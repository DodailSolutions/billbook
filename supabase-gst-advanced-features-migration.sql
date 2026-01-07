-- =====================================================
-- GST ADVANCED FEATURES & CA COLLABORATION MIGRATION
-- =====================================================
-- Features:
-- 1. GSTR-1 auto-prep
-- 2. GSTR-3B summary dashboard
-- 3. E-Invoice auto-generation (IRN)
-- 4. E-Way bill creation
-- 5. GST mismatch alerts
-- 6. CA collaboration mode
-- 7. CA dashboard for multiple clients
-- 8. Audit trail with timestamp & IP
-- 9. GST health score
-- =====================================================

-- =====================================================
-- 1. GSTR-1 AUTO-PREP DATA
-- =====================================================

-- GSTR-1 outward supply records
CREATE TABLE IF NOT EXISTS gstr1_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  tax_period VARCHAR(7) NOT NULL,  -- MMYYYY format (e.g., 012026)
  financial_year VARCHAR(10) NOT NULL,
  
  -- B2B (Business to Business) - Table 4A, 4B, 4C, 6B, 6C
  b2b_invoices JSONB DEFAULT '[]'::jsonb,
  b2b_invoice_count INTEGER DEFAULT 0,
  b2b_taxable_value DECIMAL(15, 2) DEFAULT 0,
  b2b_total_tax DECIMAL(15, 2) DEFAULT 0,
  
  -- B2CL (B2C Large - Invoices > 2.5 lakhs) - Table 5A, 5B
  b2cl_invoices JSONB DEFAULT '[]'::jsonb,
  b2cl_invoice_count INTEGER DEFAULT 0,
  b2cl_taxable_value DECIMAL(15, 2) DEFAULT 0,
  b2cl_total_tax DECIMAL(15, 2) DEFAULT 0,
  
  -- B2CS (B2C Small - Consolidated) - Table 7
  b2cs_summary JSONB DEFAULT '[]'::jsonb,
  b2cs_taxable_value DECIMAL(15, 2) DEFAULT 0,
  b2cs_total_tax DECIMAL(15, 2) DEFAULT 0,
  
  -- Exports - Table 6A
  export_invoices JSONB DEFAULT '[]'::jsonb,
  export_count INTEGER DEFAULT 0,
  export_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Credit/Debit Notes - Table 9A, 9B, 9C
  credit_debit_notes JSONB DEFAULT '[]'::jsonb,
  cdn_count INTEGER DEFAULT 0,
  cdn_value DECIMAL(15, 2) DEFAULT 0,
  
  -- HSN Summary - Table 12
  hsn_summary JSONB DEFAULT '[]'::jsonb,
  
  -- Document issued - Table 13
  documents_issued JSONB DEFAULT '[]'::jsonb,
  
  -- Amendments
  amendments JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  preparation_status VARCHAR(20) DEFAULT 'draft',  -- draft, ready, filed, accepted
  auto_generated BOOLEAN DEFAULT true,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Filing details
  filed_at TIMESTAMP WITH TIME ZONE,
  filing_reference_number VARCHAR(50),
  arn VARCHAR(50),  -- Application Reference Number
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tax_period)
);

CREATE INDEX idx_gstr1_user ON gstr1_records(user_id);
CREATE INDEX idx_gstr1_period ON gstr1_records(tax_period);
CREATE INDEX idx_gstr1_status ON gstr1_records(preparation_status);

-- =====================================================
-- 2. GSTR-3B SUMMARY
-- =====================================================

