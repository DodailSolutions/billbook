-- Add company details color and terms font customization columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_color VARCHAR(7) DEFAULT '#6b7280';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS terms_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS terms_font_size INTEGER DEFAULT 12 
CHECK (terms_font_size >= 10 AND terms_font_size <= 16);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET company_details_color = '#6b7280' 
WHERE company_details_color IS NULL;

UPDATE invoice_settings 
SET terms_font_family = 'Arial' 
WHERE terms_font_family IS NULL;

UPDATE invoice_settings 
SET terms_font_size = 12 
WHERE terms_font_size IS NULL;

COMMENT ON COLUMN invoice_settings.company_details_color IS 'Color for company details text (hex format)';
COMMENT ON COLUMN invoice_settings.terms_font_family IS 'Font family for terms, conditions, and notes text';
COMMENT ON COLUMN invoice_settings.terms_font_size IS 'Font size for terms, conditions, and notes text in pixels (10-16)';
