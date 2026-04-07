export interface Customer {
    id: string
    user_id: string
    name: string
    email?: string
    phone?: string
    address?: string
    gstin?: string
    gstin_validated?: boolean
    gstin_validation_date?: string
    customer_state_code?: string
    created_at: string
    updated_at: string
}

export interface Invoice {
    id: string
    user_id: string
    customer_id: string
    invoice_number: string
    invoice_date: string
    due_date?: string
    subtotal: number
    gst_percentage: number
    gst_amount: number
    cgst_amount?: number
    sgst_amount?: number
    igst_amount?: number
    total: number
    supply_type?: 'intra-state' | 'inter-state'
    reverse_charge_applicable?: boolean
    reverse_charge_notes?: string
    notes?: string
    status: 'draft' | 'sent' | 'paid' | 'partial' | 'cancelled'
    payment_method?: string
    payment_notes?: string
    paid_at?: string
    amount_paid?: number
    amount_remaining?: number
    is_partial_payment?: boolean
    discount_type?: 'percentage' | 'flat'
    discount_value?: number
    discount_amount?: number
    created_at: string
    updated_at: string
}

export interface InvoicePayment {
    id: string
    invoice_id: string
    user_id: string
    amount: number
    payment_method?: string
    payment_notes?: string
    payment_date: string
    created_at: string
}

export interface InvoiceItem {
    id: string
    invoice_id: string
    description: string
    item_details?: string
    quantity: number
    unit_price: number
    amount: number
    hsn_sac_code?: string
    hsn_sac_type?: 'HSN' | 'SAC'
    gst_rate?: number
    item_cgst?: number
    item_sgst?: number
    item_igst?: number
    item_tax_amount?: number
    created_at: string
}

export interface InvoiceWithDetails extends Invoice {
    customer: Customer
    invoice_items: InvoiceItem[]
    recurring_invoices?: Array<{
        id: string
        frequency: 'monthly' | 'yearly'
        next_invoice_date: string
        is_active: boolean
    }>
}

export interface InvoiceSequence {
    id: string
    user_id: string
    current_number: number
    prefix: string
    updated_at: string
}

export interface DashboardStats {
    totalRevenue: number
    totalInvoices: number
    paidInvoices: number
    pendingInvoices: number
}

export interface RecurringInvoice {
    id: string
    user_id: string
    customer_id: string
    template_invoice_id?: string
    frequency: 'monthly' | 'yearly'
    start_date: string
    end_date?: string
    next_invoice_date: string
    gst_percentage: number
    notes?: string
    is_active: boolean
    last_generated_at?: string
    created_at: string
    updated_at: string
}

export interface RecurringInvoiceItem {
    id: string
    recurring_invoice_id: string
    description: string
    quantity: number
    unit_price: number
    created_at: string
}

export interface RecurringInvoiceWithDetails extends RecurringInvoice {
    customer: Customer
    recurring_invoice_items: RecurringInvoiceItem[]
}

export interface Reminder {
    id: string
    user_id: string
    invoice_id?: string
    recurring_invoice_id?: string
    reminder_type: 'due_date' | 'overdue' | 'recurring_upcoming'
    reminder_date: string
    days_before: number
    is_sent: boolean
    sent_at?: string
    message?: string
    created_at: string
}

export interface InvoiceForReminder {
    invoice_number: string
    total: number
    due_date?: string
    status: 'draft' | 'sent' | 'paid' | 'partial' | 'cancelled'
    customer: Customer
}

export interface RecurringInvoiceForReminder {
    frequency: 'monthly' | 'yearly'
    next_invoice_date: string
    customer: Customer
}

