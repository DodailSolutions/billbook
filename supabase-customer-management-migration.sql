-- =====================================================
-- CUSTOMER MANAGEMENT ADVANCED FEATURES MIGRATION
-- =====================================================
-- Features:
-- 1. Customer credit limits tracking
-- 2. Customer aging & risk score calculation
-- 3. Vendor bills + payable tracking
-- 4. Customer-wise GST summary
-- 5. Customer document vault (contracts, PAN, GST)
-- =====================================================

-- =====================================================
-- 1. CUSTOMER CREDIT LIMITS
-- =====================================================

-- Add credit limit columns to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_limit_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS credit_used DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_available DECIMAL(12, 2) GENERATED ALWAYS AS (
  CASE 
    WHEN credit_limit_enabled THEN (credit_limit - credit_used)
    ELSE NULL
  END
) STORED,
ADD COLUMN IF NOT EXISTS credit_utilization_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
  CASE 
    WHEN credit_limit_enabled AND credit_limit > 0 
    THEN ROUND((credit_used / credit_limit * 100)::NUMERIC, 2)
    ELSE 0
  END
) STORED,
ADD COLUMN IF NOT EXISTS credit_limit_exceeded BOOLEAN GENERATED ALWAYS AS (
  credit_limit_enabled AND credit_used > credit_limit
) STORED,
ADD COLUMN IF NOT EXISTS credit_limit_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS credit_limit_updated_by UUID REFERENCES auth.users(id);

-- Credit limit history tracking
CREATE TABLE IF NOT EXISTS customer_credit_limit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_limit DECIMAL(12, 2),
  new_limit DECIMAL(12, 2) NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_history_customer ON customer_credit_limit_history(customer_id);
CREATE INDEX idx_credit_history_date ON customer_credit_limit_history(created_at DESC);

-- =====================================================
-- 2. CUSTOMER AGING & RISK SCORE
-- =====================================================

-- Customer payment behavior and risk tracking
CREATE TABLE IF NOT EXISTS customer_aging_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Aging buckets (in days)
  current_amount DECIMAL(12, 2) DEFAULT 0,          -- 0-30 days
  days_30_amount DECIMAL(12, 2) DEFAULT 0,          -- 31-60 days
  days_60_amount DECIMAL(12, 2) DEFAULT 0,          -- 61-90 days
  days_90_amount DECIMAL(12, 2) DEFAULT 0,          -- 91-120 days
  days_120_plus_amount DECIMAL(12, 2) DEFAULT 0,    -- 120+ days
  
  total_outstanding DECIMAL(12, 2) GENERATED ALWAYS AS (
    current_amount + days_30_amount + days_60_amount + days_90_amount + days_120_plus_amount
  ) STORED,
  
  -- Invoice counts
  total_invoices INTEGER DEFAULT 0,
  paid_on_time_count INTEGER DEFAULT 0,
  paid_late_count INTEGER DEFAULT 0,
  overdue_count INTEGER DEFAULT 0,
  
  -- Payment metrics
  average_days_to_pay DECIMAL(8, 2) DEFAULT 0,
  longest_overdue_days INTEGER DEFAULT 0,
  
  -- Risk scoring (0-100, higher = riskier)
  risk_score DECIMAL(5, 2) DEFAULT 0,
  risk_category VARCHAR(20),  -- low, medium, high, critical
  
  -- Credit worthiness
  payment_reliability_score DECIMAL(5, 2) DEFAULT 100, -- 0-100, higher = better
  
  last_payment_date TIMESTAMP WITH TIME ZONE,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id)
);

CREATE INDEX idx_aging_customer ON customer_aging_analysis(customer_id);
CREATE INDEX idx_aging_risk_score ON customer_aging_analysis(risk_score DESC);
CREATE INDEX idx_aging_category ON customer_aging_analysis(risk_category);

-- =====================================================
-- 3. VENDOR BILLS & PAYABLE TRACKING
-- =====================================================

-- Vendors table (suppliers/creditors)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Vendor details
  vendor_name VARCHAR(255) NOT NULL,
  vendor_code VARCHAR(50),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  
  -- GST & Tax
  gstin VARCHAR(15),
  pan VARCHAR(10),
  tan VARCHAR(10),
  state_code VARCHAR(2),
  
  -- Payment terms
  payment_terms VARCHAR(100),
  default_payment_days INTEGER DEFAULT 30,
  
  -- Banking
  bank_name VARCHAR(255),
  bank_account_number VARCHAR(50),
  ifsc_code VARCHAR(11),
  bank_branch VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  vendor_category VARCHAR(100),  -- raw_material, services, utilities, etc.
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_gstin ON vendors(gstin);
CREATE INDEX idx_vendors_active ON vendors(is_active);

-- Vendor bills (payables)
CREATE TABLE IF NOT EXISTS vendor_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Bill details
  bill_number VARCHAR(100) NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE,
  
  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL,
  cgst_amount DECIMAL(12, 2) DEFAULT 0,
  sgst_amount DECIMAL(12, 2) DEFAULT 0,
  igst_amount DECIMAL(12, 2) DEFAULT 0,
  tds_amount DECIMAL(12, 2) DEFAULT 0,
  other_charges DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- Payment tracking
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  balance_amount DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  
  -- Status
  payment_status VARCHAR(20) DEFAULT 'unpaid',  -- unpaid, partially_paid, paid, overdue
  
  -- GST details
  supply_type VARCHAR(20),  -- intra-state, inter-state
  reverse_charge_applicable BOOLEAN DEFAULT false,
  
  -- References
  purchase_order_number VARCHAR(100),
  grn_number VARCHAR(100),  -- Goods Receipt Note
  
  -- Attachments
  attachment_url TEXT,
  
  -- Metadata
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, bill_number)
);

CREATE INDEX idx_bills_user ON vendor_bills(user_id);
CREATE INDEX idx_bills_vendor ON vendor_bills(vendor_id);
CREATE INDEX idx_bills_status ON vendor_bills(payment_status);
CREATE INDEX idx_bills_due_date ON vendor_bills(due_date);

