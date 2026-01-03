-- Invoice Template Settings Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Company Information
  company_name VARCHAR(255),
  company_email VARCHAR(255),
  company_phone VARCHAR(20),
  company_address TEXT,
  company_gstin VARCHAR(15),
  company_logo_url TEXT,
  
  -- Invoice Customization
  invoice_prefix VARCHAR(10) DEFAULT 'INV',
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#8B5CF6',
  
  -- Terms and Conditions
  terms_and_conditions TEXT,
  payment_instructions TEXT,
  footer_text TEXT,
  
  -- Display Options
  show_logo BOOLEAN DEFAULT true,
  show_company_details BOOLEAN DEFAULT true,
  show_gstin BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own invoice settings" ON invoice_settings;
CREATE POLICY "Users can view their own invoice settings"
  ON invoice_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoice settings" ON invoice_settings;
CREATE POLICY "Users can insert their own invoice settings"
  ON invoice_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoice settings" ON invoice_settings;
CREATE POLICY "Users can update their own invoice settings"
  ON invoice_settings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invoice settings" ON invoice_settings;
CREATE POLICY "Users can delete their own invoice settings"
  ON invoice_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_invoice_settings_user_id ON invoice_settings(user_id);
