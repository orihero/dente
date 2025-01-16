/*
  # Create trigger for automatic dentist profile creation
  
  1. New Function
    - Creates a function that will be triggered after user creation
    - Automatically creates a dentist profile for new users
    
  2. Trigger
    - Attaches the function to auth.users table
    - Runs after INSERT
*/

-- Function to create dentist profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.dentists (id, full_name, phone)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''), '');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();