/**
 * GST Advanced Features & CA Collaboration - TypeScript Types
 * 
 * Features:
 * 1. GSTR-1 auto-prep
 * 2. GSTR-3B summary dashboard
 * 3. E-Invoice auto-generation (IRN)
 * 4. E-Way bill creation
 * 5. GST mismatch alerts
 * 6-7. CA collaboration mode
 * 8. Audit trail with timestamp & IP
 * 9. GST health score
 */

// =====================================================
// 1. GSTR-1 TYPES
// =====================================================

export interface GSTR1Record {
  id: string
  user_id: string
  tax_period: string  // MMYYYY
  financial_year: string
  
  // B2B Data
  b2b_invoices: B2BInvoice[]
  b2b_invoice_count: number
  b2b_taxable_value: number
  b2b_total_tax: number
  
  // B2CL Data (Large B2C invoices)
  b2cl_invoices: B2CLInvoice[]
  b2cl_invoice_count: number
  b2cl_taxable_value: number
  b2cl_total_tax: number
  
  // B2CS Data (Small B2C consolidated)
  b2cs_summary: B2CSSummary[]
  b2cs_taxable_value: number
  b2cs_total_tax: number
  
  // Exports
  export_invoices: ExportInvoice[]
  export_count: number
  export_value: number
  
  // Credit/Debit Notes
  credit_debit_notes: CreditDebitNote[]
  cdn_count: number
  cdn_value: number
  
  // HSN Summary
  hsn_summary: HSNSummary[]
  
  // Documents issued
  documents_issued: DocumentIssued[]
  
  // Amendments
  amendments: Amendment[]
  
  // Status
  preparation_status: 'draft' | 'ready' | 'filed' | 'accepted'
  auto_generated: boolean
  last_calculated_at: string
  
  // Filing
  filed_at?: string
  filing_reference_number?: string
  arn?: string  // Application Reference Number
  
  created_at: string
  updated_at: string
}

export interface B2BInvoice {
  invoice_number: string
  invoice_date: string
  customer_gstin: string
  customer_name: string
  taxable_value: number
  cgst: number
  sgst: number
  igst: number
  total_tax: number
  supply_type: 'intra-state' | 'inter-state'
  reverse_charge: boolean
  place_of_supply?: string
}

export interface B2CLInvoice {
  invoice_number: string
  invoice_date: string
  place_of_supply: string
  taxable_value: number
  tax_rate: number
  igst: number
}

export interface B2CSSummary {
  type: 'OE' | 'E'  // Other than Exports, Exports
  place_of_supply: string
  tax_rate: number
  taxable_value: number
  cgst: number
  sgst: number
  igst: number
}

export interface ExportInvoice {
  invoice_number: string
  invoice_date: string
  export_type: 'WPAY' | 'WOPAY'  // With Payment, Without Payment
  shipping_bill_number?: string
  shipping_bill_date?: string
  port_code?: string
  taxable_value: number
  igst: number
}

export interface CreditDebitNote {
  note_number: string
  note_date: string
  note_type: 'C' | 'D'  // Credit or Debit
  original_invoice_number: string
  original_invoice_date: string
  customer_gstin?: string
  taxable_value: number
  tax_amount: number
  reason: string
}

export interface HSNSummary {
  hsn_code: string
  description: string
  uqc: string  // Unit of Quantity
  total_quantity: number
  total_value: number
  taxable_value: number
  igst: number
  cgst: number
  sgst: number
}

export interface DocumentIssued {
  document_type: string
  serial_from: string
  serial_to: string
  total_number: number
  cancelled: number
}

export interface Amendment {
  original_invoice_number: string
  original_invoice_date: string
  revised_value: number
  revision_date: string
  reason: string
}

// =====================================================
// 2. GSTR-3B TYPES
// =====================================================

export interface GSTR3BRecord {
  id: string
  user_id: string
  tax_period: string
  financial_year: string
  return_period_from: string
  return_period_to: string
  
