// Plan utilities for checking user subscription status and limits
import { createClient } from '@/lib/supabase/server'
import { UserSubscription, SubscriptionPlan } from '@/lib/types-admin'

/**
 * Check if a user can access the AI Accountant feature based on plan slug and billing period
 */
export function canAccessAIAccountant(planSlug: string, billingPeriod?: string, features?: string[]): boolean {
    if (billingPeriod === 'lifetime' || planSlug === 'enterprise' || planSlug === 'professional') {
        return true
    }
    if (Array.isArray(features)) {
        const norm = features.map(f => f.toLowerCase().replace(/[^a-z0-9]/g, ''))
        return norm.some(f => f.includes('ai') || f.includes('accountant'))
    }
    return false
}

export interface PlanStatus {
    hasActivePlan: boolean
    isExpired: boolean
    planName: string
    planSlug: string
    expiryDate: string | null
    daysUntilExpiry: number | null
    isLifetime: boolean
    features: string[]
    limits: Record<string, number | undefined>
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

        // Super Admin accounts (including Dodail business operations) automatically receive permanent Enterprise tier
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

        if (profile?.role === 'superadmin' || profile?.role === 'super_admin') {
            return {
                hasActivePlan: true,
                isExpired: false,
                planName: 'Enterprise (Super Admin VIP)',
                planSlug: 'enterprise',
                expiryDate: '2099-12-31T23:59:59.999Z',
                daysUntilExpiry: 30000,
                isLifetime: true,
                features: ['all', 'unlimited_invoices', 'crm', 'team_members', 'inventory', 'gst_reports', 'pms', 'payroll', 'cctv', 'white_label'],
                limits: { invoices_per_month: -1, customers: -1, team_members: -1, storage_gb: 1000 },
                subscription: null
            }
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
                features: ['50 invoices total', 'Customer management', 'GST compliant invoices', 'PDF downloads', 'Custom branding'],
                limits: { invoices_per_month: 50, customers: 100, team_members: 1 },
                subscription: null
            }
        }

        // Extract plan safely handling both object, array, or null/missing relation
        const rawPlan = Array.isArray(subscription.plan) ? subscription.plan[0] : subscription.plan

        if (!rawPlan) {
            // Subscription exists but plan details not found
            return {
                hasActivePlan: true,
                isExpired: false,
                planName: 'Professional',
                planSlug: 'professional',
                expiryDate: subscription.end_date || null,
                daysUntilExpiry: null,
                isLifetime: false,
                features: ['invoices', 'customers', 'crm', 'team_members', 'gst_reports'],
                limits: { invoices_per_month: 999999, customers: 999999, team_members: 5 },
                subscription: subscription as UserSubscription
            }
        }

        const plan = rawPlan as SubscriptionPlan
        const endDate = subscription.end_date ? new Date(subscription.end_date) : null
        const now = new Date()

        let rawDaysUntilExpiry = null
        if (endDate) {
            rawDaysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }

        const isLifetime = 
            plan.billing_period === 'lifetime' || 
            (plan.slug || '').toLowerCase().includes('lifetime') ||
            (endDate !== null && (endDate.getFullYear() >= 2090 || (rawDaysUntilExpiry !== null && rawDaysUntilExpiry >= 30000)))

        let isExpired = false
        let daysUntilExpiry = isLifetime ? null : rawDaysUntilExpiry

        if (endDate && !isLifetime) {
            isExpired = endDate < now
        }

        return {
            hasActivePlan: !isExpired,
            isExpired,
            planName: plan.name || 'Free',
            planSlug: plan.slug || 'free',
            expiryDate: subscription.end_date || null,
            daysUntilExpiry,
            isLifetime,
            features: (plan as any).features || [],
            limits: (plan as any).limits || {},
            subscription: subscription as UserSubscription
        }
    } catch (error) {
        console.error('Error getting user plan status:', error)
        return null
    }
}

/**
 * Dynamic feature gate checking if active plan has a specific feature.
 * Matches feature keys dynamically against the plan's stored features and limits in DB.
 */