-- Vendor bill items
CREATE TABLE IF NOT EXISTS vendor_bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES vendor_bills(id) ON DELETE CASCADE,
  
  -- Item details
  description TEXT NOT NULL,
  hsn_sac_code VARCHAR(10),
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'unit',
  unit_price DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Tax
  gst_rate DECIMAL(5, 2) DEFAULT 0,
  gst_amount DECIMAL(12, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bill_items_bill ON vendor_bill_items(bill_id);

-- Vendor payment records
CREATE TABLE IF NOT EXISTS vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES vendor_bills(id) ON DELETE SET NULL,
  
  -- Payment details
  payment_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50),  -- cash, bank_transfer, cheque, upi, card
  
  -- Reference
  transaction_reference VARCHAR(100),
  cheque_number VARCHAR(50),
  bank_account VARCHAR(100),
  
  -- TDS
  tds_deducted DECIMAL(12, 2) DEFAULT 0,
  tds_percentage DECIMAL(5, 2) DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendor_payments_user ON vendor_payments(user_id);
CREATE INDEX idx_vendor_payments_vendor ON vendor_payments(vendor_id);
CREATE INDEX idx_vendor_payments_bill ON vendor_payments(bill_id);
CREATE INDEX idx_vendor_payments_date ON vendor_payments(payment_date DESC);

-- =====================================================
-- 4. CUSTOMER-WISE GST SUMMARY
-- =====================================================

-- Customer GST summary tracking
CREATE TABLE IF NOT EXISTS customer_gst_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  financial_year VARCHAR(10) NOT NULL,
  
  -- Transaction summary
  total_invoices INTEGER DEFAULT 0,
  total_taxable_value DECIMAL(15, 2) DEFAULT 0,
  
  -- GST breakdown
  total_cgst DECIMAL(12, 2) DEFAULT 0,
  total_sgst DECIMAL(12, 2) DEFAULT 0,
  total_igst DECIMAL(12, 2) DEFAULT 0,
  total_gst DECIMAL(12, 2) GENERATED ALWAYS AS (total_cgst + total_sgst + total_igst) STORED,
  
  -- Supply type breakdown
  intra_state_value DECIMAL(15, 2) DEFAULT 0,
  inter_state_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Reverse charge
  reverse_charge_invoices INTEGER DEFAULT 0,
  reverse_charge_value DECIMAL(15, 2) DEFAULT 0,
  
  -- HSN/SAC wise summary (JSON)
  hsn_sac_breakdown JSONB DEFAULT '[]'::jsonb,
  
  -- Tax rate wise summary
  gst_rate_breakdown JSONB DEFAULT '[]'::jsonb,
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id, financial_year)
);

CREATE INDEX idx_gst_summary_customer ON customer_gst_summary(customer_id);
CREATE INDEX idx_gst_summary_fy ON customer_gst_summary(financial_year);
CREATE INDEX idx_gst_summary_user ON customer_gst_summary(user_id);

-- =====================================================
-- 5. CUSTOMER DOCUMENT VAULT
-- =====================================================

-- Document vault for customer files
CREATE TABLE IF NOT EXISTS customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document details
  document_type VARCHAR(50) NOT NULL,  -- contract, pan, gst_certificate, agreement, msme, other
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type VARCHAR(50),  -- pdf, jpg, png, doc, etc.
  
  -- Document metadata
  document_number VARCHAR(100),  -- PAN number, GST number, contract number
  issue_date DATE,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_expired BOOLEAN DEFAULT false,
  
  -- Version control
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES customer_documents(id),
  
  -- Access control
  is_confidential BOOLEAN DEFAULT false,
  
  -- Metadata
  description TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_customer ON customer_documents(customer_id);
CREATE INDEX idx_documents_type ON customer_documents(document_type);
CREATE INDEX idx_documents_expiry ON customer_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_documents_active ON customer_documents(is_active);

