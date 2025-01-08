/*
  # Add Records Tables

  1. New Tables
    - `patient_records`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `dentist_id` (uuid, references dentists)
      - `diagnosis` (text)
      - `total_price` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `record_services`
      - `id` (uuid, primary key)
      - `record_id` (uuid, references patient_records)
      - `service_id` (uuid, references dentist_services)
      - `price` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for dentist access
*/

-- Create patient records table
CREATE TABLE patient_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  dentist_id uuid REFERENCES dentists(id) ON DELETE RESTRICT NOT NULL,
  diagnosis text NOT NULL,
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create record services table
CREATE TABLE record_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES patient_records(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES dentist_services(id) ON DELETE RESTRICT NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_services ENABLE ROW LEVEL SECURITY;

-- Add policies for patient records
CREATE POLICY "Dentists can manage patient records"
  ON patient_records
  FOR ALL
  TO authenticated
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Add policies for record services
CREATE POLICY "Dentists can manage record services"
  ON record_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_records
      WHERE patient_records.id = record_services.record_id
      AND patient_records.dentist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_records
      WHERE patient_records.id = record_services.record_id
      AND patient_records.dentist_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_patient_records_updated_at
  BEFORE UPDATE ON patient_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();