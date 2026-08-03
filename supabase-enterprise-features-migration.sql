-- =====================================================
-- ENTERPRISE FEATURES MIGRATION
-- Comprehensive business management features
-- =====================================================

-- =====================================================
-- INVENTORY+ MODULE
-- =====================================================

-- Inventory Items (Enhanced with batch & expiry tracking)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  item_code VARCHAR(100) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('product', 'service', 'raw_material')),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  
  -- Product Details
  unit_of_measurement VARCHAR(50) NOT NULL, -- pcs, kg, liters, hours, etc.
  hsn_sac_code VARCHAR(50),
  description TEXT,
  
  -- Service Inventory Fields
  service_type VARCHAR(50), -- hours, retainers, subscriptions
  billing_cycle VARCHAR(50), -- hourly, monthly, quarterly, annual
  default_rate DECIMAL(15, 2),
  
  -- Pricing
  purchase_price DECIMAL(15, 2),
  selling_price DECIMAL(15, 2),
  minimum_selling_price DECIMAL(15, 2),
  
  -- Stock Management
  current_stock DECIMAL(15, 3) DEFAULT 0,
  reorder_level DECIMAL(15, 3),
  reorder_quantity DECIMAL(15, 3),
  minimum_stock_level DECIMAL(15, 3),
  maximum_stock_level DECIMAL(15, 3),
  
  -- Warehouse Location
  warehouse_location VARCHAR(255),
  bin_location VARCHAR(100),
  
  -- Tracking Settings
  enable_batch_tracking BOOLEAN DEFAULT false,
  enable_expiry_tracking BOOLEAN DEFAULT false,
  enable_serial_tracking BOOLEAN DEFAULT false,
  
  -- AI Alert Settings
  enable_low_stock_alerts BOOLEAN DEFAULT true,
  alert_threshold_percentage INTEGER DEFAULT 20, -- Alert when stock < 20% of max
  alert_recipients JSONB, -- Array of email/phone numbers
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, item_code)
);

-- Inventory Batches
CREATE TABLE IF NOT EXISTS inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Batch Info
  batch_number VARCHAR(100) NOT NULL,
  manufacturing_date DATE,
  expiry_date DATE,
  
  -- Stock
  opening_stock DECIMAL(15, 3) NOT NULL,
  current_stock DECIMAL(15, 3) NOT NULL,
  reserved_stock DECIMAL(15, 3) DEFAULT 0,
  available_stock DECIMAL(15, 3) GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  
  -- Costing
  purchase_price_per_unit DECIMAL(15, 2),
  total_purchase_value DECIMAL(15, 2),
  
  -- Location
  warehouse_location VARCHAR(255),
  
  -- Status
  batch_status VARCHAR(50) DEFAULT 'active' CHECK (batch_status IN ('active', 'expired', 'recalled', 'depleted')),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, inventory_item_id, batch_number)
);

-- Job-Based Inventory Allocation
CREATE TABLE IF NOT EXISTS job_inventory_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Job Info
  job_code VARCHAR(100) NOT NULL,
  job_name VARCHAR(255) NOT NULL,
  job_type VARCHAR(100), -- project, order, work_order
  customer_id UUID REFERENCES customers(id),
  
  -- Allocation
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  batch_id UUID REFERENCES inventory_batches(id),
  
  allocated_quantity DECIMAL(15, 3) NOT NULL,
  consumed_quantity DECIMAL(15, 3) DEFAULT 0,
  returned_quantity DECIMAL(15, 3) DEFAULT 0,
  
  -- Dates
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_consumption_date DATE,
  actual_consumption_date DATE,
  
  -- Costing
  unit_cost DECIMAL(15, 2),
  total_cost DECIMAL(15, 2) GENERATED ALWAYS AS (consumed_quantity * unit_cost) STORED,
  
  -- Status
  allocation_status VARCHAR(50) DEFAULT 'allocated' CHECK (allocation_status IN ('allocated', 'partially_consumed', 'fully_consumed', 'returned', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  -- Audit
  allocated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Low Stock Alerts
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Alert Info
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_stock', 'expiry_warning', 'expired', 'reorder_point', 'overstock', 'negative_stock')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Details
  current_stock DECIMAL(15, 3),
  threshold_stock DECIMAL(15, 3),
  batch_id UUID REFERENCES inventory_batches(id),
  expiry_date DATE,
  days_to_expiry INTEGER,
  
  -- AI Insights
  ai_recommendation TEXT,
  recommended_reorder_quantity DECIMAL(15, 3),
  predicted_stockout_date DATE,
  
  -- Status
  alert_status VARCHAR(50) DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  
  -- Actions Taken
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXPENSE MANAGEMENT MODULE
-- =====================================================

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  category_name VARCHAR(100) NOT NULL,
  parent_category_id UUID REFERENCES expense_categories(id),
  category_type VARCHAR(50) CHECK (category_type IN ('operational', 'capital', 'staff', 'travel', 'other')),
  
  -- Accounting
  expense_account_code VARCHAR(50),
  is_tax_deductible BOOLEAN DEFAULT true,
  
  -- Approval Settings
  requires_approval BOOLEAN DEFAULT false,
  approval_limit DECIMAL(15, 2),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, category_name)
);