-- Document access log
CREATE TABLE IF NOT EXISTS customer_document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES customer_documents(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES auth.users(id),
  access_type VARCHAR(20) NOT NULL,  -- view, download, share, delete
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_doc_access_document ON customer_document_access_log(document_id);
CREATE INDEX idx_doc_access_user ON customer_document_access_log(accessed_by);
CREATE INDEX idx_doc_access_date ON customer_document_access_log(accessed_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update credit used based on unpaid invoices
CREATE OR REPLACE FUNCTION update_customer_credit_used()
RETURNS TRIGGER AS $$
BEGIN
  -- Update credit used for the customer
  UPDATE customers
  SET credit_used = (
    SELECT COALESCE(SUM(total), 0)
    FROM invoices
    WHERE customer_id = NEW.customer_id
    AND status IN ('unpaid', 'overdue', 'partially_paid')
  )
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on invoice status changes
DROP TRIGGER IF EXISTS trigger_update_credit_used ON invoices;
CREATE TRIGGER trigger_update_credit_used
AFTER INSERT OR UPDATE OF status, total ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_customer_credit_used();

-- Function to calculate customer aging and risk score
CREATE OR REPLACE FUNCTION calculate_customer_aging_risk(
  p_customer_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
DECLARE
  v_current_amount DECIMAL(12, 2) := 0;
  v_30_amount DECIMAL(12, 2) := 0;
  v_60_amount DECIMAL(12, 2) := 0;
  v_90_amount DECIMAL(12, 2) := 0;
  v_120_amount DECIMAL(12, 2) := 0;
  v_total_invoices INTEGER;
  v_paid_on_time INTEGER;
  v_paid_late INTEGER;
  v_overdue INTEGER;
  v_avg_days DECIMAL(8, 2);
  v_longest_overdue INTEGER;
  v_risk_score DECIMAL(5, 2);
  v_risk_category VARCHAR(20);
  v_reliability DECIMAL(5, 2);
  v_last_payment TIMESTAMP;
BEGIN
  -- Calculate aging buckets
  SELECT 
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date <= 30 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 31 AND 60 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 61 AND 90 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 91 AND 120 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date > 120 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0)
  INTO v_current_amount, v_30_amount, v_60_amount, v_90_amount, v_120_amount
  FROM invoices
  WHERE customer_id = p_customer_id 
    AND user_id = p_user_id
    AND status IN ('unpaid', 'overdue', 'partially_paid');

  -- Calculate payment metrics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'paid' AND payment_date IS NOT NULL AND payment_date <= due_date),
    COUNT(*) FILTER (WHERE status = 'paid' AND payment_date IS NOT NULL AND payment_date > due_date),
    COUNT(*) FILTER (WHERE status = 'overdue'),
    COALESCE(AVG(CASE WHEN payment_date IS NOT NULL AND due_date IS NOT NULL 
                 THEN EXTRACT(DAY FROM payment_date - due_date) END), 0),
    COALESCE(MAX(CASE WHEN status = 'overdue' THEN CURRENT_DATE - due_date END), 0),
    MAX(payment_date)
  INTO v_total_invoices, v_paid_on_time, v_paid_late, v_overdue, v_avg_days, v_longest_overdue, v_last_payment
  FROM invoices
  WHERE customer_id = p_customer_id AND user_id = p_user_id;

  -- Calculate risk score (0-100, higher = riskier)
  v_risk_score := 0;
  
  -- Factor 1: Overdue percentage (40 points max)
  IF v_total_invoices > 0 THEN
    v_risk_score := v_risk_score + ((v_overdue::DECIMAL / v_total_invoices) * 40);
  END IF;
  
  -- Factor 2: Aging severity (30 points max)
  v_risk_score := v_risk_score + 
    (v_30_amount / NULLIF(v_current_amount + v_30_amount + v_60_amount + v_90_amount + v_120_amount, 0) * 6) +
    (v_60_amount / NULLIF(v_current_amount + v_30_amount + v_60_amount + v_90_amount + v_120_amount, 0) * 12) +
    (v_90_amount / NULLIF(v_current_amount + v_30_amount + v_60_amount + v_90_amount + v_120_amount, 0) * 18) +
    (v_120_amount / NULLIF(v_current_amount + v_30_amount + v_60_amount + v_90_amount + v_120_amount, 0) * 30);
  
  -- Factor 3: Average delay days (20 points max)
  v_risk_score := v_risk_score + LEAST(v_avg_days / 3, 20);
  
  -- Factor 4: Longest overdue (10 points max)
  v_risk_score := v_risk_score + LEAST(v_longest_overdue / 30, 10);

  -- Determine risk category
  v_risk_category := CASE
    WHEN v_risk_score >= 75 THEN 'critical'
    WHEN v_risk_score >= 50 THEN 'high'
    WHEN v_risk_score >= 25 THEN 'medium'
    ELSE 'low'
  END;

  -- Calculate payment reliability (inverse of risk)
  v_reliability := 100 - v_risk_score;

  -- Upsert aging analysis
  INSERT INTO customer_aging_analysis (
    customer_id, user_id,
    current_amount, days_30_amount, days_60_amount, days_90_amount, days_120_plus_amount,
    total_invoices, paid_on_time_count, paid_late_count, overdue_count,
    average_days_to_pay, longest_overdue_days,
    risk_score, risk_category, payment_reliability_score,
    last_payment_date, last_calculated_at, updated_at
  )
  VALUES (
    p_customer_id, p_user_id,
    v_current_amount, v_30_amount, v_60_amount, v_90_amount, v_120_amount,
    v_total_invoices, v_paid_on_time, v_paid_late, v_overdue,
    v_avg_days, v_longest_overdue,
    v_risk_score, v_risk_category, v_reliability,
    v_last_payment, NOW(), NOW()
  )
  ON CONFLICT (customer_id, user_id)
  DO UPDATE SET
    current_amount = v_current_amount,
    days_30_amount = v_30_amount,
    days_60_amount = v_60_amount,
    days_90_amount = v_90_amount,
    days_120_plus_amount = v_120_amount,
    total_invoices = v_total_invoices,
    paid_on_time_count = v_paid_on_time,
    paid_late_count = v_paid_late,
    overdue_count = v_overdue,
    average_days_to_pay = v_avg_days,
    longest_overdue_days = v_longest_overdue,
    risk_score = v_risk_score,
    risk_category = v_risk_category,
    payment_reliability_score = v_reliability,
    last_payment_date = v_last_payment,
    last_calculated_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update customer GST summary
CREATE OR REPLACE FUNCTION update_customer_gst_summary(
  p_customer_id UUID,
  p_user_id UUID,
  p_financial_year VARCHAR(10)
)
RETURNS void AS $$
DECLARE
  v_total_invoices INTEGER;
  v_total_taxable DECIMAL(15, 2);
  v_total_cgst DECIMAL(12, 2);
  v_total_sgst DECIMAL(12, 2);
  v_total_igst DECIMAL(12, 2);
  v_intra_state DECIMAL(15, 2);
  v_inter_state DECIMAL(15, 2);
  v_rc_count INTEGER;
  v_rc_value DECIMAL(15, 2);
  v_hsn_breakdown JSONB;
  v_rate_breakdown JSONB;
BEGIN
  -- Calculate summary values
  SELECT 
    COUNT(*),
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(cgst_amount), 0),
    COALESCE(SUM(sgst_amount), 0),
    COALESCE(SUM(igst_amount), 0),
    COALESCE(SUM(CASE WHEN supply_type = 'intra-state' THEN subtotal ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN supply_type = 'inter-state' THEN subtotal ELSE 0 END), 0),
    COUNT(*) FILTER (WHERE reverse_charge_applicable = true),
    COALESCE(SUM(CASE WHEN reverse_charge_applicable = true THEN subtotal ELSE 0 END), 0)
  INTO v_total_invoices, v_total_taxable, v_total_cgst, v_total_sgst, v_total_igst,
       v_intra_state, v_inter_state, v_rc_count, v_rc_value
  FROM invoices
  WHERE customer_id = p_customer_id 
    AND user_id = p_user_id
    AND financial_year = p_financial_year;

  -- HSN/SAC breakdown
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_hsn_breakdown
  FROM (
    SELECT 
      ii.hsn_sac_code,
      COUNT(*) as invoice_count,
      SUM(ii.amount) as total_value,
      SUM(ii.gst_amount) as total_gst
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.customer_id = p_customer_id 
      AND i.user_id = p_user_id
      AND i.financial_year = p_financial_year
      AND ii.hsn_sac_code IS NOT NULL
    GROUP BY ii.hsn_sac_code
  ) t;

  -- GST rate breakdown
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_rate_breakdown
  FROM (
    SELECT 
      ii.gst_rate,
      COUNT(DISTINCT i.id) as invoice_count,
      SUM(ii.amount) as taxable_value,
      SUM(ii.gst_amount) as gst_amount
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.customer_id = p_customer_id 
      AND i.user_id = p_user_id
      AND i.financial_year = p_financial_year
    GROUP BY ii.gst_rate
  ) t;

  -- Upsert summary
  INSERT INTO customer_gst_summary (
    customer_id, user_id, financial_year,
    total_invoices, total_taxable_value,
    total_cgst, total_sgst, total_igst,
    intra_state_value, inter_state_value,
    reverse_charge_invoices, reverse_charge_value,
    hsn_sac_breakdown, gst_rate_breakdown,
    last_updated
  )
  VALUES (
    p_customer_id, p_user_id, p_financial_year,
    v_total_invoices, v_total_taxable,
    v_total_cgst, v_total_sgst, v_total_igst,
    v_intra_state, v_inter_state,
    v_rc_count, v_rc_value,
    v_hsn_breakdown, v_rate_breakdown,
    NOW()
  )
  ON CONFLICT (customer_id, user_id, financial_year)
  DO UPDATE SET
    total_invoices = v_total_invoices,
    total_taxable_value = v_total_taxable,
    total_cgst = v_total_cgst,
    total_sgst = v_total_sgst,
    total_igst = v_total_igst,
    intra_state_value = v_intra_state,
    inter_state_value = v_inter_state,
    reverse_charge_invoices = v_rc_count,
    reverse_charge_value = v_rc_value,
    hsn_sac_breakdown = v_hsn_breakdown,
    gst_rate_breakdown = v_rate_breakdown,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update vendor bill payment status
