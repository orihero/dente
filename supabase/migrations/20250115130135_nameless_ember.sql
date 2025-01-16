/*
  # Create payments table
  
  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to patients)
      - `dentist_id` (uuid, foreign key to dentists)
      - `record_id` (uuid, foreign key to patient_records)
      - `amount` (numeric, required)
      - `payment_type` (text, required)
      - `notes` (text, optional)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS
    - Add policy for dentists to manage payments
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  record_id uuid NOT NULL REFERENCES patient_records(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_type text NOT NULL CHECK (payment_type IN ('cash', 'card', 'card_transfer')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their payments"
  ON payments
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());