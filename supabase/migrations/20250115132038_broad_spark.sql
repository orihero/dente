/*
  # Fix profile photos bucket and policies
  
  1. Changes
    - Ensure profile-photos bucket exists
    - Set up proper public access
*/

DO $$ 
BEGIN
  -- Create profile-photos bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile-photos', 'profile-photos', true)
  ON CONFLICT (id) DO UPDATE
  SET public = true;

  -- Drop existing policies
  DROP POLICY IF EXISTS "Allow authenticated downloads from profile-photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public access to profile-photos" ON storage.objects;
  
  -- Create public access policy
  CREATE POLICY "Allow public access to profile-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');
END $$;