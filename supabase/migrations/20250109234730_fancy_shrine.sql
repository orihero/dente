/*
  # Add colors to service categories

  1. Changes
    - Add color column to service_categories table
    - Update existing categories with dark colors
*/

-- Add color column
ALTER TABLE service_categories
ADD COLUMN color text NOT NULL DEFAULT '#4A5568';

-- Update existing categories with dark colors
UPDATE service_categories
SET color = CASE
  WHEN "order" = 1 THEN '#9B2C2C' -- Dark red for therapy
  WHEN "order" = 2 THEN '#1A365D' -- Dark blue for orthopedics
  WHEN "order" = 3 THEN '#22543D' -- Dark green for surgery
  WHEN "order" = 4 THEN '#553C9A' -- Dark purple for orthodontics
  WHEN "order" = 5 THEN '#744210' -- Dark yellow/brown for gnathology
  ELSE '#4A5568'
END;