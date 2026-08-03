-- Advanced Invoice Features Migration
-- Multi-series, Proforma, Credit Notes, Milestones, Approval Workflow, etc.

-- ============================================
-- 1. MULTI-SERIES INVOICE NUMBERING
-- ============================================

-- Invoice Series Management (Branch-wise, FY-wise, Custom)
CREATE TABLE IF NOT EXISTS invoice_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  series_name VARCHAR(100) NOT NULL, -- e.g., "Main Office", "Branch-Mumbai", "Export"
  series_code VARCHAR(20) NOT NULL, -- e.g., "MO", "BM", "EXP"
  prefix VARCHAR(20) DEFAULT 'INV',
  suffix VARCHAR(20),
  financial_year_based BOOLEAN DEFAULT true,
  branch_id VARCHAR(50), -- Optional branch identifier
  current_number INTEGER NOT NULL DEFAULT 0,
  reset_annually BOOLEAN DEFAULT true, -- Reset counter every FY
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  number_format VARCHAR(50) DEFAULT '{PREFIX}-{FY}-{NUM}', -- e.g., INV-2425-0001, BM-INV-0001
  padding_length INTEGER DEFAULT 4, -- Number of digits to pad (e.g., 0001)
  last_reset_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, series_code)
);

CREATE INDEX idx_invoice_series_user_id ON invoice_series(user_id);
CREATE INDEX idx_invoice_series_active ON invoice_series(user_id, is_active);

