-- Create patient-avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-avatars', 'patient-avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create placeholder file
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('patient-avatars', '.keep', auth.uid(), '{"created_by": "migration"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Create policies for patient-avatars bucket
CREATE POLICY "patient_avatars_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patient-avatars');

CREATE POLICY "patient_avatars_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-avatars' AND
    (auth.role() = 'anon' OR auth.role() = 'authenticated')
  );

-- Add avatar_url column to patients table
ALTER TABLE patients
ADD COLUMN avatar_url text;