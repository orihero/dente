-- Drop existing policies if they exist
DROP POLICY IF EXISTS "dentists_manage_recipe_templates" ON recipe_templates;

-- Create comprehensive policies for recipe templates
CREATE POLICY "recipe_templates_select"
  ON recipe_templates
  FOR SELECT
  USING (dentist_id = auth.uid());

CREATE POLICY "recipe_templates_insert"
  ON recipe_templates
  FOR INSERT
  WITH CHECK (dentist_id = auth.uid());

CREATE POLICY "recipe_templates_update"
  ON recipe_templates
  FOR UPDATE
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

CREATE POLICY "recipe_templates_delete"
  ON recipe_templates
  FOR DELETE
  USING (dentist_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE recipe_templates ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON recipe_templates TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS recipe_templates_dentist_id_idx ON recipe_templates(dentist_id);
CREATE INDEX IF NOT EXISTS recipe_templates_created_at_idx ON recipe_templates(created_at);

-- Add comment
COMMENT ON TABLE recipe_templates IS 'Stores recipe and suggestion templates for dentists';