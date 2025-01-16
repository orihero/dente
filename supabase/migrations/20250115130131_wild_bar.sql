/*
  # Create patient records table
  
  1. New Tables
    - `patient_records`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to patients)
      - `dentist_id` (uuid, foreign key to dentists)
      - `record_number` (bigint, auto-incrementing)
      - `diagnosis` (text, required)
      - `total_price` (numeric, required)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS
    - Add policy for dentists to manage records
*/

CREATE SEQUENCE IF NOT EXISTS patient_records_number_seq;

CREATE TABLE IF NOT EXISTS patient_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  record_number bigint NOT NULL DEFAULT nextval('patient_records_number_seq'),
  diagnosis text NOT NULL,
  total_price numeric NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their records"
  ON patient_records
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());