-- Enable replication for the leads table
alter publication supabase_realtime add table leads;

-- Ensure the table has replica identity
ALTER TABLE leads REPLICA IDENTITY FULL;