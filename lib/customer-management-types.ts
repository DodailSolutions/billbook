/**
 * Customer Management Advanced Features - Type Definitions
 * Types for credit limits, aging, risk scores, vendors, GST summary, and document vault
 */

// =====================================================
// 1. CUSTOMER CREDIT LIMITS
// =====================================================

export interface CustomerCreditLimit {
  customer_id: string
  credit_limit: number
  credit_limit_enabled: boolean
  credit_used: number
  credit_available: number | null
  credit_utilization_percentage: number
  credit_limit_exceeded: boolean
  credit_limit_updated_at?: string
  credit_limit_updated_by?: string
}

export interface CreditLimitHistory {
  id: string
  customer_id: string
  user_id: string
  previous_limit: number | null
  new_limit: number
  reason?: string
  changed_by?: string
  created_at: string
}

export interface CreditLimitUpdate {
  customer_id: string
  new_limit: number
  reason?: string
}

// =====================================================
// 2. CUSTOMER AGING & RISK SCORE
// =====================================================

export interface CustomerAgingAnalysis {
  id: string
  customer_id: string
  user_id: string
  
  // Aging buckets
  current_amount: number          // 0-30 days
  days_30_amount: number          // 31-60 days
  days_60_amount: number          // 61-90 days
  days_90_amount: number          // 91-120 days
  days_120_plus_amount: number    // 120+ days
  total_outstanding: number
  
  // Invoice metrics
  total_invoices: number
  paid_on_time_count: number
  paid_late_count: number
  overdue_count: number
  
  // Payment metrics
  average_days_to_pay: number
  longest_overdue_days: number
  
  // Risk assessment
  risk_score: number              // 0-100, higher = riskier
  risk_category: RiskCategory
  payment_reliability_score: number  // 0-100, higher = better
  
  last_payment_date?: string
  last_calculated_at: string
  created_at: string
  updated_at: string
}

export type RiskCategory = 'low' | 'medium' | 'high' | 'critical'

export interface AgingBucket {
  label: string
  days_range: string
  amount: number
  percentage: number
  invoice_count: number
}

export interface CustomerRiskProfile {
  customer_id: string
  customer_name: string
  risk_score: number
  risk_category: RiskCategory
  reliability_score: number
  total_outstanding: number
  overdue_count: number
  average_delay_days: number
  recommendation: string
}

// =====================================================
// 3. VENDOR BILLS & PAYABLE TRACKING
// =====================================================

export interface Vendor {
  id: string
  user_id: string
  
  // Vendor details
  vendor_name: string
  vendor_code?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  
  // GST & Tax
  gstin?: string
  pan?: string
  tan?: string
  state_code?: string
  
  // Payment terms
  payment_terms?: string
  default_payment_days: number
  
  // Banking
  bank_name?: string
  bank_account_number?: string
  ifsc_code?: string
  bank_branch?: string
  
  // Status
  is_active: boolean
  vendor_category?: string
  
  notes?: string
  created_at: string
  updated_at: string
}

export interface VendorBill {
  id: string
  user_id: string
  vendor_id: string
  
  // Bill details
  bill_number: string
  bill_date: string
  due_date?: string
  
  // Amounts
  subtotal: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  tds_amount: number
  other_charges: number
  total_amount: number
  
  // Payment tracking
  paid_amount: number
  balance_amount: number
  
  // Status
  payment_status: PaymentStatus
  
  // GST details
  supply_type?: string
  reverse_charge_applicable: boolean
  
  // References
  purchase_order_number?: string
  grn_number?: string
  attachment_url?: string
  
  description?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue'

export interface VendorBillItem {
  id: string
  bill_id: string
  description: string
  hsn_sac_code?: string
  quantity: number
  unit: string
  unit_price: number
  amount: number
  gst_rate: number
  gst_amount: number
  created_at: string
}

export interface VendorPayment {
  id: string
  user_id: string
  vendor_id: string
  bill_id?: string
  
  payment_date: string
  amount: number
  payment_method?: string
  
  transaction_reference?: string
  cheque_number?: string
  bank_account?: string
  
  tds_deducted: number
  tds_percentage: number
  
