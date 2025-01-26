-- Drop existing policies
DROP POLICY IF EXISTS "Dentists can manage their patients" ON patients;
DROP POLICY IF EXISTS "Allow patient creation during Telegram bot registration" ON patients;
DROP POLICY IF EXISTS "Allow balance updates for dentists" ON patients;

-- Create comprehensive policy for patient management
CREATE POLICY "Dentists can manage their patients"
  ON patients
  USING (
    dentist_id = auth.uid() OR
    telegram_registration_token IS NOT NULL OR
    telegram_chat_id IS NOT NULL
  )
  WITH CHECK (
    dentist_id = auth.uid() OR
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
  -- Only allow updating balance and telegram-related fields
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.full_name != OLD.full_name OR
       NEW.phone != OLD.phone OR
       NEW.birthdate != OLD.birthdate OR
       NEW.address != OLD.address OR
       NEW.dentist_id != OLD.dentist_id THEN
      RAISE EXCEPTION 'Cannot modify non-allowed fields';
    END IF;
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