-- Assets (for depreciation tracking) - Created before expenses table since expenses references it
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Asset Info
  asset_code VARCHAR(100) NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_category VARCHAR(100) NOT NULL, -- machinery, vehicle, computer, furniture, etc.
  
  -- Purchase Details
  purchase_date DATE NOT NULL,
  purchase_value DECIMAL(15, 2) NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  invoice_number VARCHAR(100),
  
  -- Depreciation
  depreciation_method VARCHAR(50) NOT NULL CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'units_of_production')),
  useful_life_years INTEGER NOT NULL,
  useful_life_months INTEGER GENERATED ALWAYS AS (useful_life_years * 12) STORED,
  salvage_value DECIMAL(15, 2) DEFAULT 0,
  
  depreciation_rate DECIMAL(5, 2), -- For declining balance
  annual_depreciation DECIMAL(15, 2),
  accumulated_depreciation DECIMAL(15, 2) DEFAULT 0,
  current_book_value DECIMAL(15, 2),
  
  -- Location
  location VARCHAR(255),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Status
  asset_status VARCHAR(50) DEFAULT 'active' CHECK (asset_status IN ('active', 'under_maintenance', 'disposed', 'sold', 'written_off')),
  
  -- Disposal
  disposal_date DATE,
  disposal_value DECIMAL(15, 2),
  disposal_method VARCHAR(50),
  
  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, asset_code)
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  expense_number VARCHAR(100) NOT NULL,
  expense_date DATE NOT NULL,
  
  -- Category & Type
  expense_category_id UUID NOT NULL REFERENCES expense_categories(id),
  expense_type VARCHAR(50) NOT NULL CHECK (expense_type IN ('cash', 'card', 'bank_transfer', 'cheque', 'mileage', 'asset_purchase')),
  
  -- Vendor/Payee
  vendor_id UUID REFERENCES vendors(id),
  payee_name VARCHAR(255),
  
  -- Amount
  amount DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  
  -- Payment Details
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  payment_date DATE,
  
  -- OCR Scanned Data
  scanned_from_image BOOLEAN DEFAULT false,
  ocr_confidence_score DECIMAL(5, 2), -- 0-100
  original_image_url TEXT,
  extracted_data JSONB,
  
  -- Mileage (if expense_type = 'mileage')
  mileage_km DECIMAL(10, 2),
  mileage_rate_per_km DECIMAL(10, 2),
  start_location VARCHAR(255),
  end_location VARCHAR(255),
  vehicle_number VARCHAR(50),
  
  -- Asset (if expense_type = 'asset_purchase')
  asset_id UUID REFERENCES assets(id),
  is_capitalizable BOOLEAN DEFAULT false,
  depreciation_period_months INTEGER,
  
  -- Allocation
  allocated_to_job_id UUID,
  allocated_to_project VARCHAR(100),
  cost_center VARCHAR(100),
  
  -- Approval Workflow
  requires_approval BOOLEAN DEFAULT false,
  approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Reimbursement
  is_reimbursable BOOLEAN DEFAULT false,
  reimbursement_status VARCHAR(50) CHECK (reimbursement_status IN ('pending', 'approved', 'paid', 'rejected')),
  reimbursed_amount DECIMAL(15, 2),
  reimbursed_on DATE,
  
  -- Attachments
  receipt_urls JSONB, -- Array of receipt images/PDFs
  
  -- Notes
  description TEXT,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, expense_number)
);

