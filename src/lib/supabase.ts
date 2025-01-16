import { createClient } from '@supabase/supabase-js';

// Helper function to get environment variables
const getEnvVar = (key: string): string => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // @ts-ignore - Vite's import.meta.env is available in browser
    return import.meta.env[key] || '';
  }
  // Node.js environment
  return process.env[key] || '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
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