-- Create new enum type
DROP TYPE IF EXISTS dentist_type CASCADE;
CREATE TYPE dentist_type AS ENUM ('admin', 'manager', 'regular');

-- Add new type column with temporary name
ALTER TABLE dentists
ADD COLUMN new_type dentist_type NOT NULL DEFAULT 'regular';

-- Update the new column based on existing type if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentists'
    AND column_name = 'type'
  ) THEN
    UPDATE dentists
    SET new_type = CASE 
      WHEN type::text = 'admin' THEN 'admin'::dentist_type
      ELSE 'regular'::dentist_type
    END;
    
    -- Drop old type column
    ALTER TABLE dentists DROP COLUMN type;
  END IF;
END $$;

-- Rename new column to type
ALTER TABLE dentists RENAME COLUMN new_type TO type;

-- Update is_admin_dentist function to include manager permissions
CREATE OR REPLACE FUNCTION is_admin_dentist()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM dentists
    WHERE id = auth.uid()
    AND type IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to include manager permissions
DROP POLICY IF EXISTS "Allow reading dentists" ON dentists;
DROP POLICY IF EXISTS "Allow dentists to update own data" ON dentists;
DROP POLICY IF EXISTS "Allow admins to update other dentists" ON dentists;
DROP POLICY IF EXISTS "Allow admins to create dentists" ON dentists;

-- Create updated policies
CREATE POLICY "Allow reading dentists"
  ON dentists
  FOR SELECT
  USING (true);

CREATE POLICY "Allow dentists to update own data"
  ON dentists
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Allow admins and managers to update other dentists"
  ON dentists
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type IN ('admin', 'manager')
    )
  );

CREATE POLICY "Allow admins and managers to create dentists"
  ON dentists
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type IN ('admin', 'manager')
    )
  );

-- Add comment
COMMENT ON TYPE dentist_type IS 'Type of dentist user: admin (full access), manager (limited admin access), regular (normal dentist)';