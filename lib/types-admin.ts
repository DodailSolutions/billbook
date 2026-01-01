// Extended types for Super Admin module

export interface UserProfile {
    id: string
    role: 'user' | 'admin' | 'super_admin'
    business_name?: string
    business_id?: string
    status: 'active' | 'suspended' | 'inactive'
    created_at: string
    updated_at: string
}

export interface SubscriptionPlan {
    id: string
    name: string
    slug: string
    description?: string
    price: number
    currency: string
    billing_period: 'monthly' | 'yearly' | 'lifetime'
    features: string[]
    limits: {
        invoices_per_month?: number
        customers?: number
        storage_gb?: number
        [key: string]: number | undefined
    }
    is_active: boolean
    is_popular: boolean
    sort_order: number
    created_at: string
    updated_at: string
}

export interface UserSubscription {
    id: string
    user_id: string
    plan_id: string
    plan?: SubscriptionPlan
    status: 'active' | 'cancelled' | 'expired' | 'trial'
    start_date: string
    end_date?: string
    trial_ends_at?: string
    auto_renew: boolean
    payment_method?: string
    amount_paid?: number
    currency: string
    created_at: string
    updated_at: string
}

export interface Coupon {
    id: string
    code: string
    description?: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    currency: string
    max_uses?: number
    uses_count: number
    valid_from: string
    valid_until?: string
    applicable_plans?: string[]
    min_purchase_amount?: number
    is_active: boolean
    created_by?: string
    created_at: string
    updated_at: string
}

export interface CouponUsage {
    id: string
    coupon_id: string
    user_id: string
    subscription_id?: string
    discount_amount: number
    used_at: string
}

export interface Payment {
    id: string
    user_id: string
    subscription_id?: string
    amount: number
    currency: string
    payment_method?: string
    payment_gateway?: string
    gateway_transaction_id?: string
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    description?: string
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

export interface Refund {
    id: string
    payment_id: string
    payment?: Payment
    user_id: string
    amount: number
    currency: string
    reason?: string
    status: 'pending' | 'approved' | 'rejected' | 'completed'
    processed_by?: string
    processed_at?: string
    gateway_refund_id?: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface SupportTicket {
    id: string
    ticket_number: string
    user_id: string
    subject: string
    description: string
    category?: 'billing' | 'technical' | 'feature_request' | 'other'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
    assigned_to?: string
    resolved_at?: string
    created_at: string
    updated_at: string
    messages?: SupportTicketMessage[]
}

export interface SupportTicketMessage {
    id: string
    ticket_id: string
    user_id: string
    message: string
    is_internal: boolean
    attachments?: any[]
    created_at: string
}

export interface AuditLog {
    id: string
    user_id?: string
    action: string
    entity_type?: string
    entity_id?: string
    changes?: Record<string, any>
    ip_address?: string
    user_agent?: string
    created_at: string
}

export interface SystemSettings {
    id: string
    key: string
    value: any
    description?: string
    updated_by?: string
    created_at: string
    updated_at: string
}

export interface DashboardStats {
    total_sales: number
    total_payments: number
    unpaid_amount: number
    refund_amount: number
    total_users: number
    active_subscriptions: number
    pending_refunds: number
    open_tickets: number
}

export interface UserWithDetails extends UserProfile {
    email?: string
    subscription?: UserSubscription
    total_spent?: number
    invoice_count?: number
}
