/*
  # Create dentists table
  
  1. New Tables
    - `dentists`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `phone` (text, required)
      - `experience` (integer, default 0)
      - `birthdate` (date, optional)
      - `photo_url` (text, optional)
      - `social_media` (jsonb, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS dentists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  experience integer DEFAULT 0,
  birthdate date,
  photo_url text,
  social_media jsonb DEFAULT '{"platforms": []}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dentists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data"
  ON dentists
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());