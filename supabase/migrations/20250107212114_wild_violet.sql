-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS dentists (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text NOT NULL,
  phone text NOT NULL,
  experience integer NOT NULL CHECK (experience >= 0),
  social_media jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE dentists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own profile" ON dentists;
  DROP POLICY IF EXISTS "Users can update own profile" ON dentists;
  DROP POLICY IF EXISTS "Users can insert own profile" ON dentists;
END $$;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON dentists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON dentists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON dentists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create or replace function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS update_dentists_updated_at ON dentists;
CREATE TRIGGER update_dentists_updated_at
  BEFORE UPDATE ON dentists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();