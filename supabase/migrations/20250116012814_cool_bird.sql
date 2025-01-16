/*
  # Dentist Referral System

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `phone` (text)
      - `email` (text, optional)
      - `referred_by` (uuid, references dentists)
      - `status` (lead_status enum)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `leads` table
    - Add policies for lead management
*/

-- Create lead status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  referred_by uuid REFERENCES dentists(id) ON DELETE SET NULL,
  status lead_status NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for leads
CREATE POLICY "Everyone can create leads"
  ON leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Dentists can view leads they referred"
  ON leads
  FOR SELECT
  USING (referred_by = auth.uid());

CREATE POLICY "Admins can manage all leads"
  ON leads
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS leads_referred_by_idx ON leads(referred_by);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);

-- Add function to handle lead creation
CREATE OR REPLACE FUNCTION handle_lead_creation()
RETURNS trigger AS $$
BEGIN
  -- Send notification to admin (you can implement this later)
  -- For now, just update the timestamp
  NEW.created_at = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for lead creation
DROP TRIGGER IF EXISTS on_lead_creation ON leads;
CREATE TRIGGER on_lead_creation
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_lead_creation();