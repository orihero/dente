-- Create function to check clinic status
CREATE OR REPLACE FUNCTION check_clinic_status()
RETURNS trigger AS $$
DECLARE
  clinic_enabled boolean;
BEGIN
  -- Get clinic status
  SELECT enabled INTO clinic_enabled
  FROM clinics
  WHERE id = NEW.clinic_id;

  -- If clinic is disabled, prevent login
  IF clinic_enabled = false THEN
    RAISE EXCEPTION 'Clinic subscription is inactive';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for clinic status check
DROP TRIGGER IF EXISTS check_clinic_status_trigger ON dentists;
CREATE TRIGGER check_clinic_status_trigger
  AFTER UPDATE OF clinic_id ON dentists
  FOR EACH ROW
  EXECUTE FUNCTION check_clinic_status();

-- Add comment
COMMENT ON FUNCTION check_clinic_status IS 'Checks if dentist''s clinic subscription is active';