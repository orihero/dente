/*
  # Add profile photos storage bucket
  
  1. Storage
    - Creates profile-photos bucket for dentist profile pictures
    - Adds RLS policies for authenticated users
*/

-- Create profile photos bucket
INSERT INTO storage.buckets (id, name)
VALUES ('profile-photos', 'profile-photos')
ON CONFLICT (id) DO NOTHING;

-- Create placeholder file
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('profile-photos', '.keep', auth.uid(), '{"created_by": "migration"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Policies for profile-photos bucket
CREATE POLICY "Allow authenticated uploads to profile-photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND owner = auth.uid());

CREATE POLICY "Allow authenticated downloads from profile-photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow authenticated deletes from profile-photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND owner = auth.uid());

CREATE POLICY "Allow authenticated updates to profile-photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos' AND owner = auth.uid())
WITH CHECK (bucket_id = 'profile-photos' AND owner = auth.uid());