-- Add company name color and font weight columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_name_color VARCHAR(7);

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_weight VARCHAR(10) DEFAULT 'bold'
CHECK (company_font_weight IN ('normal', 'bold', 'bolder'));

-- Update existing rows to use primary_color for company_name_color if not set
UPDATE invoice_settings 
SET company_name_color = COALESCE(company_name_color, primary_color, '#3B82F6');

UPDATE invoice_settings 
SET company_font_weight = 'bold' 
WHERE company_font_weight IS NULL;

COMMENT ON COLUMN invoice_settings.company_name_color IS 'Color for company name text (hex format)';
COMMENT ON COLUMN invoice_settings.company_font_weight IS 'Font weight for company name (normal, bold, bolder)';
