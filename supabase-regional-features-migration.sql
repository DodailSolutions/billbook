-- =====================================================
-- REGIONAL & MOBILE FEATURES MIGRATION
-- Language support, offline sync, voice commands
-- =====================================================

-- =====================================================
-- 1. USER LANGUAGE PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS user_language_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Language Settings
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',  -- en, hi, te, ta
  invoice_language VARCHAR(10) NOT NULL DEFAULT 'en',
  ui_language VARCHAR(10) NOT NULL DEFAULT 'en',
  
  -- Regional Settings
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  number_format VARCHAR(20) DEFAULT 'indian',  -- indian, international
  currency_format VARCHAR(20) DEFAULT 'INR',
  
  -- Voice Settings
  voice_enabled BOOLEAN DEFAULT false,
  voice_language VARCHAR(10) DEFAULT 'en-IN',
  voice_speed DECIMAL(3, 1) DEFAULT 1.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- 2. INDIAN INVOICE TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template Info
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL,  -- standard, professional, modern, traditional, retail, service
  template_language VARCHAR(10) DEFAULT 'en',
  
  -- Design
  template_design JSONB NOT NULL,  -- Full template configuration
  color_scheme VARCHAR(50),  -- blue, green, red, orange, purple, traditional
  font_family VARCHAR(100),  -- devanagari, tamil, telugu, english
  
  -- Features
  show_company_logo BOOLEAN DEFAULT true,
  show_gst_details BOOLEAN DEFAULT true,
  show_bank_details BOOLEAN DEFAULT true,
  show_terms BOOLEAN DEFAULT true,
  show_signature BOOLEAN DEFAULT true,
  show_qr_code BOOLEAN DEFAULT false,
  
  -- Language-specific fields
  header_text JSONB,  -- { en: "Invoice", hi: "बीजक", te: "ఇన్వాయిస్", ta: "விலைப்பட்டியல்" }
  footer_text JSONB,
  terms_text JSONB,
  
  -- Indian business specific
  show_pan BOOLEAN DEFAULT false,
  show_msme_number BOOLEAN DEFAULT false,
  show_udyam_number BOOLEAN DEFAULT false,
  show_iec_code BOOLEAN DEFAULT false,
  
  -- Usage
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,  -- Public templates anyone can use
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. OFFLINE SYNC QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action Details
  entity_type VARCHAR(100) NOT NULL,  -- invoice, customer, payment, etc.
  entity_id UUID,
  action_type VARCHAR(50) NOT NULL,  -- create, update, delete
  
  -- Data
  action_data JSONB NOT NULL,
  previous_data JSONB,  -- For conflict resolution
  
  -- Sync Status
  sync_status VARCHAR(50) DEFAULT 'pending',  -- pending, syncing, synced, failed, conflict
  sync_attempts INTEGER DEFAULT 0,
  last_sync_attempt TIMESTAMPTZ,
  
  -- Conflict Resolution
  has_conflict BOOLEAN DEFAULT false,
  conflict_details JSONB,
  resolved BOOLEAN DEFAULT false,
  resolution_strategy VARCHAR(50),  -- server_wins, client_wins, merge, manual
  
  -- Device Info
  device_id VARCHAR(255),
  device_type VARCHAR(50),  -- mobile, tablet, desktop
  app_version VARCHAR(50),
  
  -- Network
  created_offline BOOLEAN DEFAULT false,
  sync_priority INTEGER DEFAULT 5,  -- 1-10, higher = more important
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_offline_sync_user_status ON offline_sync_queue(user_id, sync_status);
CREATE INDEX IF NOT EXISTS idx_offline_sync_entity ON offline_sync_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_priority ON offline_sync_queue(sync_priority DESC, created_at ASC) WHERE sync_status = 'pending';

-- =====================================================
-- 4. OFFLINE CACHE METADATA
-- =====================================================

