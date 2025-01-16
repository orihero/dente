/*
  # Create service tables
  
  1. New Tables
    - `service_categories`
      - `id` (uuid, primary key)
      - `name_uz` (text, required)
      - `name_ru` (text, required)
      - `color` (text, required)
      - `order` (integer, default 0)
    
    - `base_services`
      - `id` (uuid, primary key) 
      - `category_id` (uuid, foreign key to service_categories)
      - `name_uz` (text, required)
      - `name_ru` (text, required)
      - `order` (integer, default 0)
    
    - `dentist_services`
      - `id` (uuid, primary key)
      - `dentist_id` (uuid, foreign key to dentists)
      - `base_service_id` (uuid, foreign key to base_services)
      - `price` (numeric, required)
      - `duration` (text, required)
      - `warranty` (text)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  color text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read service categories"
  ON service_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Base Services
CREATE TABLE IF NOT EXISTS base_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE base_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read base services"
  ON base_services
  FOR SELECT
  TO authenticated
  USING (true);

-- Dentist Services
CREATE TABLE IF NOT EXISTS dentist_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  base_service_id uuid NOT NULL REFERENCES base_services(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  duration text NOT NULL,
  warranty text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dentist_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their services"
  ON dentist_services
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());