-- Create clinic-logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('clinic-logos', 'clinic-logos', true, 2097152)  -- 2MB limit
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 2097152;

-- Create placeholder file
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('clinic-logos', '.keep', auth.uid(), '{"created_by": "migration"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public access to clinic-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to manage clinic logos" ON storage.objects;

-- Create policies for clinic-logos bucket
CREATE POLICY "Allow public access to clinic-logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-logos');

CREATE POLICY "Allow admins to manage clinic logos"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'clinic-logos' AND
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'clinic-logos' AND
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  );