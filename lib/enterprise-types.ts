/**
 * Enterprise Features - TypeScript Type Definitions
 * Types for inventory, expenses, dashboards, access control, client portal, and WhatsApp automation
 */

// =====================================================
// INVENTORY+ MODULE TYPES
// =====================================================

export type ItemType = 'product' | 'service' | 'raw_material'
export type ServiceType = 'hours' | 'retainers' | 'subscriptions'
export type BillingCycle = 'hourly' | 'monthly' | 'quarterly' | 'annual'
export type BatchStatus = 'active' | 'expired' | 'recalled' | 'depleted'
export type AllocationStatus = 'allocated' | 'partially_consumed' | 'fully_consumed' | 'returned' | 'cancelled'
export type AlertType = 'low_stock' | 'expiry_warning' | 'expired' | 'reorder_point' | 'overstock' | 'negative_stock'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed'

export interface InventoryItem {
  id: string
  user_id: string
  
  // Basic Info
  item_code: string
  item_name: string
  item_type: ItemType
  category?: string
  subcategory?: string
  
  // Product Details
  unit_of_measurement: string
  hsn_sac_code?: string
  description?: string
  
  // Service Inventory
  service_type?: ServiceType
  billing_cycle?: BillingCycle
  default_rate?: number
  
  // Pricing
  purchase_price?: number
  selling_price?: number
  minimum_selling_price?: number
  
  // Stock
  current_stock: number
  reorder_level?: number
  reorder_quantity?: number
  minimum_stock_level?: number
  maximum_stock_level?: number
  
  // Location
  warehouse_location?: string
  bin_location?: string
  
  // Tracking
  enable_batch_tracking: boolean
  enable_expiry_tracking: boolean
  enable_serial_tracking: boolean
  
  // Alerts
  enable_low_stock_alerts: boolean
  alert_threshold_percentage: number
  alert_recipients?: string[]
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryBatch {
  id: string
  user_id: string
  inventory_item_id: string
  
  batch_number: string
  manufacturing_date?: string
  expiry_date?: string
  
  opening_stock: number
  current_stock: number
  reserved_stock: number
  available_stock: number
  
  purchase_price_per_unit?: number
  total_purchase_value?: number
  
  warehouse_location?: string
  batch_status: BatchStatus
  
  created_at: string
  updated_at: string
}

export interface JobInventoryAllocation {
  id: string
  user_id: string
  
  job_code: string
  job_name: string
  job_type?: string
  customer_id?: string
  
  inventory_item_id: string
  batch_id?: string
  
  allocated_quantity: number
  consumed_quantity: number
  returned_quantity: number
  
  allocation_date: string
  expected_consumption_date?: string
  actual_consumption_date?: string
  
  unit_cost?: number
  total_cost?: number
  
  allocation_status: AllocationStatus
  notes?: string
  
  allocated_by?: string
  created_at: string
  updated_at: string
}

export interface InventoryAlert {
  id: string
  user_id: string
  inventory_item_id: string
  
  alert_type: AlertType
  severity: AlertSeverity
  
  current_stock?: number
  threshold_stock?: number
  batch_id?: string
  expiry_date?: string
  days_to_expiry?: number
  
  ai_recommendation?: string
  recommended_reorder_quantity?: number
  predicted_stockout_date?: string
  
  alert_status: AlertStatus
  
  acknowledged_at?: string
  acknowledged_by?: string
  resolved_at?: string
  resolution_notes?: string
  
  created_at: string
  updated_at: string
}

// =====================================================
// EXPENSE MANAGEMENT TYPES
// =====================================================

export type ExpenseType = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'mileage' | 'asset_purchase'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type ReimbursementStatus = 'pending' | 'approved' | 'paid' | 'rejected'
export type DepreciationMethod = 'straight_line' | 'declining_balance' | 'units_of_production'
export type AssetStatus = 'active' | 'under_maintenance' | 'disposed' | 'sold' | 'written_off'

export interface ExpenseCategory {
  id: string
  user_id: string
  
  category_name: string
  parent_category_id?: string
  category_type?: 'operational' | 'capital' | 'staff' | 'travel' | 'other'
  
  expense_account_code?: string
  is_tax_deductible: boolean
  
  requires_approval: boolean
  approval_limit?: number
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  
  expense_number: string
  expense_date: string
  