-- Asset Depreciation Log
CREATE TABLE IF NOT EXISTS asset_depreciation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  depreciation_period VARCHAR(20) NOT NULL, -- YYYY-MM format
  financial_year VARCHAR(20) NOT NULL,
  
  -- Values
  opening_book_value DECIMAL(15, 2) NOT NULL,
  depreciation_amount DECIMAL(15, 2) NOT NULL,
  accumulated_depreciation DECIMAL(15, 2) NOT NULL,
  closing_book_value DECIMAL(15, 2) NOT NULL,
  
  -- Calculation
  calculation_method VARCHAR(50),
  calculation_details JSONB,
  
  -- Status
  is_posted BOOLEAN DEFAULT false,
  posted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADVANCED DASHBOARDS & REPORTING MODULE
-- =====================================================

-- MIS Reports Configuration
CREATE TABLE IF NOT EXISTS mis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Report Info
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('cash_flow', 'profitability', 'gst_analysis', 'collection_efficiency', 'expense_analysis', 'inventory_analysis', 'custom')),
  
  -- Configuration
  report_config JSONB NOT NULL, -- Columns, filters, groupings
  
  -- Filters
  default_date_range VARCHAR(50), -- this_month, this_quarter, this_year, custom
  default_grouping VARCHAR(50), -- daily, weekly, monthly, quarterly, yearly
  
  -- Dimensions
  group_by_dimensions JSONB, -- city, state, gst_type, customer, product, etc.
  
  -- Scheduling
  is_scheduled BOOLEAN DEFAULT false,
  schedule_frequency VARCHAR(50), -- daily, weekly, monthly
  schedule_time TIME,
  schedule_recipients JSONB, -- Array of emails
  
  -- Export Format
  default_export_format VARCHAR(20) DEFAULT 'excel' CHECK (default_export_format IN ('excel', 'pdf', 'csv')),
  
  -- AI Insights
  enable_ai_insights BOOLEAN DEFAULT true,
  
  -- Access
  is_public BOOLEAN DEFAULT false,
  shared_with JSONB, -- Array of user IDs
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Metrics (Real-time tracking)
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  metric_date DATE NOT NULL,
  metric_period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
  
  -- Cash Flow Metrics
  opening_cash_balance DECIMAL(15, 2),
  cash_inflow DECIMAL(15, 2),
  cash_outflow DECIMAL(15, 2),
  closing_cash_balance DECIMAL(15, 2),
  
  -- Receivables
  total_outstanding_receivables DECIMAL(15, 2),
  overdue_receivables DECIMAL(15, 2),
  current_receivables DECIMAL(15, 2),
  average_collection_days INTEGER,
  
  -- GST Metrics
  total_gst_collected DECIMAL(15, 2),
  total_gst_paid DECIMAL(15, 2),
  gst_liability DECIMAL(15, 2),
  itc_available DECIMAL(15, 2),
  net_gst_payable DECIMAL(15, 2),
  
  -- Collection Efficiency
  invoices_raised_value DECIMAL(15, 2),
  payments_received_value DECIMAL(15, 2),
  collection_efficiency_percentage DECIMAL(5, 2), -- (received/raised) * 100
  
  -- Profitability
  total_revenue DECIMAL(15, 2),
  total_expenses DECIMAL(15, 2),
  gross_profit DECIMAL(15, 2),
  gross_profit_margin DECIMAL(5, 2),
  net_profit DECIMAL(15, 2),
  net_profit_margin DECIMAL(5, 2),
  
  -- Business Health Index (0-100)
  business_health_score DECIMAL(5, 2),
  liquidity_score DECIMAL(5, 2),
  profitability_score DECIMAL(5, 2),
  efficiency_score DECIMAL(5, 2),
  growth_score DECIMAL(5, 2),
  
  -- AI Insights
  ai_insights JSONB,
  risk_factors JSONB,
  opportunities JSONB,
  recommendations JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, metric_date, metric_period)
);

-- =====================================================
-- ACCESS CONTROL & SECURITY MODULE
-- =====================================================

-- Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role_name VARCHAR(100) NOT NULL,
  role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('super_admin', 'admin', 'accounts', 'sales', 'inventory', 'viewer', 'custom')),
  
  -- Permissions
  permissions JSONB NOT NULL, -- Detailed permissions object
  
  -- Modules Access
  can_access_invoices BOOLEAN DEFAULT false,
  can_access_expenses BOOLEAN DEFAULT false,
  can_access_inventory BOOLEAN DEFAULT false,
  can_access_reports BOOLEAN DEFAULT false,
  can_access_settings BOOLEAN DEFAULT false,
  can_access_users BOOLEAN DEFAULT false,
  
  -- Action Permissions
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  
  -- Branch Access
  branch_ids JSONB, -- Array of branch IDs
  all_branches BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  branch_code VARCHAR(50) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  
  -- GST
  gstin VARCHAR(15),
  
  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Manager
  branch_manager_id UUID REFERENCES auth.users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, branch_code)
);

