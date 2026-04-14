-- Advanced Payment Features Migration
-- Native UPI, WhatsApp Pay, Installments, Auto-reconciliation, Analytics

-- ============================================
-- UPI PAYMENT DETAILS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS upi_payment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  upi_id VARCHAR(100) NOT NULL, -- user@bank
  qr_code_url TEXT, -- Generated QR code stored in storage
  qr_code_data TEXT, -- UPI intent string
  business_name VARCHAR(200),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upi_payment_user ON upi_payment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_payment_primary ON upi_payment_details(user_id, is_primary) WHERE is_primary = true;

-- ============================================
-- PAYMENT INSTALLMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  installment_number INTEGER NOT NULL,
  total_installments INTEGER NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'waived')),
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50), -- 'upi', 'card', 'netbanking', 'cash', 'cheque', 'whatsapp_pay'
  payment_reference VARCHAR(200),
  late_fee DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(invoice_id, installment_number)
);

CREATE INDEX IF NOT EXISTS idx_installments_invoice ON payment_installments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON payment_installments(status, due_date);
CREATE INDEX IF NOT EXISTS idx_installments_overdue ON payment_installments(due_date) WHERE status = 'pending';

-- ============================================
-- BANK TRANSACTIONS TABLE (For Reconciliation)
-- ============================================

CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id VARCHAR(200) UNIQUE, -- Bank's transaction ID
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('credit', 'debit')),
  description TEXT,
  reference_number VARCHAR(200),
  upi_id VARCHAR(100), -- For UPI transactions
  bank_account VARCHAR(100),
  reconciled BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES invoices(id),
  payment_id UUID REFERENCES payments(id),
  auto_matched BOOLEAN DEFAULT false,
  match_confidence DECIMAL(5, 4), -- 0.0000 to 1.0000
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_trans_user ON bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_trans_reconciled ON bank_transactions(user_id, reconciled);
CREATE INDEX IF NOT EXISTS idx_bank_trans_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_trans_invoice ON bank_transactions(invoice_id);

-- ============================================
-- FAILED PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS failed_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(50),
  failure_reason TEXT,
  failure_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  auto_retry_enabled BOOLEAN DEFAULT true,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMP WITH TIME ZONE,
  recovered_payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_payments_invoice ON failed_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_customer ON failed_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_retry ON failed_payments(next_retry_at) WHERE recovered = false AND auto_retry_enabled = true;

-- ============================================
-- LATE FEE CONFIG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS late_fee_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grace_period_days INTEGER DEFAULT 0,
  fee_type VARCHAR(20) DEFAULT 'percentage' CHECK (fee_type IN ('percentage', 'fixed', 'tiered')),
  fee_value DECIMAL(10, 2) NOT NULL, -- Percentage or fixed amount
  max_late_fee DECIMAL(15, 2), -- Cap on late fee
  compound_daily BOOLEAN DEFAULT false, -- Compound daily or one-time
  tiered_config JSONB, -- For tiered late fees: [{days: 7, fee: 50}, {days: 15, fee: 100}]
  auto_apply BOOLEAN DEFAULT true,
  notify_customer BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_late_fee_config_user ON late_fee_config(user_id);

-- ============================================
-- BNPL APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bnpl_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  provider VARCHAR(50) NOT NULL, -- 'flexmoney', 'zestmoney', 'lazypay', 'simpl', 'custom'
  application_id VARCHAR(200), -- Provider's application ID
  requested_amount DECIMAL(15, 2) NOT NULL,
  approved_amount DECIMAL(15, 2),
  tenure_months INTEGER, -- Repayment period
  interest_rate DECIMAL(5, 2),
  status VARCHAR(30) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  provider_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bnpl_invoice ON bnpl_applications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_customer ON bnpl_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_status ON bnpl_applications(status);

-- ============================================
-- PAYMENT FOLLOW-UPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  followup_type VARCHAR(20) NOT NULL CHECK (followup_type IN ('whatsapp', 'sms', 'email', 'call')),
  status VARCHAR(30) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'replied')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  message_content TEXT,
  message_id VARCHAR(200), -- Provider message ID
  error_message TEXT,
  auto_generated BOOLEAN DEFAULT true,
  reminder_number INTEGER DEFAULT 1, -- 1st, 2nd, 3rd reminder
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_followups_invoice ON payment_followups(invoice_id);
CREATE INDEX IF NOT EXISTS idx_followups_customer ON payment_followups(customer_id);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled ON payment_followups(scheduled_at, status) WHERE status = 'pending';

