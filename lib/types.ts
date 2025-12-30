export interface Customer {
    id: string
    user_id: string
    name: string
    email?: string
    phone?: string
    address?: string
    gstin?: string
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
    total: number
    notes?: string
    status: 'draft' | 'sent' | 'paid' | 'cancelled'
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

export interface ReminderWithDetails extends Reminder {
    invoice?: Invoice
    recurring_invoice?: RecurringInvoice
}
