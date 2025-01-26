-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_telegram_registration_token(uuid);

-- Function to generate Telegram registration token for patients
CREATE OR REPLACE FUNCTION generate_telegram_registration_token(patient_id uuid)
RETURNS uuid AS $$
DECLARE
  token uuid;
  updated_rows integer;
BEGIN
  -- Generate new token
  token := gen_random_uuid();
  
  -- Update patient with new token and get number of updated rows
  WITH updated AS (
    UPDATE patients
    SET telegram_registration_token = token
    WHERE id = patient_id
    AND EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id
      AND p.dentist_id = auth.uid()
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO updated_rows FROM updated;
  
  -- If no rows were updated, raise an exception
  IF updated_rows = 0 THEN
    RAISE EXCEPTION 'Patient not found or permission denied';
  END IF;
  
  -- Return token
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION generate_telegram_registration_token(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION generate_telegram_registration_token(uuid) IS 'Generates a registration token for Telegram bot integration for a specific patient. Raises an exception if patient is not found or user does not have permission.';