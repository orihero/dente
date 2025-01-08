/*
  # Create dentists table

  1. New Tables
    - `dentists`
      - `id` (uuid, primary key) - matches auth.users.id
      - `full_name` (text) - dentist's full name
      - `phone` (text) - contact phone number
      - `experience` (integer) - years of experience
      - `social_media` (jsonb) - social media links
      - `created_at` (timestamp) - record creation time
      - `updated_at` (timestamp) - last update time

  2. Security
    - Enable RLS on `dentists` table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
*/

CREATE TABLE IF NOT EXISTS dentists (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text NOT NULL,
  phone text NOT NULL,
  experience integer NOT NULL CHECK (experience >= 0),
  social_media jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dentists ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON dentists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON dentists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON dentists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_dentists_updated_at
  BEFORE UPDATE ON dentists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();