/*
  # Create storage bucket for certificates
  
  1. Creates a new storage bucket for certificates
  2. Sets up storage policies for authenticated users to:
     - Upload certificate images
     - Download certificate images
     - Delete their own certificate images
*/

-- Create storage bucket for certificates if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for authenticated users
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('certificates', '.keep', auth.uid(), '{"created_by": "migration"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Policy for uploading files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates' 
  AND owner = auth.uid()
);

-- Policy for downloading files
CREATE POLICY "Allow authenticated downloads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'certificates');

-- Policy for deleting files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificates' 
  AND owner = auth.uid()
);