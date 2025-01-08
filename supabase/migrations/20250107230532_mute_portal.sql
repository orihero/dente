/*
  # Add Service Categories and Base Services

  1. New Tables
    - `service_categories`
      - `id` (uuid, primary key)
      - `name_uz` (text)
      - `name_ru` (text)
      - `order` (integer)
    - `base_services`
      - `id` (uuid, primary key) 
      - `category_id` (uuid, foreign key)
      - `name_uz` (text)
      - `name_ru` (text)
      - `order` (integer)

  2. Security
    - Enable RLS
    - Add policies for read access
*/

-- Create service categories table
CREATE TABLE service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create base services table
CREATE TABLE base_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES service_categories(id) ON DELETE CASCADE NOT NULL,
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_services ENABLE ROW LEVEL SECURITY;

-- Add policies for read access
CREATE POLICY "Anyone can read service categories"
  ON service_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read base services"
  ON base_services
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert categories and store their IDs
DO $$
DECLARE
  therapy_id uuid;
  orthopedics_id uuid;
  surgery_id uuid;
  orthodontics_id uuid;
  gnathology_id uuid;
BEGIN
  -- Insert categories and store IDs
  INSERT INTO service_categories (name_uz, name_ru, "order")
  VALUES ('Даволаш (терапия)', 'Лечение (терапия)', 1)
  RETURNING id INTO therapy_id;

  INSERT INTO service_categories (name_uz, name_ru, "order")
  VALUES ('Тиш нуксонларини тиклаш, протезлар (ортопедия)', 'Восстановление зубов, протезы (ортопедия)', 2)
  RETURNING id INTO orthopedics_id;

  INSERT INTO service_categories (name_uz, name_ru, "order")
  VALUES ('Хирургия', 'Хирургия', 3)
  RETURNING id INTO surgery_id;

  INSERT INTO service_categories (name_uz, name_ru, "order")
  VALUES ('Тиш каторини тугирлаш (Ортодонтия)', 'Исправление зубного ряда (Ортодонтия)', 4)
  RETURNING id INTO orthodontics_id;

  INSERT INTO service_categories (name_uz, name_ru, "order")
  VALUES ('Гнатология', 'Гнатология', 5)
  RETURNING id INTO gnathology_id;

  -- Insert therapy services
  INSERT INTO base_services (category_id, name_uz, name_ru, "order") VALUES
    (therapy_id, 'даволанган тишларни коплама (коронка)га тайёрлаш', 'подготовка леченых зубов под коронку', 1),
    (therapy_id, 'пломба нуксонларини кайта тиклаш (пульпит, периодонтит)', 'восстановление дефектов пломб (пульпит, периодонтит)', 2),
    (therapy_id, 'реставрация килиш', 'реставрация', 3),
    (therapy_id, 'вактинчалик пломба', 'временная пломба', 4);

  -- Insert orthopedics services
  INSERT INTO base_services (category_id, name_uz, name_ru, "order") VALUES
    (orthopedics_id, 'коронка (штапмовка, м.к, церкон, винер)', 'коронка (штампованная, м/к, циркониевая, винир)', 1),
    (orthopedics_id, 'тулик ёки кисман тишсизликни протезлаш', 'полное или частичное протезирование', 2),
    (orthopedics_id, 'имплантдан кн коронка куйиш', 'установка коронки на имплант', 3);

  -- Insert surgery services
  INSERT INTO base_services (category_id, name_uz, name_ru, "order") VALUES
    (surgery_id, 'тиш олиш', 'удаление зуба', 1),
    (surgery_id, 'мураккаб олинадигон тишларни олиш', 'сложное удаление зубов', 2),
    (surgery_id, 'тиш олингандан кейинги нуксонлар бартараф этиш', 'устранение дефектов после удаления зуба', 3),
    (surgery_id, 'тиш имплантацияси урнатиш', 'установка зубного импланта', 4);
END $$;

-- Add triggers for updated_at
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_services_updated_at
  BEFORE UPDATE ON base_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();