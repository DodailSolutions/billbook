'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import type { SubscriptionPlan } from '@/lib/types-admin'

export interface PlanInput {
    name: string
    slug: string
    description?: string
    price: number
    currency: string
    billing_period: 'monthly' | 'yearly' | 'lifetime'
    features?: string[]
    limits?: {
        invoices_per_month?: number
        customers?: number
        storage_gb?: number
        [key: string]: number | undefined
    }
    is_active?: boolean
    is_popular?: boolean
    sort_order?: number
}

// Standard plans across regions
const STANDARD_REGIONAL_PLANS: PlanInput[] = [
    // 🇮🇳 INDIA (INR)
    {
        name: 'Free',
        slug: 'free',
        description: 'Perfect for getting started with basic GST invoicing',
        price: 0,
        currency: 'INR',
        billing_period: 'lifetime',
        features: ['50 invoices total', 'Customer management', 'GST compliant invoices', 'PDF downloads', 'Custom branding'],
        limits: { invoices_per_month: 50, customers: 100 },
        is_active: true,
        is_popular: false,
        sort_order: 1
    },
    {
        name: 'Starter',
        slug: 'starter',
        description: 'Best for freelancers and small businesses in India',
        price: 299,
        currency: 'INR',
        billing_period: 'monthly',
        features: ['Unlimited invoices', 'Automated payment reminders', 'WhatsApp sharing', 'GST reports & e-Way bill', 'Standard support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: true,
        sort_order: 2
    },
    {
        name: 'Starter Yearly',
        slug: 'starter-yearly',
        description: 'Save with annual billing for Indian small businesses',
        price: 2988,
        currency: 'INR',
        billing_period: 'yearly',
        features: ['Everything in Starter', 'Save ₹600/year', 'Priority email support', 'Custom invoice templates'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 3
    },
    {
        name: 'Professional',
        slug: 'professional',
        description: 'For growing businesses requiring multi-user access & analytics',
        price: 599,
        currency: 'INR',
        billing_period: 'monthly',
        features: ['Everything in Starter', 'Multi-user roles (up to 5)', 'Recurring invoices', 'Inventory tracking', 'Dedicated CA export'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 4
    },
    {
        name: 'Professional Yearly',
        slug: 'professional-yearly',
        description: 'Best value annual plan for growing businesses',
        price: 5988,
        currency: 'INR',
        billing_period: 'yearly',
        features: ['Everything in Professional', 'Save ₹1,200/year', 'Advanced audit logs', 'Priority phone & chat support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 5
    },
    {
        name: 'Lifetime Founder',
        slug: 'lifetime',
        description: 'One-time payment for lifetime unlimited invoicing',
        price: 9999,
        currency: 'INR',
        billing_period: 'lifetime',
        features: ['Unlimited invoices forever', 'All current & future features', 'No monthly or annual fees', 'VIP priority support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 6
    },

    // 🇦🇪 UAE (AED)
    {
        name: 'Starter UAE',
        slug: 'starter-ae',
        description: 'Essential FTA-compliant VAT invoicing for UAE startups',
        price: 49,
        currency: 'AED',
        billing_period: 'monthly',
        features: ['Bilingual Arabic & English invoices', 'FTA 5% VAT compliance', 'TRN validation', 'PDF & WhatsApp sharing', 'Standard support'],
        limits: { invoices_per_month: 500, customers: 500 },
        is_active: true,
        is_popular: false,
        sort_order: 10
    },
    {
        name: 'Starter UAE Yearly',
        slug: 'starter-ae-yearly',
        description: 'Annual starter plan with 2 months free for UAE businesses',
        price: 490,
        currency: 'AED',
        billing_period: 'yearly',
        features: ['Everything in Starter UAE', 'Get 2 months free', 'Priority email support', 'Bilingual custom branding'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 11
    },
    {
        name: 'Growth UAE',
        slug: 'growth-ae',
        description: 'Best for growing UAE trading and service companies',
        price: 99,
        currency: 'AED',
        billing_period: 'monthly',
        features: ['Multi-currency support (AED, USD, EUR)', 'VAT Return ready reports', 'Corporate Tax compliance ready', 'Up to 3 team members'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: true,
        sort_order: 12
    },
    {
        name: 'Growth UAE Yearly',
        slug: 'growth-ae-yearly',
        description: 'Annual growth plan for UAE small & medium businesses',
        price: 990,
        currency: 'AED',
        billing_period: 'yearly',
        features: ['Everything in Growth UAE', 'Annual discount savings', 'Priority UAE support', 'Inventory & stock tracking'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 13
    },
    {
        name: 'Lifetime Deal UAE',
        slug: 'lifetime-ae',
        description: 'Pay once, use forever for UAE freelancers & startups',
        price: 499,
        currency: 'AED',
        billing_period: 'lifetime',
        features: ['Unlimited VAT invoices forever', 'Arabic & English bilingual layout', 'TRN lookup & compliance', 'Zero recurring charges'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 14
    },

    // 🇺🇸 US & INTERNATIONAL (USD)
    {
        name: 'Starter US',
        slug: 'starter-us',
        description: 'Affordable billing for US freelancers & consultants',
        price: 9,
        currency: 'USD',
        billing_period: 'monthly',
        features: ['Multi-state US Sales Tax', 'Estimates & invoices', 'Stripe & card payment links', 'PDF downloads', 'Email dispatch'],
        limits: { invoices_per_month: 250, customers: 250 },
        is_active: true,
        is_popular: false,
        sort_order: 20
    },
    {
        name: 'Starter US Yearly',
        slug: 'starter-us-yearly',
        description: 'Best value entry plan for US solo founders',
        price: 49,
        currency: 'USD',
        billing_period: 'yearly',
        features: ['Everything in Starter US', 'Only $4/mo billed annually', 'Custom logo & styling', 'Basic financial reports'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 21
    },
    {
        name: 'Growth US',
        slug: 'growth-us',
        description: 'For growing US agencies and small businesses',
        price: 19,
        currency: 'USD',
        billing_period: 'monthly',
        features: ['Up to 3 team members', 'Recurring client billing', 'Automated late reminders', 'Client statements & aging', 'Priority support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: true,
        sort_order: 22
    },
    {
        name: 'Growth US Yearly',
        slug: 'growth-us-yearly',
        description: 'Annual growth plan for US businesses',
        price: 99,
        currency: 'USD',
        billing_period: 'yearly',
        features: ['Everything in Growth US', 'Save over 55% vs monthly', 'Detailed revenue analytics', 'QuickBooks-ready CSV exports'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 23
    },
    {
        name: 'Lifetime US',
        slug: 'lifetime-starter-us',
        description: 'One-time investment for lifetime invoicing in USD',
        price: 149,
        currency: 'USD',
        billing_period: 'lifetime',
        features: ['Unlimited US invoices forever', 'Sales tax auto-computation', 'No recurring subscription costs', 'VIP updates included'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 24
    }
]

export async function getAllPlans(currency?: string): Promise<SubscriptionPlan[]> {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) {
            console.warn('[getAllPlans] Unauthorized access attempt')
            return []
        }

        const supabase = await createClient()

        let query = supabase
            .from('subscription_plans')
            .select('*')
            .order('sort_order', { ascending: true })

        if (currency && currency !== 'all') {
            query = query.eq('currency', currency.toUpperCase())
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching subscription_plans:', error)
            return []
        }

        return (data || []) as SubscriptionPlan[]
    } catch (error) {
        console.error('Fatal error in getAllPlans:', error)
        return []
    }
}

export async function createPlan(data: PlanInput) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) {
            throw new Error('Unauthorized')
        }

        const supabase = await createClient()

        const cleanSlug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim()

        const { data: newPlan, error } = await supabase
            .from('subscription_plans')
            .insert({
                name: data.name,
                slug: cleanSlug,
                description: data.description || '',
                price: Number(data.price) || 0,
                currency: (data.currency || 'INR').toUpperCase(),
                billing_period: data.billing_period,
                features: Array.isArray(data.features) ? data.features : [],
                limits: data.limits || {},
                is_active: data.is_active !== undefined ? data.is_active : true,
                is_popular: !!data.is_popular,
                sort_order: Number(data.sort_order) || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error

        await createAuditLog('subscription_plan_created', 'plan', newPlan.id, {
            name: data.name,
            currency: data.currency,
            price: data.price
        })

        revalidatePath('/admin/plans')
        return { success: true, plan: newPlan }
    } catch (error) {
        console.error('Error creating plan:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create plan' }
    }
}

export async function updatePlan(id: string, data: Partial<PlanInput>) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) {
            throw new Error('Unauthorized')
        }

        const supabase = await createClient()

        const updatePayload: Record<string, any> = {
            updated_at: new Date().toISOString()
        }

        if (data.name !== undefined) updatePayload.name = data.name
        if (data.slug !== undefined) updatePayload.slug = data.slug.toLowerCase().trim()
        if (data.description !== undefined) updatePayload.description = data.description
        if (data.price !== undefined) updatePayload.price = Number(data.price)
        if (data.currency !== undefined) updatePayload.currency = data.currency.toUpperCase()
        if (data.billing_period !== undefined) updatePayload.billing_period = data.billing_period
        if (data.features !== undefined) updatePayload.features = data.features
        if (data.limits !== undefined) updatePayload.limits = data.limits
        if (data.is_active !== undefined) updatePayload.is_active = data.is_active
        if (data.is_popular !== undefined) updatePayload.is_popular = data.is_popular
        if (data.sort_order !== undefined) updatePayload.sort_order = Number(data.sort_order)

        const { error } = await supabase
            .from('subscription_plans')
            .update(updatePayload)
            .eq('id', id)

        if (error) throw error

        await createAuditLog('subscription_plan_updated', 'plan', id, updatePayload)

        revalidatePath('/admin/plans')
        return { success: true }
    } catch (error) {
        console.error('Error updating plan:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update plan' }
    }
}

export async function togglePlanStatus(id: string, is_active: boolean) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) throw new Error('Unauthorized')

        const supabase = await createClient()

        const { error } = await supabase
            .from('subscription_plans')
            .update({ is_active, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error

        await createAuditLog('subscription_plan_status_toggled', 'plan', id, { is_active })
        revalidatePath('/admin/plans')
        return { success: true }
    } catch (error) {
        console.error('Error toggling plan status:', error)
        return { success: false, error: 'Failed to update plan status' }
    }
}

export async function togglePlanPopular(id: string, is_popular: boolean) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) throw new Error('Unauthorized')

        const supabase = await createClient()

        const { error } = await supabase
            .from('subscription_plans')
            .update({ is_popular, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error

        await createAuditLog('subscription_plan_popular_toggled', 'plan', id, { is_popular })
        revalidatePath('/admin/plans')
        return { success: true }
    } catch (error) {
        console.error('Error toggling plan popular status:', error)
        return { success: false, error: 'Failed to update plan' }
    }
}

export async function deletePlan(id: string) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) throw new Error('Unauthorized')

        const supabase = await createClient()

        // Check if plan has active subscriptions
        const { count } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', id)

        if (count && count > 0) {
            // Soft deactivate to avoid breaking foreign key constraints
            await supabase
                .from('subscription_plans')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', id)
            
            revalidatePath('/admin/plans')
            return { success: true, message: `Plan has ${count} existing subscriber(s). It has been deactivated instead of permanently deleted.` }
        }

        const { error } = await supabase
            .from('subscription_plans')
            .delete()
            .eq('id', id)

        if (error) throw error

        await createAuditLog('subscription_plan_deleted', 'plan', id)
        revalidatePath('/admin/plans')
        return { success: true }
    } catch (error) {
        console.error('Error deleting plan:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete plan' }
    }
}

export async function seedStandardRegionalPlans() {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) throw new Error('Unauthorized')

        const supabase = await createClient()

        // Fetch existing slugs
        const { data: existingPlans } = await supabase
            .from('subscription_plans')
            .select('slug')

        const existingSlugs = new Set((existingPlans || []).map(p => p.slug))

        let addedCount = 0

        for (const plan of STANDARD_REGIONAL_PLANS) {
            if (!existingSlugs.has(plan.slug)) {
                await supabase
                    .from('subscription_plans')
                    .insert({
                        name: plan.name,
                        slug: plan.slug,
                        description: plan.description,
                        price: plan.price,
                        currency: plan.currency,
                        billing_period: plan.billing_period,
                        features: plan.features,
                        limits: plan.limits,
                        is_active: plan.is_active,
                        is_popular: plan.is_popular,
                        sort_order: plan.sort_order,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                addedCount++
            }
        }

        revalidatePath('/admin/plans')
        return { 
            success: true, 
            message: addedCount > 0 
                ? `Successfully seeded ${addedCount} missing regional plan(s) for India, UAE, and US!`
                : 'All standard regional plans already exist in the database.' 
        }
    } catch (error) {
        console.error('Error seeding regional plans:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to seed plans' }
    }
}
