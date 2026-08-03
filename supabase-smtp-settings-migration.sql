-- SMTP Settings Table for Admin Email Configuration
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- SMTP Configuration
  smtp_host VARCHAR(255) NOT NULL DEFAULT 'smtp-mail.outlook.com',
  smtp_port INTEGER NOT NULL DEFAULT 587 CHECK (smtp_port > 0 AND smtp_port < 65536),
  smtp_user VARCHAR(255) NOT NULL,
  smtp_password TEXT NOT NULL, -- Will be encrypted
  smtp_from_email VARCHAR(255) NOT NULL,
  smtp_from_name VARCHAR(255) DEFAULT 'BillBooky Support',
  
  -- Security & Status
  is_active BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP,
  last_test_status VARCHAR(50), -- 'success', 'failed', 'pending'
  last_test_error TEXT,
  
  -- Audit
  test_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_smtp_settings_updated_by ON smtp_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_smtp_settings_is_active ON smtp_settings(is_active);

-- Enable RLS
ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can view and modify SMTP settings
CREATE POLICY "Super admins can manage SMTP settings"
  ON smtp_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Create audit trigger
CREATE OR REPLACE FUNCTION update_smtp_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS smtp_settings_timestamp_trigger ON smtp_settings;
CREATE TRIGGER smtp_settings_timestamp_trigger
BEFORE UPDATE ON smtp_settings
FOR EACH ROW
EXECUTE FUNCTION update_smtp_settings_timestamp();
