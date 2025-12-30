-- Add company font customization columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_size INTEGER DEFAULT 24 
CHECK (company_font_size >= 16 AND company_font_size <= 48);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET company_font_family = 'Arial' 
WHERE company_font_family IS NULL;

UPDATE invoice_settings 
SET company_font_size = 24 
WHERE company_font_size IS NULL;

COMMENT ON COLUMN invoice_settings.company_font_family IS 'Font family for company name (Arial, Helvetica, etc.)';
COMMENT ON COLUMN invoice_settings.company_font_size IS 'Font size for company name in pixels (16-48)';