-- IP Access Restrictions
CREATE TABLE IF NOT EXISTS ip_access_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('allow', 'deny')),
  
  -- IP Configuration
  ip_address VARCHAR(45), -- Single IP
  ip_range_start VARCHAR(45), -- IP range start
  ip_range_end VARCHAR(45), -- IP range end
  cidr_notation VARCHAR(50), -- CIDR notation
  
  -- Scope
  applies_to VARCHAR(50) DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_users', 'specific_roles')),
  user_ids JSONB, -- Array of user IDs
  role_ids JSONB, -- Array of role IDs
  
  -- Time-based
  active_from TIME,
  active_to TIME,
  active_days JSONB, -- Array of day numbers (0-6)
  
  priority INTEGER DEFAULT 100, -- Lower number = higher priority
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs (Enhanced)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Info
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name VARCHAR(255),
  performed_by_email VARCHAR(255),
  performed_by_role VARCHAR(100),
  
  -- Action
  action_type VARCHAR(100) NOT NULL, -- create, update, delete, view, export, approve, reject
  entity_type VARCHAR(100) NOT NULL, -- invoice, expense, customer, etc.
  entity_id UUID,
  entity_name VARCHAR(255),
  
  -- Details
  action_description TEXT,
  old_values JSONB,
  new_values JSONB,
  changes_summary TEXT,
  
  -- Context
  module_name VARCHAR(100),
  feature_name VARCHAR(100),
  
  -- Request Info
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_method VARCHAR(10),
  request_url TEXT,
  
  -- Location
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Status
  action_status VARCHAR(50) DEFAULT 'success' CHECK (action_status IN ('success', 'failed', 'partial')),
  error_message TEXT,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_performed_by ON activity_logs(user_id, performed_by);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Maker-Checker Approvals
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  workflow_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL, -- invoice, expense, payment, etc.
  
  -- Trigger Conditions
  trigger_conditions JSONB NOT NULL, -- Amount threshold, specific actions, etc.
  
  -- Approval Levels
  approval_levels JSONB NOT NULL, -- Array of approval levels with approvers
  require_all_approvers BOOLEAN DEFAULT false,
  require_sequential_approval BOOLEAN DEFAULT true,
  
  -- Escalation
  enable_escalation BOOLEAN DEFAULT false,
  escalation_hours INTEGER DEFAULT 24,
  escalate_to JSONB, -- Array of user IDs
  
  -- Notifications
  notify_maker BOOLEAN DEFAULT true,
  notify_checker BOOLEAN DEFAULT true,
  notification_emails JSONB,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Requests
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id),
  
  -- Request Info
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  entity_data JSONB,
  
  -- Maker
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  request_reason TEXT,
  
  -- Current Status
  approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled', 'escalated')),
  current_level INTEGER DEFAULT 1,
  
  -- Checker Actions
  approval_history JSONB, -- Array of approvals/rejections
  
  -- Final Action
  final_approver UUID REFERENCES auth.users(id),
  final_action_at TIMESTAMPTZ,
  final_comments TEXT,
  
  -- Escalation
  is_escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMPTZ,
  escalated_to UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CLIENT PORTAL MODULE
-- =====================================================

-- Client Portal Users
CREATE TABLE IF NOT EXISTS client_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Business owner
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Login Credentials
  client_email VARCHAR(255) NOT NULL UNIQUE,
  client_phone VARCHAR(50),
  password_hash TEXT, -- If using separate auth
  
  -- Access
  portal_access_enabled BOOLEAN DEFAULT true,
  first_login_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  -- Permissions
  can_view_invoices BOOLEAN DEFAULT true,
  can_approve_invoices BOOLEAN DEFAULT false,
  can_raise_disputes BOOLEAN DEFAULT true,
  can_make_payments BOOLEAN DEFAULT true,
  can_download_statements BOOLEAN DEFAULT true,
  can_view_payment_history BOOLEAN DEFAULT true,
  can_chat_support BOOLEAN DEFAULT true,
  
  -- Settings
  receive_email_notifications BOOLEAN DEFAULT true,
  receive_sms_notifications BOOLEAN DEFAULT false,
  receive_whatsapp_notifications BOOLEAN DEFAULT true,
  
  -- Status
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'suspended')),
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Approvals (Client Side)
CREATE TABLE IF NOT EXISTS client_invoice_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  client_portal_user_id UUID NOT NULL REFERENCES client_portal_users(id),
  
  -- Approval
  approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'disputed')),
  
  approved_by_name VARCHAR(255),
  approved_at TIMESTAMPTZ,
  approval_comments TEXT,
  
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Dispute
  is_disputed BOOLEAN DEFAULT false,
  disputed_at TIMESTAMPTZ,
  dispute_details TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(invoice_id, client_portal_user_id)
);

