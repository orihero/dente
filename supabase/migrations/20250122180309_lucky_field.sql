-- Add telegram link column to dentists
ALTER TABLE dentists
ADD COLUMN telegram_link text;

-- Create function to generate telegram link
CREATE OR REPLACE FUNCTION generate_telegram_link(dentist_id uuid)
RETURNS text AS $$
DECLARE
  token uuid;
BEGIN
  -- Generate new token
  token := gen_random_uuid();
  
  -- Update dentist with new token and return link
  UPDATE dentists
  SET telegram_registration_token = token
  WHERE id = dentist_id
  AND EXISTS (
    SELECT 1 FROM dentists d
    WHERE d.id = dentist_id
    AND (d.id = auth.uid() OR d.type = 'admin')
  )
  RETURNING 'https://t.me/denteuzbot?start=' || token::text INTO token;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_telegram_link TO authenticated;