  // 3.1 Outward & Inward supplies
  outward_taxable_supplies: number
  outward_tax_amount: number
  inward_reverse_charge_supplies: number
  inward_reverse_charge_tax: number
  
  // 3.2 Inter-state supplies
  inter_state_supplies: InterStateSupply[]
  inter_state_total: number
  
  // 4 Eligible ITC
  itc_available: ITCDetails
  itc_igst: number
  itc_cgst: number
  itc_sgst: number
  itc_cess: number
  
  // 5 Exempt supplies
  exempt_supplies: number
  nil_rated_supplies: number
  non_gst_supplies: number
  
  // 6.1 Tax payable
  tax_payable_igst: number
  tax_payable_cgst: number
  tax_payable_sgst: number
  tax_payable_cess: number
  total_tax_liability: number
  
  // Interest & Late fees
  interest_igst: number
  interest_cgst: number
  interest_sgst: number
  late_fee: number
  
  // Status
  preparation_status: 'draft' | 'ready' | 'filed' | 'accepted'
  auto_generated: boolean
  last_calculated_at: string
  
  // Filing
  filed_at?: string
  filing_reference_number?: string
  arn?: string
  
  created_at: string
  updated_at: string
}

export interface InterStateSupply {
  place_of_supply: string
  taxable_value: number
  igst: number
}

export interface ITCDetails {
  imports: { igst: number; cgst: number; sgst: number; cess: number }
  inputs: { igst: number; cgst: number; sgst: number; cess: number }
  capital_goods: { igst: number; cgst: number; sgst: number; cess: number }
  input_services: { igst: number; cgst: number; sgst: number; cess: number }
  ineligible: { igst: number; cgst: number; sgst: number; cess: number }
}

// =====================================================
// 3. E-INVOICE (IRN) TYPES
// =====================================================

export interface EInvoiceRecord {
  id: string
  user_id: string
  invoice_id: string
  
  // IRN Details
  irn: string  // 64 character unique identifier
  acknowledgement_number: string
  acknowledgement_date: string
  
  // Signed data
  signed_invoice: string  // Base64 encoded
  signed_qr_code: string  // QR code data
  
  // IRP Response
  irp_response: IRPResponse
  irp_status: 'pending' | 'generated' | 'cancelled' | 'failed'
  
  // E-Way Bill integration
  eway_bill_number?: string
  eway_bill_date?: string
  eway_bill_valid_until?: string
  
  // Generation
  generated_at: string
  generated_by: string
  
  // Cancellation
  cancelled_at?: string
  cancellation_reason?: string
  cancellation_remarks?: string
  
  // Errors
  error_code?: string
  error_message?: string
  retry_count: number
  
  created_at: string
  updated_at: string
}

export interface IRPResponse {
  Status: string
  AckNo: string
  AckDt: string
  Irn: string
  SignedInvoice: string
  SignedQRCode: string
  EwbNo?: string
  EwbDt?: string
  EwbValidTill?: string
  Remarks?: string
  ErrorDetails?: IRPError[]
}

export interface IRPError {
  ErrorCode: string
  ErrorMessage: string
  ErrorSource?: string
}

export interface GenerateEInvoiceData {
  invoice_id: string
  generate_eway_bill?: boolean
  distance_km?: number
  transporter_id?: string
  vehicle_number?: string
  transport_mode?: TransportMode
}

// =====================================================
// 4. E-WAY BILL TYPES
// =====================================================

export interface EWayBill {
  id: string
  user_id: string
  invoice_id?: string
  einvoice_id?: string
  
  // E-Way Bill Number
  eway_bill_number: string
  eway_bill_date: string
  
  // Validity
  valid_from: string
  valid_until: string
  approximate_distance_km: number
  
  // Document
  document_type: string
  document_number: string
  document_date: string
  
  // Parties
  supplier_gstin: string
  recipient_gstin?: string
  recipient_name: string
  recipient_address: string
  recipient_state_code: string
  recipient_pincode: string
  
