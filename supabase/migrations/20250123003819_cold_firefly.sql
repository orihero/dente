-- Drop existing notifications table if it exists
DROP TABLE IF EXISTS notifications;

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('sms', 'telegram')),
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  recipient text NOT NULL,
  message text NOT NULL,
  error text,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow reading notifications"
  ON notifications
  FOR SELECT
  USING (true);

CREATE POLICY "Allow creating notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Add indexes
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_status_idx ON notifications(status);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Set replica identity
ALTER TABLE notifications REPLICA IDENTITY FULL;