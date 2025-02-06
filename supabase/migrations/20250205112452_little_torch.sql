-- Drop existing policies for service categories and base services
DROP POLICY IF EXISTS "Everyone can read service categories" ON service_categories;
DROP POLICY IF EXISTS "Everyone can read base services" ON base_services;

-- Create comprehensive policies for service categories
CREATE POLICY "service_categories_select"
  ON service_categories
  FOR SELECT
  USING (true);

-- Create comprehensive policies for base services
CREATE POLICY "base_services_select"
  ON base_services
  FOR SELECT
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON service_categories TO anon;
GRANT SELECT ON service_categories TO authenticated;
GRANT SELECT ON base_services TO anon;
GRANT SELECT ON base_services TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS base_services_category_id_idx ON base_services(category_id);
CREATE INDEX IF NOT EXISTS service_categories_order_idx ON service_categories("order");

-- Add comments
COMMENT ON TABLE service_categories IS 'Stores service categories with names and colors';
COMMENT ON TABLE base_services IS 'Stores base service definitions that dentists can use';