-- GSTR-3B monthly return data
CREATE TABLE IF NOT EXISTS gstr3b_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  tax_period VARCHAR(7) NOT NULL,  -- MMYYYY
  financial_year VARCHAR(10) NOT NULL,
  return_period_from DATE NOT NULL,
  return_period_to DATE NOT NULL,
  
  -- 3.1 - Outward supplies and inward supplies liable to reverse charge
  outward_taxable_supplies DECIMAL(15, 2) DEFAULT 0,
  outward_tax_amount DECIMAL(15, 2) DEFAULT 0,
  inward_reverse_charge_supplies DECIMAL(15, 2) DEFAULT 0,
  inward_reverse_charge_tax DECIMAL(15, 2) DEFAULT 0,
  
  -- 3.2 - Inter-state supplies
  inter_state_supplies JSONB DEFAULT '[]'::jsonb,
  inter_state_total DECIMAL(15, 2) DEFAULT 0,
  
  -- 4 - Eligible ITC (Input Tax Credit)
  itc_available JSONB DEFAULT '{}'::jsonb,
  itc_igst DECIMAL(15, 2) DEFAULT 0,
  itc_cgst DECIMAL(15, 2) DEFAULT 0,
  itc_sgst DECIMAL(15, 2) DEFAULT 0,
  itc_cess DECIMAL(15, 2) DEFAULT 0,
  
  -- 5 - Exempt, Nil rated and Non-GST supplies
  exempt_supplies DECIMAL(15, 2) DEFAULT 0,
  nil_rated_supplies DECIMAL(15, 2) DEFAULT 0,
  non_gst_supplies DECIMAL(15, 2) DEFAULT 0,
  
  -- 6.1 - Payment of tax
  tax_payable_igst DECIMAL(15, 2) DEFAULT 0,
  tax_payable_cgst DECIMAL(15, 2) DEFAULT 0,
  tax_payable_sgst DECIMAL(15, 2) DEFAULT 0,
  tax_payable_cess DECIMAL(15, 2) DEFAULT 0,
  
  total_tax_liability DECIMAL(15, 2) GENERATED ALWAYS AS (
    tax_payable_igst + tax_payable_cgst + tax_payable_sgst + tax_payable_cess
  ) STORED,
  
  -- Interest and Late Fees
  interest_igst DECIMAL(15, 2) DEFAULT 0,
  interest_cgst DECIMAL(15, 2) DEFAULT 0,
  interest_sgst DECIMAL(15, 2) DEFAULT 0,
  late_fee DECIMAL(15, 2) DEFAULT 0,
  
  -- Status
  preparation_status VARCHAR(20) DEFAULT 'draft',
  auto_generated BOOLEAN DEFAULT true,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Filing
  filed_at TIMESTAMP WITH TIME ZONE,
  filing_reference_number VARCHAR(50),
  arn VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tax_period)
);

CREATE INDEX idx_gstr3b_user ON gstr3b_records(user_id);
CREATE INDEX idx_gstr3b_period ON gstr3b_records(tax_period);
CREATE INDEX idx_gstr3b_status ON gstr3b_records(preparation_status);

-- =====================================================
-- 3. E-INVOICE (IRN) GENERATION
-- =====================================================

-- E-Invoice records
CREATE TABLE IF NOT EXISTS einvoice_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- IRN Details
  irn VARCHAR(64) UNIQUE NOT NULL,  -- Invoice Reference Number (64 chars)
  acknowledgement_number VARCHAR(20),
  acknowledgement_date TIMESTAMP WITH TIME ZONE,
  
  -- Signed Invoice
  signed_invoice TEXT,  -- Base64 encoded signed invoice
  signed_qr_code TEXT,  -- QR Code for signed invoice
  
  -- IRP (Invoice Registration Portal) details
  irp_response JSONB,
  irp_status VARCHAR(20) DEFAULT 'pending',  -- pending, generated, cancelled, failed
  
  -- E-Way Bill integration
  eway_bill_number VARCHAR(12),
  eway_bill_date TIMESTAMP WITH TIME ZONE,
  eway_bill_valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Generation details
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id),
  
  -- Cancellation
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason VARCHAR(255),
  cancellation_remarks TEXT,
  
  -- Errors
  error_code VARCHAR(20),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_einvoice_user ON einvoice_records(user_id);
CREATE INDEX idx_einvoice_invoice ON einvoice_records(invoice_id);
CREATE INDEX idx_einvoice_irn ON einvoice_records(irn);
CREATE INDEX idx_einvoice_status ON einvoice_records(irp_status);
CREATE INDEX idx_einvoice_eway ON einvoice_records(eway_bill_number) WHERE eway_bill_number IS NOT NULL;

-- =====================================================
-- 4. E-WAY BILL
-- =====================================================

