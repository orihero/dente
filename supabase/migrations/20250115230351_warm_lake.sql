-- Add missing columns to dentists table
ALTER TABLE dentists 
ADD COLUMN IF NOT EXISTS telegram_bot_settings jsonb DEFAULT '{
  "loyalty": {
    "birthday": {
      "enabled": false,
      "days_before": 0,
      "days_after": 0,
      "percentage": 0
    }
  },
  "referral": {
    "enabled": false,
    "percentage": 0,
    "days_active": 0
  }
}'::jsonb;

-- Create function to handle Telegram bot registration
CREATE OR REPLACE FUNCTION handle_telegram_bot_registration()
RETURNS trigger AS $$
BEGIN
  -- Clear registration token after successful registration
  IF NEW.telegram_bot_registered = true AND OLD.telegram_bot_registered = false THEN
    NEW.telegram_registration_token = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for Telegram bot registration
DROP TRIGGER IF EXISTS on_telegram_bot_registration ON dentists;
CREATE TRIGGER on_telegram_bot_registration
  BEFORE UPDATE ON dentists
  FOR EACH ROW
  WHEN (NEW.telegram_bot_registered IS DISTINCT FROM OLD.telegram_bot_registered)
  EXECUTE FUNCTION handle_telegram_bot_registration();

-- Create function to generate registration token
CREATE OR REPLACE FUNCTION generate_telegram_registration_token(dentist_id uuid)
RETURNS text AS $$
DECLARE
  token uuid;
BEGIN
  -- Generate new token
  token := gen_random_uuid();
  
  -- Update dentist with new token
  UPDATE dentists
  SET telegram_registration_token = token
  WHERE id = dentist_id;
  
  -- Return token
  RETURN token::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;