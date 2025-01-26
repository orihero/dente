-- First check if the publication exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Create the publication with the leads table
    CREATE PUBLICATION supabase_realtime FOR TABLE leads;
  ELSE
    -- Publication exists, check if leads table is included
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'leads'
    ) THEN
      -- Add leads table to existing publication
      ALTER PUBLICATION supabase_realtime ADD TABLE leads;
    END IF;
  END IF;
END $$;

-- Ensure the table has replica identity
ALTER TABLE leads REPLICA IDENTITY FULL;

-- Enable replication at the table level
ALTER TABLE leads REPLICA IDENTITY FULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can create leads" ON leads;
DROP POLICY IF EXISTS "Dentists can view leads they referred" ON leads;
DROP POLICY IF EXISTS "Dentists can view and manage leads" ON leads;

-- Create new policies that allow public access for realtime
CREATE POLICY "Allow public access to leads"
  ON leads
  FOR SELECT
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON leads TO anon;
GRANT SELECT ON leads TO authenticated;