  expense_category_id: string
  expense_type: ExpenseType
  
  vendor_id?: string
  payee_name?: string
  
  amount: number
  tax_amount: number
  total_amount: number
  currency: string
  
  payment_method?: string
  payment_reference?: string
  payment_date?: string
  
  // OCR
  scanned_from_image: boolean
  ocr_confidence_score?: number
  original_image_url?: string
  extracted_data?: Record<string, unknown>
  
  // Mileage
  mileage_km?: number
  mileage_rate_per_km?: number
  start_location?: string
  end_location?: string
  vehicle_number?: string
  
  // Asset
  asset_id?: string
  is_capitalizable: boolean
  depreciation_period_months?: number
  
  // Allocation
  allocated_to_job_id?: string
  allocated_to_project?: string
  cost_center?: string
  
  // Approval
  requires_approval: boolean
  approval_status: ApprovalStatus
  submitted_by?: string
  submitted_at?: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  
  // Reimbursement
  is_reimbursable: boolean
  reimbursement_status?: ReimbursementStatus
  reimbursed_amount?: number
  reimbursed_on?: string
  
  receipt_urls?: string[]
  description?: string
  notes?: string
  
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  user_id: string
  
  asset_code: string
  asset_name: string
  asset_category: string
  
  purchase_date: string
  purchase_value: number
  vendor_id?: string
  invoice_number?: string
  
  depreciation_method: DepreciationMethod
  useful_life_years: number
  useful_life_months: number
  salvage_value: number
  
  depreciation_rate?: number
  annual_depreciation?: number
  accumulated_depreciation: number
  current_book_value?: number
  
  location?: string
  assigned_to?: string
  
  asset_status: AssetStatus
  
  disposal_date?: string
  disposal_value?: number
  disposal_method?: string
  
  last_maintenance_date?: string
  next_maintenance_date?: string
  
  created_at: string
  updated_at: string
}

export interface AssetDepreciationLog {
  id: string
  asset_id: string
  user_id: string
  
  depreciation_period: string
  financial_year: string
  
  opening_book_value: number
  depreciation_amount: number
  accumulated_depreciation: number
  closing_book_value: number
  
  calculation_method?: string
  calculation_details?: Record<string, unknown>
  
  is_posted: boolean
  posted_at?: string
  
  created_at: string
}

// =====================================================
// DASHBOARD & REPORTING TYPES
// =====================================================

export type ReportType = 'cash_flow' | 'profitability' | 'gst_analysis' | 'collection_efficiency' | 'expense_analysis' | 'inventory_analysis' | 'custom'
export type ExportFormat = 'excel' | 'pdf' | 'csv'
export type MetricPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface MISReport {
  id: string
  user_id: string
  
  report_name: string
  report_type: ReportType
  
  report_config: Record<string, unknown>
  
  default_date_range?: string
  default_grouping?: string
  group_by_dimensions?: string[]
  
  is_scheduled: boolean
  schedule_frequency?: string
  schedule_time?: string
  schedule_recipients?: string[]
  
  default_export_format: ExportFormat
  enable_ai_insights: boolean
  
  is_public: boolean
  shared_with?: string[]
  
  created_at: string
  updated_at: string
}

export interface BusinessMetrics {
  id: string
  user_id: string
  
  metric_date: string
  metric_period: MetricPeriod
  
  // Cash Flow
  opening_cash_balance?: number
  cash_inflow?: number
  cash_outflow?: number
  closing_cash_balance?: number
  
  // Receivables
  total_outstanding_receivables?: number
  overdue_receivables?: number
  current_receivables?: number
  average_collection_days?: number
  
  // GST
  total_gst_collected?: number
  total_gst_paid?: number
  gst_liability?: number
  itc_available?: number
  net_gst_payable?: number
  
  // Collection Efficiency
  invoices_raised_value?: number
  payments_received_value?: number
  collection_efficiency_percentage?: number
  
  // Profitability
  total_revenue?: number
  total_expenses?: number
  gross_profit?: number
  gross_profit_margin?: number
  net_profit?: number
  net_profit_margin?: number
  
  // Health Scores
  business_health_score?: number
  liquidity_score?: number
  profitability_score?: number
  efficiency_score?: number
  growth_score?: number
  
