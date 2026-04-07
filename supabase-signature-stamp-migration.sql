-- Add digital signature and company stamp columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings
ADD COLUMN IF NOT EXISTS digital_signature_url TEXT,
ADD COLUMN IF NOT EXISTS show_signature BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS company_stamp_url TEXT,
ADD COLUMN IF NOT EXISTS show_stamp BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN invoice_settings.digital_signature_url IS 'Base64 or URL of owner digital signature image';
COMMENT ON COLUMN invoice_settings.show_signature IS 'Whether to display digital signature on invoices';
COMMENT ON COLUMN invoice_settings.company_stamp_url IS 'Base64 or URL of company stamp/seal image';
COMMENT ON COLUMN invoice_settings.show_stamp IS 'Whether to display company stamp on invoices';
