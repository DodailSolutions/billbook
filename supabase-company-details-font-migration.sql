-- Add company details font customization columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_font_size INTEGER DEFAULT 12 
CHECK (company_details_font_size >= 10 AND company_details_font_size <= 16);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET company_details_font_family = 'Arial' 
WHERE company_details_font_family IS NULL;

UPDATE invoice_settings 
SET company_details_font_size = 12 
WHERE company_details_font_size IS NULL;

COMMENT ON COLUMN invoice_settings.company_details_font_family IS 'Font family for company details (address, email, phone, GSTIN)';
COMMENT ON COLUMN invoice_settings.company_details_font_size IS 'Font size for company details in pixels (10-16)';
