import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Check if it's a connection error
  if (error.message?.includes('Failed to fetch')) {
    return 'Connection error. Please check your internet connection.';
  }
  
  // Check if it's an authentication error
  if (error.status === 400 || error.status === 401) {
    supabase.auth.signOut(); // Sign out user on auth errors
    return 'Authentication error. Please log in again.';
  }
  
  return error.message || 'An unexpected error occurred';
};