  // AI Insights
  ai_insights?: Array<{
    insight: string
    category: string
    priority: string
  }>
  risk_factors?: string[]
  opportunities?: string[]
  recommendations?: string[]
  
  created_at: string
}

export interface CashFlowRealtime {
  user_id: string
  report_date: string
  total_revenue: number
  pending_revenue: number
  overdue_revenue: number
  today_expenses?: number
  monthly_expenses?: number
}

export interface CollectionEfficiency {
  user_id: string
  total_invoices: number
  total_invoiced: number
  total_collected: number
  collection_efficiency_percentage: number
  avg_collection_days: number
}

// =====================================================
// ACCESS CONTROL & SECURITY TYPES
// =====================================================

export type RoleType = 'super_admin' | 'admin' | 'accounts' | 'sales' | 'inventory' | 'viewer' | 'custom'
export type ActionStatus = 'success' | 'failed' | 'partial'

export interface UserRole {
  id: string
  user_id: string
  
  role_name: string
  role_type: RoleType
  
  permissions: Record<string, unknown>
  
  can_access_invoices: boolean
  can_access_expenses: boolean
  can_access_inventory: boolean
  can_access_reports: boolean
  can_access_settings: boolean
  can_access_users: boolean
  
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_approve: boolean
  can_export: boolean
  
  branch_ids?: string[]
  all_branches: boolean
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  user_id: string
  
  branch_code: string
  branch_name: string
  
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  pincode?: string
  country: string
  
  gstin?: string
  
  phone?: string
  email?: string
  
  branch_manager_id?: string
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IPAccessRule {
  id: string
  user_id: string
  
  rule_name: string
  rule_type: 'allow' | 'deny'
  
  ip_address?: string
  ip_range_start?: string
  ip_range_end?: string
  cidr_notation?: string
  
  applies_to: 'all' | 'specific_users' | 'specific_roles'
  user_ids?: string[]
  role_ids?: string[]
  
  active_from?: string
  active_to?: string
  active_days?: number[]
  
  priority: number
  is_active: boolean
  
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  
  performed_by?: string
  performed_by_name?: string
  performed_by_email?: string
  performed_by_role?: string
  
  action_type: string
  entity_type: string
  entity_id?: string
  entity_name?: string
  
  action_description?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  changes_summary?: string
  
  module_name?: string
  feature_name?: string
  
  ip_address?: string
  user_agent?: string
  request_method?: string
  request_url?: string
  
  country?: string
  city?: string
  
  action_status: ActionStatus
  error_message?: string
  
  metadata?: Record<string, unknown>
  
  created_at: string
}

export interface ApprovalWorkflow {
  id: string
  user_id: string
  
  workflow_name: string
  entity_type: string
  
  trigger_conditions: Record<string, unknown>
  approval_levels: Array<{
    level: number
    approvers: string[]
    require_all: boolean
  }>
  
  require_all_approvers: boolean
  require_sequential_approval: boolean
  
  enable_escalation: boolean
  escalation_hours: number
  escalate_to?: string[]
  
  notify_maker: boolean
  notify_checker: boolean
  notification_emails?: string[]
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApprovalRequest {
  id: string
  user_id: string
  workflow_id: string
  
  entity_type: string
  entity_id: string
  entity_data?: Record<string, unknown>
  
  requested_by: string
  requested_at: string
  request_reason?: string
  
  approval_status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'escalated'
  current_level: number
  
  approval_history?: Array<{
    level: number
    approver: string
    action: string
    timestamp: string
    comments?: string
  }>
  
  final_approver?: string
  final_action_at?: string
  final_comments?: string
  
  is_escalated: boolean
  escalated_at?: string
  escalated_to?: string
  
  created_at: string
  updated_at: string
}

// =====================================================
// CLIENT PORTAL TYPES
// =====================================================

export type VerificationStatus = 'pending' | 'verified' | 'suspended'
export type InvoiceApprovalStatus = 'pending' | 'approved' | 'rejected' | 'disputed'
export type DisputeType = 'amount_mismatch' | 'quality_issue' | 'delivery_issue' | 'pricing_error' | 'duplicate_invoice' | 'service_not_rendered' | 'other'
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated'
export type DisputePriority = 'low' | 'medium' | 'high' | 'critical'
export type ChatStatus = 'open' | 'in_progress' | 'waiting_on_client' | 'waiting_on_business' | 'resolved' | 'closed'
export type ChatPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ClientPortalUser {
  id: string
  user_id: string
  customer_id: string
  
  client_email: string
  client_phone?: string
  password_hash?: string
  
  portal_access_enabled: boolean
  first_login_at?: string
  last_login_at?: string
  login_count: number
  
  can_view_invoices: boolean
  can_approve_invoices: boolean
  can_raise_disputes: boolean
  can_make_payments: boolean
  can_download_statements: boolean
  can_view_payment_history: boolean
  can_chat_support: boolean
  
  receive_email_notifications: boolean
  receive_sms_notifications: boolean
  receive_whatsapp_notifications: boolean
  
  verification_status: VerificationStatus
  verification_token?: string
  verified_at?: string
  
  created_at: string
  updated_at: string
}

export interface ClientInvoiceApproval {
  id: string
  user_id: string
  invoice_id: string
  client_portal_user_id: string
  
