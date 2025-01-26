-- Add tooth_id column to record_services table
ALTER TABLE record_services
ADD COLUMN tooth_id text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS record_services_tooth_id_idx ON record_services(tooth_id);

-- Update RLS policy to include new column
DROP POLICY IF EXISTS "Dentists can manage their record services" ON record_services;

CREATE POLICY "Dentists can manage their record services"
  ON record_services
  USING (
    EXISTS (
      SELECT 1 FROM patient_records pr
      WHERE pr.id = record_id
      AND pr.dentist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_records pr
      WHERE pr.id = record_id
      AND pr.dentist_id = auth.uid()
    )
  );