  // Transaction
  transaction_type: TransactionType
  supply_type: 'outward' | 'inward'
  sub_supply_type?: string
  
  // Goods
  goods_value: number
  hsn_code: string
  goods_description: string
  quantity: number
  unit: string
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  cess_amount: number
  total_invoice_value: number
  
  // Transportation
  transporter_id?: string
  transporter_name?: string
  transport_mode: TransportMode
  transport_document_number?: string
  transport_document_date?: string
  vehicle_number?: string
  vehicle_type?: 'regular' | 'over_dimensional'
  
  // Status
  status: 'active' | 'cancelled' | 'expired' | 'extended'
  
  // Cancellation
  cancelled_at?: string
  cancellation_reason?: string
  cancellation_remarks?: string
  
  // Extension
  extended_at?: string
  extension_reason?: string
  
  // Part-B Update
  part_b_updated: boolean
  part_b_updated_at?: string
  
  created_at: string
  updated_at: string
}

export type TransactionType = 'regular' | 'bill_to_ship_to' | 'export' | 'job_work' | 'supply_on_approval' | 'others'
export type TransportMode = 'road' | 'rail' | 'air' | 'ship'

export interface CreateEWayBillData {
  invoice_id?: string
  einvoice_id?: string
  document_number: string
  document_date: string
  recipient_gstin?: string
  recipient_name: string
  recipient_address: string
  recipient_state_code: string
  recipient_pincode: string
  goods_value: number
  hsn_code: string
  goods_description: string
  quantity: number
  unit: string
  approximate_distance_km: number
  transport_mode: TransportMode
  transporter_id?: string
  vehicle_number?: string
}

// =====================================================
// 5. GST MISMATCH ALERTS TYPES
// =====================================================

export interface GSTMismatchAlert {
  id: string
  user_id: string
  
  // Alert details
  alert_type: AlertType
  severity: 'low' | 'medium' | 'high' | 'critical'
  
  // Affected entity
  entity_type: 'invoice' | 'credit_note' | 'gstr1' | 'gstr3b'
  entity_id?: string
  reference_number: string
  
  // Mismatch
  expected_value: number
  actual_value: number
  difference: number
  field_name: string
  description: string
  
  // Tax period
  tax_period?: string
  
  // Resolution
  status: 'open' | 'investigating' | 'resolved' | 'ignored'
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  
  // Detection
  detected_by: 'system' | 'manual' | 'ca'
  detected_at: string
  
  // Action
  action_required: boolean
  recommended_action?: string
  
  created_at: string
  updated_at: string
}

export type AlertType = 
  | 'tax_calculation'
  | 'gstr1_mismatch'
  | 'gstr3b_mismatch'
  | 'itc_mismatch'
  | 'hsn_mismatch'
  | 'invoice_missing'
  | 'duplicate_invoice'
  | 'amount_mismatch'
  | 'gstin_invalid'

export interface CreateMismatchAlertData {
  alert_type: AlertType
  severity: 'low' | 'medium' | 'high' | 'critical'
  entity_type: string
  entity_id?: string
  reference_number: string
  expected_value: number
  actual_value: number
  field_name: string
  description: string
  tax_period?: string
}

// =====================================================
// 6-7. CA COLLABORATION TYPES
// =====================================================

export interface CAProfile {
  id: string
  user_id: string
  
  // CA Details
  ca_name: string
  ca_firm_name?: string
  membership_number: string  // ICAI number
  
  // Contact
  email: string
  phone?: string
  address?: string
  
  // Verification
  is_verified: boolean
  verification_document_url?: string
  verified_at?: string
  
  // Specialization
  specializations: CASpecialization[]
  
  // Status
  is_active: boolean
  
  created_at: string
  updated_at: string
}

export type CASpecialization = 'gst' | 'income_tax' | 'audit' | 'compliance' | 'advisory'

export interface ClientCAAccess {
  id: string
  client_user_id: string
  ca_user_id: string
  
