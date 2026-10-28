-- ==============================================================================
-- Client Email Configuration & Email Templates Migration
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Table for Client Email / SMTP Configuration (Per-Tenant / User)
CREATE TABLE IF NOT EXISTS user_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  reply_to_email VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'system' CHECK (provider IN ('system', 'custom_smtp')),
  smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
  smtp_port INTEGER DEFAULT 587 CHECK (smtp_port > 0 AND smtp_port < 65536),
  smtp_secure BOOLEAN DEFAULT false,
  smtp_user VARCHAR(255),
  smtp_password TEXT,
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  last_test_status VARCHAR(50), -- 'success', 'failed', 'pending'
  last_test_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for Client Email Templates (Customizable per user)
CREATE TABLE IF NOT EXISTS user_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('invoice_delivery', 'payment_reminder', 'payment_receipt', 'quotation', 'general')),
  name VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_email_settings_user_id ON user_email_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_email_templates_user_type ON user_email_templates(user_id, template_type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can insert own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can update own email settings" ON user_email_settings;
DROP POLICY IF EXISTS "Users can delete own email settings" ON user_email_settings;

DROP POLICY IF EXISTS "Users can view own email templates" ON user_email_templates;
DROP POLICY IF EXISTS "Users can insert own email templates" ON user_email_templates;
DROP POLICY IF EXISTS "Users can update own email templates" ON user_email_templates;
DROP POLICY IF EXISTS "Users can delete own email templates" ON user_email_templates;

-- Policies for user_email_settings
CREATE POLICY "Users can view own email settings"
  ON user_email_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email settings"
  ON user_email_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email settings"
  ON user_email_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own email settings"
  ON user_email_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_email_templates
CREATE POLICY "Users can view own email templates"
  ON user_email_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email templates"
  ON user_email_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email templates"
  ON user_email_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own email templates"
  ON user_email_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_user_email_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_email_settings_timestamp ON user_email_settings;
CREATE TRIGGER user_email_settings_timestamp
BEFORE UPDATE ON user_email_settings
FOR EACH ROW EXECUTE FUNCTION update_user_email_timestamp();

DROP TRIGGER IF EXISTS user_email_templates_timestamp ON user_email_templates;
CREATE TRIGGER user_email_templates_timestamp
BEFORE UPDATE ON user_email_templates
FOR EACH ROW EXECUTE FUNCTION update_user_email_timestamp();
