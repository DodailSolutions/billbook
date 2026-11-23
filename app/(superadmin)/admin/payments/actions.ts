'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export interface UnifiedPayment {
    id: string
    type: 'subscription' | 'invoice_settlement' | 'gateway'
    amount: number
    currency: string
    status: 'completed' | 'pending' | 'failed' | 'refunded'
    payment_method: string
    payment_gateway?: string
    gateway_transaction_id?: string
    description?: string
    user_id: string
    user_name?: string
    user_email?: string
    business_name?: string
    plan_name?: string
    created_at: string
}

export async function getAllPayments(): Promise<UnifiedPayment[]> {
    const supabase = await createClient()
    
    // Check super admin access
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) {
        return []
    }

    const unified: UnifiedPayment[] = []

    try {
        // 1. Fetch from payments table
        const { data: paymentsData, error: paymentsErr } = await supabase
            .from('payments')
            .select(`
                *,
                user:user_profiles!user_id(owner_name, business_name, business_email)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

        if (!paymentsErr && paymentsData) {
            paymentsData.forEach((p: any) => {
                const userObj = Array.isArray(p.user) ? p.user[0] : p.user
                unified.push({
                    id: p.id,
                    type: p.subscription_id ? 'subscription' : 'invoice_settlement',
                    amount: Number(p.amount) || 0,
                    currency: p.currency || 'INR',
                    status: (p.status || 'completed') as any,
                    payment_method: p.payment_method || 'Online Gateway',
                    payment_gateway: p.payment_gateway || 'Razorpay',
                    gateway_transaction_id: p.gateway_transaction_id || p.gateway_payment_id,
                    description: p.description || 'Payment Transaction',
                    user_id: p.user_id,
                    user_name: userObj?.owner_name,
                    user_email: userObj?.business_email,
                    business_name: userObj?.business_name,
                    created_at: p.created_at
                })
            })
        }
    } catch (e) {
        console.warn('Error reading payments table:', e)
    }

    try {
        // 2. Fetch from user_subscriptions table to ensure all subscription revenues are reflected
        const { data: subsData, error: subsErr } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans(
                    id,
                    name,
                    price
                ),
                user:user_profiles!user_id(owner_name, business_name, business_email)
            `)
            .not('amount_paid', 'is', null)
            .order('created_at', { ascending: false })
            .limit(100)

        if (!subsErr && subsData) {
            subsData.forEach((s: any) => {
                // Check if already captured via payments table
                const exists = unified.some(u => u.id === s.id)
                if (!exists) {
                    const userObj = Array.isArray(s.user) ? s.user[0] : s.user
                    unified.push({
                        id: s.id,
                        type: 'subscription',
                        amount: Number(s.amount_paid) || 0,
                        currency: s.currency || 'INR',
                        status: (s.status === 'active' || s.status === 'completed' ? 'completed' : s.status) as any,
                        payment_method: s.payment_method || 'Razorpay Recurring',
                        payment_gateway: 'Razorpay',
                        gateway_transaction_id: s.gateway_subscription_id,
                        description: `Subscription: ${s.subscription_plans?.name || 'Pro Plan'}`,
                        user_id: s.user_id,
                        user_name: userObj?.owner_name,
                        user_email: userObj?.business_email,
                        business_name: userObj?.business_name,
                        plan_name: s.subscription_plans?.name,
                        created_at: s.created_at
                    })
                }
            })
        }
    } catch (e) {
        console.warn('Error reading user_subscriptions table:', e)
    }

    // Sort descending by date
    unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return unified
}
