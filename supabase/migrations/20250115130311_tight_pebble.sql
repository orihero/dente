/*
  # Create record files table
  
  1. New Tables
    - `record_files`
      - `id` (uuid, primary key)
      - `record_id` (uuid, foreign key to patient_records)
      - `file_url` (text, required)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS
    - Add policy for dentists to manage record files
*/

CREATE TABLE IF NOT EXISTS record_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES patient_records(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE record_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their record files"
  ON record_files
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