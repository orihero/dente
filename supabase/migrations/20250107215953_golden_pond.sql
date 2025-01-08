/*
  # Add Family Members, Services and Payments Tables

  1. New Tables
    - `family_members`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `full_name` (text)
      - `phone` (text)
      - `birthdate` (date)
      - `relationship` (text)
      - Timestamps
    
    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `warranty_months` (integer)
      - `section` (text)
      - Timestamps

    - `patient_services`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `service_id` (uuid, references services)
      - `dentist_id` (uuid, references dentists)
      - `price` (numeric)
      - `warranty_end` (date)
      - `notes` (text)
      - Timestamps

    - `payments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `amount` (numeric)
      - `payment_type` (text)
      - `notes` (text)
      - Timestamps

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated dentists
*/

-- Family Members Table
CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  birthdate date NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage family members through patients"
  ON family_members
  FOR ALL
  TO authenticated
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

-- Services Table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid REFERENCES dentists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  warranty_months integer CHECK (warranty_months >= 0),
  section text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their own services"
  ON services
  FOR ALL
  TO authenticated
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Patient Services Table
CREATE TABLE patient_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE RESTRICT NOT NULL,
  dentist_id uuid REFERENCES dentists(id) ON DELETE RESTRICT NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  warranty_end date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patient_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage patient services"
  ON patient_services
  FOR ALL
  TO authenticated
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Payments Table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  dentist_id uuid REFERENCES dentists(id) ON DELETE RESTRICT NOT NULL,
  amount numeric NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('cash', 'card_transfer', 'card')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_services_updated_at
  BEFORE UPDATE ON patient_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();