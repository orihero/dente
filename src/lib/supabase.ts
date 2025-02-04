import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
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
  },
  global: {
    headers: {
      'x-client-info': 'dente-uz'
    }
  },
  // Add retry configuration
  db: {
    schema: 'public'
  },
  // Add request timeout and retry logic
  fetch: (url, options = {}) => {
    const timeout = 15000; // 15 seconds timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetch(url, {
      ...options,
      signal: controller.signal,
      // Add retry headers
      headers: {
        ...options.headers,
        'x-retry-after': '1',
        'x-retry-count': '3'
      }
    })
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    });
  }
});

// Helper function to handle Supabase errors with retry logic
export const handleSupabaseError = async (error: any, retryCount = 0, maxRetries = 3) => {
  console.error('Supabase error:', error);
  
  // Check if it's a connection error
  if (error.message?.includes('Failed to fetch')) {
    if (retryCount < maxRetries) {
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return { shouldRetry: true, retryCount: retryCount + 1 };
    }
    return { 
      shouldRetry: false, 
      error: 'Connection error. Please check your internet connection.' 
    };
  }
  
  // Check if it's an authentication error
  if (error.status === 400 || error.status === 401) {
    supabase.auth.signOut(); // Sign out user on auth errors
    return { 
      shouldRetry: false, 
      error: 'Authentication error. Please log in again.' 
    };
  }
  
  return { 
    shouldRetry: false, 
    error: error.message || 'An unexpected error occurred' 
  };
};