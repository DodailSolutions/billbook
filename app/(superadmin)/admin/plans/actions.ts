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

// Standard official plans across all regions
const STANDARD_REGIONAL_PLANS: PlanInput[] = [
    // 🇮🇳 INDIA (INR ₹)
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
        price: 2999,
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
        description: 'Save with annual billing for Indian small businesses (save ₹6,000/year)',
        price: 29990,
        currency: 'INR',
        billing_period: 'yearly',
        features: ['Everything in Starter', 'Save ₹6,000/year', 'Priority email support', 'Custom invoice templates'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 3
    },
    {
        name: 'Professional',
        slug: 'professional',
        description: 'For growing businesses requiring multi-user access & analytics',
        price: 4999,
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
        description: 'Best value annual plan for growing businesses (save ₹10,000/year)',
        price: 49990,
        currency: 'INR',
        billing_period: 'yearly',
        features: ['Everything in Professional', 'Save ₹10,000/year', 'Advanced audit logs', 'Priority phone & chat support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 5
    },
    {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'Complete suite with AI assistant, payroll engine & CA marketplace',
        price: 10999,
        currency: 'INR',
        billing_period: 'monthly',
        features: ['Everything in Professional', 'Full Payroll & Payslip Engine', 'AI Accountant Assistant', 'Unlimited team members', 'Certified CA Marketplace Access'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 6
    },
    {
        name: 'Founder Lifetime Plan',
        slug: 'lifetime-professional',
        description: 'Founder circle lifetime access - All professional features included forever',
        price: 9999,
        currency: 'INR',
        billing_period: 'lifetime',
        features: ['Unlimited invoices forever', 'Priority WhatsApp support', 'Early access to AI features', 'Direct founder access', 'Feature voting rights', 'Custom branding'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: true,
        sort_order: 7
    },
    {
        name: 'Founder Yearly Plan',
        slug: 'founder-yearly',
        description: 'Founder circle yearly access with locked-in founder rates',
        price: 2999,
        currency: 'INR',
        billing_period: 'yearly',
        features: ['Unlimited invoices for 12 months', 'GST-ready billing & e-Way bill reports', 'Automated payment reminders & WhatsApp', 'Customer management & payment tracking', 'Fast email invoice delivery', 'Business analytics & reports'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 8
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
        name: 'Pro UAE',
        slug: 'pro-ae',
        description: 'For growing UAE companies & agencies needing multi-user and advanced VAT',
        price: 199,
        currency: 'AED',
        billing_period: 'monthly',
        features: ['Up to 5 users', 'Everything in Growth UAE', 'Advanced VAT return reports', 'Multi-currency', 'API access', 'Priority support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 14
    },
    {
        name: 'Pro UAE Yearly',
        slug: 'pro-ae-yearly',
        description: 'Annual Pro plan with 2 months free for UAE companies',
        price: 1990,
        currency: 'AED',
        billing_period: 'yearly',
        features: ['Everything in Pro UAE', '2 months free', 'Custom branding', 'Dedicated phone & WhatsApp support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 15
    },
    {
        name: 'Enterprise UAE',
        slug: 'enterprise-ae',
        description: 'For large UAE teams, Free Zone firms & enterprise operations',
        price: 299,
        currency: 'AED',
        billing_period: 'monthly',
        features: ['Up to 10 users', 'Everything in Pro UAE', 'AI Accountant Copilot', 'Custom integrations', 'Dedicated CA export'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 16
    },
    {
        name: 'Enterprise UAE Yearly',
        slug: 'enterprise-ae-yearly',
        description: 'Annual enterprise billing for UAE operations with VIP onboarding',
        price: 2990,
        currency: 'AED',
        billing_period: 'yearly',
        features: ['Everything in Enterprise UAE', 'Save AED 598/yr', 'Dedicated account manager', 'Custom API integration'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 17
    },
    {
        name: 'Starter Lifetime UAE',
        slug: 'lifetime-ae',
        description: 'Pay once, use forever for UAE freelancers & solo consultants',
        price: 499,
        currency: 'AED',
        billing_period: 'lifetime',
        features: ['1 user', '300 invoices/year', 'FTA 5% VAT-compliant', 'Client management', 'Email support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 18
    },
    {
        name: 'Growth Lifetime UAE',
        slug: 'lifetime-growth-ae',
        description: 'Pay once, use forever for UAE small businesses & trading firms',
        price: 899,
        currency: 'AED',
        billing_period: 'lifetime',
        features: ['Up to 3 users', '1,200 invoices/year', 'Recurring invoices', 'Payment reminders', 'VAT reports', 'Priority support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: true,
        sort_order: 19
    },
    {
        name: 'Pro Lifetime UAE',
        slug: 'lifetime-pro-ae',
        description: 'Pay once, use forever for UAE agencies & service providers',
        price: 1499,
        currency: 'AED',
        billing_period: 'lifetime',
        features: ['Up to 5 users', '3,000 invoices/year', 'Advanced VAT reports', 'Multi-currency', 'Custom templates', 'API access'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 20
    },
    {
        name: 'Business Lifetime UAE',
        slug: 'lifetime-enterprise-ae',
        description: 'Pay once, use forever for established UAE enterprises',
        price: 2499,
        currency: 'AED',
        billing_period: 'lifetime',
        features: ['Up to 10 users', '10,000 invoices/year', 'White-label invoices', 'Client portal', 'Advanced analytics', 'Dedicated onboarding'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 21
    },

    // 🇺🇸 US & INTERNATIONAL (USD $)
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
        sort_order: 30
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
        sort_order: 31
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
        sort_order: 32
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
        sort_order: 33
    },
    {
        name: 'Pro US',
        slug: 'pro-us',
        description: 'For agencies & consultants needing partial payments and custom branding',
        price: 29,
        currency: 'USD',
        billing_period: 'monthly',
        features: ['Up to 5 users', 'Partial payments', 'Advanced reports', 'Custom invoice branding', 'API access', 'Priority support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 34
    },
    {
        name: 'Pro US Yearly',
        slug: 'pro-us-yearly',
        description: 'Annual Pro plan with maximum savings for global agencies',
        price: 179,
        currency: 'USD',
        billing_period: 'yearly',
        features: ['Everything in Pro US', 'Save $169/yr', 'Priority 24/7 support', 'Custom templates'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 35
    },
    {
        name: 'Business US',
        slug: 'business-us',
        description: 'For established US firms, white-label agencies, and client portals',
        price: 49,
        currency: 'USD',
        billing_period: 'monthly',
        features: ['Up to 10 users', 'White-label invoices', 'Client portal', 'Role-based access', 'Advanced analytics', 'Dedicated onboarding'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 36
    },
    {
        name: 'Business US Yearly',
        slug: 'business-us-yearly',
        description: 'Annual business subscription with white-label and client portal',
        price: 299,
        currency: 'USD',
        billing_period: 'yearly',
        features: ['Everything in Business US', 'Save $289/yr', 'Dedicated account manager', 'White-label branding'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 37
    },
    {
        name: 'Starter Lifetime US',
        slug: 'lifetime-starter-us',
        description: 'One-time investment for lifetime invoicing in USD for freelancers & solo founders',
        price: 149,
        currency: 'USD',
        billing_period: 'lifetime',
        features: ['1 user', '250 invoices / year', 'Sales invoices & estimates', 'Auto tax calculation', 'Email invoices + PDF', 'Standard support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 38
    },
    {
        name: 'Growth Lifetime US',
        slug: 'lifetime-growth-us',
        description: 'One-time investment for small businesses - pay once, use forever',
        price: 249,
        currency: 'USD',
        billing_period: 'lifetime',
        features: ['Up to 3 users', '1,000 invoices / year', 'Recurring invoices', 'Payment reminders', 'Client statements', 'Multi-state tax handling', 'Priority support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: true,
        sort_order: 39
    },
    {
        name: 'Pro Lifetime US',
        slug: 'lifetime-pro-us',
        description: 'One-time investment for agencies & consultants with custom branding',
        price: 399,
        currency: 'USD',
        billing_period: 'lifetime',
        features: ['Up to 5 users', '3,000 invoices / year', 'Partial payments', 'Advanced reports', 'Custom invoice branding', 'API access', 'Priority support'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 40
    },
    {
        name: 'Business Lifetime US',
        slug: 'lifetime-business-us',
        description: 'One-time investment for accounting firms and enterprises',
        price: 599,
        currency: 'USD',
        billing_period: 'lifetime',
        features: ['Up to 10 users', '10,000 invoices / year', 'White-label invoices', 'Client portal', 'Role-based access', 'Advanced analytics', 'Dedicated onboarding'],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 41
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

        const plans = (data || []) as SubscriptionPlan[]

        // Auto-heal legacy rates mismatch to official prices (Starter ₹2999, Professional ₹4999, Enterprise ₹10999)
        // so that Super Admin view always matches the official pricing
        let needsRevalidate = false
        for (const p of plans) {
            if (p.slug === 'starter' && (Number(p.price) === 299 || Number(p.price) === 499)) {
                await supabase.from('subscription_plans').update({ price: 2999 }).eq('id', p.id)
                p.price = 2999
                needsRevalidate = true
            }
            if (p.slug === 'professional' && (Number(p.price) === 599 || Number(p.price) === 999)) {
                await supabase.from('subscription_plans').update({ price: 4999 }).eq('id', p.id)
                p.price = 4999
                needsRevalidate = true
            }
            if (p.slug === 'enterprise' && (Number(p.price) === 999 || Number(p.price) === 2999)) {
                await supabase.from('subscription_plans').update({ price: 10999 }).eq('id', p.id)
                p.price = 10999
                needsRevalidate = true
            }
        }

        // Auto-seed any missing standard regional plans so Super Admin can manage every tier
        for (const stdPlan of STANDARD_REGIONAL_PLANS) {
            if (currency && currency !== 'all' && stdPlan.currency !== currency.toUpperCase()) {
                continue
            }
            const exists = plans.some(p => p.slug === stdPlan.slug)
            if (!exists) {
                try {
                    const { data: inserted } = await supabase
                        .from('subscription_plans')
                        .insert({
                            name: stdPlan.name,
                            slug: stdPlan.slug,
                            description: stdPlan.description || '',
                            price: stdPlan.price,
                            currency: stdPlan.currency,
                            billing_period: stdPlan.billing_period,
                            features: stdPlan.features || [],
                            limits: stdPlan.limits || {},
                            is_active: stdPlan.is_active ?? true,
                            is_popular: !!stdPlan.is_popular,
                            sort_order: stdPlan.sort_order || 99,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select()
                        .single()

                    if (inserted) {
                        plans.push(inserted as SubscriptionPlan)
                        needsRevalidate = true
                    }
                } catch (err) {
                    console.warn(`Could not auto-insert missing plan ${stdPlan.slug}:`, err)
                }
            }
        }

        if (needsRevalidate) {
            revalidateAllPricingRoutes()
        }

        return plans
    } catch (error) {
        console.error('Fatal error in getAllPlans:', error)
        return []
    }
}

export async function revalidateAllPricingRoutes() {
    revalidatePath('/admin/plans')
    revalidatePath('/')
    revalidatePath('/pricing')
    revalidatePath('/ae')
    revalidatePath('/ae/pricing')
    revalidatePath('/us')
    revalidatePath('/us/pricing')
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

        revalidateAllPricingRoutes()
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

        revalidateAllPricingRoutes()
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
        revalidateAllPricingRoutes()
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
        revalidateAllPricingRoutes()
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
            
            revalidateAllPricingRoutes()
            return { success: true, message: `Plan has ${count} existing subscriber(s). It has been deactivated instead of permanently deleted.` }
        }

        const { error } = await supabase
            .from('subscription_plans')
            .delete()
            .eq('id', id)

        if (error) throw error

        await createAuditLog('subscription_plan_deleted', 'plan', id)
        revalidateAllPricingRoutes()
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

        let updatedCount = 0
        let insertedCount = 0

        for (const plan of STANDARD_REGIONAL_PLANS) {
            const { data: existing } = await supabase
                .from('subscription_plans')
                .select('id, price, name')
                .eq('slug', plan.slug)
                .single()

            if (existing) {
                // Update to standard official rates and features
                await supabase
                    .from('subscription_plans')
                    .update({
                        name: plan.name,
                        price: plan.price,
                        currency: plan.currency,
                        description: plan.description,
                        billing_period: plan.billing_period,
                        features: plan.features,
                        limits: plan.limits,
                        is_active: plan.is_active,
                        is_popular: plan.is_popular,
                        sort_order: plan.sort_order,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                updatedCount++
            } else {
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
                insertedCount++
            }
        }

        revalidateAllPricingRoutes()

        return { 
            success: true, 
            message: `Synchronized ${updatedCount} plan(s) and ensured all ${insertedCount} regional and lifetime tiers are active!` 
        }
    } catch (error) {
        console.error('Error seeding regional plans:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to seed plans' }
    }
}
