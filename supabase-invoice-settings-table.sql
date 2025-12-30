-- Create invoice_settings table with all customization columns
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Company Information
  company_name VARCHAR(255),
  company_email VARCHAR(255),
  company_phone VARCHAR(50),
  company_address TEXT,
  company_gstin VARCHAR(15),
  company_logo_url TEXT,
  
  -- Logo Settings
  logo_size VARCHAR(10) DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large')),
  
  -- Company Name Styling
  company_font_family VARCHAR(50) DEFAULT 'Arial',
  company_font_size INTEGER DEFAULT 24 CHECK (company_font_size >= 16 AND company_font_size <= 48),
  company_name_color VARCHAR(7) DEFAULT '#000000',
  company_font_weight VARCHAR(10) DEFAULT 'bold' CHECK (company_font_weight IN ('normal', 'bold', 'bolder')),
  
  -- Company Details Styling
  company_details_font_family VARCHAR(50) DEFAULT 'Arial',
  company_details_font_size INTEGER DEFAULT 12 CHECK (company_details_font_size >= 10 AND company_details_font_size <= 16),
  company_details_color VARCHAR(7) DEFAULT '#6b7280',
  
  -- Invoice Body Text Styling
  invoice_font_family VARCHAR(50) DEFAULT 'Arial',
  invoice_font_size INTEGER DEFAULT 14 CHECK (invoice_font_size >= 10 AND invoice_font_size <= 18),
  
  -- Terms & Conditions Styling
  terms_font_family VARCHAR(50) DEFAULT 'Arial',
  terms_font_size INTEGER DEFAULT 12 CHECK (terms_font_size >= 10 AND terms_font_size <= 16),
  
  -- Invoice Branding
  invoice_prefix VARCHAR(10) DEFAULT 'INV',
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#8B5CF6',
  
  -- Invoice Content
  terms_and_conditions TEXT,
  payment_instructions TEXT,
  footer_text TEXT,
  
  -- Display Options
  show_logo BOOLEAN DEFAULT true,
  show_company_details BOOLEAN DEFAULT true,
  show_gstin BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_invoice_settings_user_id ON invoice_settings(user_id);

-- Enable Row Level Security
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_settings
CREATE POLICY "Users can view their own invoice settings"
  ON invoice_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice settings"
  ON invoice_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice settings"
  ON invoice_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice settings"
  ON invoice_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE invoice_settings IS 'Stores customizable invoice settings and branding for each user';
COMMENT ON COLUMN invoice_settings.logo_size IS 'Size of company logo: small (64px), medium (96px), large (128px)';
COMMENT ON COLUMN invoice_settings.company_font_family IS 'Font family for company name';
COMMENT ON COLUMN invoice_settings.company_font_size IS 'Font size for company name in pixels (16-48)';
COMMENT ON COLUMN invoice_settings.company_name_color IS 'Hex color for company name text';
COMMENT ON COLUMN invoice_settings.company_font_weight IS 'Font weight for company name';
COMMENT ON COLUMN invoice_settings.company_details_font_family IS 'Font family for company details (address, email, phone)';
COMMENT ON COLUMN invoice_settings.company_details_font_size IS 'Font size for company details in pixels (10-16)';
COMMENT ON COLUMN invoice_settings.company_details_color IS 'Hex color for company details text';
COMMENT ON COLUMN invoice_settings.invoice_font_family IS 'Font family for invoice body text';
COMMENT ON COLUMN invoice_settings.invoice_font_size IS 'Font size for invoice body text in pixels (10-18)';
COMMENT ON COLUMN invoice_settings.terms_font_family IS 'Font family for terms, conditions, and notes';
COMMENT ON COLUMN invoice_settings.terms_font_size IS 'Font size for terms, conditions, and notes in pixels (10-16)';
