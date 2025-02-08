-- Create function to handle patient registration with dentist language
CREATE OR REPLACE FUNCTION handle_patient_registration()
RETURNS trigger AS $$
DECLARE
  dentist_language text;
BEGIN
  -- Get dentist's language if patient is being registered through Telegram
  IF NEW.telegram_registration_token IS NOT NULL AND NEW.telegram_chat_id IS NOT NULL THEN
    SELECT COALESCE(language, 'uz') INTO dentist_language
    FROM dentists
    WHERE id = NEW.dentist_id;

    -- Set patient's language to match dentist's language
    NEW.language := dentist_language;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for patient registration
DROP TRIGGER IF EXISTS patient_registration_trigger ON patients;
CREATE TRIGGER patient_registration_trigger
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION handle_patient_registration();

-- Add comment
COMMENT ON FUNCTION handle_patient_registration IS 'Automatically sets patient language to match dentist language during Telegram registration';