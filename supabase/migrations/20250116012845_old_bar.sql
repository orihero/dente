/*
  # Fix Dentist Referral System Migration

  1. Drop existing objects first
  2. Create new objects
  3. Add policies with checks for existence
*/

-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS on_lead_creation ON leads;
DROP FUNCTION IF EXISTS handle_lead_creation();
DROP TABLE IF EXISTS leads;
DROP TYPE IF EXISTS lead_status;

-- Create lead status enum
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'rejected');

-- Create leads table
CREATE TABLE leads (
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
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Everyone can create leads" ON leads;
  DROP POLICY IF EXISTS "Dentists can view leads they referred" ON leads;
  DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;
  
  -- Create new policies
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
END $$;

-- Add indexes
CREATE INDEX leads_referred_by_idx ON leads(referred_by);
CREATE INDEX leads_status_idx ON leads(status);
CREATE INDEX leads_created_at_idx ON leads(created_at);

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
CREATE TRIGGER on_lead_creation
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_lead_creation();