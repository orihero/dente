import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface ProfileState {
  profile: any;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: true,
  error: null,
  initialized: false,

  fetchProfile: async () => {
    try {
      // Don't fetch again if already initialized and not loading
      if (get().initialized && !get().loading) {
        return;
      }

      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) {
        set({ profile: null, loading: false, initialized: true });
        return;
      }

      const { data, error } = await supabase
        .from('dentists')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Handle network errors specifically
        if (error.message?.includes('Failed to fetch')) {
          throw new Error('Network connection error. Please check your internet connection and try again.');
        }
        throw error;
      }

      set({ profile: data, loading: false, initialized: true, error: null });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Set a user-friendly error message
      set({ 
        error: error.message || 'An error occurred while loading your profile. Please try again.',
        loading: false,
        initialized: true 
      });

      // If it's an auth error, sign out
      if (error.status === 401) {
        await supabase.auth.signOut();
      }
    }
  },

  updateProfile: async (data) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('No user found');

      // Clean up the data object to ensure valid JSON
      const cleanData = {
        full_name: data.full_name || '',
        phone: data.phone || '',
        experience: parseInt(data.experience) || 0,
        birthdate: data.birthdate || null,
        photo_url: data.photo_url || null,
        social_media: {
          platforms: Array.isArray(data.social_media?.platforms) 
            ? data.social_media.platforms.map((p: any) => ({
                platform: String(p.platform || ''),
                url: String(p.url || '')
              }))
            : []
        }
      };

      const { error } = await supabase
        .from('dentists')
        .update(cleanData)
        .eq('id', user.id);

      if (error) {
        // Handle network errors specifically
        if (error.message?.includes('Failed to fetch')) {
          throw new Error('Network connection error. Please check your internet connection and try again.');
        }
        throw error;
      }

      // Fetch fresh data after update
      const { data: freshData, error: fetchError } = await supabase
        .from('dentists')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      set({
        profile: freshData,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      // Set a user-friendly error message
      set({ 
        error: error.message || 'An error occurred while updating your profile. Please try again.',
        loading: false 
      });

      // If it's an auth error, sign out
      if (error.status === 401) {
        await supabase.auth.signOut();
      }

      throw error;
    }
  }
}));