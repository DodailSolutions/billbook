/**
 * Advanced Payment Types
 * TypeScript interfaces for UPI, installments, reconciliation, and analytics
 */

export interface UPIPaymentDetails {
  id: string
  user_id: string
  upi_id: string
  qr_code_url?: string
  qr_code_data?: string
  business_name?: string
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentInstallment {
  id: string
  invoice_id: string
  installment_number: number
  total_installments: number
  amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'waived'
  paid_amount: number
  paid_date?: string
  payment_method?: PaymentMethod
  payment_reference?: string
  late_fee: number
  notes?: string
  created_at: string
  updated_at: string
}

export type PaymentMethod = 
  | 'upi' 
  | 'card' 
  | 'netbanking' 
  | 'cash' 
  | 'cheque' 
  | 'whatsapp_pay'
  | 'bnpl'

export interface BankTransaction {
  id: string
  user_id: string
  transaction_id?: string
  transaction_date: string
  amount: number
  transaction_type: 'credit' | 'debit'
  description?: string
  reference_number?: string
  upi_id?: string
  bank_account?: string
  reconciled: boolean
  invoice_id?: string
  payment_id?: string
  auto_matched: boolean
  match_confidence?: number
  created_at: string
  updated_at: string
}

export interface FailedPayment {
  id: string
  invoice_id: string
  customer_id: string
  amount: number
  payment_method?: PaymentMethod
  failure_reason?: string
  failure_code?: string
  retry_count: number
  last_retry_at?: string
  next_retry_at?: string
  auto_retry_enabled: boolean
  recovered: boolean
  recovered_at?: string
  recovered_payment_id?: string
  created_at: string
  updated_at: string
}

export interface LateFeeConfig {
  id: string
  user_id: string
  grace_period_days: number
  fee_type: 'percentage' | 'fixed' | 'tiered'
  fee_value: number
  max_late_fee?: number
  compound_daily: boolean
  tiered_config?: TieredLateFee[]
  auto_apply: boolean
  notify_customer: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TieredLateFee {
  days: number
  fee: number
}

export interface BNPLApplication {
  id: string
  invoice_id: string
  customer_id: string
  provider: 'flexmoney' | 'zestmoney' | 'lazypay' | 'simpl' | 'custom'
  application_id?: string
  requested_amount: number
  approved_amount?: number
  tenure_months?: number
  interest_rate?: number
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted'
  approval_date?: string
  rejection_reason?: string
  provider_response?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PaymentFollowup {
  id: string
  invoice_id: string
  customer_id: string
  followup_type: 'whatsapp' | 'sms' | 'email' | 'call'
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'replied'
  scheduled_at: string
  sent_at?: string
  delivered_at?: string
  read_at?: string
  message_content?: string
  message_id?: string
  error_message?: string
  auto_generated: boolean
  reminder_number: number
  created_at: string
  updated_at: string
}

export interface PaymentBehaviorAnalytics {
  id: string
  customer_id: string
  user_id: string
  total_invoices: number
  total_paid_invoices: number
  total_overdue_invoices: number
  avg_payment_delay_days: number
  payment_reliability_score: number
  preferred_payment_method?: PaymentMethod
  total_amount_paid: number
  total_late_fees_paid: number
  failed_payment_count: number
  last_payment_date?: string
  payment_pattern: 'early_payer' | 'on_time' | 'occasional_late' | 'chronic_late' | 'defaulter'
  risk_category: 'low' | 'medium' | 'high'
  last_updated: string
  created_at: string
}

export interface WhatsAppPaymentLink {
  id: string
  invoice_id: string
  customer_id: string
  payment_link: string
  short_link?: string
  qr_code_url?: string
  whatsapp_number?: string
  sent_at?: string
  clicked_at?: string
  paid_at?: string
  expires_at?: string
  is_expired: boolean
  click_count: number
  created_at: string
}

export interface InstallmentPlan {
  frequency: 'weekly' | 'monthly' | 'quarterly'
  total_installments: number
  start_date: string
  installments: Array<{
    number: number
    amount: number
    due_date: string
  }>
}

export interface ReconciliationMatch {
  transaction_id: string
  invoice_id: string
  confidence: number
  matched_fields: string[]
  suggestions: string[]
}

export interface PaymentRecoveryAction {
  action_type: 'auto_retry' | 'manual_followup' | 'discount_offer' | 'installment_offer'
  scheduled_for: string
  details: Record<string, unknown>
}

export interface PaymentAnalyticsDashboard {
  total_collected: number
  pending_amount: number
  overdue_amount: number
  late_fees_collected: number
  average_payment_delay: number
  on_time_payment_rate: number
  failed_payment_rate: number
  top_paying_customers: Array<{
    customer_id: string
    customer_name: string
    total_paid: number
    reliability_score: number
  }>
  high_risk_customers: Array<{
    customer_id: string
    customer_name: string
    overdue_amount: number
    risk_category: string
  }>
}

export interface UPIIntent {
  pa: string // payee address (UPI ID)
  pn: string // payee name
  am: string // amount
  tr: string // transaction reference
  tn: string // transaction note
  cu: string // currency (INR)
}

export interface QRCodeOptions {
  size: number
  format: 'png' | 'svg' | 'jpeg'
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  includeMargin: boolean
}

export interface FollowupSchedule {
  invoice_id: string
  schedules: Array<{
    type: 'whatsapp' | 'sms' | 'email'
    days_after_due: number
    template: string
  }>
}

export interface PaymentRecoveryStats {
  total_failed: number
  recovered: number
  recovery_rate: number
  avg_recovery_time_days: number
  recovery_by_method: Record<PaymentMethod, number>
}
