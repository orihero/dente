-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_telegram_registration_token(uuid);

-- Function to generate Telegram registration token for patients
CREATE OR REPLACE FUNCTION generate_telegram_registration_token(patient_id uuid)
RETURNS uuid AS $$
DECLARE
  token uuid;
BEGIN
  -- Generate new token
  token := gen_random_uuid();
  
  -- Update patient with new token
  UPDATE patients
  SET telegram_registration_token = token
  WHERE id = patient_id
  AND EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = patient_id
    AND p.dentist_id = auth.uid()
  );
  
  -- Return token
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION generate_telegram_registration_token(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION generate_telegram_registration_token(uuid) IS 'Generates a registration token for Telegram bot integration for a specific patient';