export async function hasPlanFeature(featureKey: string): Promise<boolean> {
    const status = await getUserPlanStatus()
    if (!status || !status.hasActivePlan) {
        return ['invoices', 'customers', 'pdf', 'custom_branding'].includes(featureKey.toLowerCase())
    }

    const planSlug = (status.planSlug || '').toLowerCase()
    const isPro = planSlug.includes('pro') || planSlug.includes('professional')
    const isEnterprise = planSlug.includes('enterprise')
    const isLifetime = status.isLifetime || planSlug.includes('lifetime')

    // Enterprise and Lifetime have access to all platform features unless explicitly disabled
    const rawLimits = (status.limits as any) || {}
    const featureFlags = rawLimits.feature_flags || {}

    // Direct feature flag check if explicitly set in the plan package
    if (featureFlags[featureKey] !== undefined) {
        return !!featureFlags[featureKey]
    }

    if (isEnterprise || isLifetime) {
        return true
    }

    // Professional & Enterprise tier automatically bundles all vertical-specific power tools
    if (isPro) {
        const verticalModules = [
            'pms', 'estate_pms', 'campsite_pms', 'gear_rentals',
            'dental_case_sheets', 'odontogram',
            'vehicle_job_cards', 'garage_inspections',
            'salon_splits', 'stylist_commissions',
            'client_proposals', 'rfp_rfq',
            'b2b_organizations', 'pos', 'counter_pos', 'barcodes',
            'pos_checkout', 'barcode_batch', 'studio_bom', 'payroll',
            'double_entry_bookkeeping', 'gstr1_gstr3b_reports'
        ]
        const cleanKey = featureKey.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (verticalModules.some(m => m.replace(/[^a-z0-9]/g, '') === cleanKey || cleanKey.includes(m.replace(/[^a-z0-9]/g, '')))) {
            return true
        }
    }

    const normalizedKey = featureKey.toLowerCase().replace(/[^a-z0-9]/g, '')

    // Professional tier includes team members, crm, inventory, reports, reminders, whatsapp
    if (isPro) {
        const proIncluded = ['team', 'teammembers', 'crm', 'inventory', 'reports', 'gstreports', 'reminders', 'whatsapp', 'invoices', 'customers']
        if (proIncluded.includes(normalizedKey)) {
            return true
        }
    }

    const features = (status.features || []).map(f => f.toLowerCase().replace(/[^a-z0-9]/g, ''))

    if (features.some(f => f.includes(normalizedKey) || normalizedKey.includes(f))) {
        return true
    }

    if (normalizedKey.includes('team') && ((status.limits?.team_members ?? 0) > 0 || isPro)) {
        return true
    }

    const paidTiers = ['starter', 'starter-yearly', 'professional', 'professional-yearly', 'enterprise']
    if (['whatsapp', 'gst_reports', 'reminders', 'crm', 'inventory', 'team_members', 'team'].includes(featureKey) && paidTiers.some(t => planSlug.includes(t))) {
        return true
    }

    return false
}

/**
 * Dynamic limit checker for any feature quota.
 */
export async function checkFeatureLimit(
    limitKey: 'invoices_per_month' | 'customers' | 'team_members' | 'leads',
    currentCount: number
): Promise<{ allowed: boolean; limit: number; current: number }> {
    const status = await getUserPlanStatus()
    if (!status || !status.hasActivePlan) {
        const freeLimits: Record<string, number> = { invoices_per_month: 50, customers: 100, team_members: 1, leads: 50 }
        const limit = freeLimits[limitKey] ?? 10
        return { allowed: currentCount < limit, limit, current: currentCount }
    }

    if (status.isLifetime || status.planSlug === 'enterprise') {
        return { allowed: true, limit: -1, current: currentCount }
    }

    const planLimit = status.limits?.[limitKey] ?? -1
    if (planLimit === -1) {
        return { allowed: true, limit: -1, current: currentCount }
    }

    return {
        allowed: currentCount < planLimit,
        limit: planLimit,
        current: currentCount
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
            return { canCreate: true, count: 0, limit: 50 }
        }

        const planStatus = await getUserPlanStatus()
        const dynamicLimit = (planStatus?.limits as any)?.invoices_per_month

        // If explicitly configured in super admin, enforce dynamic limit
        if (dynamicLimit !== undefined && dynamicLimit !== null) {
            const limitVal = Number(dynamicLimit)
            if (limitVal === -1) {
                return { canCreate: true, count: 0, limit: -1 }
            }
            const { count, error: countError } = await supabase
                .from('invoices')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
            const invoiceCount = count || 0
            return {
                canCreate: invoiceCount < limitVal,
                count: invoiceCount,
                limit: limitVal
            }
        }
        
        // If user has a paid plan (not free), they have unlimited invoices
        if (planStatus && planStatus.planSlug !== 'free') {
            return { canCreate: true, count: 0, limit: -1 } // -1 means unlimited
        }

        // For free plan, check the 50 invoice limit
        const { count, error: countError } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (countError) {
            console.error('Error counting invoices:', countError)
            return { canCreate: true, count: 0, limit: 50 }
        }

        const invoiceCount = count || 0
        const limit = 50
        
        return {
            canCreate: invoiceCount < limit,
            count: invoiceCount,
            limit
        }
    } catch (error) {
        console.error('Error checking invoice limit:', error)
        return { canCreate: true, count: 0, limit: 50 }
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
