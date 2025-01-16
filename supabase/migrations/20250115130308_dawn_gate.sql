/*
  # Create certificates table
  
  1. New Tables
    - `dentist_certificates`
      - `id` (uuid, primary key)
      - `dentist_id` (uuid, foreign key to dentists)
      - `title` (text, required)
      - `image_url` (text, required)
      - `issue_date` (date, required)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS
    - Add policy for dentists to manage their certificates
*/

CREATE TABLE IF NOT EXISTS dentist_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text NOT NULL,
  issue_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dentist_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their certificates"
  ON dentist_certificates
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());