CREATE OR REPLACE FUNCTION update_vendor_bill_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update paid amount
  UPDATE vendor_bills
  SET 
    paid_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM vendor_payments
      WHERE bill_id = NEW.bill_id
    ),
    payment_status = CASE
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM vendor_payments WHERE bill_id = NEW.bill_id) = 0 
        THEN 'unpaid'
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM vendor_payments WHERE bill_id = NEW.bill_id) >= total_amount 
        THEN 'paid'
      ELSE 'partially_paid'
    END,
    updated_at = NOW()
  WHERE id = NEW.bill_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on vendor payments
DROP TRIGGER IF EXISTS trigger_update_bill_status ON vendor_payments;
CREATE TRIGGER trigger_update_bill_status
AFTER INSERT OR UPDATE ON vendor_payments
FOR EACH ROW
EXECUTE FUNCTION update_vendor_bill_status();

-- Function to check and update document expiry status
CREATE OR REPLACE FUNCTION update_document_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_expired := (NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update document expiry on insert/update
DROP TRIGGER IF EXISTS trigger_update_document_expiry ON customer_documents;
CREATE TRIGGER trigger_update_document_expiry
BEFORE INSERT OR UPDATE ON customer_documents
FOR EACH ROW
EXECUTE FUNCTION update_document_expiry();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Comprehensive customer financial view
CREATE OR REPLACE VIEW customer_financial_overview AS
SELECT 
  c.id as customer_id,
  c.user_id,
  c.name as customer_name,
  c.email,
  c.gstin,
  c.credit_limit,
  c.credit_limit_enabled,
  c.credit_used,
  c.credit_available,
  c.credit_utilization_percentage,
  c.credit_limit_exceeded,
  
  -- Aging data
  ca.current_amount,
  ca.days_30_amount,
  ca.days_60_amount,
  ca.days_90_amount,
  ca.days_120_plus_amount,
  ca.total_outstanding,
  ca.risk_score,
  ca.risk_category,
  ca.payment_reliability_score,
  ca.average_days_to_pay,
  ca.longest_overdue_days,
  ca.last_payment_date,
  
  -- GST summary
  cgs.total_invoices as gst_invoice_count,
  cgs.total_taxable_value as gst_taxable_value,
  cgs.total_gst as gst_total_tax,
  
  -- Document counts
  (SELECT COUNT(*) FROM customer_documents WHERE customer_id = c.id AND is_active = true) as total_documents,
  (SELECT COUNT(*) FROM customer_documents WHERE customer_id = c.id AND document_type = 'contract' AND is_active = true) as contract_count,
  (SELECT COUNT(*) FROM customer_documents WHERE customer_id = c.id AND is_expired = true) as expired_documents
  
FROM customers c
LEFT JOIN customer_aging_analysis ca ON c.id = ca.customer_id AND c.user_id = ca.user_id
LEFT JOIN customer_gst_summary cgs ON c.id = cgs.customer_id AND c.user_id = cgs.user_id;

-- Vendor payables summary
CREATE OR REPLACE VIEW vendor_payables_summary AS
SELECT 
  v.id as vendor_id,
  v.user_id,
  v.vendor_name,
  v.gstin,
  v.payment_terms,
  v.is_active,
  
  COUNT(vb.id) as total_bills,
  COALESCE(SUM(vb.total_amount), 0) as total_bill_amount,
  COALESCE(SUM(vb.paid_amount), 0) as total_paid,
  COALESCE(SUM(vb.balance_amount), 0) as total_outstanding,
  
  COUNT(*) FILTER (WHERE vb.payment_status = 'unpaid') as unpaid_count,
  COUNT(*) FILTER (WHERE vb.payment_status = 'overdue') as overdue_count,
  COALESCE(SUM(CASE WHEN vb.payment_status = 'overdue' THEN vb.balance_amount ELSE 0 END), 0) as overdue_amount,
  
  MAX(vb.due_date) as next_due_date,
  MIN(CASE WHEN vb.payment_status IN ('unpaid', 'partially_paid') THEN vb.due_date END) as earliest_due_date
  
FROM vendors v
LEFT JOIN vendor_bills vb ON v.id = vb.vendor_id
GROUP BY v.id, v.user_id, v.vendor_name, v.gstin, v.payment_terms, v.is_active;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE customer_credit_limit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_aging_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_gst_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_document_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credit history" ON customer_credit_limit_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credit history" ON customer_credit_limit_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their customer aging" ON customer_aging_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their customer aging" ON customer_aging_analysis FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their vendors" ON vendors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their vendors" ON vendors FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their vendor bills" ON vendor_bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their vendor bills" ON vendor_bills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view vendor bill items" ON vendor_bill_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM vendor_bills WHERE id = vendor_bill_items.bill_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage vendor bill items" ON vendor_bill_items FOR ALL USING (
  EXISTS (SELECT 1 FROM vendor_bills WHERE id = vendor_bill_items.bill_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view their vendor payments" ON vendor_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their vendor payments" ON vendor_payments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view customer GST summary" ON customer_gst_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage customer GST summary" ON customer_gst_summary FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their customer documents" ON customer_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their customer documents" ON customer_documents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view document access logs" ON customer_document_access_log FOR SELECT USING (auth.uid() = accessed_by);
CREATE POLICY "Users can insert document access logs" ON customer_document_access_log FOR INSERT WITH CHECK (auth.uid() = accessed_by);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_customers_credit_exceeded ON customers(user_id, credit_limit_exceeded) WHERE credit_limit_exceeded = true;
CREATE INDEX IF NOT EXISTS idx_customers_credit_utilization ON customers(credit_utilization_percentage DESC) WHERE credit_limit_enabled = true;
CREATE INDEX IF NOT EXISTS idx_vendor_bills_overdue ON vendor_bills(user_id, due_date) WHERE payment_status IN ('unpaid', 'partially_paid');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE customer_credit_limit_history IS 'Tracks changes to customer credit limits over time';
COMMENT ON TABLE customer_aging_analysis IS 'Stores customer payment aging buckets and risk scores';
COMMENT ON TABLE vendors IS 'Master table for vendor/supplier management';
COMMENT ON TABLE vendor_bills IS 'Tracks vendor bills and payables';
COMMENT ON TABLE vendor_payments IS 'Records payments made to vendors';
COMMENT ON TABLE customer_gst_summary IS 'Customer-wise GST transaction summary by financial year';
COMMENT ON TABLE customer_documents IS 'Document vault for customer files (contracts, PAN, GST, etc.)';
COMMENT ON TABLE customer_document_access_log IS 'Audit log for document access tracking';

-- =====================================================
-- 6. AI CREDIT RISK PREDICTION
-- =====================================================

-- AI Credit Risk Predictions
CREATE TABLE IF NOT EXISTS customer_credit_risk_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI Prediction scores (0-100, higher = riskier)
  default_probability DECIMAL(5, 2) NOT NULL,  -- Probability of default
  credit_risk_score DECIMAL(5, 2) NOT NULL,    -- Overall credit risk
  
  -- Risk category from AI
  predicted_risk_level VARCHAR(20) NOT NULL,   -- very_low, low, medium, high, very_high
  
  -- Confidence level of prediction
  prediction_confidence DECIMAL(5, 2) NOT NULL,  -- 0-100
  
  -- Features used in prediction
  payment_history_score DECIMAL(5, 2),
  transaction_frequency_score DECIMAL(5, 2),
  average_ticket_size_score DECIMAL(5, 2),
  payment_timing_score DECIMAL(5, 2),
  outstanding_ratio_score DECIMAL(5, 2),
  
  -- Prediction details
  model_version VARCHAR(20) NOT NULL,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Action recommendations
  recommended_credit_limit DECIMAL(12, 2),
  recommended_payment_terms INTEGER,  -- days
  action_required BOOLEAN DEFAULT false,
  action_type VARCHAR(50),  -- review, reduce_limit, increase_monitoring, blacklist
  
  -- Model explanation
  key_risk_factors TEXT[],
  positive_indicators TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id)
);

CREATE INDEX idx_credit_predictions_customer ON customer_credit_risk_predictions(customer_id);
CREATE INDEX idx_credit_predictions_risk_level ON customer_credit_risk_predictions(predicted_risk_level);
CREATE INDEX idx_credit_predictions_action ON customer_credit_risk_predictions(action_required) WHERE action_required = true;
CREATE INDEX idx_credit_predictions_date ON customer_credit_risk_predictions(prediction_date DESC);

-- AI Prediction history (track changes over time)
CREATE TABLE IF NOT EXISTS credit_risk_prediction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  default_probability DECIMAL(5, 2) NOT NULL,
  credit_risk_score DECIMAL(5, 2) NOT NULL,
  predicted_risk_level VARCHAR(20) NOT NULL,
  prediction_confidence DECIMAL(5, 2) NOT NULL,
  
  model_version VARCHAR(20) NOT NULL,
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prediction_history_customer ON credit_risk_prediction_history(customer_id);
CREATE INDEX idx_prediction_history_date ON credit_risk_prediction_history(prediction_date DESC);

-- =====================================================
-- 7. AUTO BLACKLIST CHRONIC DEFAULTERS
-- =====================================================

-- Customer blacklist table
CREATE TABLE IF NOT EXISTS customer_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Blacklist status
  is_blacklisted BOOLEAN DEFAULT true,
  blacklist_type VARCHAR(20) NOT NULL,  -- auto, manual, temporary
  
  -- Reason details
  reason TEXT NOT NULL,
  reason_code VARCHAR(50),  -- chronic_default, fraud, legal_dispute, payment_issues
  
  -- Metrics at blacklist time
  total_overdue_amount DECIMAL(12, 2),
  overdue_invoice_count INTEGER,
  longest_overdue_days INTEGER,
  default_rate DECIMAL(5, 2),  -- percentage of defaulted invoices
  
  -- Auto-blacklist criteria met
  auto_blacklist_criteria JSONB,  -- stores which rules triggered
  
  -- Dates
  blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blacklisted_by UUID REFERENCES auth.users(id),
  
  -- Removal details
  removed_at TIMESTAMP WITH TIME ZONE,
  removed_by UUID REFERENCES auth.users(id),
  removal_reason TEXT,
  
  -- Restrictions
  block_new_invoices BOOLEAN DEFAULT true,
  block_credit_sales BOOLEAN DEFAULT true,
  require_advance_payment BOOLEAN DEFAULT false,
  
  -- Review
  review_date DATE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id)
);

