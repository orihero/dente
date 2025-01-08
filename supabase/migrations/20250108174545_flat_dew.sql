/*
  # Add record files relationship

  1. Changes
    - Rename service_files table to record_files
    - Update foreign key relationship to point to patient_records
    - Update RLS policies
*/

-- Rename table and update foreign key
ALTER TABLE service_files RENAME TO record_files;
ALTER TABLE record_files DROP CONSTRAINT service_files_service_id_fkey;
ALTER TABLE record_files RENAME COLUMN service_id TO record_id;
ALTER TABLE record_files ADD CONSTRAINT record_files_record_id_fkey 
  FOREIGN KEY (record_id) REFERENCES patient_records(id) ON DELETE CASCADE;

-- Drop old policy
DROP POLICY IF EXISTS "Dentists can manage service files through patient services" ON record_files;

-- Create new policy
CREATE POLICY "Dentists can manage record files"
  ON record_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_records
      WHERE patient_records.id = record_files.record_id
      AND patient_records.dentist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_records
      WHERE patient_records.id = record_files.record_id
      AND patient_records.dentist_id = auth.uid()
    )
  );