-- Update invoices table to reference series
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_series_id UUID REFERENCES invoice_series(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS financial_year VARCHAR(10); -- e.g., "2024-25"

-- ============================================
-- 2. INVOICE LIFECYCLE & TYPES
-- ============================================

-- Add invoice type and lifecycle tracking
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(30) DEFAULT 'standard' 
  CHECK (invoice_type IN ('standard', 'proforma', 'credit_note', 'debit_note', 'advance', 'milestone'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parent_invoice_id UUID REFERENCES invoices(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lifecycle_stage VARCHAR(30) DEFAULT 'draft'
  CHECK (lifecycle_stage IN ('draft', 'proforma', 'approved', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'converted'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS converted_to_invoice_id UUID REFERENCES invoices(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS credit_note_reason TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS proforma_valid_until DATE;

-- ============================================
-- 3. MILESTONE & PARTIAL BILLING
-- ============================================

CREATE TABLE IF NOT EXISTS invoice_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  milestone_invoice_id UUID REFERENCES invoices(id),
  milestone_number INTEGER NOT NULL,
  milestone_name VARCHAR(200) NOT NULL,
  description TEXT,
  percentage DECIMAL(5, 2), -- Percentage of total project
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'cancelled')),
  completion_criteria TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_milestones_parent ON invoice_milestones(parent_invoice_id);
CREATE INDEX idx_invoice_milestones_status ON invoice_milestones(parent_invoice_id, status);

-- Add milestone tracking to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_milestone_based BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES invoice_milestones(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_name VARCHAR(200);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_total_value DECIMAL(12, 2);

-- ============================================
-- 4. ADVANCE PAYMENT INVOICES
-- ============================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_advance_payment BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS advance_percentage DECIMAL(5, 2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS advance_adjusted_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS advance_invoice_ids JSONB; -- Array of advance invoice IDs

-- Advance payment adjustments table
CREATE TABLE IF NOT EXISTS advance_payment_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advance_invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  final_invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  adjusted_amount DECIMAL(12, 2) NOT NULL,
  adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_advance_adjustments_advance ON advance_payment_adjustments(advance_invoice_id);
CREATE INDEX idx_advance_adjustments_final ON advance_payment_adjustments(final_invoice_id);

-- ============================================
-- 5. INVOICE APPROVAL WORKFLOW (Maker-Checker)
-- ============================================

CREATE TABLE IF NOT EXISTS invoice_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  current_approver UUID REFERENCES auth.users(id),
  approval_level INTEGER DEFAULT 1,
  required_approvals INTEGER DEFAULT 1,
  approval_status VARCHAR(30) DEFAULT 'pending' 
    CHECK (approval_status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_id UUID REFERENCES invoice_approvals(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES auth.users(id) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'commented')),
  comments TEXT,
  action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_approvals_invoice ON invoice_approvals(invoice_id);
CREATE INDEX idx_invoice_approvals_approver ON invoice_approvals(current_approver, approval_status);
CREATE INDEX idx_approval_history_approval ON approval_history(approval_id);

-- Add approval fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30);

-- ============================================
-- 6. ENHANCED GST FEATURES
-- ============================================

-- Store company/user GST details for auto-classification
CREATE TABLE IF NOT EXISTS company_gst_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_gstin VARCHAR(15) NOT NULL,
  company_state_code VARCHAR(2) NOT NULL,
  company_state_name VARCHAR(100),
  default_place_of_supply VARCHAR(2),
  is_composition_scheme BOOLEAN DEFAULT false,
  composition_rate DECIMAL(5, 2),
  reverse_charge_applicable_categories JSONB, -- Array of service categories
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_company_gst_user ON company_gst_settings(user_id);

-- Enhanced customer state tracking (if not already present)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_code VARCHAR(2);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_name VARCHAR(100);

-- Add more GST fields to invoices if not present
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_sez_supply BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_export BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS export_type VARCHAR(30);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_bill_no VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_bill_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS port_code VARCHAR(10);

-- ============================================
-- 7. HSN/SAC MASTER DATABASE
-- ============================================

CREATE TABLE IF NOT EXISTS hsn_sac_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('HSN', 'SAC')),
  gst_rate DECIMAL(5, 2) DEFAULT 18.00,
  default_gst_rate DECIMAL(5, 2) DEFAULT 18.00,
  product_category VARCHAR(100),
  chapter_no VARCHAR(4),
  chapter_name VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  search_keywords TEXT[], -- For intelligent search
  usage_count INTEGER DEFAULT 0, -- Track popularity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all required columns exist (in case table was created elsewhere)
DO $$ 
BEGIN
  -- Add gst_rate if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'gst_rate'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00;
  END IF;

  -- Add default_gst_rate if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'default_gst_rate'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN default_gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00;
  END IF;

  -- Add product_category if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'product_category'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN product_category VARCHAR(100);
  END IF;
  
  -- Add chapter_no if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'chapter_no'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN chapter_no VARCHAR(4);
  END IF;
  
  -- Add chapter_name if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'chapter_name'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN chapter_name VARCHAR(200);
  END IF;
  
  -- Add search_keywords if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'search_keywords'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN search_keywords TEXT[];
  END IF;
  
  -- Add usage_count if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hsn_sac_code ON hsn_sac_master(code);
CREATE INDEX IF NOT EXISTS idx_hsn_sac_category ON hsn_sac_master(category);
CREATE INDEX IF NOT EXISTS idx_hsn_sac_description ON hsn_sac_master USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_hsn_sac_keywords ON hsn_sac_master USING gin(search_keywords);

-- User's frequently used HSN/SAC codes
CREATE TABLE IF NOT EXISTS user_hsn_sac_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hsn_sac_code VARCHAR(10) NOT NULL,
  custom_description TEXT,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hsn_sac_code)
);

CREATE INDEX idx_user_hsn_preferences ON user_hsn_sac_preferences(user_id, usage_count DESC);

-- ============================================
-- 8. COMPLIANCE & ROUND-OFF
-- ============================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS round_off_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_before_round_off DECIMAL(12, 2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS compliance_checked BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS compliance_warnings JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS auto_calculated BOOLEAN DEFAULT true;

-- Compliance audit log
CREATE TABLE IF NOT EXISTS invoice_compliance_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  check_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pass', 'warning', 'error')),
  message TEXT,
  details JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_compliance_log_invoice ON invoice_compliance_log(invoice_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Invoice Series
ALTER TABLE invoice_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invoice series" ON invoice_series FOR ALL USING (auth.uid() = user_id);

-- Invoice Milestones
ALTER TABLE invoice_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own milestones" ON invoice_milestones FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_milestones.parent_invoice_id AND invoices.user_id = auth.uid()));

-- Advance Payment Adjustments
ALTER TABLE advance_payment_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own adjustments" ON advance_payment_adjustments FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = advance_payment_adjustments.advance_invoice_id AND invoices.user_id = auth.uid()));

-- Invoice Approvals
ALTER TABLE invoice_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own approvals" ON invoice_approvals FOR ALL 
  USING (auth.uid() = submitted_by OR auth.uid() = current_approver);

ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view approval history" ON approval_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM invoice_approvals WHERE invoice_approvals.id = approval_history.approval_id 
    AND (invoice_approvals.submitted_by = auth.uid() OR invoice_approvals.current_approver = auth.uid())));

-- Company GST Settings
ALTER TABLE company_gst_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own GST settings" ON company_gst_settings FOR ALL USING (auth.uid() = user_id);

-- HSN/SAC Master (public read, admin write)
ALTER TABLE hsn_sac_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read HSN/SAC" ON hsn_sac_master FOR SELECT USING (true);

-- User HSN/SAC Preferences
ALTER TABLE user_hsn_sac_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own HSN preferences" ON user_hsn_sac_preferences FOR ALL USING (auth.uid() = user_id);

-- Invoice Compliance Log
ALTER TABLE invoice_compliance_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own compliance logs" ON invoice_compliance_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_compliance_log.invoice_id AND invoices.user_id = auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current Financial Year
CREATE OR REPLACE FUNCTION get_current_financial_year()
RETURNS VARCHAR AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
  fy_start_year INTEGER;
  fy_end_year INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  IF current_month >= 4 THEN
    fy_start_year := current_year;
    fy_end_year := current_year + 1;
  ELSE
    fy_start_year := current_year - 1;
    fy_end_year := current_year;
  END IF;
  
  RETURN fy_start_year::VARCHAR || '-' || SUBSTRING(fy_end_year::VARCHAR, 3, 2);
END;
$$ LANGUAGE plpgsql;

-- Enhanced invoice number generation with series support
CREATE OR REPLACE FUNCTION get_next_invoice_number_with_series(
  p_user_id UUID,
  p_series_id UUID DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
  v_series RECORD;
  v_next_number INTEGER;
  v_invoice_number VARCHAR;
  v_fy VARCHAR;
  v_num_str VARCHAR;
BEGIN
  -- Get financial year
  v_fy := get_current_financial_year();
  
  -- Get series (use default if not specified)
  IF p_series_id IS NULL THEN
    SELECT * INTO v_series FROM invoice_series 
    WHERE user_id = p_user_id AND (is_default = true OR is_active = true)
    ORDER BY is_default DESC, created_at ASC
    LIMIT 1 FOR UPDATE;
    
    IF NOT FOUND THEN
      -- Create default series
      INSERT INTO invoice_series (user_id, series_name, series_code, prefix, is_default, is_active)
      VALUES (p_user_id, 'Default Series', 'DEF', 'INV', true, true)
      RETURNING * INTO v_series;
    END IF;
  ELSE
    SELECT * INTO v_series FROM invoice_series 
    WHERE id = p_series_id AND user_id = p_user_id
    FOR UPDATE;
  END IF;
  
  -- Check if reset is needed
  IF v_series.reset_annually AND v_series.financial_year_based THEN
    IF v_series.last_reset_date IS NULL OR 
       EXTRACT(YEAR FROM v_series.last_reset_date) < EXTRACT(YEAR FROM CURRENT_DATE) THEN
      v_next_number := 1;
      UPDATE invoice_series 
      SET current_number = 1, last_reset_date = CURRENT_DATE
      WHERE id = v_series.id;
    ELSE
      v_next_number := v_series.current_number + 1;
      UPDATE invoice_series SET current_number = v_next_number WHERE id = v_series.id;
    END IF;
  ELSE
    v_next_number := v_series.current_number + 1;
    UPDATE invoice_series SET current_number = v_next_number WHERE id = v_series.id;
  END IF;
  
  -- Format number with padding
  v_num_str := LPAD(v_next_number::TEXT, v_series.padding_length, '0');
  
  -- Build invoice number based on format
  v_invoice_number := v_series.number_format;
  v_invoice_number := REPLACE(v_invoice_number, '{PREFIX}', v_series.prefix);
  v_invoice_number := REPLACE(v_invoice_number, '{FY}', v_fy);
  v_invoice_number := REPLACE(v_invoice_number, '{NUM}', v_num_str);
  v_invoice_number := REPLACE(v_invoice_number, '{SERIES}', v_series.series_code);
  
  IF v_series.suffix IS NOT NULL THEN
    v_invoice_number := v_invoice_number || '-' || v_series.suffix;
  END IF;
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-determine GST type based on state codes
CREATE OR REPLACE FUNCTION auto_determine_gst_type(
  p_company_state_code VARCHAR(2),
  p_customer_state_code VARCHAR(2)
)
RETURNS VARCHAR AS $$
BEGIN
  IF p_customer_state_code IS NULL OR p_customer_state_code = '' THEN
    RETURN 'intra-state'; -- Default to intra-state
  END IF;
  
  IF p_company_state_code = p_customer_state_code THEN
    RETURN 'intra-state'; -- CGST + SGST
  ELSE
    RETURN 'inter-state'; -- IGST
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate round-off
CREATE OR REPLACE FUNCTION calculate_round_off(p_amount DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  v_rounded DECIMAL;
  v_round_off DECIMAL;
BEGIN
  v_rounded := ROUND(p_amount);
  v_round_off := v_rounded - p_amount;
  RETURN v_round_off;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_series_updated_at BEFORE UPDATE ON invoice_series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_milestones_updated_at BEFORE UPDATE ON invoice_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_approvals_updated_at BEFORE UPDATE ON invoice_approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_gst_updated_at BEFORE UPDATE ON company_gst_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Common HSN/SAC Codes
-- ============================================

INSERT INTO hsn_sac_master (code, description, category, gst_rate, chapter_no, chapter_name, search_keywords) VALUES
-- Services (SAC)
('9954', 'Consultancy Services', 'SAC', 18.00, '99', 'Professional Services', ARRAY['consulting', 'advisory', 'professional', 'business']),
('9965', 'Other Professional, Technical and Business Services', 'SAC', 18.00, '99', 'Professional Services', ARRAY['professional', 'technical', 'business']),
('9967', 'Financial and Related Services', 'SAC', 18.00, '99', 'Financial Services', ARRAY['finance', 'banking', 'accounting']),
('9973', 'Software Implementation Services', 'SAC', 18.00, '99', 'IT Services', ARRAY['software', 'implementation', 'it', 'technology']),
('9982', 'Computer and Information Services', 'SAC', 18.00, '99', 'IT Services', ARRAY['computer', 'information', 'it', 'software']),
('9983', 'News Agency Services', 'SAC', 18.00, '99', 'Media Services', ARRAY['news', 'media', 'journalism']),
('9985', 'Education and Training Services', 'SAC', 18.00, '99', 'Education', ARRAY['education', 'training', 'teaching', 'learning']),
('9986', 'Health Services', 'SAC', 12.00, '99', 'Healthcare', ARRAY['health', 'medical', 'healthcare', 'hospital']),
('9988', 'Other Professional, Technical and Business Services n.e.c.', 'SAC', 18.00, '99', 'Professional Services', ARRAY['professional', 'business', 'services']),
('9989', 'Maintenance, repair and installation (except construction) services', 'SAC', 18.00, '99', 'Maintenance Services', ARRAY['maintenance', 'repair', 'installation']),
-- Goods (HSN)
('8517', 'Electrical apparatus for line telephony or line telegraphy', 'HSN', 18.00, '85', 'Electrical Machinery', ARRAY['phone', 'telephone', 'communication', 'mobile']),
('8471', 'Automatic data processing machines and units thereof', 'HSN', 18.00, '84', 'Computers', ARRAY['computer', 'laptop', 'desktop', 'hardware']),
('6204', 'Women or girls suits, ensembles, jackets, blazers', 'HSN', 12.00, '62', 'Apparel', ARRAY['clothing', 'garments', 'women', 'apparel']),
('7326', 'Other articles of iron or steel', 'HSN', 18.00, '73', 'Iron and Steel', ARRAY['steel', 'iron', 'metal']),
('3004', 'Medicaments', 'HSN', 12.00, '30', 'Pharmaceuticals', ARRAY['medicine', 'drugs', 'pharmaceutical', 'medicament']),
('4901', 'Printed books, brochures, leaflets', 'HSN', 12.00, '49', 'Publications', ARRAY['books', 'publications', 'printed']),
('8544', 'Insulated wire, cable', 'HSN', 18.00, '85', 'Electrical Machinery', ARRAY['wire', 'cable', 'electrical']),
('9403', 'Other furniture and parts thereof', 'HSN', 18.00, '94', 'Furniture', ARRAY['furniture', 'table', 'chair', 'desk'])
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Invoice Summary View with all details
CREATE OR REPLACE VIEW invoice_summary_view AS
SELECT 
  i.*,
  c.name as customer_name,
  c.gstin as customer_gstin,
  c.state_code as customer_state_code,
  s.series_name,
  s.series_code,
  ia.approval_status as current_approval_status,
  COALESCE(m.milestone_count, 0) as milestone_count,
  COALESCE(m.paid_milestones, 0) as paid_milestones
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id
LEFT JOIN invoice_series s ON i.invoice_series_id = s.id
LEFT JOIN invoice_approvals ia ON i.id = ia.invoice_id AND ia.approval_status = 'pending'
LEFT JOIN (
  SELECT parent_invoice_id, 
         COUNT(*) as milestone_count,
         COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_milestones
  FROM invoice_milestones 
  GROUP BY parent_invoice_id
) m ON i.id = m.parent_invoice_id;

COMMENT ON TABLE invoice_series IS 'Manages multiple invoice numbering series for branches, financial years, or custom requirements';
COMMENT ON TABLE invoice_milestones IS 'Tracks milestone-based billing for project invoices';
COMMENT ON TABLE invoice_approvals IS 'Implements maker-checker approval workflow for invoices';
COMMENT ON TABLE hsn_sac_master IS 'Master database of HSN and SAC codes with GST rates';
COMMENT ON TABLE company_gst_settings IS 'Stores company GST configuration for auto-classification';