-- E-Way Bill records
CREATE TABLE IF NOT EXISTS eway_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  einvoice_id UUID REFERENCES einvoice_records(id) ON DELETE SET NULL,
  
  -- E-Way Bill Number
  eway_bill_number VARCHAR(12) UNIQUE NOT NULL,
  eway_bill_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  approximate_distance_km INTEGER,
  
  -- Document Details
  document_type VARCHAR(20) NOT NULL,  -- inv, chl, bil, etc.
  document_number VARCHAR(50) NOT NULL,
  document_date DATE NOT NULL,
  
  -- Parties
  supplier_gstin VARCHAR(15) NOT NULL,
  recipient_gstin VARCHAR(15),
  recipient_name VARCHAR(255),
  recipient_address TEXT,
  recipient_state_code VARCHAR(2),
  recipient_pincode VARCHAR(6),
  
  -- Transaction Details
  transaction_type VARCHAR(20) NOT NULL,  -- regular, bill_to_ship_to, export, job_work
  supply_type VARCHAR(20) NOT NULL,  -- outward, inward
  sub_supply_type VARCHAR(30),  -- supply, export, job_work, etc.
  
  -- Goods Details
  goods_value DECIMAL(15, 2) NOT NULL,
  hsn_code VARCHAR(8),
  goods_description TEXT,
  quantity DECIMAL(10, 2),
  unit VARCHAR(10),
  cgst_amount DECIMAL(12, 2) DEFAULT 0,
  sgst_amount DECIMAL(12, 2) DEFAULT 0,
  igst_amount DECIMAL(12, 2) DEFAULT 0,
  cess_amount DECIMAL(12, 2) DEFAULT 0,
  total_invoice_value DECIMAL(15, 2) NOT NULL,
  
  -- Transportation
  transporter_id VARCHAR(15),
  transporter_name VARCHAR(255),
  transport_mode VARCHAR(20),  -- road, rail, air, ship
  transport_document_number VARCHAR(50),
  transport_document_date DATE,
  vehicle_number VARCHAR(20),
  vehicle_type VARCHAR(20),  -- regular, over_dimensional
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- active, cancelled, expired, extended
  
  -- Cancellation
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason VARCHAR(255),
  cancellation_remarks TEXT,
  
  -- Extension
  extended_at TIMESTAMP WITH TIME ZONE,
  extension_reason TEXT,
  
  -- Part-B Update (by transporter)
  part_b_updated BOOLEAN DEFAULT false,
  part_b_updated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_eway_user ON eway_bills(user_id);
CREATE INDEX idx_eway_invoice ON eway_bills(invoice_id);
CREATE INDEX idx_eway_number ON eway_bills(eway_bill_number);
CREATE INDEX idx_eway_status ON eway_bills(status);
CREATE INDEX idx_eway_validity ON eway_bills(valid_until);

-- =====================================================
-- 5. GST MISMATCH ALERTS
-- =====================================================

-- GST Mismatch alerts and reconciliation
CREATE TABLE IF NOT EXISTS gst_mismatch_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type VARCHAR(50) NOT NULL,  -- tax_calculation, gstr1_mismatch, gstr3b_mismatch, itc_mismatch, hsn_mismatch
  severity VARCHAR(20) NOT NULL,  -- low, medium, high, critical
  
  -- Affected entity
  entity_type VARCHAR(20),  -- invoice, credit_note, gstr1, gstr3b
  entity_id UUID,
  reference_number VARCHAR(100),
  
  -- Mismatch details
  expected_value DECIMAL(15, 2),
  actual_value DECIMAL(15, 2),
  difference DECIMAL(15, 2),
  
  field_name VARCHAR(100),
  description TEXT NOT NULL,
  
  -- Tax period
  tax_period VARCHAR(7),
  
  -- Resolution
  status VARCHAR(20) DEFAULT 'open',  -- open, investigating, resolved, ignored
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Auto-detection
  detected_by VARCHAR(20) DEFAULT 'system',  -- system, manual, ca
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Action required
  action_required BOOLEAN DEFAULT true,
  recommended_action TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gst_alerts_user ON gst_mismatch_alerts(user_id);
CREATE INDEX idx_gst_alerts_status ON gst_mismatch_alerts(status) WHERE status = 'open';
CREATE INDEX idx_gst_alerts_severity ON gst_mismatch_alerts(severity);
CREATE INDEX idx_gst_alerts_type ON gst_mismatch_alerts(alert_type);
CREATE INDEX idx_gst_alerts_period ON gst_mismatch_alerts(tax_period);

-- =====================================================
-- 6 & 7. CA COLLABORATION MODE
-- =====================================================

-- CA (Chartered Accountant) profiles
CREATE TABLE IF NOT EXISTS ca_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- CA Details
  ca_name VARCHAR(255) NOT NULL,
  ca_firm_name VARCHAR(255),
  membership_number VARCHAR(20),  -- ICAI membership number
  
  -- Contact
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_document_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Specialization
  specializations TEXT[],  -- gst, income_tax, audit, compliance
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_ca_profiles_user ON ca_profiles(user_id);
CREATE INDEX idx_ca_profiles_email ON ca_profiles(email);
CREATE INDEX idx_ca_profiles_verified ON ca_profiles(is_verified);

