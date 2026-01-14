-- WHATSAPP WEB CONNECT MIGRATION
-- Enables WhatsApp Web integration for sending invoices directly from the app

-- 1. CREATE WHATSAPP CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, connected, disconnected, error
    qr_code TEXT, -- Base64 QR code for initial connection
    connected_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_whatsapp_connections_user_id ON whatsapp_connections(user_id);
CREATE INDEX idx_whatsapp_connections_session_id ON whatsapp_connections(session_id);
CREATE INDEX idx_whatsapp_connections_status ON whatsapp_connections(status);

-- Add RLS policies
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WhatsApp connections"
    ON whatsapp_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WhatsApp connections"
    ON whatsapp_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WhatsApp connections"
    ON whatsapp_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WhatsApp connections"
    ON whatsapp_connections FOR DELETE
    USING (auth.uid() = user_id);

-- 2. CREATE WHATSAPP MESSAGES TABLE
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    recipient_name TEXT,
    message TEXT NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- text, document, image
    attachment_url TEXT,
    media_url TEXT,
    media_type TEXT,
    sent_by_me BOOLEAN DEFAULT true,
    read BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, delivered, read, failed
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX idx_whatsapp_messages_connection_id ON whatsapp_messages(connection_id);
CREATE INDEX idx_whatsapp_messages_contact_id ON whatsapp_messages(contact_id);
CREATE INDEX idx_whatsapp_messages_invoice_id ON whatsapp_messages(invoice_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);

-- Add RLS policies
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WhatsApp messages"
    ON whatsapp_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WhatsApp messages"
    ON whatsapp_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WhatsApp messages"
    ON whatsapp_messages FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. ADD WHATSAPP PHONE TO CUSTOMERS TABLE
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'whatsapp_phone'
    ) THEN
        ALTER TABLE customers ADD COLUMN whatsapp_phone TEXT;
    END IF;
END $$;

-- 4. CREATE FUNCTION TO AUTO-UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_whatsapp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS update_whatsapp_connections_updated_at ON whatsapp_connections;
CREATE TRIGGER update_whatsapp_connections_updated_at
    BEFORE UPDATE ON whatsapp_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_updated_at();

DROP TRIGGER IF EXISTS update_whatsapp_messages_updated_at ON whatsapp_messages;
CREATE TRIGGER update_whatsapp_messages_updated_at
    BEFORE UPDATE ON whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_updated_at();

-- Add comments
COMMENT ON TABLE whatsapp_connections IS 'Stores WhatsApp Web connections for users';
COMMENT ON TABLE whatsapp_messages IS 'Stores WhatsApp messages sent from the application';
COMMENT ON COLUMN customers.whatsapp_phone IS 'Customer WhatsApp phone number (can be different from regular phone)';
