-- ============================================================================
-- Migration: Add show_bank_details_when_paid to invoice_settings and invoices
-- ============================================================================

-- 1. Ensure invoice_settings has show_bank_details_when_paid
ALTER TABLE IF EXISTS invoice_settings 
ADD COLUMN IF NOT EXISTS show_bank_details_when_paid BOOLEAN DEFAULT FALSE;

-- 2. Ensure invoices has show_bank_details_when_paid (nullable to inherit from settings)
ALTER TABLE IF EXISTS invoices 
ADD COLUMN IF NOT EXISTS show_bank_details_when_paid BOOLEAN DEFAULT NULL;

-- 3. Helpful column comments
COMMENT ON COLUMN invoice_settings.show_bank_details_when_paid IS 'Organization default: whether to show bank details & payment QR code on fully paid invoices';
COMMENT ON COLUMN invoices.show_bank_details_when_paid IS 'Invoice-specific override: whether to show bank details & payment QR code when paid (null = inherit from invoice_settings)';
