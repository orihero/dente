/*
  # Update appointments table schema

  1. Changes
    - Drop existing appointments table
    - Recreate appointments table with correct schema including patient_id
  
  2. Security
    - Enable RLS
    - Add policy for dentists to manage their appointments
*/

DROP TABLE IF EXISTS appointments;

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) NOT NULL,
  patient_id uuid REFERENCES patients(id) NOT NULL,
  appointment_time timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their own appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (auth.uid() = dentist_id)
  WITH CHECK (auth.uid() = dentist_id);

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();