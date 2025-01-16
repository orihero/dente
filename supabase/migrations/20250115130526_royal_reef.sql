/*
  # Insert dentist profile for existing user
  
  1. Insert
    - Creates a dentist profile for the existing authenticated user
    - Only inserts if profile doesn't exist
*/

DO $$ 
BEGIN
  -- Insert dentist profile for existing user if it doesn't exist
  INSERT INTO public.dentists (id, full_name, phone)
  SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', ''),
    ''
  FROM auth.users
  WHERE NOT EXISTS (
    SELECT 1 FROM public.dentists WHERE dentists.id = auth.users.id
  );
END $$;