  approval_status: InvoiceApprovalStatus
  
  approved_by_name?: string
  approved_at?: string
  approval_comments?: string
  
  rejected_at?: string
  rejection_reason?: string
  
  is_disputed: boolean
  disputed_at?: string
  dispute_details?: string
  
  created_at: string
  updated_at: string
}

export interface InvoiceDispute {
  id: string
  user_id: string
  invoice_id: string
  client_portal_user_id: string
  
  dispute_type: DisputeType
  dispute_description: string
  disputed_amount?: number
  
  supporting_documents?: string[]
  
  dispute_status: DisputeStatus
  priority: DisputePriority
  
  assigned_to?: string
  resolution_notes?: string
  resolved_at?: string
  resolution_type?: string
  
  credit_note_issued: boolean
  credit_note_id?: string
  credit_amount?: number
  
  internal_notes?: string
  client_communication?: Array<{
    from: string
    message: string
    timestamp: string
  }>
  
  created_at: string
  updated_at: string
}

export interface ClientSupportChat {
  id: string
  user_id: string
  client_portal_user_id: string
  
  ticket_number: string
  subject: string
  category?: string
  
  chat_status: ChatStatus
  priority: ChatPriority
  
  assigned_to?: string
  assigned_at?: string
  
  messages?: Array<{
    sender: string
    sender_type: 'client' | 'business'
    message: string
    timestamp: string
    attachments?: string[]
  }>
  
  resolved_at?: string
  resolution_summary?: string
  client_satisfaction_rating?: number
  
