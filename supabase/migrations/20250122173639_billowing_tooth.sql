-- First check if the publication exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Check if leads table is already in the publication
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'leads'
  ) THEN
    -- Add leads table to publication only if it's not already there
    ALTER PUBLICATION supabase_realtime ADD TABLE leads;
  END IF;
END $$;

-- Ensure the table has replica identity
ALTER TABLE leads REPLICA IDENTITY FULL;