-- Disputes
CREATE TABLE IF NOT EXISTS invoice_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  client_portal_user_id UUID NOT NULL REFERENCES client_portal_users(id),
  
  -- Dispute Info
  dispute_type VARCHAR(100) NOT NULL CHECK (dispute_type IN ('amount_mismatch', 'quality_issue', 'delivery_issue', 'pricing_error', 'duplicate_invoice', 'service_not_rendered', 'other')),
  dispute_description TEXT NOT NULL,
  
  disputed_amount DECIMAL(15, 2),
  
  -- Attachments
  supporting_documents JSONB, -- Array of URLs
  
  -- Status
  dispute_status VARCHAR(50) DEFAULT 'open' CHECK (dispute_status IN ('open', 'under_review', 'resolved', 'closed', 'escalated')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Resolution
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_type VARCHAR(50), -- full_credit, partial_credit, no_action, revised_invoice
  
  credit_note_issued BOOLEAN DEFAULT false,
  credit_note_id UUID,
  credit_amount DECIMAL(15, 2),
  
  -- Communication
  internal_notes TEXT,
  client_communication JSONB, -- Thread of messages
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Support Chat
CREATE TABLE IF NOT EXISTS client_support_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_portal_user_id UUID NOT NULL REFERENCES client_portal_users(id),
  
  -- Chat Info
  ticket_number VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- billing, technical, general, complaint
  
  -- Status
  chat_status VARCHAR(50) DEFAULT 'open' CHECK (chat_status IN ('open', 'in_progress', 'waiting_on_client', 'waiting_on_business', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Messages
  messages JSONB, -- Array of chat messages
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_summary TEXT,
  client_satisfaction_rating INTEGER, -- 1-5
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, ticket_number)
);

-- =====================================================
-- WHATSAPP AUTOMATION MODULE
-- =====================================================

-- WhatsApp Templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template Info
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL CHECK (template_type IN ('payment_reminder', 'payment_received', 'invoice_sent', 'order_confirmation', 'delivery_update', 'custom')),
  
  -- Content
  template_message TEXT NOT NULL,
  variables JSONB, -- Array of variables like {{customer_name}}, {{amount}}, etc.
  
  -- Media
  include_media BOOLEAN DEFAULT false,
  media_type VARCHAR(50) CHECK (media_type IN ('image', 'pdf', 'video')),
  media_url TEXT,
  
  -- Branding
  include_business_logo BOOLEAN DEFAULT true,
  include_business_name BOOLEAN DEFAULT true,
  include_contact_details BOOLEAN DEFAULT true,
  
  -- Trigger Settings
  trigger_type VARCHAR(50), -- manual, automatic, scheduled
  trigger_conditions JSONB,
  
  -- WhatsApp Business API
  wa_template_id VARCHAR(255), -- WhatsApp approved template ID
  wa_template_status VARCHAR(50), -- approved, pending, rejected
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Messages Log
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recipient
  customer_id UUID REFERENCES customers(id),
  recipient_phone VARCHAR(50) NOT NULL,
  recipient_name VARCHAR(255),
  
  -- Message
  template_id UUID REFERENCES whatsapp_templates(id),
  message_type VARCHAR(100) NOT NULL,
  message_content TEXT NOT NULL,
  
  -- Media
  media_urls JSONB,
  
  -- Related Entity
  entity_type VARCHAR(100), -- invoice, payment, order
  entity_id UUID,
  
  -- Delivery Status
  message_status VARCHAR(50) DEFAULT 'pending' CHECK (message_status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- WhatsApp API
  wa_message_id VARCHAR(255),
  wa_conversation_id VARCHAR(255),
  
  -- Cost
  message_cost DECIMAL(10, 4),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Nudges Configuration
CREATE TABLE IF NOT EXISTS payment_nudge_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Nudge Settings
  enable_payment_nudges BOOLEAN DEFAULT true,
  
  -- Before Due Date Nudges
  nudge_before_days JSONB DEFAULT '[7, 3, 1]'::jsonb, -- Days before due date
  
  -- After Due Date Nudges
  nudge_after_days JSONB DEFAULT '[1, 3, 7, 15, 30]'::jsonb, -- Days after due date
  
  -- Escalation
  enable_escalation BOOLEAN DEFAULT false,
  escalation_after_days INTEGER DEFAULT 30,
  escalation_message_template TEXT,
  
  -- Timing
  nudge_time TIME DEFAULT '10:00:00', -- Send at 10 AM
  
  -- Frequency Limits
  max_nudges_per_invoice INTEGER DEFAULT 10,
  min_hours_between_nudges INTEGER DEFAULT 48,
  
  -- WhatsApp Settings
  send_via_whatsapp BOOLEAN DEFAULT true,
  send_via_sms BOOLEAN DEFAULT false,
  send_via_email BOOLEAN DEFAULT true,
  
  -- Personalization
  include_payment_link BOOLEAN DEFAULT true,
  include_invoice_pdf BOOLEAN DEFAULT false,
  use_friendly_tone BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Calculate Business Health Score
CREATE OR REPLACE FUNCTION calculate_business_health_score(
  p_user_id UUID,
  p_metric_date DATE
) RETURNS DECIMAL(5, 2) AS $$
DECLARE
  v_liquidity_score DECIMAL(5, 2) := 0;
  v_profitability_score DECIMAL(5, 2) := 0;
  v_efficiency_score DECIMAL(5, 2) := 0;
  v_growth_score DECIMAL(5, 2) := 0;
  v_overall_score DECIMAL(5, 2) := 0;
BEGIN
  -- Liquidity Score (30%) - Cash position, working capital
  -- Simplified calculation
  v_liquidity_score := 75.0; -- Placeholder
  
  -- Profitability Score (30%) - Margins, ROI
  v_profitability_score := 70.0; -- Placeholder
  
  -- Efficiency Score (25%) - Collection days, inventory turnover
  v_efficiency_score := 80.0; -- Placeholder
  
  -- Growth Score (15%) - Revenue growth, customer acquisition
  v_growth_score := 65.0; -- Placeholder
  
  -- Weighted Average
  v_overall_score := (v_liquidity_score * 0.30) + 
                     (v_profitability_score * 0.30) + 
                     (v_efficiency_score * 0.25) + 
                     (v_growth_score * 0.15);
  
  RETURN v_overall_score;
END;
$$ LANGUAGE plpgsql;

-- Generate Daily Business Metrics
CREATE OR REPLACE FUNCTION generate_daily_business_metrics(
  p_user_id UUID,
  p_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO business_metrics (
    user_id,
    metric_date,
    metric_period,
    business_health_score
  ) VALUES (
    p_user_id,
    p_date,
    'daily',
    calculate_business_health_score(p_user_id, p_date)
  )
  ON CONFLICT (user_id, metric_date, metric_period) 
  DO UPDATE SET
    business_health_score = EXCLUDED.business_health_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Auto-generate Low Stock Alerts
CREATE OR REPLACE FUNCTION check_and_create_inventory_alerts() RETURNS TRIGGER AS $$
BEGIN
  -- Low Stock Alert
  IF NEW.current_stock <= NEW.reorder_level AND NEW.enable_low_stock_alerts THEN
    INSERT INTO inventory_alerts (
      user_id,
      inventory_item_id,
      alert_type,
      severity,
      current_stock,
      threshold_stock,
      alert_status
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'low_stock',
      CASE 
        WHEN NEW.current_stock <= (NEW.reorder_level * 0.5) THEN 'critical'
        WHEN NEW.current_stock <= (NEW.reorder_level * 0.75) THEN 'high'
        ELSE 'medium'
      END,
      NEW.current_stock,
      NEW.reorder_level,
      'active'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_alerts
AFTER UPDATE OF current_stock ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION check_and_create_inventory_alerts();

-- =====================================================
-- VIEWS
-- =====================================================

-- Real-time Cash Flow View
CREATE OR REPLACE VIEW cash_flow_realtime AS
SELECT 
  i.user_id,
  CURRENT_DATE as report_date,
  SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_revenue,
  SUM(CASE WHEN i.status IN ('draft', 'sent') THEN i.total ELSE 0 END) as pending_revenue,
  SUM(CASE WHEN i.due_date < CURRENT_DATE AND i.status != 'paid' THEN i.total ELSE 0 END) as overdue_revenue,
  (SELECT SUM(total_amount) FROM expenses e WHERE e.user_id = i.user_id AND e.payment_date = CURRENT_DATE) as today_expenses,
  (SELECT SUM(total_amount) FROM expenses e WHERE e.user_id = i.user_id AND e.expense_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_expenses
FROM invoices i
GROUP BY i.user_id;

-- Collection Efficiency View
CREATE OR REPLACE VIEW collection_efficiency_view AS
SELECT 
  i.user_id,
  COUNT(*) as total_invoices,
  SUM(i.total) as total_invoiced,
  SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_collected,
  ROUND((SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) / NULLIF(SUM(i.total), 0)) * 100, 2) as collection_efficiency_percentage,
  AVG(CASE WHEN i.status = 'paid' THEN EXTRACT(DAYS FROM (i.updated_at - i.created_at)) ELSE NULL END) as avg_collection_days
FROM invoices i
WHERE i.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY i.user_id;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_inventory_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_depreciation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invoice_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_nudge_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (User can only access their own data)
CREATE POLICY inventory_items_policy ON inventory_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY inventory_batches_policy ON inventory_batches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY job_inventory_allocations_policy ON job_inventory_allocations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY inventory_alerts_policy ON inventory_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY expense_categories_policy ON expense_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY expenses_policy ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY assets_policy ON assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY asset_depreciation_log_policy ON asset_depreciation_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY mis_reports_policy ON mis_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY business_metrics_policy ON business_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_roles_policy ON user_roles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY branches_policy ON branches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY ip_access_rules_policy ON ip_access_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY activity_logs_policy ON activity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY approval_workflows_policy ON approval_workflows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY approval_requests_policy ON approval_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY client_portal_users_policy ON client_portal_users FOR ALL USING (auth.uid() = user_id);
CREATE POLICY client_invoice_approvals_policy ON client_invoice_approvals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY invoice_disputes_policy ON invoice_disputes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY client_support_chats_policy ON client_support_chats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY whatsapp_templates_policy ON whatsapp_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY whatsapp_messages_policy ON whatsapp_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY payment_nudge_settings_policy ON payment_nudge_settings FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_item_type ON inventory_items(item_type);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_expiry_date ON inventory_batches(expiry_date) WHERE batch_status = 'active';
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_status ON inventory_alerts(alert_status, alert_type);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_approval_status ON expenses(approval_status) WHERE requires_approval = true;
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(asset_status);
CREATE INDEX IF NOT EXISTS idx_business_metrics_date ON business_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(approval_status);
CREATE INDEX IF NOT EXISTS idx_client_portal_users_customer_id ON client_portal_users(customer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(message_status);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE inventory_items IS 'Enhanced inventory management with batch tracking, service inventory, and AI alerts';
COMMENT ON TABLE inventory_batches IS 'Batch-wise inventory tracking with expiry management';
COMMENT ON TABLE job_inventory_allocations IS 'Job/project-based inventory allocation and consumption tracking';
COMMENT ON TABLE inventory_alerts IS 'AI-powered low stock and expiry alerts';
COMMENT ON TABLE expenses IS 'Comprehensive expense management with OCR, mileage, and asset tracking';
COMMENT ON TABLE assets IS 'Fixed asset management with depreciation calculations';
COMMENT ON TABLE business_metrics IS 'Real-time business performance metrics and health scores';
COMMENT ON TABLE mis_reports IS 'Custom MIS report configurations';
COMMENT ON TABLE user_roles IS 'Role-based access control with granular permissions';
COMMENT ON TABLE branches IS 'Multi-branch business management';
COMMENT ON TABLE approval_workflows IS 'Maker-checker approval workflows';
COMMENT ON TABLE client_portal_users IS 'Client portal login and access management';
COMMENT ON TABLE invoice_disputes IS 'Client-initiated invoice dispute management';
COMMENT ON TABLE whatsapp_templates IS 'WhatsApp message templates for automation';
COMMENT ON TABLE payment_nudge_settings IS 'Automated payment reminder configurations';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