export interface ReminderWithDetails extends Reminder {
    invoice?: InvoiceForReminder
    recurring_invoice?: RecurringInvoiceForReminder
}
// GST Compliance Interfaces
export interface HSNSACMaster {
    id: string
    code: string
    description: string
    category: 'HSN' | 'SAC'
    default_gst_rate: number
    product_category?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface ReverseChargeSettings {
    id: string
    user_id: string
    enable_reverse_charge: boolean
    auto_detect_supplier_registration: boolean
    notes?: string
    created_at: string
    updated_at: string
}

export interface GSTBreakdown {
    subtotal: number
    cgst: number
    sgst: number
    igst: number
    totalTax: number
    totalAmount: number
    effectiveRate: number
}

// ============================================
// ADVANCED INVOICE FEATURES
// ============================================

// Multi-Series Invoice Numbering
export interface InvoiceSeries {
    id: string
    user_id: string
    series_name: string
    series_code: string
    prefix: string
    suffix?: string
    financial_year_based: boolean
    branch_id?: string
    current_number: number
    reset_annually: boolean
    is_active: boolean
    is_default: boolean
    number_format: string // e.g., '{PREFIX}-{FY}-{NUM}'
    padding_length: number
    last_reset_date?: string
    created_at: string
    updated_at: string
}

// Invoice Types and Lifecycle
export type InvoiceType = 'standard' | 'proforma' | 'credit_note' | 'debit_note' | 'advance' | 'milestone'
export type InvoiceLifecycleStage = 'draft' | 'proforma' | 'approved' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'converted'

// Milestone Billing
export interface InvoiceMilestone {
    id: string
    parent_invoice_id: string
    milestone_invoice_id?: string
    milestone_number: number
    milestone_name: string
    description?: string
    percentage?: number
    amount: number
    due_date?: string
    status: 'pending' | 'invoiced' | 'paid' | 'cancelled'
    completion_criteria?: string
    completed_at?: string
    created_at: string
    updated_at: string
}

// Advance Payment
export interface AdvancePaymentAdjustment {
    id: string
    advance_invoice_id: string
    final_invoice_id: string
    adjusted_amount: number
    adjustment_date: string
    notes?: string
    created_at: string
}

// Invoice Approval Workflow
export interface InvoiceApproval {
    id: string
    invoice_id: string
    submitted_by: string
    current_approver?: string
    approval_level: number
    required_approvals: number
    approval_status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
    comments?: string
    submitted_at: string
    approved_at?: string
    rejected_at?: string
    rejection_reason?: string
    created_at: string
    updated_at: string
}

export interface ApprovalHistory {
    id: string
    approval_id: string
    approver_id: string
    action: 'approved' | 'rejected' | 'commented'
    comments?: string
    action_date: string
}

// Company GST Settings
export interface CompanyGSTSettings {
    id: string
    user_id: string
    company_gstin: string
    company_state_code: string
    company_state_name?: string
    default_place_of_supply?: string
    is_composition_scheme: boolean
    composition_rate?: number
    reverse_charge_applicable_categories?: string[]
    created_at: string
    updated_at: string
}

// HSN/SAC Master Database
export interface HSNSACMasterExtended {
    id: string
    code: string
    description: string
    category: 'HSN' | 'SAC'
    gst_rate: number
    chapter_no?: string
    chapter_name?: string
    is_active: boolean
    effective_from?: string
    search_keywords?: string[]
    usage_count: number
    created_at: string
    updated_at: string
}

export interface UserHSNSACPreference {
    id: string
    user_id: string
    hsn_sac_code: string
    custom_description?: string
    usage_count: number
    last_used_at: string
    created_at: string
}

// Compliance
export interface InvoiceComplianceLog {
    id: string
    invoice_id: string
    check_type: string
    status: 'pass' | 'warning' | 'error'
    message: string
    details?: Record<string, any>
    checked_at: string
}

// Extended Invoice with all new fields
export interface InvoiceExtended extends Invoice {
    invoice_series_id?: string
    financial_year?: string
    invoice_type: InvoiceType
    parent_invoice_id?: string
    lifecycle_stage: InvoiceLifecycleStage
    converted_to_invoice_id?: string
    credit_note_reason?: string
    proforma_valid_until?: string
    is_milestone_based: boolean
    milestone_id?: string
    project_name?: string
    project_total_value?: number
    is_advance_payment: boolean
    advance_percentage?: number
    advance_adjusted_amount: number
    advance_invoice_ids?: string[]
    place_of_supply?: string
    is_sez_supply: boolean
    is_export: boolean
    export_type?: string
    shipping_bill_no?: string
    shipping_bill_date?: string
    port_code?: string
    round_off_amount: number
    total_before_round_off?: number
    compliance_checked: boolean
    compliance_warnings?: ComplianceWarning[]
    auto_calculated: boolean
    requires_approval: boolean
    approval_status?: string
}

export interface ComplianceWarning {
    type: string
    severity: 'info' | 'warning' | 'error'
    message: string
    field?: string
}

// HSN/SAC Suggestion
export interface HSNSACSuggestion {
    code: string
    description: string
    category: 'HSN' | 'SAC'
    gst_rate: number
    relevance_score: number
    is_frequently_used: boolean
}