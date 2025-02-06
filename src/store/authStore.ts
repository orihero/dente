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
      set({ loading: true, error: null });

      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        // Handle network errors specifically
        if (sessionError.message?.includes('Failed to fetch')) {
          if (get().retryCount < get().maxRetries) {
            const retryCount = get().retryCount + 1;
            set(state => ({ retryCount }));
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

      // Get dentist data to check clinic status
      const { data: dentist, error: dentistError } = await supabase
        .from('dentists')
        .select(`
          *,
          clinic:clinics(
            id,
            enabled
          )
        `)
        .eq('id', session.user.id)
        .maybeSingle();

      if (dentistError) throw dentistError;
      if (!dentist) throw new Error('Dentist not found');

      // Check if clinic is disabled (only if dentist belongs to a clinic)
      if (dentist.clinic && !dentist.clinic.enabled) {
        // Sign out if clinic is disabled
        await supabase.auth.signOut();
        throw new Error(
          dentist.language === 'uz'
            ? 'Klinika faol emas. Iltimos, administrator bilan bog\'laning.'
            : 'Клиника неактивна. Пожалуйста, свяжитесь с администратором.'
        );
      }

      // Check if user is admin
      const isAdmin = dentist.type === 'admin' || session.user.email === 'admin@dente.uz';
      
      set({ 
        user: session.user,
        isAdmin,
        loading: false,
        initialized: true,
        error: null
      });

    } catch (error: any) {
      console.error('❌ Auth error:', error);
      
      set({ 
        user: null, 
        isAdmin: false, 
        loading: false, 
        initialized: true,
        error: error.message || 'An error occurred while checking authentication. Please try again.'
      });

      // If it's a network error and we haven't exceeded max retries, try again
      if (error.message?.includes('Failed to fetch') && get().retryCount < get().maxRetries) {
        const retryCount = get().retryCount + 1;
        set(state => ({ retryCount }));
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
      // First clear any stored session data
      localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_URL + '-auth-token');
      
      // Then sign out from Supabase
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