-- ============================================
-- PAYMENT BEHAVIOR ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_invoices INTEGER DEFAULT 0,
  total_paid_invoices INTEGER DEFAULT 0,
  total_overdue_invoices INTEGER DEFAULT 0,
  avg_payment_delay_days DECIMAL(10, 2), -- Average days past due date
  payment_reliability_score DECIMAL(5, 2), -- 0 to 100
  preferred_payment_method VARCHAR(50),
  total_amount_paid DECIMAL(15, 2) DEFAULT 0,
  total_late_fees_paid DECIMAL(15, 2) DEFAULT 0,
  failed_payment_count INTEGER DEFAULT 0,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  payment_pattern VARCHAR(30), -- 'early_payer', 'on_time', 'occasional_late', 'chronic_late', 'defaulter'
  risk_category VARCHAR(20), -- 'low', 'medium', 'high'
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_behavior_customer ON payment_behavior_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_behavior_score ON payment_behavior_analytics(payment_reliability_score);
CREATE INDEX IF NOT EXISTS idx_payment_behavior_risk ON payment_behavior_analytics(risk_category);

-- ============================================
-- WHATSAPP PAYMENT LINKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS whatsapp_payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  payment_link TEXT NOT NULL,
  short_link VARCHAR(100), -- Shortened URL
  qr_code_url TEXT, -- QR code for the payment link
  whatsapp_number VARCHAR(20),
  sent_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_expired BOOLEAN DEFAULT false,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_links_invoice ON whatsapp_payment_links(invoice_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_links_customer ON whatsapp_payment_links(customer_id);

-- ============================================
-- ADD PAYMENT FIELDS TO EXISTING TABLES
-- ============================================

-- Add fields to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS installment_plan BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_installments INTEGER;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS installment_frequency VARCHAR(20); -- 'weekly', 'monthly', 'quarterly'
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS late_fee_applied DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS late_fee_last_calculated TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bnpl_enabled BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS auto_followup_enabled BOOLEAN DEFAULT true;

-- Add fields to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_transaction_id VARCHAR(200);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS whatsapp_payment BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS installment_id UUID REFERENCES payment_installments(id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- UPI Payment Details
ALTER TABLE upi_payment_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own UPI details" ON upi_payment_details;
CREATE POLICY "Users manage own UPI details" ON upi_payment_details FOR ALL USING (auth.uid() = user_id);

-- Payment Installments
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage installments" ON payment_installments;
CREATE POLICY "Users manage installments" ON payment_installments FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_installments.invoice_id AND invoices.user_id = auth.uid()));

-- Bank Transactions
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own bank transactions" ON bank_transactions;
CREATE POLICY "Users manage own bank transactions" ON bank_transactions FOR ALL USING (auth.uid() = user_id);

-- Failed Payments
ALTER TABLE failed_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own failed payments" ON failed_payments;
CREATE POLICY "Users view own failed payments" ON failed_payments FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = failed_payments.invoice_id AND invoices.user_id = auth.uid()));

-- Late Fee Config
ALTER TABLE late_fee_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own late fee config" ON late_fee_config;
CREATE POLICY "Users manage own late fee config" ON late_fee_config FOR ALL USING (auth.uid() = user_id);

-- BNPL Applications
ALTER TABLE bnpl_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own BNPL applications" ON bnpl_applications;
CREATE POLICY "Users view own BNPL applications" ON bnpl_applications FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = bnpl_applications.invoice_id AND invoices.user_id = auth.uid()));

-- Payment Follow-ups
ALTER TABLE payment_followups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own followups" ON payment_followups;
CREATE POLICY "Users manage own followups" ON payment_followups FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_followups.invoice_id AND invoices.user_id = auth.uid()));

-- Payment Behavior Analytics
ALTER TABLE payment_behavior_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own customer analytics" ON payment_behavior_analytics;
CREATE POLICY "Users view own customer analytics" ON payment_behavior_analytics FOR ALL USING (auth.uid() = user_id);

