-- Create function to handle patient language updates
CREATE OR REPLACE FUNCTION handle_patient_language_update()
RETURNS trigger AS $$
BEGIN
  -- Only update language if it's being changed
  IF NEW.language IS DISTINCT FROM OLD.language THEN
    -- Update patient's language preference
    UPDATE patients
    SET language = NEW.language
    WHERE telegram_chat_id = NEW.telegram_chat_id
    AND telegram_registered = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for patient language updates
DROP TRIGGER IF EXISTS patient_language_update_trigger ON patients;
CREATE TRIGGER patient_language_update_trigger
  AFTER UPDATE OF language ON patients
  FOR EACH ROW
  EXECUTE FUNCTION handle_patient_language_update();

-- Grant necessary permissions
GRANT UPDATE ON patients TO anon;
GRANT UPDATE ON patients TO authenticated;

-- Add comment
COMMENT ON FUNCTION handle_patient_language_update IS 'Updates patient language preference when changed through Telegram bot';