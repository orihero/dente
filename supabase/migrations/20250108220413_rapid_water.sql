/*
  # Add profile photos storage bucket and policies
  
  1. Storage
    - Create profile-photos bucket
    - Set bucket to public
  
  2. Security
    - Add policies for authenticated users to:
      - Upload their own photos
      - View any photo
      - Delete their own photos
*/

DO $$ 
BEGIN
  -- Create bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profile-photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-photos', 'profile-photos', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated uploads to profile-photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated downloads from profile-photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated deletes from profile-photos" ON storage.objects;
END $$;

-- Create new policies
CREATE POLICY "Allow authenticated uploads to profile-photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND owner = auth.uid()
);

CREATE POLICY "Allow authenticated downloads from profile-photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow authenticated deletes from profile-photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND owner = auth.uid()
);