  notes?: string
  created_at: string
}

export interface VendorBillWithDetails extends VendorBill {
  vendor: Vendor
  items: VendorBillItem[]
  payments: VendorPayment[]
}

export interface VendorPayablesSummary {
  vendor_id: string
  vendor_name: string
  total_bills: number
  total_bill_amount: number
  total_paid: number
  total_outstanding: number
  unpaid_count: number
  overdue_count: number
  overdue_amount: number
  next_due_date?: string
  earliest_due_date?: string
}

// =====================================================
// 4. CUSTOMER-WISE GST SUMMARY
// =====================================================

export interface CustomerGSTSummary {
  id: string
  customer_id: string
  user_id: string
  financial_year: string
  
  // Transaction summary
  total_invoices: number
  total_taxable_value: number
  
  // GST breakdown
  total_cgst: number
  total_sgst: number
  total_igst: number
  total_gst: number
  
  // Supply type breakdown
  intra_state_value: number
  inter_state_value: number
  
  // Reverse charge
  reverse_charge_invoices: number
  reverse_charge_value: number
  
  // HSN/SAC breakdown
  hsn_sac_breakdown: HSNSACBreakdown[]
  
  // Tax rate breakdown
  gst_rate_breakdown: GSTRateBreakdown[]
  
  last_updated: string
  created_at: string
}

export interface HSNSACBreakdown {
  hsn_sac_code: string
  invoice_count: number
  total_value: number
  total_gst: number
}

export interface GSTRateBreakdown {
  gst_rate: number
  invoice_count: number
  taxable_value: number
  gst_amount: number
}

export interface CustomerGSTReport {
  customer_id: string
  customer_name: string
  gstin?: string
  financial_year: string
  summary: CustomerGSTSummary
  monthly_breakdown: MonthlyGSTBreakdown[]
}

export interface MonthlyGSTBreakdown {
  month: string
  invoice_count: number
  taxable_value: number
  cgst: number
  sgst: number
  igst: number
  total_gst: number
}

// =====================================================
// 5. CUSTOMER DOCUMENT VAULT
// =====================================================

export interface CustomerDocument {
  id: string
  customer_id: string
  user_id: string
  
  // Document details
  document_type: DocumentType
  document_name: string
  file_url: string
  file_size_bytes?: number
  file_type?: string
  
  // Document metadata
  document_number?: string
  issue_date?: string
  expiry_date?: string
  is_verified: boolean
  verified_at?: string
  verified_by?: string
  
  // Status
  is_active: boolean
  is_expired: boolean
  
  // Version control
  version: number
  previous_version_id?: string
  
  // Access control
  is_confidential: boolean
  
  description?: string
  tags?: string[]
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export type DocumentType = 
  | 'contract'
  | 'pan'
  | 'gst_certificate'
  | 'agreement'
  | 'msme'
  | 'other'

export interface DocumentAccessLog {
  id: string
  document_id: string
  accessed_by: string
  access_type: AccessType
  ip_address?: string
  user_agent?: string
  accessed_at: string
}

export type AccessType = 'view' | 'download' | 'share' | 'delete'

export interface DocumentUpload {
  customer_id: string
  document_type: DocumentType
  document_name: string
  file: File
  document_number?: string
  issue_date?: string
  expiry_date?: string
  is_confidential?: boolean
  description?: string
  tags?: string[]
}

export interface DocumentFilter {
  document_type?: DocumentType
  is_active?: boolean
  is_expired?: boolean
  is_verified?: boolean
  search?: string
}

// =====================================================
// COMPREHENSIVE VIEWS
// =====================================================

export interface CustomerFinancialOverview {
  customer_id: string
  user_id: string
  customer_name: string
  email?: string
  gstin?: string
  
  // Credit limits
  credit_limit: number
  credit_limit_enabled: boolean
  credit_used: number
  credit_available: number | null
  credit_utilization_percentage: number
  credit_limit_exceeded: boolean
  
  // Aging data
  current_amount: number
  days_30_amount: number
  days_60_amount: number
  days_90_amount: number
  days_120_plus_amount: number
  total_outstanding: number
  risk_score: number
  risk_category: RiskCategory
  payment_reliability_score: number
  average_days_to_pay: number
  longest_overdue_days: number
  last_payment_date?: string
  
  // GST summary
  gst_invoice_count: number
  gst_taxable_value: number
  gst_total_tax: number
  
