/*
  # Make all storage buckets public
  
  1. Changes
    - Set all buckets as public
    - Update storage policies for public access
*/

DO $$ 
BEGIN
  -- Update all buckets to be public
  UPDATE storage.buckets
  SET public = true
  WHERE id IN ('profile-photos', 'certificates', 'service-files');

  -- Drop existing policies
  DROP POLICY IF EXISTS "Allow authenticated downloads from certificates" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated downloads from service-files" ON storage.objects;
  
  -- Create public access policies
  CREATE POLICY "Allow public access to certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

  CREATE POLICY "Allow public access to service-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-files');
END $$;