-- Create function to get clinic statistics
CREATE OR REPLACE FUNCTION get_clinic_statistics(clinic_ids uuid[])
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_dentists', (
      SELECT COUNT(*) 
      FROM dentists 
      WHERE clinic_id = ANY(clinic_ids)
    ),
    'total_patients', (
      SELECT COUNT(DISTINCT p.id)
      FROM patients p
      JOIN dentists d ON d.id = p.dentist_id
      WHERE d.clinic_id = ANY(clinic_ids)
    ),
    'total_appointments', (
      SELECT COUNT(*)
      FROM appointments a
      JOIN dentists d ON d.id = a.dentist_id
      WHERE d.clinic_id = ANY(clinic_ids)
    ),
    'total_records', (
      SELECT COUNT(*)
      FROM patient_records pr
      JOIN dentists d ON d.id = pr.dentist_id
      WHERE d.clinic_id = ANY(clinic_ids)
    ),
    'total_leads', (
      SELECT COUNT(*)
      FROM leads l
      JOIN dentists d ON d.id = l.referred_by
      WHERE d.clinic_id = ANY(clinic_ids)
    ),
    'converted_leads', (
      SELECT COUNT(*)
      FROM leads l
      JOIN dentists d ON d.id = l.referred_by
      WHERE d.clinic_id = ANY(clinic_ids)
      AND l.status = 'converted'
    ),
    'rejected_leads', (
      SELECT COUNT(*)
      FROM leads l
      JOIN dentists d ON d.id = l.referred_by
      WHERE d.clinic_id = ANY(clinic_ids)
      AND l.status = 'rejected'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_clinic_statistics TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_clinic_statistics IS 'Returns statistics for specified clinics';