-- WhatsApp Payment Links
ALTER TABLE whatsapp_payment_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own WhatsApp links" ON whatsapp_payment_links;
CREATE POLICY "Users manage own WhatsApp links" ON whatsapp_payment_links FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = whatsapp_payment_links.invoice_id AND invoices.user_id = auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate late fee
CREATE OR REPLACE FUNCTION calculate_late_fee(
  p_invoice_id UUID,
  p_due_date DATE,
  p_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_config RECORD;
  v_days_overdue INTEGER;
  v_late_fee DECIMAL := 0;
  v_user_id UUID;
BEGIN
  -- Get invoice user
  SELECT user_id INTO v_user_id FROM invoices WHERE id = p_invoice_id;
  
  -- Get late fee config
  SELECT * INTO v_config FROM late_fee_config 
  WHERE user_id = v_user_id AND is_active = true
  ORDER BY created_at DESC LIMIT 1;
  
  IF v_config IS NULL OR NOT v_config.auto_apply THEN
    RETURN 0;
  END IF;
  
  -- Calculate days overdue
  v_days_overdue := CURRENT_DATE - p_due_date - v_config.grace_period_days;
  
  IF v_days_overdue <= 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate fee based on type
  IF v_config.fee_type = 'percentage' THEN
    v_late_fee := p_amount * (v_config.fee_value / 100);
    IF v_config.compound_daily THEN
      v_late_fee := v_late_fee * v_days_overdue;
    END IF;
  ELSIF v_config.fee_type = 'fixed' THEN
    v_late_fee := v_config.fee_value;
    IF v_config.compound_daily THEN
      v_late_fee := v_late_fee * v_days_overdue;
    END IF;
  END IF;
  
  -- Apply cap if exists
  IF v_config.max_late_fee IS NOT NULL AND v_late_fee > v_config.max_late_fee THEN
    v_late_fee := v_config.max_late_fee;
  END IF;
  
  RETURN v_late_fee;
END;
$$ LANGUAGE plpgsql;

-- Function to update payment behavior analytics
CREATE OR REPLACE FUNCTION update_payment_behavior(p_customer_id UUID) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_total_invoices INTEGER;
  v_paid_invoices INTEGER;
  v_overdue_invoices INTEGER;
  v_avg_delay DECIMAL;
  v_score DECIMAL;
  v_pattern VARCHAR(30);
  v_risk VARCHAR(20);
BEGIN
  -- Get user_id
  SELECT user_id INTO v_user_id FROM customers WHERE id = p_customer_id;
  
  -- Calculate metrics
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'paid' THEN 1 END),
    COUNT(CASE WHEN status = 'overdue' THEN 1 END)
  INTO v_total_invoices, v_paid_invoices, v_overdue_invoices
  FROM invoices WHERE customer_id = p_customer_id;
  
  -- Calculate average delay
  SELECT AVG(EXTRACT(DAY FROM paid_at - due_date::TIMESTAMPTZ))
  INTO v_avg_delay
  FROM invoices WHERE customer_id = p_customer_id AND status = 'paid' AND paid_at > due_date::TIMESTAMPTZ;
  
  -- Calculate reliability score (0-100)
  IF v_total_invoices > 0 THEN
    v_score := (v_paid_invoices::DECIMAL / v_total_invoices) * 100;
    v_score := GREATEST(0, v_score - (COALESCE(v_avg_delay, 0) * 2)); -- Penalize delays
  ELSE
    v_score := 50; -- Neutral for new customers
  END IF;
  
  -- Determine payment pattern
  IF v_avg_delay IS NULL OR v_avg_delay <= 0 THEN
    v_pattern := 'early_payer';
  ELSIF v_avg_delay <= 3 THEN
    v_pattern := 'on_time';
  ELSIF v_avg_delay <= 10 THEN
    v_pattern := 'occasional_late';
  ELSIF v_avg_delay <= 30 THEN
    v_pattern := 'chronic_late';
  ELSE
    v_pattern := 'defaulter';
  END IF;
  
  -- Determine risk category
  IF v_score >= 80 THEN
    v_risk := 'low';
  ELSIF v_score >= 50 THEN
    v_risk := 'medium';
  ELSE
    v_risk := 'high';
  END IF;
  
  -- Upsert analytics
  INSERT INTO payment_behavior_analytics (
    customer_id, user_id, total_invoices, total_paid_invoices, 
    total_overdue_invoices, avg_payment_delay_days, payment_reliability_score,
    payment_pattern, risk_category, last_updated
  ) VALUES (
    p_customer_id, v_user_id, v_total_invoices, v_paid_invoices,
    v_overdue_invoices, COALESCE(v_avg_delay, 0), v_score,
    v_pattern, v_risk, NOW()
  )
  ON CONFLICT (customer_id, user_id) 
  DO UPDATE SET
    total_invoices = EXCLUDED.total_invoices,
    total_paid_invoices = EXCLUDED.total_paid_invoices,
    total_overdue_invoices = EXCLUDED.total_overdue_invoices,
    avg_payment_delay_days = EXCLUDED.avg_payment_delay_days,
    payment_reliability_score = EXCLUDED.payment_reliability_score,
    payment_pattern = EXCLUDED.payment_pattern,
    risk_category = EXCLUDED.risk_category,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to auto-match bank transactions with invoices