-- Client-CA relationship
CREATE TABLE IF NOT EXISTS client_ca_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ca_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Access permissions
  access_level VARCHAR(20) NOT NULL,  -- view_only, edit, full
  can_view_invoices BOOLEAN DEFAULT true,
  can_edit_invoices BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT true,
  can_file_returns BOOLEAN DEFAULT false,
  can_view_payments BOOLEAN DEFAULT true,
  can_manage_customers BOOLEAN DEFAULT false,
  
  -- Specific access
  allowed_modules TEXT[],  -- invoices, customers, reports, gst_filing, payments
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- pending, active, revoked, expired
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_token VARCHAR(255),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Validity
  valid_from DATE NOT NULL,
  valid_until DATE,
  
  -- Revocation
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),
  revocation_reason TEXT,
  
  -- Notes
  client_notes TEXT,
  ca_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_user_id, ca_user_id)
);

CREATE INDEX idx_client_ca_client ON client_ca_access(client_user_id);
CREATE INDEX idx_client_ca_ca ON client_ca_access(ca_user_id);
CREATE INDEX idx_client_ca_status ON client_ca_access(status) WHERE status = 'active';

-- CA activity log for clients
CREATE TABLE IF NOT EXISTS ca_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type VARCHAR(50) NOT NULL,  -- viewed_invoice, edited_invoice, filed_return, generated_report, added_note
  entity_type VARCHAR(20),  -- invoice, customer, report, gstr1, gstr3b
  entity_id UUID,
  
  -- Details
  activity_description TEXT NOT NULL,
  changes_made JSONB,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ca_activity_ca ON ca_activity_log(ca_user_id);
CREATE INDEX idx_ca_activity_client ON ca_activity_log(client_user_id);
CREATE INDEX idx_ca_activity_date ON ca_activity_log(performed_at DESC);
CREATE INDEX idx_ca_activity_type ON ca_activity_log(activity_type);

-- =====================================================
-- 8. AUDIT TRAIL WITH TIMESTAMP & IP
-- =====================================================

-- Comprehensive audit trail for all GST-related activities
CREATE TABLE IF NOT EXISTS gst_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Actor (who performed the action)
  performed_by UUID REFERENCES auth.users(id),
  performed_by_type VARCHAR(20),  -- owner, ca, system, admin
  
  -- Action details
  action_type VARCHAR(50) NOT NULL,  -- create, update, delete, file, cancel, view
  entity_type VARCHAR(30) NOT NULL,  -- invoice, gstr1, gstr3b, einvoice, eway_bill
  entity_id UUID,
  
  -- Before/After state
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  -- Detailed description
  action_description TEXT NOT NULL,
  action_category VARCHAR(30),  -- compliance, filing, invoice, reconciliation
  
  -- Security metadata
  ip_address INET NOT NULL,
  user_agent TEXT,
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  
  -- Location
  geolocation JSONB,  -- {country, region, city}
  
  -- Timestamp
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Compliance flags
  is_critical_action BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  approval_status VARCHAR(20),  -- pending, approved, rejected
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Retention
  retention_period_days INTEGER DEFAULT 2555,  -- 7 years (GST requirement)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON gst_audit_trail(user_id);
CREATE INDEX idx_audit_performed_by ON gst_audit_trail(performed_by);
CREATE INDEX idx_audit_entity ON gst_audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_action ON gst_audit_trail(action_type);
CREATE INDEX idx_audit_date ON gst_audit_trail(performed_at DESC);
CREATE INDEX idx_audit_ip ON gst_audit_trail(ip_address);
CREATE INDEX idx_audit_critical ON gst_audit_trail(is_critical_action) WHERE is_critical_action = true;

-- =====================================================
-- 9. GST HEALTH SCORE
-- =====================================================

