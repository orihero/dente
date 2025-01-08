/*
  # Add Sequential Record Number
  
  1. Changes
    - Add record_number column to patient_records table
    - Create function to generate sequential record number per dentist
    - Create trigger to automatically set record number on insert
*/

-- Add record_number column
ALTER TABLE patient_records
ADD COLUMN record_number integer;

-- Create function to generate sequential record number
CREATE OR REPLACE FUNCTION generate_record_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number integer;
BEGIN
  -- Get the next number for this dentist
  SELECT COALESCE(MAX(record_number), 0) + 1
  INTO next_number
  FROM patient_records
  WHERE dentist_id = NEW.dentist_id;
  
  -- Set the record number
  NEW.record_number := next_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set record number on insert
CREATE TRIGGER set_record_number
  BEFORE INSERT ON patient_records
  FOR EACH ROW
  EXECUTE FUNCTION generate_record_number();