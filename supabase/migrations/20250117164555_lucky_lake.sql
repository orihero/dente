-- Drop existing policies
DROP POLICY IF EXISTS "Dentists can manage their patients" ON patients;
DROP POLICY IF EXISTS "Allow patient creation during Telegram bot registration" ON patients;
DROP POLICY IF EXISTS "Allow balance updates for dentists" ON patients;

-- Create comprehensive policy for patient management
CREATE POLICY "Dentists can manage their patients"
  ON patients
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Create policy for Telegram registration
CREATE POLICY "Allow Telegram registration"
  ON patients
  FOR ALL
  USING (
    telegram_registration_token IS NOT NULL OR
    telegram_chat_id IS NOT NULL
  )
  WITH CHECK (
    telegram_registration_token IS NOT NULL OR
    telegram_chat_id IS NOT NULL
  );

-- Create policy for balance updates
CREATE POLICY "Allow balance updates for dentists"
  ON patients
  FOR UPDATE
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Create trigger function to validate updates
CREATE OR REPLACE FUNCTION check_patient_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updating balance without restrictions
  IF NEW.balance IS DISTINCT FROM OLD.balance THEN
    RETURN NEW;
  END IF;

  -- Allow updating telegram-related fields
  IF NEW.telegram_chat_id IS DISTINCT FROM OLD.telegram_chat_id OR
     NEW.telegram_registered IS DISTINCT FROM OLD.telegram_registered OR
     NEW.telegram_registration_token IS DISTINCT FROM OLD.telegram_registration_token THEN
    RETURN NEW;
  END IF;

  -- For other fields, only allow if they haven't changed
  IF NEW.full_name != OLD.full_name OR
     NEW.phone != OLD.phone OR
     NEW.birthdate != OLD.birthdate OR
     NEW.address != OLD.address OR
     NEW.dentist_id != OLD.dentist_id THEN
    RAISE EXCEPTION 'Cannot modify non-allowed fields';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_patient_updates ON patients;
CREATE TRIGGER validate_patient_updates
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION check_patient_updates();