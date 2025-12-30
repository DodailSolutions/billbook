-- Add invoice body text font customization columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS invoice_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS invoice_font_size INTEGER DEFAULT 12 
CHECK (invoice_font_size >= 10 AND invoice_font_size <= 18);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET invoice_font_family = 'Arial' 
WHERE invoice_font_family IS NULL;

UPDATE invoice_settings 
SET invoice_font_size = 12 
WHERE invoice_font_size IS NULL;

COMMENT ON COLUMN invoice_settings.invoice_font_family IS 'Font family for invoice body text';
COMMENT ON COLUMN invoice_settings.invoice_font_size IS 'Font size for invoice body text in pixels (10-18)';