  // Document counts
  total_documents: number
  contract_count: number
  expired_documents: number
}

// =====================================================
// FORM DATA & API REQUESTS
// =====================================================

export interface CreateVendorData {
  vendor_name: string
  vendor_code?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  gstin?: string
  pan?: string
  payment_terms?: string
  default_payment_days?: number
  bank_name?: string
  bank_account_number?: string
  ifsc_code?: string
  vendor_category?: string
  notes?: string
}

export interface CreateVendorBillData {
  vendor_id: string
  bill_number: string
  bill_date: string
  due_date?: string
  items: VendorBillItemInput[]
  cgst_amount?: number
  sgst_amount?: number
  igst_amount?: number
  tds_amount?: number
  other_charges?: number
  supply_type?: string
  reverse_charge_applicable?: boolean
  purchase_order_number?: string
  grn_number?: string
  description?: string
  notes?: string
}

export interface VendorBillItemInput {
  description: string
  hsn_sac_code?: string
  quantity: number
  unit?: string
  unit_price: number
  gst_rate?: number
}

export interface RecordVendorPaymentData {
  vendor_id: string
  bill_id?: string
  payment_date: string
  amount: number
  payment_method?: string
  transaction_reference?: string
  cheque_number?: string
  bank_account?: string
  tds_deducted?: number
  tds_percentage?: number
  notes?: string
}

// =====================================================
// ANALYTICS & DASHBOARD
// =====================================================

export interface CreditLimitAnalytics {
  total_customers_with_limit: number
  total_credit_extended: number
  total_credit_used: number
  average_utilization: number
  exceeded_limit_count: number
  exceeded_limit_amount: number
  customers_near_limit: Array<{
    customer_name: string
    utilization_percentage: number
    available_credit: number
  }>
}

export interface AgingAnalytics {
  total_outstanding: number
  customers_with_outstanding: number
  aging_distribution: {
    current: number
    days_30: number
    days_60: number
    days_90: number
    days_120_plus: number
  }
  risk_distribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  top_risky_customers: CustomerRiskProfile[]
}

export interface VendorAnalytics {
  total_vendors: number
  active_vendors: number
  total_outstanding_payables: number
  overdue_bills_count: number
  overdue_amount: number
  upcoming_payments_7_days: number
  upcoming_payments_amount: number
  top_vendors_by_payable: Array<{
    vendor_name: string
    outstanding_amount: number
    overdue_amount: number
  }>
}

export interface DocumentAnalytics {
  total_documents: number
  documents_by_type: Record<DocumentType, number>
  expired_documents: number
  expiring_soon_count: number
  unverified_documents: number
  total_storage_bytes: number
}

// =====================================================
// 6. AI CREDIT RISK PREDICTION
// =====================================================

export interface CustomerCreditRiskPrediction {
  id: string
  customer_id: string
  user_id: string
  
  // AI Prediction scores (0-100)
  default_probability: number      // Probability of default
  credit_risk_score: number        // Overall credit risk
  
  // Risk assessment
  predicted_risk_level: RiskLevel
  prediction_confidence: number    // 0-100
  
  // Feature scores
  payment_history_score?: number
  transaction_frequency_score?: number
  average_ticket_size_score?: number
  payment_timing_score?: number
  outstanding_ratio_score?: number
  
  // Prediction metadata
  model_version: string
  prediction_date: string
  
  // Recommendations
  recommended_credit_limit?: number
  recommended_payment_terms?: number
  action_required: boolean
  action_type?: ActionType
  
  // Explanation
  key_risk_factors?: string[]
  positive_indicators?: string[]
  
  created_at: string
  updated_at: string
}

export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
export type ActionType = 'review' | 'reduce_limit' | 'increase_monitoring' | 'blacklist'

export interface CreditRiskPredictionHistory {
  id: string
  customer_id: string
  user_id: string
  default_probability: number
  credit_risk_score: number
  predicted_risk_level: RiskLevel
  prediction_confidence: number
  model_version: string
  prediction_date: string
  created_at: string
}

export interface RiskPredictionResult {
  prediction: CustomerCreditRiskPrediction
  trend: 'improving' | 'stable' | 'declining'
  recommendation: string
  alerts: string[]
}

// =====================================================
// 7. AUTO BLACKLIST CHRONIC DEFAULTERS
// =====================================================

export interface CustomerBlacklist {
  id: string
  customer_id: string
  user_id: string
  