  // Access permissions
  access_level: 'view_only' | 'edit' | 'full'
  can_view_invoices: boolean
  can_edit_invoices: boolean
  can_view_reports: boolean
  can_file_returns: boolean
  can_view_payments: boolean
  can_manage_customers: boolean
  
  // Module access
  allowed_modules: ModuleType[]
  
  // Status
  status: 'pending' | 'active' | 'revoked' | 'expired'
  invitation_sent_at?: string
  invitation_token?: string
  accepted_at?: string
  
  // Validity
  valid_from: string
  valid_until?: string
  
  // Revocation
  revoked_at?: string
  revoked_by?: string
  revocation_reason?: string
  
  // Notes
  client_notes?: string
  ca_notes?: string
  
  created_at: string
  updated_at: string
}

export type ModuleType = 
  | 'invoices'
  | 'customers'
  | 'reports'
  | 'gst_filing'
  | 'payments'
  | 'settings'
  | 'audit_trail'

export interface CAActivityLog {
  id: string
  ca_user_id: string
  client_user_id: string
  
  // Activity
  activity_type: ActivityType
  entity_type?: string
  entity_id?: string
  
  // Details
  activity_description: string
  changes_made?: Record<string, unknown>
  
  // Metadata
  ip_address: string
  user_agent?: string
  session_id?: string
  
  performed_at: string
}

export type ActivityType = 
  | 'viewed_invoice'
  | 'edited_invoice'
  | 'created_invoice'
  | 'filed_return'
  | 'generated_report'
  | 'added_note'
  | 'accessed_dashboard'
  | 'exported_data'
  | 'reconciled_accounts'

export interface GrantCAAccessData {
  ca_email: string
  access_level: 'view_only' | 'edit' | 'full'
  allowed_modules: ModuleType[]
  valid_from: string
  valid_until?: string
  client_notes?: string
}

export interface CAClientSummary {
  client_user_id: string
  client_email: string
  health_score?: number
  health_grade?: string
  risk_level?: string
  pending_gstr1: number
  pending_gstr3b: number
  open_alerts: number
  access_level: string
  access_status: string
  valid_until?: string
}

// =====================================================
// 8. AUDIT TRAIL TYPES
// =====================================================

export interface GSTAuditTrail {
  id: string
  user_id: string
  
  // Actor
  performed_by: string
  performed_by_type: 'owner' | 'ca' | 'system' | 'admin'
  
  // Action
  action_type: AuditActionType
  entity_type: AuditEntityType
  entity_id?: string
  
  // State changes
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  changed_fields: string[]
  
  // Description
  action_description: string
  action_category: 'compliance' | 'filing' | 'invoice' | 'reconciliation' | 'settings'
  
  // Security
  ip_address: string
  user_agent?: string
  session_id?: string
  request_id?: string
  
  // Location
  geolocation?: {
    country?: string
    region?: string
    city?: string
  }
  
  // Timestamp
  performed_at: string
  
  // Compliance
  is_critical_action: boolean
  requires_approval: boolean
  approval_status?: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  
  // Retention
  retention_period_days: number
  
  created_at: string
}

export type AuditActionType = 
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'file'
  | 'cancel'
  | 'approve'
  | 'reject'

export type AuditEntityType = 
  | 'invoice'
  | 'customer'
  | 'gstr1'
  | 'gstr3b'
  | 'einvoice'
  | 'eway_bill'
  | 'payment'
  | 'setting'
  | 'user'

export interface CreateAuditLogData {
  action_type: AuditActionType
  entity_type: AuditEntityType
  entity_id?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  action_description: string
  ip_address: string
  user_agent?: string
  is_critical?: boolean
}

// =====================================================
// 9. GST HEALTH SCORE TYPES
// =====================================================

export interface GSTHealthScore {
  id: string
  user_id: string
  
  // Overall score
  overall_score: number  // 0-100
  health_grade: HealthGrade
  