  created_at: string
  updated_at: string
}

// =====================================================
// WHATSAPP AUTOMATION TYPES
// =====================================================

export type WhatsAppTemplateType = 'payment_reminder' | 'payment_received' | 'invoice_sent' | 'order_confirmation' | 'delivery_update' | 'custom'
export type MediaType = 'image' | 'pdf' | 'video'
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface WhatsAppTemplate {
  id: string
  user_id: string
  
  template_name: string
  template_type: WhatsAppTemplateType
  
  template_message: string
  variables?: string[]
  
  include_media: boolean
  media_type?: MediaType
  media_url?: string
  
  include_business_logo: boolean
  include_business_name: boolean
  include_contact_details: boolean
  
  trigger_type?: string
  trigger_conditions?: Record<string, unknown>
  
  wa_template_id?: string
  wa_template_status?: string
  
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WhatsAppMessage {
  id: string
  user_id: string
  
  customer_id?: string
  recipient_phone: string
  recipient_name?: string
  
  template_id?: string
  message_type: string
  message_content: string
  
  media_urls?: string[]
  
  entity_type?: string
  entity_id?: string
  
  message_status: MessageStatus
  
  sent_at?: string
  delivered_at?: string
  read_at?: string
  failed_at?: string
  failure_reason?: string
  
  wa_message_id?: string
  wa_conversation_id?: string
  
  message_cost?: number
  
  created_at: string
}

export interface PaymentNudgeSettings {
  id: string
  user_id: string
  
  enable_payment_nudges: boolean
  
  nudge_before_days: number[]
  nudge_after_days: number[]
  
  enable_escalation: boolean
  escalation_after_days: number
  escalation_message_template?: string
  
  nudge_time: string
  
  max_nudges_per_invoice: number
  min_hours_between_nudges: number
  
  send_via_whatsapp: boolean
  send_via_sms: boolean
  send_via_email: boolean
  
  include_payment_link: boolean
  include_invoice_pdf: boolean
  use_friendly_tone: boolean
  
  created_at: string
  updated_at: string
}

// =====================================================
// FILTER & REQUEST TYPES
// =====================================================

export interface InventoryItemFilters {
  item_type?: ItemType
  category?: string
  is_active?: boolean
  enable_low_stock_alerts?: boolean
  search?: string
}

export interface ExpenseFilters {
  expense_type?: ExpenseType
  expense_category_id?: string
  approval_status?: ApprovalStatus
  from_date?: string
  to_date?: string
  is_reimbursable?: boolean
  search?: string
}

export interface AssetFilters {
  asset_status?: AssetStatus
  asset_category?: string
  assigned_to?: string
  search?: string
}

export interface AlertFilters {
  alert_type?: AlertType
  severity?: AlertSeverity
  alert_status?: AlertStatus
}

export interface ActivityLogFilters {
  action_type?: string
  entity_type?: string
  performed_by?: string
  from_date?: string
  to_date?: string
}

export interface DisputeFilters {
  dispute_status?: DisputeStatus
  priority?: DisputePriority
  dispute_type?: DisputeType
  assigned_to?: string
}

export interface WhatsAppMessageFilters {
  message_status?: MessageStatus
  message_type?: string
  customer_id?: string
  from_date?: string
  to_date?: string
}

// =====================================================
// DASHBOARD AGGREGATES
// =====================================================

export interface InventoryDashboard {
  total_items: number
  total_stock_value: number
  low_stock_items: number
  expiring_soon_batches: number
  active_alerts: number
  service_items: number
  product_items: number
}

export interface ExpenseDashboard {
  total_expenses: number
  pending_approvals: number
  pending_reimbursements: number
  monthly_expense_trend: Array<{
    month: string
    amount: number
  }>
  category_wise_expenses: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export interface ClientPortalDashboard {
  total_clients: number
  active_clients: number
  pending_approvals: number
  open_disputes: number
  open_support_tickets: number
  client_satisfaction_avg: number
}

export interface WhatsAppDashboard {
  total_messages_sent: number
  delivery_rate: number
  read_rate: number
  failed_messages: number
  cost_this_month: number
  template_performance: Array<{
    template_name: string
    sent: number
    delivered: number
    read: number
  }>
}

// =====================================================
// CREATE/UPDATE REQUEST TYPES
// =====================================================

export interface CreateInventoryItemRequest {
  item_code: string
  item_name: string
  item_type: ItemType
  unit_of_measurement: string
  current_stock?: number
  reorder_level?: number
  selling_price?: number
  enable_batch_tracking?: boolean
  enable_expiry_tracking?: boolean
  [key: string]: unknown
}

export interface CreateExpenseRequest {
  expense_number: string
  expense_date: string
  expense_category_id: string
  expense_type: ExpenseType
  amount: number
  tax_amount?: number
  total_amount: number
  requires_approval?: boolean
  [key: string]: unknown
}

export interface CreateAssetRequest {
  asset_code: string
  asset_name: string
  asset_category: string
  purchase_date: string
  purchase_value: number
  depreciation_method: DepreciationMethod
  useful_life_years: number
  salvage_value?: number
  [key: string]: unknown
}

export interface CreateClientPortalUserRequest {
  customer_id: string
  client_email: string
  client_phone?: string
  can_approve_invoices?: boolean
  can_raise_disputes?: boolean
  [key: string]: unknown
}

export interface CreateDisputeRequest {
  invoice_id: string
  client_portal_user_id: string
  dispute_type: DisputeType
  dispute_description: string
  disputed_amount?: number
  supporting_documents?: string[]
  priority?: DisputePriority
}

export interface CreateWhatsAppTemplateRequest {
  template_name: string
  template_type: WhatsAppTemplateType
  template_message: string
  variables?: string[]
  include_media?: boolean
  media_url?: string
  [key: string]: unknown
}

export interface SendWhatsAppMessageRequest {
  customer_id?: string
  recipient_phone: string
  template_id?: string
  message_content: string
  entity_type?: string
  entity_id?: string
  media_urls?: string[]
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}