CREATE INDEX idx_blacklist_customer ON customer_blacklist(customer_id);
CREATE INDEX idx_blacklist_status ON customer_blacklist(is_blacklisted) WHERE is_blacklisted = true;
CREATE INDEX idx_blacklist_type ON customer_blacklist(blacklist_type);
CREATE INDEX idx_blacklist_review_date ON customer_blacklist(review_date) WHERE review_date IS NOT NULL;

-- Blacklist rules configuration
CREATE TABLE IF NOT EXISTS blacklist_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rule identification
  rule_name VARCHAR(100) NOT NULL,
  rule_description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  
  -- Trigger conditions
  min_overdue_amount DECIMAL(12, 2),
  min_overdue_invoices INTEGER,
  min_overdue_days INTEGER,
  min_default_rate DECIMAL(5, 2),  -- percentage
  consecutive_defaults_count INTEGER,
  
  -- Risk-based triggers
  min_risk_score DECIMAL(5, 2),
  risk_level_trigger VARCHAR(20),  -- high, very_high
  
  -- Actions
  auto_blacklist BOOLEAN DEFAULT false,
  send_warning BOOLEAN DEFAULT true,
  notify_admin BOOLEAN DEFAULT true,
  reduce_credit_limit BOOLEAN DEFAULT false,
  new_credit_limit_percentage DECIMAL(5, 2),  -- percentage of current
  
  -- Review settings
  auto_review_after_days INTEGER DEFAULT 90,
  require_manual_approval BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blacklist_rules_user ON blacklist_rules(user_id);