  // Component scores
  filing_compliance_score: number
  tax_calculation_accuracy_score: number
  reconciliation_score: number
  documentation_score: number
  itc_claim_score: number
  
  // Metrics
  total_returns_due: number
  returns_filed_on_time: number
  returns_filed_late: number
  returns_pending: number
  average_filing_delay_days: number
  
  tax_calculation_errors: number
  gst_mismatches_found: number
  gst_mismatches_resolved: number
  
  invoices_with_errors: number
  total_invoices_issued: number
  
  // Penalties
  total_interest_paid: number
  total_late_fees_paid: number
  total_penalties: number
  
  // Risk
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  improvement_suggestions: string[]
  
  // Comparison
  industry_average_score?: number
  percentile?: number
  
  // Period
  calculation_period_from: string
  calculation_period_to: string
  
  // Metadata
  calculated_at: string
  previous_score?: number
  score_change?: number
  trend: 'improving' | 'declining' | 'stable'
  
  created_at: string
  updated_at: string
}

export type HealthGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface GSTHealthScoreHistory {
  id: string
  user_id: string
  overall_score: number
  health_grade: HealthGrade
  calculation_period_from: string
  calculation_period_to: string
  score_snapshot: Record<string, unknown>
  calculated_at: string
  created_at: string
}

export interface HealthScoreTrend {
  period: string
  score: number
  grade: HealthGrade
}

// =====================================================
// UTILITY & FILTER TYPES
// =====================================================

export interface GSTR1Filter {
  tax_period?: string
  financial_year?: string
  status?: 'draft' | 'ready' | 'filed' | 'accepted'
  from_date?: string
  to_date?: string
}

export interface GSTR3BFilter {
  tax_period?: string
  financial_year?: string
  status?: 'draft' | 'ready' | 'filed' | 'accepted'
  from_date?: string
  to_date?: string
}

export interface EInvoiceFilter {
  irp_status?: 'pending' | 'generated' | 'cancelled' | 'failed'
  from_date?: string
  to_date?: string
  has_eway_bill?: boolean
}

export interface EWayBillFilter {
  status?: 'active' | 'cancelled' | 'expired' | 'extended'
  from_date?: string
  to_date?: string
  transport_mode?: TransportMode
}

export interface AuditTrailFilter {
  action_type?: AuditActionType
  entity_type?: AuditEntityType
  performed_by?: string
  from_date?: string
  to_date?: string
  is_critical?: boolean
}

export interface MismatchAlertFilter {
  alert_type?: AlertType
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'open' | 'investigating' | 'resolved' | 'ignored'
  tax_period?: string
}

// =====================================================
// DASHBOARD & ANALYTICS TYPES
// =====================================================

export interface GSTComplianceDashboard {
  // Health Score
  health_score: GSTHealthScore
  
  // GSTR-1 Summary
  gstr1_pending: number
  gstr1_filed: number
  gstr1_overdue: number
  
  // GSTR-3B Summary
  gstr3b_pending: number
  gstr3b_filed: number
  gstr3b_overdue: number
  
  // E-Invoice Summary
  einvoices_generated: number
  einvoices_failed: number
  einvoices_pending: number
  
  // E-Way Bills
  eway_bills_active: number
  eway_bills_expiring_soon: number
  
  // Alerts
  open_alerts: number
  critical_alerts: number
  alerts_by_type: Record<AlertType, number>
  
  // CA Access
  active_ca_access: number
  ca_activity_count: number
  
  // Recent Activity
  recent_audit_logs: GSTAuditTrail[]
  recent_alerts: GSTMismatchAlert[]
  
  // Trends
  health_score_trend: HealthScoreTrend[]
}

export interface CADashboard {
  ca_profile: CAProfile
  total_clients: number
  active_clients: number
  clients_summary: CAClientSummary[]
  total_alerts: number
  critical_alerts: number
  pending_returns: number
  recent_activity: CAActivityLog[]
}