  // Status
  is_blacklisted: boolean
  blacklist_type: BlacklistType
  
  // Reason
  reason: string
  reason_code?: ReasonCode
  
  // Metrics at blacklist time
  total_overdue_amount?: number
  overdue_invoice_count?: number
  longest_overdue_days?: number
  default_rate?: number
  
  // Auto-blacklist details
  auto_blacklist_criteria?: Record<string, string | number | boolean>
  
  // Dates
  blacklisted_at: string
  blacklisted_by?: string
  removed_at?: string
  removed_by?: string
  removal_reason?: string
  
  // Restrictions
  block_new_invoices: boolean
  block_credit_sales: boolean
  require_advance_payment: boolean
  
  // Review
  review_date?: string
  reviewed_at?: string
  review_notes?: string
  
  created_at: string
  updated_at: string
}

export type BlacklistType = 'auto' | 'manual' | 'temporary'
export type ReasonCode = 'chronic_default' | 'fraud' | 'legal_dispute' | 'payment_issues'

export interface BlacklistRule {
  id: string
  user_id: string
  
  // Rule identification
  rule_name: string
  rule_description?: string
  is_enabled: boolean
  
  // Trigger conditions
  min_overdue_amount?: number
  min_overdue_invoices?: number
  min_overdue_days?: number
  min_default_rate?: number
  consecutive_defaults_count?: number
  
  // Risk-based triggers
  min_risk_score?: number
  risk_level_trigger?: RiskLevel
  
  // Actions
  auto_blacklist: boolean
  send_warning: boolean
  notify_admin: boolean
  reduce_credit_limit: boolean
  new_credit_limit_percentage?: number
  
  // Review settings
  auto_review_after_days: number
  require_manual_approval: boolean
  
  created_at: string
  updated_at: string
}

export interface BlacklistActionLog {
  id: string
  customer_id: string
  user_id: string
  
  action_type: BlacklistActionType
  action_reason?: string
  
  triggered_by: 'auto' | 'manual' | 'system'
  rule_id?: string
  
  performed_by?: string
  performed_at: string
  
  previous_state?: Record<string, string | number | boolean | null>
  new_state?: Record<string, string | number | boolean | null>
  
  created_at: string
}

export type BlacklistActionType = 
  | 'blacklisted' 
  | 'removed' 
  | 'warning_sent' 
  | 'review_scheduled'
  | 'limit_reduced'

export interface CreateBlacklistRuleData {
  rule_name: string
  rule_description?: string
  min_overdue_amount?: number
  min_overdue_invoices?: number
  min_overdue_days?: number
  min_risk_score?: number
  auto_blacklist?: boolean
  send_warning?: boolean
  notify_admin?: boolean
}

export interface BlacklistCustomerData {
  customer_id: string
  reason: string
  reason_code: ReasonCode
  blacklist_type: BlacklistType
  block_new_invoices?: boolean
  block_credit_sales?: boolean
  require_advance_payment?: boolean
  review_date?: string
}

// =====================================================
// 8. CUSTOMER WHATSAPP CHAT HISTORY
// =====================================================

export interface WhatsAppConversation {
  id: string
  customer_id: string
  user_id: string
  
  // WhatsApp details
  whatsapp_number: string
  whatsapp_name?: string
  
  // Conversation metadata
  conversation_status: ConversationStatus
  last_message_at?: string
  last_message_from?: 'customer' | 'business'
  
  // Counts
  total_messages: number
  unread_messages: number
  
  // Context
  conversation_context?: ConversationContext
  related_invoice_id?: string
  
  // Tags
  tags?: string[]
  
  // Flags
  is_pinned: boolean
  is_important: boolean
  requires_action: boolean
  
  created_at: string
  updated_at: string
}

export type ConversationStatus = 'active' | 'archived' | 'blocked'
export type ConversationContext = 
  | 'payment_reminder' 
  | 'invoice_query' 
  | 'support' 
  | 'general'

export interface WhatsAppMessage {
  id: string
  conversation_id: string
  customer_id: string
  user_id: string
  
