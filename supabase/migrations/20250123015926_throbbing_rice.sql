-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow dentists to manage their templates" ON recipe_templates;
DROP POLICY IF EXISTS "Dentists can manage their recipe templates" ON recipe_templates;
DROP POLICY IF EXISTS "dentists_manage_recipe_templates" ON recipe_templates;

-- Create recipe templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS recipe_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  name text NOT NULL,
  recipe text,
  suggestions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recipe_templates ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policy for recipe templates
CREATE POLICY "dentists_manage_recipe_templates"
  ON recipe_templates
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON recipe_templates TO authenticated;

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'recipe_templates' 
    AND indexname = 'recipe_templates_dentist_id_idx'
  ) THEN
    CREATE INDEX recipe_templates_dentist_id_idx ON recipe_templates(dentist_id);
  END IF;
END $$;