/*
  # Create patients table
  
  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `dentist_id` (uuid, foreign key to dentists)
      - `full_name` (text, required)
      - `phone` (text, required)
      - `birthdate` (date, required)
      - `address` (text, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS
    - Add policy for dentists to manage their patients
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  birthdate date NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their patients"
  ON patients
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());