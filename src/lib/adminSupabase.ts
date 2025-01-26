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

// Create a separate instance for admin operations
export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Function to check if current user is admin
export const isAdmin = async () => {
  try {
    const { data: { user } } = await adminSupabase.auth.getUser();
    if (!user) return false;

    const { data: isAdmin } = await adminSupabase.rpc('is_admin_dentist');
    return !!isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Function to ensure admin access
export const ensureAdmin = async () => {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error('Admin access required');
  }
};