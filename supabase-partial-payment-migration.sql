-- Migration to add partial payment support to invoices
-- Run this in your Supabase SQL Editor

-- First, drop the old status check constraint if it exists
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Update the status check constraint to include 'partial'
ALTER TABLE invoices
ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'cancelled'));

-- Add columns for partial payment tracking
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_remaining DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS is_partial_payment BOOLEAN DEFAULT FALSE;

-- Update amount_remaining for existing invoices
UPDATE invoices 
SET amount_remaining = total - COALESCE(amount_paid, 0)
WHERE amount_remaining IS NULL;

-- Make amount_remaining NOT NULL after updating
ALTER TABLE invoices 
ALTER COLUMN amount_remaining SET DEFAULT 0,
ALTER COLUMN amount_remaining SET NOT NULL;

-- Add check constraint to ensure amounts are valid
ALTER TABLE invoices
ADD CONSTRAINT check_payment_amounts 
CHECK (amount_paid >= 0 AND amount_paid <= total AND amount_remaining >= 0);

-- Create index for queries on partial payments
CREATE INDEX IF NOT EXISTS idx_invoices_partial_payment ON invoices(user_id, is_partial_payment) 
WHERE is_partial_payment = true;

-- Create a payments history table for tracking multiple partial payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_notes TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for payment history
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_user_id ON invoice_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_date ON invoice_payments(payment_date);

-- Enable RLS on invoice_payments
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_payments
CREATE POLICY "Users can view their own invoice payments"
  ON invoice_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice payments"
  ON invoice_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice payments"
  ON invoice_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice payments"
  ON invoice_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update invoice status and amounts on payment
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the invoice amounts and status
  UPDATE invoices
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM invoice_payments
      WHERE invoice_id = NEW.invoice_id
    ),
    amount_remaining = total - (
      SELECT COALESCE(SUM(amount), 0)
      FROM invoice_payments
      WHERE invoice_id = NEW.invoice_id
    ),
    is_partial_payment = (
      SELECT COALESCE(SUM(amount), 0) < total AND COALESCE(SUM(amount), 0) > 0
      FROM invoice_payments
      WHERE invoice_id = NEW.invoice_id
    ),
    status = CASE
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM invoice_payments
        WHERE invoice_id = NEW.invoice_id
      ) >= total THEN 'paid'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invoice payments
DROP TRIGGER IF EXISTS trigger_update_invoice_on_payment ON invoice_payments;
CREATE TRIGGER trigger_update_invoice_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_on_payment();

-- Add comment for documentation
COMMENT ON TABLE invoice_payments IS 'Tracks individual payment transactions for invoices, enabling partial payment support';
COMMENT ON COLUMN invoices.amount_paid IS 'Total amount paid towards this invoice';
COMMENT ON COLUMN invoices.amount_remaining IS 'Remaining amount to be paid';
COMMENT ON COLUMN invoices.is_partial_payment IS 'Whether this invoice has received partial payment';