-- GST Compliance Health Score
CREATE TABLE IF NOT EXISTS gst_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Overall health score (0-100)
  overall_score DECIMAL(5, 2) NOT NULL,
  health_grade VARCHAR(2),  -- A+, A, B, C, D, F
  
  -- Component scores
  filing_compliance_score DECIMAL(5, 2) DEFAULT 0,  -- Timely filing
  tax_calculation_accuracy_score DECIMAL(5, 2) DEFAULT 0,  -- Calculation errors
  reconciliation_score DECIMAL(5, 2) DEFAULT 0,  -- Books vs returns match
  documentation_score DECIMAL(5, 2) DEFAULT 0,  -- Proper invoicing
  itc_claim_score DECIMAL(5, 2) DEFAULT 0,  -- Input tax credit claims
  
  -- Metrics used for calculation
  total_returns_due INTEGER DEFAULT 0,
  returns_filed_on_time INTEGER DEFAULT 0,
  returns_filed_late INTEGER DEFAULT 0,
  returns_pending INTEGER DEFAULT 0,
  
  average_filing_delay_days DECIMAL(8, 2) DEFAULT 0,
  
  tax_calculation_errors INTEGER DEFAULT 0,
  gst_mismatches_found INTEGER DEFAULT 0,
  gst_mismatches_resolved INTEGER DEFAULT 0,
  
  invoices_with_errors INTEGER DEFAULT 0,
  total_invoices_issued INTEGER DEFAULT 0,
  
  -- Penalties and Interest
  total_interest_paid DECIMAL(15, 2) DEFAULT 0,
  total_late_fees_paid DECIMAL(15, 2) DEFAULT 0,
  total_penalties DECIMAL(15, 2) DEFAULT 0,
  
  -- Risk factors
  risk_level VARCHAR(20),  -- low, medium, high, critical
  risk_factors TEXT[],
  improvement_suggestions TEXT[],
  
  -- Comparison
  industry_average_score DECIMAL(5, 2),
  percentile DECIMAL(5, 2),  -- How user compares to others
  
  -- Calculation period
  calculation_period_from DATE NOT NULL,
  calculation_period_to DATE NOT NULL,
  
  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  previous_score DECIMAL(5, 2),
  score_change DECIMAL(5, 2),
  trend VARCHAR(20),  -- improving, declining, stable
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_user ON gst_health_scores(user_id);
CREATE INDEX idx_health_score ON gst_health_scores(overall_score DESC);
CREATE INDEX idx_health_risk ON gst_health_scores(risk_level);
CREATE INDEX idx_health_date ON gst_health_scores(calculated_at DESC);

