-- First check if the publication exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Create the publication with the leads table
    CREATE PUBLICATION supabase_realtime FOR TABLE leads;
  ELSE
    -- Check if leads table is already in the publication
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'leads'
    ) THEN
      -- Add leads table to existing publication only if not already present
      ALTER PUBLICATION supabase_realtime ADD TABLE leads;
    END IF;
  END IF;
END $$;

-- Ensure the table has replica identity
ALTER TABLE leads REPLICA IDENTITY FULL;

-- Grant necessary permissions for realtime
GRANT SELECT ON leads TO anon;
GRANT SELECT ON leads TO authenticated;