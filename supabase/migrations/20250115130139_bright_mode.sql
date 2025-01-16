/*
  # Create storage buckets and policies
  
  1. Storage
    - Create certificates bucket
    - Create service-files bucket
  
  2. Security
    - Add policies for authenticated users to manage their files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name)
VALUES 
  ('certificates', 'certificates'),
  ('service-files', 'service-files')
ON CONFLICT (id) DO NOTHING;

-- Create placeholder files
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES 
  ('certificates', '.keep', auth.uid(), '{"created_by": "migration"}'::jsonb),
  ('service-files', '.keep', auth.uid(), '{"created_by": "migration"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Policies for certificates bucket
CREATE POLICY "Allow authenticated uploads to certificates"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'certificates' AND owner = auth.uid());

CREATE POLICY "Allow authenticated downloads from certificates"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'certificates');

CREATE POLICY "Allow authenticated deletes from certificates"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'certificates' AND owner = auth.uid());

-- Policies for service-files bucket
CREATE POLICY "Allow authenticated uploads to service-files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'service-files' AND owner = auth.uid());

CREATE POLICY "Allow authenticated downloads from service-files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'service-files');

CREATE POLICY "Allow authenticated deletes from service-files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'service-files' AND owner = auth.uid());