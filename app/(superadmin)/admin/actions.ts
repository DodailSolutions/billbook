'use server'

import { createClient } from '@/lib/supabase/server'
import type { DashboardStats } from '@/lib/types-admin'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export async function getDashboardStats(): Promise<DashboardStats | null> {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return null
        }

        const supabase = await createClient()

        // Get total payments
        const { data: payments } = await supabase
            .from('payments')
            .select('amount, status')

        const total_payments = payments
            ?.filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        const total_sales = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        // Get unpaid/pending amount
        const unpaid_amount = payments
            ?.filter(p => p.status === 'pending' || p.status === 'failed')
            .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        // Get refund amount
        const { data: refunds } = await supabase
            .from('refunds')
            .select('amount, status')

        const refund_amount = refunds
            ?.filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + (r.amount || 0), 0) || 0

        const pending_refunds = refunds
            ?.filter(r => r.status === 'pending' || r.status === 'approved')
            .length || 0

        // Get user counts
        const { count: total_users } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })

        // Get active subscriptions
        const { count: active_subscriptions } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        // Get open tickets
        const { count: open_tickets } = await supabase
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .in('status', ['open', 'in_progress'])

        return {
            total_sales,
            total_payments,
            unpaid_amount,
            refund_amount,
            total_users: total_users || 0,
            active_subscriptions: active_subscriptions || 0,
            pending_refunds,
            open_tickets: open_tickets || 0
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return null
    }
}

export async function getRecentActivity() {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return []
        }

        const supabase = await createClient()

        const { data } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        return data || []
    } catch (error) {
        console.error('Error fetching recent activity:', error)
        return []
    }
}
