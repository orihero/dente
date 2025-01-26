-- Add statistics function for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_statistics()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_dentists', (SELECT COUNT(*) FROM dentists),
    'total_leads', (SELECT COUNT(*) FROM leads),
    'converted_leads', (SELECT COUNT(*) FROM leads WHERE status = 'converted'),
    'rejected_leads', (SELECT COUNT(*) FROM leads WHERE status = 'rejected'),
    'total_patients', (SELECT COUNT(*) FROM patients),
    'total_appointments', (SELECT COUNT(*) FROM appointments),
    'total_records', (SELECT COUNT(*) FROM patient_records)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_statistics TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_admin_statistics IS 'Returns statistics for admin dashboard';

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS leads_status_created_at_idx ON leads(status, created_at);