-- Create function to handle dentist creation on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO dentists (id, full_name, phone, experience)
  VALUES (new.id, '', '', 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Create missing dentist records for existing users
INSERT INTO dentists (id, full_name, phone, experience)
SELECT id, '', '', 0
FROM auth.users
WHERE id NOT IN (SELECT id FROM dentists);