/*
  # Add Telegram Fields to Patients Table

  1. Changes
    - Add `telegram_chat_id` column to store the patient's Telegram chat ID
    - Add `telegram_registered` column to track if patient is registered with the bot
    - Add `telegram_registration_token` column for secure registration links
*/

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS telegram_chat_id text,
ADD COLUMN IF NOT EXISTS telegram_registered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram_registration_token uuid;

-- Create unique index on telegram_registration_token
CREATE UNIQUE INDEX IF NOT EXISTS patients_telegram_registration_token_idx 
ON patients(telegram_registration_token) 
WHERE telegram_registration_token IS NOT NULL;

-- Create unique index on telegram_chat_id
CREATE UNIQUE INDEX IF NOT EXISTS patients_telegram_chat_id_idx 
ON patients(telegram_chat_id) 
WHERE telegram_chat_id IS NOT NULL;