-- Health score history for trend tracking
CREATE TABLE IF NOT EXISTS gst_health_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  overall_score DECIMAL(5, 2) NOT NULL,
  health_grade VARCHAR(2),
  calculation_period_from DATE NOT NULL,
  calculation_period_to DATE NOT NULL,
  
  score_snapshot JSONB,  -- Complete snapshot of all metrics
  
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_history_user ON gst_health_score_history(user_id);
CREATE INDEX idx_health_history_date ON gst_health_score_history(calculated_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to auto-generate GSTR-1 data
CREATE OR REPLACE FUNCTION generate_gstr1_data(
  p_user_id UUID,
  p_tax_period VARCHAR(7)
)
RETURNS UUID AS $$
DECLARE
  v_gstr1_id UUID;
  v_fy VARCHAR(10);
  v_period_start DATE;
  v_period_end DATE;
  v_b2b_data JSONB;
  v_b2cl_data JSONB;
  v_b2cs_data JSONB;
  v_hsn_data JSONB;
BEGIN
  -- Calculate period dates
  v_period_start := TO_DATE(p_tax_period, 'MMYYYY');
  v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Get financial year
  v_fy := CASE 
    WHEN EXTRACT(MONTH FROM v_period_start) >= 4 
    THEN EXTRACT(YEAR FROM v_period_start)::TEXT || '-' || (EXTRACT(YEAR FROM v_period_start) + 1)::TEXT
    ELSE (EXTRACT(YEAR FROM v_period_start) - 1)::TEXT || '-' || EXTRACT(YEAR FROM v_period_start)::TEXT
  END;
  
  -- Generate B2B data (invoices with GSTIN > 2.5L)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'invoice_number', i.invoice_number,
    'invoice_date', i.invoice_date,
    'customer_gstin', c.gstin,
    'customer_name', c.name,
    'taxable_value', i.subtotal,
    'cgst', i.cgst_amount,
    'sgst', i.sgst_amount,
    'igst', i.igst_amount,
    'total_tax', i.gst_amount,
    'supply_type', i.supply_type,
    'reverse_charge', i.reverse_charge_applicable
  )), '[]'::jsonb)
  INTO v_b2b_data
  FROM invoices i
  JOIN customers c ON i.customer_id = c.id
  WHERE i.user_id = p_user_id
    AND i.invoice_date BETWEEN v_period_start AND v_period_end
    AND c.gstin IS NOT NULL
    AND i.total >= 250000;  -- B2B threshold
  
  -- Generate HSN summary
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'hsn_code', ii.hsn_sac_code,
    'description', ii.description,
    'uqc', ii.unit,
    'total_quantity', SUM(ii.quantity),
    'total_value', SUM(ii.amount),
    'taxable_value', SUM(ii.amount),
    'igst', SUM(CASE WHEN i.supply_type = 'inter-state' THEN ii.gst_amount ELSE 0 END),
    'cgst', SUM(CASE WHEN i.supply_type = 'intra-state' THEN ii.gst_amount / 2 ELSE 0 END),
    'sgst', SUM(CASE WHEN i.supply_type = 'intra-state' THEN ii.gst_amount / 2 ELSE 0 END)
  )), '[]'::jsonb)
  INTO v_hsn_data
  FROM invoice_items ii
  JOIN invoices i ON ii.invoice_id = i.id
  WHERE i.user_id = p_user_id
    AND i.invoice_date BETWEEN v_period_start AND v_period_end
    AND ii.hsn_sac_code IS NOT NULL
  GROUP BY ii.hsn_sac_code, ii.description, ii.unit;
  
  -- Insert or update GSTR-1 record
  INSERT INTO gstr1_records (
    user_id, tax_period, financial_year,
    b2b_invoices, b2b_invoice_count, b2b_taxable_value, b2b_total_tax,
    hsn_summary,
    preparation_status, auto_generated, last_calculated_at
  )
  VALUES (
    p_user_id, p_tax_period, v_fy,
    v_b2b_data,
    jsonb_array_length(v_b2b_data),
    (SELECT COALESCE(SUM((value->>'taxable_value')::DECIMAL), 0) FROM jsonb_array_elements(v_b2b_data)),
    (SELECT COALESCE(SUM((value->>'total_tax')::DECIMAL), 0) FROM jsonb_array_elements(v_b2b_data)),
    v_hsn_data,
    'ready', true, NOW()
  )
  ON CONFLICT (user_id, tax_period)
  DO UPDATE SET
    b2b_invoices = v_b2b_data,
    b2b_invoice_count = jsonb_array_length(v_b2b_data),
    b2b_taxable_value = (SELECT COALESCE(SUM((value->>'taxable_value')::DECIMAL), 0) FROM jsonb_array_elements(v_b2b_data)),
    b2b_total_tax = (SELECT COALESCE(SUM((value->>'total_tax')::DECIMAL), 0) FROM jsonb_array_elements(v_b2b_data)),
    hsn_summary = v_hsn_data,
    last_calculated_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_gstr1_id;
  
  RETURN v_gstr1_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate GST health score
CREATE OR REPLACE FUNCTION calculate_gst_health_score(
  p_user_id UUID,
  p_period_from DATE,
  p_period_to DATE
)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  v_filing_score DECIMAL(5, 2) := 0;
  v_accuracy_score DECIMAL(5, 2) := 0;
  v_documentation_score DECIMAL(5, 2) := 0;
  v_overall_score DECIMAL(5, 2);
  v_health_grade VARCHAR(2);
  v_total_returns INTEGER;
  v_on_time INTEGER;
  v_total_invoices INTEGER;
  v_error_invoices INTEGER;