CREATE INDEX idx_blacklist_rules_enabled ON blacklist_rules(is_enabled) WHERE is_enabled = true;

-- Blacklist action log
CREATE TABLE IF NOT EXISTS blacklist_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  action_type VARCHAR(50) NOT NULL,  -- blacklisted, removed, warning_sent, review_scheduled
  action_reason TEXT,
  
  triggered_by VARCHAR(20),  -- auto, manual, system
  rule_id UUID REFERENCES blacklist_rules(id),
  
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- State before and after
  previous_state JSONB,
  new_state JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blacklist_log_customer ON blacklist_action_log(customer_id);
CREATE INDEX idx_blacklist_log_date ON blacklist_action_log(performed_at DESC);

-- =====================================================
-- 8. CUSTOMER WHATSAPP CHAT HISTORY
-- =====================================================

-- WhatsApp conversations
CREATE TABLE IF NOT EXISTS customer_whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- WhatsApp details
  whatsapp_number VARCHAR(20) NOT NULL,
  whatsapp_name VARCHAR(255),
  
  -- Conversation metadata
  conversation_status VARCHAR(20) DEFAULT 'active',  -- active, archived, blocked
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_from VARCHAR(20),  -- customer, business
  
  -- Message counts
  total_messages INTEGER DEFAULT 0,
  unread_messages INTEGER DEFAULT 0,
  
  -- Context
  conversation_context VARCHAR(50),  -- payment_reminder, invoice_query, support, general
  related_invoice_id UUID REFERENCES invoices(id),
  
  -- Tags for organization
  tags TEXT[],
  
  -- Important flags
  is_pinned BOOLEAN DEFAULT false,
  is_important BOOLEAN DEFAULT false,
  requires_action BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id, whatsapp_number)
);

CREATE INDEX idx_whatsapp_conv_customer ON customer_whatsapp_conversations(customer_id);
CREATE INDEX idx_whatsapp_conv_status ON customer_whatsapp_conversations(conversation_status);
CREATE INDEX idx_whatsapp_conv_unread ON customer_whatsapp_conversations(unread_messages) WHERE unread_messages > 0;
CREATE INDEX idx_whatsapp_conv_action ON customer_whatsapp_conversations(requires_action) WHERE requires_action = true;
CREATE INDEX idx_whatsapp_conv_last_msg ON customer_whatsapp_conversations(last_message_at DESC);

-- WhatsApp messages
CREATE TABLE IF NOT EXISTS customer_whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES customer_whatsapp_conversations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message details
  message_type VARCHAR(20) NOT NULL,  -- text, image, document, audio, video, location, template
  message_direction VARCHAR(20) NOT NULL,  -- inbound, outbound
  
  -- Content
  message_text TEXT,
  media_url TEXT,
  media_type VARCHAR(50),
  media_size_bytes BIGINT,
  
  -- WhatsApp metadata
  whatsapp_message_id VARCHAR(255),
  whatsapp_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Status (for outbound messages)
  message_status VARCHAR(20),  -- sent, delivered, read, failed
  delivery_status_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Context and linking
  related_invoice_id UUID REFERENCES invoices(id),
  related_payment_id UUID,
  context_type VARCHAR(50),  -- payment_reminder, invoice_sent, follow_up, query_response
  
  -- AI Analysis
  sentiment VARCHAR(20),  -- positive, neutral, negative, urgent
  contains_payment_intent BOOLEAN DEFAULT false,
  contains_complaint BOOLEAN DEFAULT false,
  requires_human_response BOOLEAN DEFAULT false,
  
  -- Response tracking
  is_automated_response BOOLEAN DEFAULT false,
  response_template_id UUID,
  responded_to_message_id UUID REFERENCES customer_whatsapp_messages(id),
  
  -- User interaction
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES auth.users(id),
  
  -- Notes
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_msg_conversation ON customer_whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_msg_customer ON customer_whatsapp_messages(customer_id);
CREATE INDEX idx_whatsapp_msg_direction ON customer_whatsapp_messages(message_direction);
CREATE INDEX idx_whatsapp_msg_unread ON customer_whatsapp_messages(is_read) WHERE is_read = false;
CREATE INDEX idx_whatsapp_msg_invoice ON customer_whatsapp_messages(related_invoice_id) WHERE related_invoice_id IS NOT NULL;
CREATE INDEX idx_whatsapp_msg_timestamp ON customer_whatsapp_messages(whatsapp_timestamp DESC);
CREATE INDEX idx_whatsapp_msg_payment_intent ON customer_whatsapp_messages(contains_payment_intent) WHERE contains_payment_intent = true;

-- WhatsApp message templates
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template details
  template_name VARCHAR(100) NOT NULL,
  template_category VARCHAR(50) NOT NULL,  -- payment_reminder, invoice_notification, follow_up, greeting
  
  -- Content
  template_text TEXT NOT NULL,
  template_variables TEXT[],  -- {{customer_name}}, {{invoice_number}}, {{amount}}, {{due_date}}
  
  -- WhatsApp Business API template
  whatsapp_template_id VARCHAR(255),
  template_language VARCHAR(10) DEFAULT 'en',
  
  -- Usage
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  description TEXT,
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_templates_user ON whatsapp_message_templates(user_id);
CREATE INDEX idx_whatsapp_templates_category ON whatsapp_message_templates(template_category);
CREATE INDEX idx_whatsapp_templates_active ON whatsapp_message_templates(is_active) WHERE is_active = true;

-- WhatsApp quick replies
CREATE TABLE IF NOT EXISTS whatsapp_quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  shortcut VARCHAR(50) NOT NULL,
  reply_text TEXT NOT NULL,
  
  category VARCHAR(50),
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, shortcut)
);

CREATE INDEX idx_quick_replies_user ON whatsapp_quick_replies(user_id);

-- =====================================================
-- ADDITIONAL FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to calculate AI credit risk score (simplified version - real AI would be external)
CREATE OR REPLACE FUNCTION calculate_ai_credit_risk(
  p_customer_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  default_probability DECIMAL(5, 2),
  credit_risk_score DECIMAL(5, 2),
  predicted_risk_level VARCHAR(20),
  prediction_confidence DECIMAL(5, 2),
  recommended_credit_limit DECIMAL(12, 2)
) AS $$
DECLARE
  v_aging_score DECIMAL(5, 2);
  v_payment_history_score DECIMAL(5, 2);
  v_default_prob DECIMAL(5, 2);
  v_risk_score DECIMAL(5, 2);
  v_risk_level VARCHAR(20);
  v_confidence DECIMAL(5, 2);
  v_rec_limit DECIMAL(12, 2);
  v_current_limit DECIMAL(12, 2);
