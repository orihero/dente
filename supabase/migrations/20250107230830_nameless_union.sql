/*
  # Add Dentist Services Table

  1. New Tables
    - `dentist_services`
      - `id` (uuid, primary key)
      - `dentist_id` (uuid, foreign key)
      - `base_service_id` (uuid, foreign key)
      - `price` (numeric)
      - `duration` (text)
      - `warranty_months` (integer)

  2. Security
    - Enable RLS
    - Add policies for dentist access
*/

-- Create dentist services table
CREATE TABLE dentist_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE NOT NULL,
  base_service_id uuid REFERENCES base_services(id) ON DELETE RESTRICT NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  duration text NOT NULL,
  warranty_months integer NOT NULL CHECK (warranty_months >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dentist_services ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Dentists can manage their own services"
  ON dentist_services
  FOR ALL
  TO authenticated
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_dentist_services_updated_at
  BEFORE UPDATE ON dentist_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();