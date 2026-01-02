-- Add payment_method field to invoices table
-- This allows tracking how invoices were paid (cash, QR code, etc.)

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_notes TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_payment_method ON invoices(payment_method);

COMMENT ON COLUMN invoices.payment_method IS 'Payment method used: cash, gpay, phonepe, paytm, bank_transfer, etc.';
COMMENT ON COLUMN invoices.payment_notes IS 'Additional notes about the payment';
COMMENT ON COLUMN invoices.paid_at IS 'Timestamp when invoice was marked as paid';
