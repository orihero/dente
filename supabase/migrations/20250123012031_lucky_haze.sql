-- Add recipe column to patient_records
ALTER TABLE patient_records
ADD COLUMN recipe text,
ADD COLUMN suggestions text;

-- Add recipe_sent column to track if recipe was sent via bot
ALTER TABLE patient_records
ADD COLUMN recipe_sent boolean DEFAULT false;

-- Create function to send recipe via bot
CREATE OR REPLACE FUNCTION send_record_recipe(record_id uuid)
RETURNS void AS $$
DECLARE
  record_data record;
  patient_data record;
  dentist_data record;
BEGIN
  -- Get record data
  SELECT * INTO record_data
  FROM patient_records
  WHERE id = record_id
  AND EXISTS (
    SELECT 1 FROM dentists
    WHERE dentists.id = patient_records.dentist_id
    AND dentists.id = auth.uid()
  );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Record not found or permission denied';
  END IF;

  -- Get patient data
  SELECT * INTO patient_data
  FROM patients
  WHERE id = record_data.patient_id;

  -- Get dentist data
  SELECT * INTO dentist_data
  FROM dentists
  WHERE id = record_data.dentist_id;

  -- Update recipe_sent status
  UPDATE patient_records
  SET recipe_sent = true
  WHERE id = record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_record_recipe TO authenticated;