CREATE OR REPLACE FUNCTION auto_match_bank_transaction(p_transaction_id UUID) RETURNS VOID AS $$
DECLARE
  v_trans RECORD;
  v_invoice_id UUID;
  v_confidence DECIMAL;
BEGIN
  SELECT * INTO v_trans FROM bank_transactions WHERE id = p_transaction_id;
  
  IF v_trans.transaction_type = 'credit' AND NOT v_trans.reconciled THEN
    -- Try to match with pending invoices
    -- Match by amount and customer reference
    SELECT i.id, 0.9 INTO v_invoice_id, v_confidence
    FROM invoices i
    INNER JOIN customers c ON i.customer_id = c.id
    WHERE i.user_id = v_trans.user_id
      AND i.status IN ('sent', 'overdue')
      AND ABS(i.total - v_trans.amount) < 1 -- Within 1 rupee
    ORDER BY i.due_date DESC
    LIMIT 1;
    
    IF v_invoice_id IS NOT NULL THEN
      UPDATE bank_transactions 
      SET invoice_id = v_invoice_id,
          auto_matched = true,
          match_confidence = v_confidence,
          updated_at = NOW()
      WHERE id = p_transaction_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp triggers
DROP TRIGGER IF EXISTS update_upi_payment_updated_at ON upi_payment_details;
CREATE TRIGGER update_upi_payment_updated_at BEFORE UPDATE ON upi_payment_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_installments_updated_at ON payment_installments;
CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON payment_installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_trans_updated_at ON bank_transactions;
CREATE TRIGGER update_bank_trans_updated_at BEFORE UPDATE ON bank_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_failed_payments_updated_at ON failed_payments;
CREATE TRIGGER update_failed_payments_updated_at BEFORE UPDATE ON failed_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_late_fee_config_updated_at ON late_fee_config;
CREATE TRIGGER update_late_fee_config_updated_at BEFORE UPDATE ON late_fee_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bnpl_updated_at ON bnpl_applications;
CREATE TRIGGER update_bnpl_updated_at BEFORE UPDATE ON bnpl_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_followups_updated_at ON payment_followups;
CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON payment_followups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update payment behavior on invoice status change
CREATE OR REPLACE FUNCTION trigger_update_payment_behavior() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('paid', 'overdue') THEN
    PERFORM update_payment_behavior(NEW.customer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoice_status_update_behavior ON invoices;
CREATE TRIGGER invoice_status_update_behavior
AFTER UPDATE OF status ON invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_update_payment_behavior();

-- ============================================
-- VIEWS
-- ============================================

-- Overdue invoices with late fees
DROP VIEW IF EXISTS invoices_with_late_fees;
CREATE OR REPLACE VIEW invoices_with_late_fees AS
SELECT 
  i.*,
  calculate_late_fee(i.id, i.due_date, i.total) as calculated_late_fee,
  CASE 
    WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled') 
    THEN CURRENT_DATE - i.due_date 
    ELSE 0 
  END as days_overdue
FROM invoices i
WHERE i.status NOT IN ('paid', 'cancelled');

-- Payment analytics summary
DROP VIEW IF EXISTS payment_analytics_summary;
CREATE OR REPLACE VIEW payment_analytics_summary AS
SELECT 
  user_id,
  COUNT(*) as total_customers,
  AVG(payment_reliability_score) as avg_reliability_score,
  COUNT(CASE WHEN risk_category = 'high' THEN 1 END) as high_risk_customers,
  COUNT(CASE WHEN payment_pattern = 'defaulter' THEN 1 END) as defaulter_count,
  SUM(total_amount_paid) as total_collected
FROM payment_behavior_analytics
GROUP BY user_id;

COMMENT ON TABLE upi_payment_details IS 'UPI payment configuration for businesses';
COMMENT ON TABLE payment_installments IS 'Installment payment plans for invoices';
COMMENT ON TABLE bank_transactions IS 'Bank transactions for auto-reconciliation';
COMMENT ON TABLE failed_payments IS 'Failed payment attempts and recovery tracking';
COMMENT ON TABLE late_fee_config IS 'Late fee calculation configuration';
COMMENT ON TABLE bnpl_applications IS 'Buy Now Pay Later applications for MSMEs';
COMMENT ON TABLE payment_followups IS 'Automated payment reminder follow-ups';
COMMENT ON TABLE payment_behavior_analytics IS 'Customer payment behavior analysis';
COMMENT ON TABLE whatsapp_payment_links IS 'WhatsApp payment links and tracking';
