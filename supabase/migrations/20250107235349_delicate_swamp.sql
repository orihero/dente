/*
  # Add certificates support

  1. New Tables
    - `dentist_certificates`
      - `id` (uuid, primary key)
      - `dentist_id` (uuid, references dentists)
      - `title` (text)
      - `image_url` (text)
      - `issue_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `dentist_certificates` table
    - Add policy for dentists to manage their own certificates
*/

CREATE TABLE dentist_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  image_url text NOT NULL,
  issue_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dentist_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their own certificates"
  ON dentist_certificates
  FOR ALL
  TO authenticated
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

CREATE TRIGGER update_dentist_certificates_updated_at
  BEFORE UPDATE ON dentist_certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();