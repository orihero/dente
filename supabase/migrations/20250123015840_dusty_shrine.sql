-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow dentists to manage their templates" ON recipe_templates;
DROP POLICY IF EXISTS "Dentists can manage their recipe templates" ON recipe_templates;

-- Create comprehensive policy for recipe templates
CREATE POLICY "dentists_manage_recipe_templates"
  ON recipe_templates
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE recipe_templates ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON recipe_templates TO authenticated;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS recipe_templates_dentist_id_idx ON recipe_templates(dentist_id);

-- Add comment
COMMENT ON TABLE recipe_templates IS 'Stores recipe and suggestion templates for dentists';