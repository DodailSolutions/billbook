-- Voice-to-Invoice Feature Migration
-- Enables voice-based invoice creation with AI processing

-- ============================================
-- VOICE RECORDINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recording_url TEXT, -- Stored in Supabase Storage
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  mime_type VARCHAR(50) DEFAULT 'audio/webm',
  status VARCHAR(30) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'transcribed', 'parsed', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_recordings_user_id ON voice_recordings(user_id);
CREATE INDEX idx_voice_recordings_status ON voice_recordings(user_id, status);

-- ============================================
-- VOICE TRANSCRIPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voice_recording_id UUID REFERENCES voice_recordings(id) ON DELETE CASCADE NOT NULL,
  raw_transcript TEXT NOT NULL,
  confidence_score DECIMAL(5, 4), -- 0.0000 to 1.0000
  language VARCHAR(10) DEFAULT 'en-IN',
  transcription_service VARCHAR(50), -- 'web-speech-api', 'google', 'openai-whisper', etc.
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_transcriptions_recording ON voice_transcriptions(voice_recording_id);

-- ============================================
-- VOICE INVOICE PARSING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_invoice_parsing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voice_recording_id UUID REFERENCES voice_recordings(id) ON DELETE CASCADE NOT NULL,
  transcription_id UUID REFERENCES voice_transcriptions(id) NOT NULL,
  parsed_data JSONB NOT NULL, -- Structured invoice data extracted from voice
  confidence_score DECIMAL(5, 4),
  parsing_service VARCHAR(50), -- 'openai-gpt', 'custom-nlp', etc.
  validation_status VARCHAR(30) DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'valid', 'needs_review', 'invalid')),
  validation_errors JSONB, -- Array of validation issues
  invoice_id UUID REFERENCES invoices(id), -- Created invoice (if completed)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_invoice_parsing_recording ON voice_invoice_parsing(voice_recording_id);
CREATE INDEX idx_voice_invoice_parsing_invoice ON voice_invoice_parsing(invoice_id);

-- ============================================
-- VOICE COMMANDS LOG
-- ============================================

CREATE TABLE IF NOT EXISTS voice_commands_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voice_recording_id UUID REFERENCES voice_recordings(id),
  command_type VARCHAR(50) NOT NULL, -- 'create_invoice', 'add_item', 'update_customer', 'set_date', etc.
  command_text TEXT NOT NULL,
  extracted_entities JSONB, -- Entities extracted from command
  executed BOOLEAN DEFAULT false,
  execution_result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_commands_user ON voice_commands_log(user_id);
CREATE INDEX idx_voice_commands_type ON voice_commands_log(command_type);

-- ============================================
-- ADD VOICE FIELDS TO INVOICES
-- ============================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_via_voice BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voice_recording_id UUID REFERENCES voice_recordings(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voice_confidence_score DECIMAL(5, 4);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Voice Recordings
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own voice recordings" ON voice_recordings FOR ALL USING (auth.uid() = user_id);

-- Voice Transcriptions
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transcriptions" ON voice_transcriptions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM voice_recordings WHERE voice_recordings.id = voice_transcriptions.voice_recording_id AND voice_recordings.user_id = auth.uid()));

-- Voice Invoice Parsing
ALTER TABLE voice_invoice_parsing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own parsing" ON voice_invoice_parsing FOR SELECT 
  USING (EXISTS (SELECT 1 FROM voice_recordings WHERE voice_recordings.id = voice_invoice_parsing.voice_recording_id AND voice_recordings.user_id = auth.uid()));

-- Voice Commands Log
ALTER TABLE voice_commands_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own commands" ON voice_commands_log FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to extract invoice data from voice transcript
CREATE OR REPLACE FUNCTION extract_invoice_entities(p_transcript TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_customer TEXT;
  v_amount NUMERIC;
  v_items JSONB;
BEGIN
  -- This is a basic implementation - in production, use AI/NLP service
  v_result := '{}'::JSONB;
  
  -- Extract customer name (simple pattern matching)
  v_customer := substring(p_transcript FROM 'customer[:\s]+([A-Za-z\s]+)');
  IF v_customer IS NOT NULL THEN
    v_result := jsonb_set(v_result, '{customer_name}', to_jsonb(trim(v_customer)));
  END IF;
  
  -- Extract amount
  v_amount := substring(p_transcript FROM '[\$₹]\s*([0-9,\.]+)')::NUMERIC;
  IF v_amount IS NOT NULL THEN
    v_result := jsonb_set(v_result, '{total}', to_jsonb(v_amount));
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate parsed invoice data
CREATE OR REPLACE FUNCTION validate_voice_invoice_data(p_data JSONB)
RETURNS JSONB AS $$
DECLARE
  v_errors JSONB := '[]'::JSONB;
  v_is_valid BOOLEAN := true;
BEGIN
  -- Check required fields
  IF NOT (p_data ? 'customer_name' OR p_data ? 'customer_id') THEN
    v_errors := v_errors || jsonb_build_object('field', 'customer', 'message', 'Customer name or ID is required');
    v_is_valid := false;
  END IF;
  
  IF NOT (p_data ? 'items') OR jsonb_array_length(p_data->'items') = 0 THEN
    v_errors := v_errors || jsonb_build_object('field', 'items', 'message', 'At least one item is required');
    v_is_valid := false;
  END IF;
  
  IF NOT (p_data ? 'total' OR p_data ? 'subtotal') THEN
    v_errors := v_errors || jsonb_build_object('field', 'total', 'message', 'Invoice total is required');
    v_is_valid := false;
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', v_is_valid,
    'errors', v_errors
  );
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE TRIGGER update_voice_recordings_updated_at BEFORE UPDATE ON voice_recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_invoice_parsing_updated_at BEFORE UPDATE ON voice_invoice_parsing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VOICE TEMPLATES (Common Phrases)
-- ============================================

CREATE TABLE IF NOT EXISTS voice_invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  template_phrase TEXT NOT NULL, -- e.g., "Create invoice for [customer] for [amount]"
  expected_entities JSONB NOT NULL, -- List of entities to extract
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_templates_user ON voice_invoice_templates(user_id);

ALTER TABLE voice_invoice_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own templates" ON voice_invoice_templates FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

CREATE OR REPLACE VIEW voice_invoice_summary AS
SELECT 
  vr.id as recording_id,
  vr.user_id,
  vr.status as recording_status,
  vr.duration_seconds,
  vt.raw_transcript,
  vt.confidence_score as transcription_confidence,
  vip.parsed_data,
  vip.validation_status,
  vip.invoice_id,
  i.invoice_number,
  i.total as invoice_total,
  vr.created_at
FROM voice_recordings vr
LEFT JOIN voice_transcriptions vt ON vr.id = vt.voice_recording_id
LEFT JOIN voice_invoice_parsing vip ON vr.id = vip.voice_recording_id
LEFT JOIN invoices i ON vip.invoice_id = i.id
ORDER BY vr.created_at DESC;

COMMENT ON TABLE voice_recordings IS 'Stores audio recordings for voice-to-invoice feature';
COMMENT ON TABLE voice_transcriptions IS 'Stores transcribed text from voice recordings';
COMMENT ON TABLE voice_invoice_parsing IS 'Stores parsed and structured invoice data from voice input';
COMMENT ON TABLE voice_commands_log IS 'Logs all voice commands executed by users';
COMMENT ON TABLE voice_invoice_templates IS 'Pre-defined voice command templates for faster invoice creation';
