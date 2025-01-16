/*
  # Update storage bucket policies

  1. Changes
    - Make all storage buckets public
    - Update policies for public access and authenticated uploads
    - Handle existing policies gracefully

  2. Security
    - Enable public read access to all buckets
    - Maintain authenticated-only upload restrictions
*/

DO $$ 
BEGIN
  -- Update all buckets to be public
  UPDATE storage.buckets
  SET public = true
  WHERE id IN ('profile-photos', 'certificates', 'service-files');

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow authenticated downloads from profile-photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated downloads from certificates" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated downloads from service-files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public access to profile-photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public access to certificates" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public access to service-files" ON storage.objects;
  
  -- Create public access policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow public access to profile-photos'
  ) THEN
    CREATE POLICY "Allow public access to profile-photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow public access to certificates'
  ) THEN
    CREATE POLICY "Allow public access to certificates"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'certificates');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow public access to service-files'
  ) THEN
    CREATE POLICY "Allow public access to service-files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'service-files');
  END IF;

  -- Update upload policies if they exist, create if they don't
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow authenticated uploads to profile-photos'
  ) THEN
    DROP POLICY "Allow authenticated uploads to profile-photos" ON storage.objects;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow authenticated uploads to certificates'
  ) THEN
    DROP POLICY "Allow authenticated uploads to certificates" ON storage.objects;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow authenticated uploads to service-files'
  ) THEN
    DROP POLICY "Allow authenticated uploads to service-files" ON storage.objects;
  END IF;

  -- Create upload policies
  CREATE POLICY "Allow authenticated uploads to profile-photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND owner = auth.uid());

  CREATE POLICY "Allow authenticated uploads to certificates"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND owner = auth.uid());

  CREATE POLICY "Allow authenticated uploads to service-files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'service-files' AND owner = auth.uid());
END $$;