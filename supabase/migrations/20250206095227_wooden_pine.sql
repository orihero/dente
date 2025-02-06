-- Drop all existing policies
DROP POLICY IF EXISTS "dentists_select" ON dentists;
DROP POLICY IF EXISTS "dentists_insert" ON dentists;
DROP POLICY IF EXISTS "dentists_update" ON dentists;
DROP POLICY IF EXISTS "dentists_delete" ON dentists;

-- Create simplified policies without recursion
CREATE POLICY "dentists_select"
  ON dentists
  FOR SELECT
  USING (
    -- Allow if:
    -- 1. User is the dentist themselves
    id = auth.uid() OR
    -- 2. User is admin
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    -- 3. Has valid Telegram token
    telegram_registration_token IS NOT NULL
  );

CREATE POLICY "dentists_insert"
  ON dentists
  FOR INSERT
  WITH CHECK (
    -- Allow if:
    -- 1. Initial user creation
    id = auth.uid() OR
    -- 2. Admin creating new dentist
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

CREATE POLICY "dentists_update"
  ON dentists
  FOR UPDATE
  USING (
    -- Allow if:
    -- 1. User updating own data
    id = auth.uid() OR
    -- 2. Admin updating any dentist
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    -- 3. Telegram registration
    telegram_registration_token IS NOT NULL
  )
  WITH CHECK (
    -- Same conditions as USING clause
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    telegram_registration_token IS NOT NULL
  );

CREATE POLICY "dentists_delete"
  ON dentists
  FOR DELETE
  USING (
    -- Only admin can delete
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

-- Update clinic status check function to handle initial creation
CREATE OR REPLACE FUNCTION check_clinic_status()
RETURNS trigger AS $$
DECLARE
  clinic_enabled boolean;
BEGIN
  -- Skip check if clinic_id is null (initial creation)
  IF NEW.clinic_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get clinic status
  SELECT enabled INTO clinic_enabled
  FROM clinics
  WHERE id = NEW.clinic_id;

  -- If clinic is disabled, prevent login
  IF clinic_enabled = false THEN
    RAISE EXCEPTION USING 
      message = CASE 
        WHEN NEW.language = 'uz' 
        THEN 'Klinika faol emas. Iltimos, administrator bilan bog''laning.'
        ELSE 'Клиника неактивна. Пожалуйста, свяжитесь с администратором.'
      END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger to run before update
DROP TRIGGER IF EXISTS check_clinic_status_trigger ON dentists;
CREATE TRIGGER check_clinic_status_trigger
  BEFORE UPDATE OF clinic_id ON dentists
  FOR EACH ROW
  EXECUTE FUNCTION check_clinic_status();

-- Grant necessary permissions
GRANT ALL ON dentists TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Add comments
COMMENT ON TABLE dentists IS 'Stores dentist information with role-based access control';
COMMENT ON FUNCTION check_clinic_status IS 'Checks if dentist''s clinic subscription is active';