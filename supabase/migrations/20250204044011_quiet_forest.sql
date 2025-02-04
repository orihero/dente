-- Drop existing policies
DROP POLICY IF EXISTS "clinic_logos_public_select" ON storage.objects;
DROP POLICY IF EXISTS "clinic_logos_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "clinic_logos_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "clinic_logos_admin_delete" ON storage.objects;

-- Create simplified policies for clinic-logos bucket
CREATE POLICY "clinic_logos_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-logos');

CREATE POLICY "clinic_logos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinic-logos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "clinic_logos_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clinic-logos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "clinic_logos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clinic-logos' AND
    auth.role() = 'authenticated'
  );

-- Add email column to dentists
ALTER TABLE dentists
DROP COLUMN IF EXISTS experience;

ALTER TABLE dentists
ADD COLUMN IF NOT EXISTS email text;

-- Update email from auth.users
UPDATE dentists d
SET email = u.email
FROM auth.users u
WHERE d.id = u.id
AND d.email IS NULL;

-- Create trigger to keep email in sync
CREATE OR REPLACE FUNCTION sync_dentist_email()
RETURNS trigger AS $$
BEGIN
  UPDATE dentists
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_dentist_email_trigger ON auth.users;
CREATE TRIGGER sync_dentist_email_trigger
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_dentist_email();

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Ensure clinic-logos bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('clinic-logos', 'clinic-logos', true, 5242880)  -- 5MB limit
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880;