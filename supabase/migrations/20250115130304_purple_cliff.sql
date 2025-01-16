/*
  # Create record services table
  
  1. New Tables
    - `record_services`
      - `id` (uuid, primary key)
      - `record_id` (uuid, foreign key to patient_records)
      - `service_id` (uuid, foreign key to dentist_services)
      - `price` (numeric, required)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS
    - Add policy for dentists to manage record services
*/

CREATE TABLE IF NOT EXISTS record_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES patient_records(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES dentist_services(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE record_services ENABLE ROW LEVEL SECURITY;

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