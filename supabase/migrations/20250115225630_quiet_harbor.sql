/*
  # Add Telegram Bot Settings and Discount Tables

  1. New Tables
    - `discounts`
      - `id` (uuid, primary key)
      - `dentist_id` (uuid, references dentists)
      - `type` (text, enum: 'birthday', 'custom', 'referral', 'dentist_referral')
      - `percentage` (numeric)
      - `days_before` (integer, for birthday discounts)
      - `days_after` (integer, for birthday discounts)
      - `start_date` (date, for custom discounts)
      - `end_date` (date, for custom discounts)
      - `days_active` (integer, for referral discounts)
      - `enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `leads`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `phone` (text)
      - `email` (text)
      - `referred_by` (uuid, references dentists)
      - `status` (text, enum: 'new', 'contacted', 'converted', 'rejected')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create discount types enum
CREATE TYPE discount_type AS ENUM ('birthday', 'custom', 'referral', 'dentist_referral');

-- Create lead status enum
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'rejected');

-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  type discount_type NOT NULL,
  percentage numeric NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  days_before integer CHECK (days_before >= 0),
  days_after integer CHECK (days_after >= 0),
  start_date date,
  end_date date,
  days_active integer CHECK (days_active > 0),
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Add constraints for different discount types
  CONSTRAINT valid_birthday_discount CHECK (
    (type = 'birthday' AND days_before IS NOT NULL AND days_after IS NOT NULL) OR
    (type != 'birthday' AND days_before IS NULL AND days_after IS NULL)
  ),
  CONSTRAINT valid_custom_discount CHECK (
    (type = 'custom' AND start_date IS NOT NULL AND end_date IS NOT NULL) OR
    (type != 'custom' AND start_date IS NULL AND end_date IS NULL)
  ),
  CONSTRAINT valid_referral_discount CHECK (
    (type IN ('referral', 'dentist_referral') AND days_active IS NOT NULL) OR
    (type NOT IN ('referral', 'dentist_referral') AND days_active IS NULL)
  ),
  CONSTRAINT valid_date_range CHECK (
    start_date IS NULL OR end_date IS NULL OR start_date <= end_date
  )
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  referred_by uuid REFERENCES dentists(id) ON DELETE SET NULL,
  status lead_status NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for discounts
CREATE POLICY "Dentists can manage their own discounts"
  ON discounts
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Create policies for leads
CREATE POLICY "Everyone can create leads"
  ON leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Dentists can view leads they referred"
  ON leads
  FOR SELECT
  USING (referred_by = auth.uid());

-- Add indexes
CREATE INDEX IF NOT EXISTS discounts_dentist_id_idx ON discounts(dentist_id);
CREATE INDEX IF NOT EXISTS discounts_type_idx ON discounts(type);
CREATE INDEX IF NOT EXISTS discounts_enabled_idx ON discounts(enabled);
CREATE INDEX IF NOT EXISTS leads_referred_by_idx ON leads(referred_by);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);

-- Add telegram_bot_registered column to dentists
ALTER TABLE dentists 
ADD COLUMN IF NOT EXISTS telegram_bot_registered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram_bot_chat_id text,
ADD COLUMN IF NOT EXISTS telegram_registration_token uuid;

-- Create unique index on telegram_registration_token
CREATE UNIQUE INDEX IF NOT EXISTS dentists_telegram_registration_token_idx 
ON dentists(telegram_registration_token) 
WHERE telegram_registration_token IS NOT NULL;

-- Create unique index on telegram_bot_chat_id
CREATE UNIQUE INDEX IF NOT EXISTS dentists_telegram_bot_chat_id_idx 
ON dentists(telegram_bot_chat_id) 
WHERE telegram_bot_chat_id IS NOT NULL;