CREATE TABLE IF NOT EXISTS offline_cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cache Info
  cache_key VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  
  -- Data
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  data_version INTEGER DEFAULT 1,
  data_checksum VARCHAR(64),  -- For integrity check
  
  -- Size
  data_size_bytes BIGINT,
  compressed BOOLEAN DEFAULT false,
  
  -- Access
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  
  -- Device
  device_id VARCHAR(255),
  
  UNIQUE(user_id, cache_key, device_id)
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON offline_cache_metadata(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cache_last_accessed ON offline_cache_metadata(last_accessed);

-- =====================================================
-- 5. VOICE COMMANDS LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS voice_commands_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Voice Input
  transcript TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en-IN',  -- en-IN, hi-IN, te-IN, ta-IN
  confidence_score DECIMAL(5, 4),  -- 0.0000 to 1.0000
  
  -- Recognition
  recognized_intent VARCHAR(100),  -- create_invoice, view_customers, check_payment, etc.
  recognized_entities JSONB,  -- Extracted entities (customer name, amount, etc.)
  
  -- Processing
  processing_status VARCHAR(50) DEFAULT 'processed',  -- processing, processed, failed
  processing_time_ms INTEGER,
  
  -- Action Taken
  action_executed VARCHAR(100),
  action_result VARCHAR(50),  -- success, failed, cancelled
  action_data JSONB,
  
  -- Error Handling
  error_message TEXT,
  fallback_used BOOLEAN DEFAULT false,
  
  -- User Feedback
  user_confirmed BOOLEAN,
  user_corrected BOOLEAN DEFAULT false,
  corrected_transcript TEXT,
  
  -- Context
  previous_command_id UUID REFERENCES voice_commands_log(id),
  session_id VARCHAR(255),
  
  -- Device
  device_type VARCHAR(50),
  browser VARCHAR(100),
  
  -- Training Data
  used_for_training BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing voice_commands_log table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_commands_log' AND column_name = 'recognized_intent') THEN
    ALTER TABLE voice_commands_log ADD COLUMN recognized_intent VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_commands_log' AND column_name = 'recognized_entities') THEN
    ALTER TABLE voice_commands_log ADD COLUMN recognized_entities JSONB;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_voice_commands_user ON voice_commands_log(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_intent ON voice_commands_log(recognized_intent);
CREATE INDEX IF NOT EXISTS idx_voice_commands_date ON voice_commands_log(created_at DESC);

-- =====================================================
-- 6. WHATSAPP QUICK ACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action Details
  action_name VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,  -- send_invoice, payment_reminder, thank_you, follow_up
  
  -- Trigger
  trigger_type VARCHAR(50),  -- manual, automatic, scheduled
  trigger_condition JSONB,  -- Conditions for auto-trigger
  
  -- Message Template
  message_template TEXT NOT NULL,
  variables JSONB,  -- Template variables
  
  -- Media
  include_pdf BOOLEAN DEFAULT false,
  include_payment_link BOOLEAN DEFAULT false,
  include_qr_code BOOLEAN DEFAULT false,
  
  -- Language
  message_language VARCHAR(10) DEFAULT 'en',  -- en, hi, te, ta
  auto_translate BOOLEAN DEFAULT false,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Sorting
  display_order INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_actions_user ON whatsapp_quick_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_actions_type ON whatsapp_quick_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_actions_order ON whatsapp_quick_actions(display_order);

-- =====================================================
-- 7. MOBILE APP SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Offline Mode
  offline_mode_enabled BOOLEAN DEFAULT true,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_on_wifi_only BOOLEAN DEFAULT false,
  sync_interval_minutes INTEGER DEFAULT 30,
  
  -- Cache
  max_cache_size_mb INTEGER DEFAULT 100,
  cache_invoices BOOLEAN DEFAULT true,
  cache_customers BOOLEAN DEFAULT true,
  cache_products BOOLEAN DEFAULT true,
  cache_days INTEGER DEFAULT 30,
  
  -- Notifications
  push_notifications_enabled BOOLEAN DEFAULT true,
  payment_received_notification BOOLEAN DEFAULT true,
  payment_overdue_notification BOOLEAN DEFAULT true,
  daily_summary_notification BOOLEAN DEFAULT false,
  
  -- Quick Actions
  quick_create_invoice BOOLEAN DEFAULT true,
  quick_record_payment BOOLEAN DEFAULT true,
  quick_send_reminder BOOLEAN DEFAULT true,
  
  -- Theme
  theme VARCHAR(20) DEFAULT 'light',  -- light, dark, auto
  compact_view BOOLEAN DEFAULT false,
  
  -- Security
  biometric_login_enabled BOOLEAN DEFAULT false,
  auto_lock_minutes INTEGER DEFAULT 15,
  require_pin BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_cache_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_commands_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_language_preferences_policy ON user_language_preferences;
CREATE POLICY user_language_preferences_policy ON user_language_preferences FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS invoice_templates_policy ON invoice_templates;
CREATE POLICY invoice_templates_policy ON invoice_templates FOR ALL USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS offline_sync_queue_policy ON offline_sync_queue;
CREATE POLICY offline_sync_queue_policy ON offline_sync_queue FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS offline_cache_metadata_policy ON offline_cache_metadata;
CREATE POLICY offline_cache_metadata_policy ON offline_cache_metadata FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS voice_commands_log_policy ON voice_commands_log;
CREATE POLICY voice_commands_log_policy ON voice_commands_log FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS whatsapp_quick_actions_policy ON whatsapp_quick_actions;
CREATE POLICY whatsapp_quick_actions_policy ON whatsapp_quick_actions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS mobile_app_settings_policy ON mobile_app_settings;
CREATE POLICY mobile_app_settings_policy ON mobile_app_settings FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-cleanup old offline sync records
CREATE OR REPLACE FUNCTION cleanup_synced_records() RETURNS void AS $$
BEGIN
  DELETE FROM offline_sync_queue 
  WHERE sync_status = 'synced' 
  AND synced_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM offline_cache_metadata
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Get pending sync count
CREATE OR REPLACE FUNCTION get_pending_sync_count(p_user_id UUID) 
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM offline_sync_queue
  WHERE user_id = p_user_id
  AND sync_status IN ('pending', 'failed');
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED PUBLIC TEMPLATES
-- =====================================================

-- Insert default Indian invoice templates
INSERT INTO invoice_templates (
  template_name,
  template_type,
  template_design,
  color_scheme,
  is_public
) VALUES
(
  'Professional GST Invoice',
  'professional',
  '{"layout": "modern", "sections": ["header", "items", "tax", "footer"]}'::jsonb,
  'blue',
  true
),
(
  'Traditional Business Invoice',
  'traditional',
  '{"layout": "classic", "sections": ["header", "items", "tax", "bank_details", "footer"]}'::jsonb,
  'traditional',
  true
),
(
  'Modern Retail Invoice',
  'modern',
  '{"layout": "minimal", "sections": ["header", "items", "tax", "qr_code"]}'::jsonb,
  'green',
  true
),
(
  'Service Invoice',
  'service',
  '{"layout": "clean", "sections": ["header", "services", "tax", "terms", "footer"]}'::jsonb,
  'purple',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE user_language_preferences IS 'User language and regional preferences for UI and invoices';
COMMENT ON TABLE invoice_templates IS 'Indian business invoice templates with multi-language support';
COMMENT ON TABLE offline_sync_queue IS 'Queue for offline-first mobile app data synchronization';
COMMENT ON TABLE offline_cache_metadata IS 'Metadata for offline cached data';
COMMENT ON TABLE voice_commands_log IS 'Voice command recognition log with Indian accent support';
COMMENT ON TABLE whatsapp_quick_actions IS 'Quick action buttons for WhatsApp-first UX';
COMMENT ON TABLE mobile_app_settings IS 'Mobile app specific settings and preferences';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
