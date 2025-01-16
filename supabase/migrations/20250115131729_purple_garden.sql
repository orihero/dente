/*
  # Update profile photos access policy
  
  1. Changes
    - Ensure public access policy exists for profile-photos bucket
    - Remove any conflicting policies
*/

DO $$ 
BEGIN
  -- Drop the authenticated-only select policy if it exists
  DROP POLICY IF EXISTS "Allow authenticated downloads from profile-photos" ON storage.objects;
  
  -- Drop the public access policy if it exists
  DROP POLICY IF EXISTS "Allow public access to profile-photos" ON storage.objects;
  
  -- Create public access policy
  CREATE POLICY "Allow public access to profile-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');
END $$;