-- Add subscription related columns
ALTER TABLE dentists
ADD COLUMN subscription_status text NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
ADD COLUMN subscription_ends_at timestamptz,
ADD COLUMN subscription_started_at timestamptz DEFAULT now();

-- Create function to extend subscription
CREATE OR REPLACE FUNCTION extend_dentist_subscription(
  dentist_id uuid,
  months integer
)
RETURNS void AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM dentists
    WHERE id = auth.uid()
    AND type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can extend subscriptions';
  END IF;

  -- Update subscription
  UPDATE dentists
  SET 
    subscription_status = 'active',
    subscription_ends_at = COALESCE(
      subscription_ends_at,
      CURRENT_TIMESTAMP
    ) + (months || ' months')::interval
  WHERE id = dentist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION extend_dentist_subscription TO authenticated;