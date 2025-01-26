-- Add balance column to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS balance numeric DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS patients_balance_idx ON patients(balance);

-- Update existing balances
DO $$ 
BEGIN
  -- Calculate and update balances for all patients
  WITH patient_balances AS (
    SELECT 
      p.id,
      COALESCE(
        (SELECT SUM(amount) FROM payments WHERE patient_id = p.id),
        0
      ) - 
      COALESCE(
        (SELECT SUM(total_price) FROM patient_records WHERE patient_id = p.id),
        0
      ) as balance
    FROM patients p
  )
  UPDATE patients p
  SET balance = pb.balance
  FROM patient_balances pb
  WHERE p.id = pb.id;
END $$;