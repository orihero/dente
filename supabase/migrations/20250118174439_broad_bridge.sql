-- Create clinic-logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-logos', 'clinic-logos', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create placeholder file
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('clinic-logos', '.keep', auth.uid(), '{"created_by": "migration"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Create policies for clinic-logos bucket
CREATE POLICY "Allow public access to clinic-logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-logos');

CREATE POLICY "Allow admins to manage clinic logos"
  ON storage.objects
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