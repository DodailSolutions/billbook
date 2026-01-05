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
    status: 'draft' | 'sent' | 'paid' | 'cancelled'
    payment_method?: string
    payment_notes?: string
    paid_at?: string
    created_at: string
    updated_at: string
}

export interface InvoiceItem {
    id: string
    invoice_id: string
    description: string
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
    status: 'draft' | 'sent' | 'paid' | 'cancelled'
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