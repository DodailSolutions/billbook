-- CA Payment and Data Access System Migration
-- Created: February 6, 2026
-- Purpose: Enable payment tracking and data access requests for hired CAs

-- CA Payments Table
CREATE TABLE IF NOT EXISTS ca_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES ca_engagements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ca_professional_id UUID NOT NULL REFERENCES ca_professionals(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  payment_gateway TEXT NOT NULL DEFAULT 'razorpay',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  invoice_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CA Data Access Requests Table
CREATE TABLE IF NOT EXISTS ca_data_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES ca_engagements(id) ON DELETE CASCADE,
  ca_professional_id UUID NOT NULL REFERENCES ca_professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_types_requested TEXT[] NOT NULL,
  purpose TEXT NOT NULL,
  access_duration_days INTEGER NOT NULL DEFAULT 90,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  specific_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  client_notes TEXT,
  access_granted_at TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CA Data Access Table (Active Access Permissions)
CREATE TABLE IF NOT EXISTS ca_data_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_request_id UUID NOT NULL REFERENCES ca_data_access_requests(id) ON DELETE CASCADE,
  ca_professional_id UUID NOT NULL REFERENCES ca_professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('invoices', 'bank_statements', 'expense_records', 'gst_portal', 'itr_portal', 'financial_statements', 'purchase_records', 'sales_records')),
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_download BOOLEAN NOT NULL DEFAULT true,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  access_start_date TIMESTAMPTZ NOT NULL,
  access_end_date TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ca_payments_engagement ON ca_payments(engagement_id);
CREATE INDEX IF NOT EXISTS idx_ca_payments_user ON ca_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_ca_payments_ca ON ca_payments(ca_professional_id);
CREATE INDEX IF NOT EXISTS idx_ca_payments_status ON ca_payments(status);

CREATE INDEX IF NOT EXISTS idx_ca_data_requests_engagement ON ca_data_access_requests(engagement_id);
CREATE INDEX IF NOT EXISTS idx_ca_data_requests_user ON ca_data_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ca_data_requests_ca ON ca_data_access_requests(ca_professional_id);
CREATE INDEX IF NOT EXISTS idx_ca_data_requests_status ON ca_data_access_requests(status);

CREATE INDEX IF NOT EXISTS idx_ca_data_access_request ON ca_data_access(access_request_id);
CREATE INDEX IF NOT EXISTS idx_ca_data_access_user ON ca_data_access(user_id);
CREATE INDEX IF NOT EXISTS idx_ca_data_access_ca ON ca_data_access(ca_professional_id);
CREATE INDEX IF NOT EXISTS idx_ca_data_access_active ON ca_data_access(is_active) WHERE is_active = true;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_ca_payments_updated_at BEFORE UPDATE ON ca_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ca_data_requests_updated_at BEFORE UPDATE ON ca_data_access_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ca_data_access_updated_at BEFORE UPDATE ON ca_data_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- CA Payments RLS
ALTER TABLE ca_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON ca_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "CAs can view payments for their engagements"
  ON ca_payments FOR SELECT
  USING (
    ca_professional_id IN (
      SELECT id FROM ca_professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their engagements"
  ON ca_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- CA Data Access Requests RLS
ALTER TABLE ca_data_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view access requests for their data"
  ON ca_data_access_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "CAs can view their own access requests"
  ON ca_data_access_requests FOR SELECT
  USING (
    ca_professional_id IN (
      SELECT id FROM ca_professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "CAs can create access requests for their engagements"
  ON ca_data_access_requests FOR INSERT
  WITH CHECK (
    ca_professional_id IN (
      SELECT id FROM ca_professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update access requests for their data"
  ON ca_data_access_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "CAs can update their own access requests"
  ON ca_data_access_requests FOR UPDATE
  USING (
    ca_professional_id IN (
      SELECT id FROM ca_professionals WHERE user_id = auth.uid()
    )
  );

-- CA Data Access RLS
ALTER TABLE ca_data_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view data access granted to CAs"
  ON ca_data_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "CAs can view their granted data access"
  ON ca_data_access FOR SELECT
  USING (
    ca_professional_id IN (
      SELECT id FROM ca_professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create data access records"
  ON ca_data_access FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can revoke data access"
  ON ca_data_access FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "CAs can update access metadata"
  ON ca_data_access FOR UPDATE
  USING (
    ca_professional_id IN (
      SELECT id FROM ca_professionals WHERE user_id = auth.uid()
    )
  );

-- Function to auto-create data access records when request is approved
CREATE OR REPLACE FUNCTION create_data_access_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Set access granted and expiry dates
    NEW.access_granted_at = NOW();
    NEW.access_expires_at = NOW() + (NEW.access_duration_days || ' days')::INTERVAL;
    NEW.reviewed_at = NOW();
    
    -- Create individual access records for each data type
    INSERT INTO ca_data_access (
      access_request_id,
      ca_professional_id,
      user_id,
      data_type,
      can_view,
      can_download,
      can_edit,
      access_start_date,
      access_end_date,
      is_active
    )
    SELECT
      NEW.id,
      NEW.ca_professional_id,
      NEW.user_id,
      unnest(NEW.data_types_requested),
      true,
      true,
      CASE WHEN unnest(NEW.data_types_requested) IN ('gst_portal', 'itr_portal') THEN true ELSE false END,
      NEW.access_granted_at,
      NEW.access_expires_at,
      true;
  END IF;
  
  -- Revoke access when request is rejected or revoked
  IF NEW.status IN ('rejected', 'revoked') AND OLD.status IN ('pending', 'approved') THEN
    NEW.reviewed_at = NOW();
    IF NEW.status = 'revoked' THEN
      NEW.revoked_at = NOW();
    END IF;
    
    -- Deactivate all related data access records
    UPDATE ca_data_access
    SET is_active = false, updated_at = NOW()
    WHERE access_request_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_data_access_request_status_change
  BEFORE UPDATE ON ca_data_access_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_data_access_on_approval();

-- Function to check if CA has active payment before requesting access
CREATE OR REPLACE FUNCTION check_payment_before_access_request()
RETURNS TRIGGER AS $$
DECLARE
  payment_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM ca_payments
    WHERE engagement_id = NEW.engagement_id
      AND status = 'completed'
      AND ca_professional_id = NEW.ca_professional_id
  ) INTO payment_exists;
  
  IF NOT payment_exists THEN
    RAISE EXCEPTION 'Payment must be completed before requesting data access';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_payment_before_access
  BEFORE INSERT ON ca_data_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION check_payment_before_access_request();

-- Function to automatically expire access
CREATE OR REPLACE FUNCTION expire_data_access()
RETURNS void AS $$
BEGIN
  UPDATE ca_data_access
  SET is_active = false, updated_at = NOW()
  WHERE is_active = true
    AND access_end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE ca_payments IS 'Tracks payments made by clients to CAs for engagements';
COMMENT ON TABLE ca_data_access_requests IS 'CA requests for access to client data (invoices, GST portal, etc.)';
COMMENT ON TABLE ca_data_access IS 'Active data access permissions granted to CAs';

COMMENT ON COLUMN ca_data_access_requests.data_types_requested IS 'Array of data types: invoices, bank_statements, expense_records, gst_portal, itr_portal, financial_statements, purchase_records, sales_records';
COMMENT ON COLUMN ca_data_access_requests.access_duration_days IS 'Number of days access should remain valid (default 90 days)';
COMMENT ON COLUMN ca_data_access.can_edit IS 'For portal access (GST, ITR), allows CA to file returns on behalf of client';
