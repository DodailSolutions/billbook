// Plan utilities for checking user subscription status and limits
import { createClient } from '@/lib/supabase/server'
import { UserSubscription, SubscriptionPlan } from '@/lib/types-admin'

export interface PlanStatus {
    hasActivePlan: boolean
    isExpired: boolean
    planName: string
    planSlug: string
    expiryDate: string | null
    daysUntilExpiry: number | null
    isLifetime: boolean
    subscription: UserSubscription | null
}

/**
 * Get the current user's subscription and plan status
 */
export async function getUserPlanStatus(): Promise<PlanStatus | null> {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return null
        }

        // Get user's active subscription
        const { data: subscription, error: subError } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                plan:subscription_plans(*)
            `)
            .eq('user_id', user.id)
            .in('status', ['active', 'trial'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (subError || !subscription) {
            // User has no active subscription - should be on free plan
            return {
                hasActivePlan: false,
                isExpired: false,
                planName: 'Free',
                planSlug: 'free',
                expiryDate: null,
                daysUntilExpiry: null,
                isLifetime: false,
                subscription: null
            }
        }

        const plan = subscription.plan as SubscriptionPlan
        const isLifetime = plan.billing_period === 'lifetime'
        const endDate = subscription.end_date ? new Date(subscription.end_date) : null
        const now = new Date()

        let isExpired = false
        let daysUntilExpiry = null

        if (endDate && !isLifetime) {
            isExpired = endDate < now
            daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }

        return {
            hasActivePlan: !isExpired,
            isExpired,
            planName: plan.name,
            planSlug: plan.slug,
            expiryDate: subscription.end_date || null,
            daysUntilExpiry,
            isLifetime,
            subscription: subscription as UserSubscription
        }
    } catch (error) {
        console.error('Error getting user plan status:', error)
        return null
    }
}

/**
 * Check if user has reached their invoice limit (for free plan)
 */
export async function checkInvoiceLimit(): Promise<{ canCreate: boolean; count: number; limit: number }> {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { canCreate: false, count: 0, limit: 0 }
        }

        const planStatus = await getUserPlanStatus()
        
        // If user has a paid plan (not free), they have unlimited invoices
        if (planStatus && planStatus.planSlug !== 'free') {
            return { canCreate: true, count: 0, limit: -1 } // -1 means unlimited
        }

        // For free plan, check the 300 invoice limit
        const { count, error: countError } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (countError) {
            console.error('Error counting invoices:', countError)
            return { canCreate: false, count: 0, limit: 300 }
        }

        const invoiceCount = count || 0
        const limit = 300
        
        return {
            canCreate: invoiceCount < limit,
            count: invoiceCount,
            limit
        }
    } catch (error) {
        console.error('Error checking invoice limit:', error)
        return { canCreate: false, count: 0, limit: 300 }
    }
}

/**
 * Check if plan has expired and needs renewal
 */
export async function checkPlanExpiry(): Promise<{
    needsRenewal: boolean
    isExpired: boolean
    daysUntilExpiry: number | null
    planName: string
}> {
    const planStatus = await getUserPlanStatus()
    
    if (!planStatus) {
        return {
            needsRenewal: false,
            isExpired: false,
            daysUntilExpiry: null,
            planName: 'Free'
        }
    }

    // Lifetime plans never expire
    if (planStatus.isLifetime) {
        return {
            needsRenewal: false,
            isExpired: false,
            daysUntilExpiry: null,
            planName: planStatus.planName
        }
    }

    // Check if expired or expiring soon (within 7 days)
    const needsRenewal = planStatus.isExpired || 
        (planStatus.daysUntilExpiry !== null && planStatus.daysUntilExpiry <= 7)

    return {
        needsRenewal,
        isExpired: planStatus.isExpired,
        daysUntilExpiry: planStatus.daysUntilExpiry,
        planName: planStatus.planName
    }
}