  // Message details
  message_type: MessageType
  message_direction: 'inbound' | 'outbound'
  
  // Content
  message_text?: string
  media_url?: string
  media_type?: string
  media_size_bytes?: number
  
  // WhatsApp metadata
  whatsapp_message_id?: string
  whatsapp_timestamp?: string
  
  // Status
  message_status?: MessageStatus
  delivery_status_updated_at?: string
  
  // Context
  related_invoice_id?: string
  related_payment_id?: string
  context_type?: string
  
  // AI Analysis
  sentiment?: Sentiment
  contains_payment_intent: boolean
  contains_complaint: boolean
  requires_human_response: boolean
  
  // Response tracking
  is_automated_response: boolean
  response_template_id?: string
  responded_to_message_id?: string
  
  // User interaction
  is_read: boolean
  read_at?: string
  read_by?: string
  
  internal_notes?: string
  
  created_at: string
  updated_at: string
}

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'document' 
  | 'audio' 
  | 'video' 
  | 'location' 
  | 'template'

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'urgent'

export interface WhatsAppMessageTemplate {
  id: string
  user_id: string
  
  template_name: string
  template_category: TemplateCategory
  
  template_text: string
  template_variables?: string[]
  
  whatsapp_template_id?: string
  template_language: string
  
  is_active: boolean
  usage_count: number
  last_used_at?: string
  
  description?: string
  tags?: string[]
  
  created_at: string
  updated_at: string
}

export type TemplateCategory = 
  | 'payment_reminder' 
  | 'invoice_notification' 
  | 'follow_up' 
  | 'greeting'

export interface WhatsAppQuickReply {
  id: string
  user_id: string
  shortcut: string
  reply_text: string
  category?: string
  usage_count: number
  created_at: string
}

export interface SendWhatsAppMessageData {
  customer_id: string
  conversation_id?: string
  message_text?: string
  message_type?: MessageType
  template_id?: string
  template_variables?: Record<string, string>
  related_invoice_id?: string
  media_url?: string
}

export interface WhatsAppConversationSummary {
  conversation_id: string
  customer_id: string
  customer_name: string
  whatsapp_number: string
  conversation_status: ConversationStatus
  last_message_at?: string
  total_messages: number
  unread_messages: number
  requires_action: boolean
  is_important: boolean
  last_message_preview?: string
  related_invoice_number?: string
  related_invoice_amount?: number
}

export interface WhatsAppAnalytics {
  total_conversations: number
  active_conversations: number
  unread_count: number
  messages_today: number
  messages_this_week: number
  avg_response_time_minutes: number
  payment_intent_messages: number
  complaints_count: number
  conversations_by_context: Record<ConversationContext, number>
  sentiment_distribution: Record<Sentiment, number>
}

// =====================================================
// COMPREHENSIVE DASHBOARD WITH NEW FEATURES
// =====================================================

export interface HighRiskCustomer {
  customer_id: string
  user_id: string
  customer_name: string
  email?: string
  phone?: string
  
  // Credit info
  credit_limit?: number
  credit_used?: number
  credit_limit_exceeded?: boolean
  
  // Risk scores
  aging_risk_score?: number
  aging_risk_category?: RiskCategory
  ai_risk_score?: number
  ai_risk_level?: RiskLevel
  default_probability?: number
  
  // Blacklist status
  is_blacklisted?: boolean
  blacklist_type?: BlacklistType
  blacklisted_at?: string
  
  // Outstanding
  total_outstanding?: number
  overdue_count?: number
  longest_overdue_days?: number
}

export interface ComprehensiveDashboard {
  // Existing analytics
  credit_analytics: CreditLimitAnalytics
  aging_analytics: AgingAnalytics
  vendor_analytics: VendorAnalytics
  document_analytics: DocumentAnalytics
  
  // New analytics
  risk_predictions: {
    total_predictions: number
    high_risk_count: number
    very_high_risk_count: number
    avg_default_probability: number
    customers_requiring_action: number
  }
  
  blacklist_summary: {
    total_blacklisted: number
    auto_blacklisted: number
    pending_review: number
    removed_this_month: number
  }
  
  whatsapp_analytics: WhatsAppAnalytics
  
  high_risk_customers: HighRiskCustomer[]
}

