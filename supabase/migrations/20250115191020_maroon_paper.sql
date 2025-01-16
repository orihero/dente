/*
  # Create family members table

  1. New Tables
    - `family_members`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `full_name` (text)
      - `phone` (text)
      - `birthdate` (date)
      - `relationship` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `family_members` table
    - Add policy for dentists to manage their patients' family members
*/

CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  birthdate date NOT NULL,
  relationship text NOT NULL CHECK (relationship IN ('mother', 'father', 'spouse', 'child', 'sibling', 'other')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their patients' family members"
  ON family_members
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = family_members.patient_id
      AND patients.dentist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = family_members.patient_id
      AND patients.dentist_id = auth.uid()
    )
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS family_members_patient_id_idx ON family_members(patient_id);