BEGIN
  -- Calculate filing compliance (40% weight)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE filed_at <= DATE_TRUNC('month', TO_DATE(tax_period, 'MMYYYY')) + INTERVAL '20 days')
  INTO v_total_returns, v_on_time
  FROM gstr3b_records
  WHERE user_id = p_user_id
    AND TO_DATE(tax_period, 'MMYYYY') BETWEEN p_period_from AND p_period_to;
  
  IF v_total_returns > 0 THEN
    v_filing_score := (v_on_time::DECIMAL / v_total_returns) * 100;
  ELSE
    v_filing_score := 50;  -- Default for new users
  END IF;
  
  -- Calculate documentation accuracy (30% weight)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE compliance_warnings IS NOT NULL AND jsonb_array_length(compliance_warnings) > 0)
  INTO v_total_invoices, v_error_invoices
  FROM invoices
  WHERE user_id = p_user_id
    AND invoice_date BETWEEN p_period_from AND p_period_to;
  
  IF v_total_invoices > 0 THEN
    v_documentation_score := ((v_total_invoices - v_error_invoices)::DECIMAL / v_total_invoices) * 100;
  ELSE
    v_documentation_score := 100;
  END IF;
  
  -- Calculate accuracy score (30% weight) - based on mismatch alerts
  SELECT 100 - LEAST(COUNT(*) * 2, 100) INTO v_accuracy_score
  FROM gst_mismatch_alerts
  WHERE user_id = p_user_id
    AND detected_at BETWEEN p_period_from AND p_period_to
    AND status = 'open';
  
  -- Calculate overall score (weighted average)
  v_overall_score := (v_filing_score * 0.4) + (v_documentation_score * 0.3) + (v_accuracy_score * 0.3);
  
  -- Determine grade
  v_health_grade := CASE
    WHEN v_overall_score >= 95 THEN 'A+'
    WHEN v_overall_score >= 85 THEN 'A'
    WHEN v_overall_score >= 75 THEN 'B'
    WHEN v_overall_score >= 65 THEN 'C'
    WHEN v_overall_score >= 50 THEN 'D'
    ELSE 'F'
  END;
  
  -- Insert health score
  INSERT INTO gst_health_scores (
    user_id, overall_score, health_grade,
    filing_compliance_score, tax_calculation_accuracy_score, documentation_score,
    calculation_period_from, calculation_period_to,
    calculated_at
  )
  VALUES (
    p_user_id, v_overall_score, v_health_grade,
    v_filing_score, v_accuracy_score, v_documentation_score,
    p_period_from, p_period_to,
    NOW()
  );
  
  -- Insert history
  INSERT INTO gst_health_score_history (
    user_id, overall_score, health_grade,
    calculation_period_from, calculation_period_to,
    calculated_at
  )
  VALUES (
    p_user_id, v_overall_score, v_health_grade,
    p_period_from, p_period_to,
    NOW()
  );
  
  RETURN v_overall_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create audit trail on invoice changes
CREATE OR REPLACE FUNCTION audit_invoice_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_fields TEXT[];
  v_action_type VARCHAR(50);
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action_type := 'create';
    v_changed_fields := ARRAY['*'];
  ELSIF TG_OP = 'UPDATE' THEN
    v_action_type := 'update';
    v_changed_fields := ARRAY[]::TEXT[];
    
    IF OLD.subtotal != NEW.subtotal THEN v_changed_fields := array_append(v_changed_fields, 'subtotal'); END IF;
    IF OLD.gst_amount != NEW.gst_amount THEN v_changed_fields := array_append(v_changed_fields, 'gst_amount'); END IF;
    IF OLD.total != NEW.total THEN v_changed_fields := array_append(v_changed_fields, 'total'); END IF;
    IF OLD.status != NEW.status THEN v_changed_fields := array_append(v_changed_fields, 'status'); END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action_type := 'delete';
    v_changed_fields := ARRAY['*'];
  END IF;
  
  -- Insert audit record
  INSERT INTO gst_audit_trail (
    user_id, performed_by, performed_by_type,
    action_type, entity_type, entity_id,
    old_values, new_values, changed_fields,
    action_description, action_category,
    ip_address, is_critical_action
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.user_id, OLD.user_id),
    'owner',
    v_action_type,
    'invoice',
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW),
    v_changed_fields,
    v_action_type || ' invoice ' || COALESCE(NEW.invoice_number, OLD.invoice_number),
    'invoice',
    '0.0.0.0',  -- Will be updated by application
    (v_action_type = 'delete' OR array_length(v_changed_fields, 1) > 3)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_invoices ON invoices;
CREATE TRIGGER trigger_audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW
EXECUTE FUNCTION audit_invoice_changes();

-- =====================================================
-- VIEWS
-- =====================================================

-- CA Dashboard view for multiple clients
CREATE OR REPLACE VIEW ca_clients_dashboard AS
SELECT 
  cca.ca_user_id,
  cca.client_user_id,
  u.email as client_email,
  
  -- Client GST health
  ghs.overall_score as health_score,
  ghs.health_grade,
  ghs.risk_level,
  
  -- Pending returns
  (SELECT COUNT(*) FROM gstr1_records 
   WHERE user_id = cca.client_user_id 
   AND preparation_status = 'draft') as pending_gstr1,
  (SELECT COUNT(*) FROM gstr3b_records 
   WHERE user_id = cca.client_user_id 
   AND preparation_status = 'draft') as pending_gstr3b,
  
  -- Open alerts
  (SELECT COUNT(*) FROM gst_mismatch_alerts 
   WHERE user_id = cca.client_user_id 
   AND status = 'open') as open_alerts,
  
  -- Access details
  cca.access_level,
  cca.status as access_status,
  cca.valid_until
  
