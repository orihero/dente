-- First check if the publication exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Enable replication for the leads table
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- Ensure the table has replica identity
ALTER TABLE leads REPLICA IDENTITY FULL;

-- Verify replication is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'leads'
  ) THEN
    RAISE EXCEPTION 'Replication not enabled for leads table';
  END IF;
END $$;