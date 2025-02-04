-- Drop existing policies for clinic-logos bucket
DROP POLICY IF EXISTS "Allow public access to clinic-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to manage clinic logos" ON storage.objects;

-- Create comprehensive policies for clinic-logos bucket
CREATE POLICY "clinic_logos_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-logos');

CREATE POLICY "clinic_logos_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinic-logos' AND
    (
      EXISTS (
        SELECT 1 FROM auth.users
        JOIN dentists ON dentists.id = auth.users.id
        WHERE auth.users.id = auth.uid()
        AND dentists.type IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "clinic_logos_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clinic-logos' AND
    (
      EXISTS (
        SELECT 1 FROM auth.users
        JOIN dentists ON dentists.id = auth.users.id
        WHERE auth.users.id = auth.uid()
        AND dentists.type IN ('admin', 'manager')
      )
    )
  )
  WITH CHECK (
    bucket_id = 'clinic-logos' AND
    (
      EXISTS (
        SELECT 1 FROM auth.users
        JOIN dentists ON dentists.id = auth.users.id
        WHERE auth.users.id = auth.uid()
        AND dentists.type IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "clinic_logos_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clinic-logos' AND
    (
      EXISTS (
        SELECT 1 FROM auth.users
        JOIN dentists ON dentists.id = auth.users.id
        WHERE auth.users.id = auth.uid()
        AND dentists.type IN ('admin', 'manager')
      )
    )
  );

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Ensure clinic-logos bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-logos', 'clinic-logos', true)
ON CONFLICT (id) DO UPDATE
SET public = true;