FROM client_ca_access cca
JOIN auth.users u ON cca.client_user_id = u.id
LEFT JOIN gst_health_scores ghs ON cca.client_user_id = ghs.user_id
WHERE cca.status = 'active';

-- GST Compliance summary view
CREATE OR REPLACE VIEW gst_compliance_summary AS
SELECT 
  i.user_id,
  i.financial_year,
  
  -- Invoice counts
  COUNT(*) as total_invoices,
  COUNT(*) FILTER (WHERE i.supply_type = 'intra-state') as intra_state_count,
  COUNT(*) FILTER (WHERE i.supply_type = 'inter-state') as inter_state_count,
  
  -- Tax totals
  SUM(i.subtotal) as total_taxable_value,
  SUM(i.cgst_amount) as total_cgst,
  SUM(i.sgst_amount) as total_sgst,
  SUM(i.igst_amount) as total_igst,
  SUM(i.gst_amount) as total_gst,
  
  -- E-Invoice stats
  COUNT(e.id) FILTER (WHERE e.irp_status = 'generated') as einvoices_generated,
  COUNT(e.id) FILTER (WHERE e.irp_status = 'failed') as einvoices_failed,
  
  -- E-Way Bill stats
  COUNT(ew.id) FILTER (WHERE ew.status = 'active') as active_eway_bills,
  
  -- Health
  AVG(ghs.overall_score) as avg_health_score
  
FROM invoices i
LEFT JOIN einvoice_records e ON i.id = e.invoice_id
LEFT JOIN eway_bills ew ON i.id = ew.invoice_id
LEFT JOIN gst_health_scores ghs ON i.user_id = ghs.user_id
GROUP BY i.user_id, i.financial_year;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE gstr1_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gstr3b_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE einvoice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE eway_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_mismatch_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_ca_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_health_score_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their GSTR-1 data" ON gstr1_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their GSTR-1 data" ON gstr1_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their GSTR-3B data" ON gstr3b_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their GSTR-3B data" ON gstr3b_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their E-Invoices" ON einvoice_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their E-Invoices" ON einvoice_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their E-Way Bills" ON eway_bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their E-Way Bills" ON eway_bills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their GST alerts" ON gst_mismatch_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their GST alerts" ON gst_mismatch_alerts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their CA profile" ON ca_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their CA profile" ON ca_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view CA access to their data" ON client_ca_access FOR SELECT USING (auth.uid() = client_user_id OR auth.uid() = ca_user_id);
CREATE POLICY "Clients can manage CA access" ON client_ca_access FOR ALL USING (auth.uid() = client_user_id);

CREATE POLICY "CAs can view activity logs" ON ca_activity_log FOR SELECT USING (auth.uid() = ca_user_id OR auth.uid() = client_user_id);
CREATE POLICY "System can insert activity logs" ON ca_activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their audit trail" ON gst_audit_trail FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit logs" ON gst_audit_trail FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their health scores" ON gst_health_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage health scores" ON gst_health_scores FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view health score history" ON gst_health_score_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert health history" ON gst_health_score_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE gstr1_records IS 'GSTR-1 monthly/quarterly return data auto-generated from invoices';
COMMENT ON TABLE gstr3b_records IS 'GSTR-3B monthly return summary with tax liability and ITC';
COMMENT ON TABLE einvoice_records IS 'E-Invoice (IRN) generation records with IRP integration';
COMMENT ON TABLE eway_bills IS 'E-Way Bill records for goods transportation';
COMMENT ON TABLE gst_mismatch_alerts IS 'Automated GST mismatch detection and reconciliation alerts';
COMMENT ON TABLE ca_profiles IS 'Chartered Accountant profiles for collaboration';
COMMENT ON TABLE client_ca_access IS 'Client-CA access permissions and relationships';
COMMENT ON TABLE ca_activity_log IS 'Activity log for CA actions on client data';
COMMENT ON TABLE gst_audit_trail IS 'Comprehensive audit trail for all GST activities with IP tracking';
COMMENT ON TABLE gst_health_scores IS 'GST compliance health scores with component metrics';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