BEGIN
  -- Get aging data
  SELECT 
    COALESCE(ca.risk_score, 0),
    COALESCE(ca.payment_reliability_score, 100)
  INTO v_aging_score, v_payment_history_score
  FROM customer_aging_analysis ca
  WHERE ca.customer_id = p_customer_id AND ca.user_id = p_user_id;
  
  -- If no aging data, use defaults
  v_aging_score := COALESCE(v_aging_score, 0);
  v_payment_history_score := COALESCE(v_payment_history_score, 100);
  
  -- Calculate default probability (0-100)
  -- Higher aging score = higher default probability
  -- Lower payment reliability = higher default probability
  v_default_prob := (v_aging_score * 0.6) + ((100 - v_payment_history_score) * 0.4);
  v_default_prob := LEAST(100, GREATEST(0, v_default_prob));
  
  -- Credit risk score (same as default probability for now)
  v_risk_score := v_default_prob;
  
  -- Determine risk level
  v_risk_level := CASE
    WHEN v_risk_score < 20 THEN 'very_low'
    WHEN v_risk_score < 40 THEN 'low'
    WHEN v_risk_score < 60 THEN 'medium'
    WHEN v_risk_score < 80 THEN 'high'
    ELSE 'very_high'
  END;
  
  -- Confidence level (higher with more data)
  SELECT 
    CASE 
      WHEN COALESCE(ca.total_invoices, 0) >= 20 THEN 95
      WHEN COALESCE(ca.total_invoices, 0) >= 10 THEN 85
      WHEN COALESCE(ca.total_invoices, 0) >= 5 THEN 70
      WHEN COALESCE(ca.total_invoices, 0) >= 2 THEN 55
      ELSE 40
    END
  INTO v_confidence
  FROM customer_aging_analysis ca
  WHERE ca.customer_id = p_customer_id AND ca.user_id = p_user_id;
  
  v_confidence := COALESCE(v_confidence, 40);
  
  -- Get current credit limit
  SELECT credit_limit INTO v_current_limit
  FROM customers
  WHERE id = p_customer_id AND user_id = p_user_id;
  
  v_current_limit := COALESCE(v_current_limit, 0);
  
  -- Recommend credit limit based on risk
  v_rec_limit := CASE
    WHEN v_risk_level = 'very_low' THEN v_current_limit * 1.5
    WHEN v_risk_level = 'low' THEN v_current_limit * 1.2
    WHEN v_risk_level = 'medium' THEN v_current_limit
    WHEN v_risk_level = 'high' THEN v_current_limit * 0.5
    ELSE v_current_limit * 0.25
  END;
  
  RETURN QUERY SELECT v_default_prob, v_risk_score, v_risk_level, v_confidence, v_rec_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to check and auto-blacklist customers
