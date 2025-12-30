-- Combined migration for all invoice customization features
-- Run this in your Supabase SQL Editor

-- 1. Add logo size column
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS logo_size VARCHAR(10) DEFAULT 'medium'
CHECK (logo_size IN ('small', 'medium', 'large'));

-- 2. Add company font customization columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_size INTEGER DEFAULT 24 
CHECK (company_font_size >= 16 AND company_font_size <= 48);

-- 3. Add company name styling columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_name_color VARCHAR(7) DEFAULT '#000000';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_weight VARCHAR(10) DEFAULT 'bold'
CHECK (company_font_weight IN ('normal', 'bold', 'bolder'));

-- 4. Add invoice body text font columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS invoice_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS invoice_font_size INTEGER DEFAULT 14 
CHECK (invoice_font_size >= 10 AND invoice_font_size <= 18);

-- 5. Add company details font columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_font_size INTEGER DEFAULT 12 
CHECK (company_details_font_size >= 10 AND company_details_font_size <= 16);

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_color VARCHAR(7) DEFAULT '#6b7280';

-- 6. Add terms and conditions font columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS terms_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS terms_font_size INTEGER DEFAULT 12 
CHECK (terms_font_size >= 10 AND terms_font_size <= 16);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET 
    logo_size = COALESCE(logo_size, 'medium'),
    company_font_family = COALESCE(company_font_family, 'Arial'),
    company_font_size = COALESCE(company_font_size, 24),
    company_name_color = COALESCE(company_name_color, '#000000'),
    company_font_weight = COALESCE(company_font_weight, 'bold'),
    invoice_font_family = COALESCE(invoice_font_family, 'Arial'),
    invoice_font_size = COALESCE(invoice_font_size, 14),
    company_details_font_family = COALESCE(company_details_font_family, 'Arial'),
    company_details_font_size = COALESCE(company_details_font_size, 12),
    company_details_color = COALESCE(company_details_color, '#6b7280'),
    terms_font_family = COALESCE(terms_font_family, 'Arial'),
    terms_font_size = COALESCE(terms_font_size, 12);

-- Add comments for documentation
COMMENT ON COLUMN invoice_settings.logo_size IS 'Size of the company logo (small: 64px, medium: 96px, large: 128px)';
COMMENT ON COLUMN invoice_settings.company_font_family IS 'Font family for company name';
COMMENT ON COLUMN invoice_settings.company_font_size IS 'Font size for company name in pixels (16-48)';
COMMENT ON COLUMN invoice_settings.company_name_color IS 'Color for company name text (hex format)';
COMMENT ON COLUMN invoice_settings.company_font_weight IS 'Font weight for company name (normal, bold, bolder)';
COMMENT ON COLUMN invoice_settings.invoice_font_family IS 'Font family for invoice body text';
COMMENT ON COLUMN invoice_settings.invoice_font_size IS 'Font size for invoice body text in pixels (10-18)';
COMMENT ON COLUMN invoice_settings.company_details_font_family IS 'Font family for company details (address, email, phone)';
COMMENT ON COLUMN invoice_settings.company_details_font_size IS 'Font size for company details in pixels (10-16)';
COMMENT ON COLUMN invoice_settings.company_details_color IS 'Color for company details text (hex format)';
COMMENT ON COLUMN invoice_settings.terms_font_family IS 'Font family for terms, conditions, and notes text';
COMMENT ON COLUMN invoice_settings.terms_font_size IS 'Font size for terms, conditions, and notes text in pixels (10-16)';
