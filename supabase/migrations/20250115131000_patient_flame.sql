/*
  # Add public access to profile photos

  1. Changes
    - Add public access policy for profile photos bucket
    - This allows anyone to view profile photos without authentication

  2. Security
    - Only authenticated users can still upload/modify/delete photos
    - Public access is limited to read-only operations
*/

-- Enable public access for profile photos
CREATE POLICY "Allow public access to profile-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Update existing policy to be more specific
DROP POLICY IF EXISTS "Allow authenticated downloads from profile-photos" ON storage.objects;