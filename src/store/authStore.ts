import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any;
  loading: boolean;
  isAdmin: boolean;
  initialized: boolean;
  error: string | null;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
  retryCount: number;
  maxRetries: number;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isAdmin: false,
  initialized: false,
  error: null,
  retryCount: 0,
  maxRetries: 3,

  checkUser: async () => {
    try {
      // Don't check again if already initialized and not loading
      if (get().initialized && !get().loading) {
        return;
      }

      set({ loading: true, error: null });

      // Get session and handle potential network errors
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        // Handle network errors specifically
        if (sessionError.message?.includes('Failed to fetch')) {
          // If we haven't exceeded max retries, try again
          if (get().retryCount < get().maxRetries) {
            set(state => ({ retryCount: state.retryCount + 1 }));
            // Exponential backoff
            const delay = Math.pow(2, get().retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return get().checkUser();
          }
          throw new Error('Network connection error. Please check your internet connection and try again.');
        }
        throw sessionError;
      }

      // Reset retry count on successful request
      set({ retryCount: 0 });

      // If no session, clear state
      if (!session) {
        set({ 
          user: null, 
          isAdmin: false, 
          loading: false, 
          initialized: true, 
          error: null 
        });
        return;
      }

      // Set up auth state change listener
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ 
            user: null, 
            isAdmin: false, 
            loading: false, 
            initialized: true, 
            error: null 
          });
        } else if (session) {
          try {
            // Check if user is admin
            const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_dentist');

            if (adminError) {
              // Handle network errors specifically
              if (adminError.message?.includes('Failed to fetch')) {
                throw new Error('Network connection error. Please check your internet connection and try again.');
              }
              throw adminError;
            }

            set({ 
              user: session.user,
              isAdmin: !!isAdmin,
              loading: false,
              initialized: true,
              error: null
            });
          } catch (error: any) {
            console.error('Error checking admin status:', error);
            // Set a user-friendly error message
            set({ 
              error: error.message || 'An error occurred while checking authentication. Please try again.',
              loading: false,
              initialized: true
            });

            // If it's a network error and we haven't exceeded max retries, try again
            if (error.message?.includes('Failed to fetch') && get().retryCount < get().maxRetries) {
              set(state => ({ retryCount: state.retryCount + 1 }));
              const delay = Math.pow(2, get().retryCount) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              return get().checkUser();
            }
          }
        }
      });

      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_dentist');

      if (adminError) {
        // Handle network errors specifically
        if (adminError.message?.includes('Failed to fetch')) {
          throw new Error('Network connection error. Please check your internet connection and try again.');
        }
        throw adminError;
      }

      set({ 
        user: session.user,
        isAdmin: !!isAdmin,
        loading: false,
        initialized: true,
        error: null
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Set a user-friendly error message
      set({ 
        user: null, 
        isAdmin: false, 
        loading: false, 
        initialized: true,
        error: error.message || 'An error occurred while checking authentication. Please try again.'
      });

      // If it's a network error and we haven't exceeded max retries, try again
      if (error.message?.includes('Failed to fetch') && get().retryCount < get().maxRetries) {
        set(state => ({ retryCount: state.retryCount + 1 }));
        const delay = Math.pow(2, get().retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return get().checkUser();
      }

      // If it's an auth error, sign out
      if (error.status === 401) {
        await supabase.auth.signOut();
      }
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        isAdmin: false, 
        loading: false, 
        initialized: true,
        error: null,
        retryCount: 0
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      set({ 
        error: error.message || 'An error occurred while signing out. Please try again.',
        retryCount: 0
      });
    }
  }
}));