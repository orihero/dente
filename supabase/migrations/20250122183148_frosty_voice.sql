-- Add telegram link column to dentists
ALTER TABLE dentists
ADD COLUMN telegram_link text;

-- Create function to generate telegram link
CREATE OR REPLACE FUNCTION generate_telegram_link(dentist_id uuid)
RETURNS text AS $$
DECLARE
  token uuid;
  link text;
BEGIN
  -- Generate new token
  token := gen_random_uuid();
  
  -- Update dentist with new token
  UPDATE dentists
  SET 
    telegram_registration_token = token,
    telegram_link = 'https://t.me/denteuzbot?start=' || token::text
  WHERE id = dentist_id
  AND EXISTS (
    SELECT 1 FROM dentists d
    WHERE d.id = dentist_id
    AND (d.id = auth.uid() OR d.type = 'admin')
  )
  RETURNING telegram_link INTO link;
  
  -- Return the link
  RETURN link;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_telegram_link TO authenticated;