CREATE OR REPLACE FUNCTION check_auto_blacklist(
  p_customer_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_should_blacklist BOOLEAN := false;
  v_rule RECORD;
  v_aging RECORD;
  v_risk RECORD;
  v_criteria JSONB := '[]'::jsonb;
BEGIN
  -- Get customer aging data
  SELECT * INTO v_aging
  FROM customer_aging_analysis
  WHERE customer_id = p_customer_id AND user_id = p_user_id;
  
  -- Get customer risk prediction
  SELECT * INTO v_risk
  FROM customer_credit_risk_predictions
  WHERE customer_id = p_customer_id AND user_id = p_user_id;
  
  -- Check each enabled rule
  FOR v_rule IN 
    SELECT * FROM blacklist_rules 
    WHERE user_id = p_user_id AND is_enabled = true AND auto_blacklist = true
  LOOP
    -- Check overdue amount
    IF v_rule.min_overdue_amount IS NOT NULL AND 
       COALESCE(v_aging.total_outstanding, 0) >= v_rule.min_overdue_amount THEN
      v_should_blacklist := true;
      v_criteria := v_criteria || jsonb_build_object('rule', v_rule.rule_name, 'condition', 'overdue_amount');
    END IF;
    
    -- Check overdue invoices count
    IF v_rule.min_overdue_invoices IS NOT NULL AND 
       COALESCE(v_aging.overdue_count, 0) >= v_rule.min_overdue_invoices THEN
      v_should_blacklist := true;
      v_criteria := v_criteria || jsonb_build_object('rule', v_rule.rule_name, 'condition', 'overdue_count');
    END IF;
    
    -- Check overdue days
    IF v_rule.min_overdue_days IS NOT NULL AND 
       COALESCE(v_aging.longest_overdue_days, 0) >= v_rule.min_overdue_days THEN
      v_should_blacklist := true;
      v_criteria := v_criteria || jsonb_build_object('rule', v_rule.rule_name, 'condition', 'overdue_days');
    END IF;
    
    -- Check risk score
    IF v_rule.min_risk_score IS NOT NULL AND 
       COALESCE(v_risk.credit_risk_score, 0) >= v_rule.min_risk_score THEN
      v_should_blacklist := true;
      v_criteria := v_criteria || jsonb_build_object('rule', v_rule.rule_name, 'condition', 'risk_score');
    END IF;
    
    -- If any rule triggered, blacklist the customer
    IF v_should_blacklist THEN
      -- Insert or update blacklist
      INSERT INTO customer_blacklist (
        customer_id, user_id, blacklist_type, reason, reason_code,
        total_overdue_amount, overdue_invoice_count, longest_overdue_days,
        auto_blacklist_criteria, block_new_invoices, block_credit_sales,
        blacklisted_by
      )
      VALUES (
        p_customer_id, p_user_id, 'auto', 
        'Automatically blacklisted due to: ' || v_criteria::text,
        'chronic_default',
        COALESCE(v_aging.total_outstanding, 0),
        COALESCE(v_aging.overdue_count, 0),
        COALESCE(v_aging.longest_overdue_days, 0),
        v_criteria,
        true, true,
        p_user_id
      )
      ON CONFLICT (customer_id, user_id) 
      DO UPDATE SET
        is_blacklisted = true,
        auto_blacklist_criteria = v_criteria,
        updated_at = NOW();
      
      -- Log the action
      INSERT INTO blacklist_action_log (
        customer_id, user_id, action_type, action_reason,
        triggered_by, rule_id, performed_by
      )
      VALUES (
        p_customer_id, p_user_id, 'blacklisted',
        'Auto-blacklisted: ' || v_criteria::text,
        'auto', v_rule.id, p_user_id
      );
      
      EXIT; -- Exit loop after first match
    END IF;
  END LOOP;
  
  RETURN v_should_blacklist;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
CREATE OR REPLACE FUNCTION update_whatsapp_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_whatsapp_conversations
  SET 
    last_message_at = NEW.whatsapp_timestamp,
    last_message_from = CASE 
      WHEN NEW.message_direction = 'inbound' THEN 'customer'
      ELSE 'business'
    END,
    total_messages = total_messages + 1,
    unread_messages = CASE 
      WHEN NEW.message_direction = 'inbound' AND NOT NEW.is_read 
      THEN unread_messages + 1
      ELSE unread_messages
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation ON customer_whatsapp_messages;
CREATE TRIGGER trigger_update_conversation
AFTER INSERT ON customer_whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION update_whatsapp_conversation_on_message();

-- Trigger to mark conversation messages as read
CREATE OR REPLACE FUNCTION mark_conversation_messages_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unread_messages = 0 AND OLD.unread_messages > 0 THEN
    UPDATE customer_whatsapp_messages
    SET is_read = true, read_at = NOW()
    WHERE conversation_id = NEW.id AND is_read = false AND message_direction = 'inbound';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mark_messages_read ON customer_whatsapp_conversations;
CREATE TRIGGER trigger_mark_messages_read
AFTER UPDATE ON customer_whatsapp_conversations
FOR EACH ROW
WHEN (NEW.unread_messages = 0 AND OLD.unread_messages > 0)
EXECUTE FUNCTION mark_conversation_messages_read();

-- =====================================================
-- ADDITIONAL VIEWS
-- =====================================================

-- High-risk customers view
CREATE OR REPLACE VIEW high_risk_customers AS
SELECT 
  c.id as customer_id,
  c.user_id,
  c.name as customer_name,
  c.email,
  c.phone,
  
  -- Credit info
  c.credit_limit,
  c.credit_used,
  c.credit_limit_exceeded,
  
  -- Risk scores
  ca.risk_score as aging_risk_score,
  ca.risk_category as aging_risk_category,
  crp.credit_risk_score as ai_risk_score,
  crp.predicted_risk_level as ai_risk_level,
  crp.default_probability,
  
  -- Blacklist status
  cb.is_blacklisted,
  cb.blacklist_type,
  cb.blacklisted_at,
  
  -- Outstanding
  ca.total_outstanding,
  ca.overdue_count,
  ca.longest_overdue_days
  
FROM customers c
LEFT JOIN customer_aging_analysis ca ON c.id = ca.customer_id AND c.user_id = ca.user_id
LEFT JOIN customer_credit_risk_predictions crp ON c.id = crp.customer_id AND c.user_id = crp.user_id
LEFT JOIN customer_blacklist cb ON c.id = cb.customer_id AND c.user_id = cb.user_id
WHERE 
  ca.risk_category IN ('high', 'critical') 
  OR crp.predicted_risk_level IN ('high', 'very_high')
  OR cb.is_blacklisted = true;

-- WhatsApp conversation summary view
CREATE OR REPLACE VIEW whatsapp_conversation_summary AS
SELECT 
  cwc.id as conversation_id,
  cwc.customer_id,
  cwc.user_id,
  c.name as customer_name,
  cwc.whatsapp_number,
  cwc.conversation_status,
  cwc.last_message_at,
  cwc.total_messages,
  cwc.unread_messages,
  cwc.requires_action,
  cwc.is_important,
  
  -- Latest message preview
  (
    SELECT message_text
    FROM customer_whatsapp_messages
    WHERE conversation_id = cwc.id
    ORDER BY whatsapp_timestamp DESC
    LIMIT 1
  ) as last_message_preview,
  
  -- Related invoice
  i.invoice_number as related_invoice_number,
  i.total as related_invoice_amount
  
FROM customer_whatsapp_conversations cwc
JOIN customers c ON cwc.customer_id = c.id
LEFT JOIN invoices i ON cwc.related_invoice_id = i.id;

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Credit Risk Predictions
ALTER TABLE customer_credit_risk_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their credit predictions" ON customer_credit_risk_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their credit predictions" ON customer_credit_risk_predictions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE credit_risk_prediction_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view prediction history" ON credit_risk_prediction_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert prediction history" ON credit_risk_prediction_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Blacklist
ALTER TABLE customer_blacklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their blacklist" ON customer_blacklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their blacklist" ON customer_blacklist FOR ALL USING (auth.uid() = user_id);

ALTER TABLE blacklist_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their blacklist rules" ON blacklist_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their blacklist rules" ON blacklist_rules FOR ALL USING (auth.uid() = user_id);

ALTER TABLE blacklist_action_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view blacklist logs" ON blacklist_action_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert blacklist logs" ON blacklist_action_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WhatsApp
ALTER TABLE customer_whatsapp_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their conversations" ON customer_whatsapp_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their conversations" ON customer_whatsapp_conversations FOR ALL USING (auth.uid() = user_id);

ALTER TABLE customer_whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their messages" ON customer_whatsapp_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their messages" ON customer_whatsapp_messages FOR ALL USING (auth.uid() = user_id);

ALTER TABLE whatsapp_message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their templates" ON whatsapp_message_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their templates" ON whatsapp_message_templates FOR ALL USING (auth.uid() = user_id);

ALTER TABLE whatsapp_quick_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their quick replies" ON whatsapp_quick_replies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their quick replies" ON whatsapp_quick_replies FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- ADDITIONAL COMMENTS
-- =====================================================

COMMENT ON TABLE customer_credit_risk_predictions IS 'AI-powered credit risk predictions for customers';
COMMENT ON TABLE credit_risk_prediction_history IS 'Historical tracking of risk prediction changes';
COMMENT ON TABLE customer_blacklist IS 'Blacklisted customers with chronic payment issues';
COMMENT ON TABLE blacklist_rules IS 'Configurable rules for auto-blacklisting customers';
COMMENT ON TABLE blacklist_action_log IS 'Audit log of blacklist actions';
COMMENT ON TABLE customer_whatsapp_conversations IS 'WhatsApp conversation threads with customers';
COMMENT ON TABLE customer_whatsapp_messages IS 'Individual WhatsApp messages';
COMMENT ON TABLE whatsapp_message_templates IS 'Reusable WhatsApp message templates';
COMMENT ON TABLE whatsapp_quick_replies IS 'Quick reply shortcuts for common responses';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
