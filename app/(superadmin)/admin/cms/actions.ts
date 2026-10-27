'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export interface RegionalCMSData {
    region: 'IN' | 'AE' | 'US'
    announcement: {
        enabled: boolean
        message: string
        linkText?: string
        linkUrl?: string
        theme: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'
    }
    hero: {
        badge: string
        headline: string
        subheadline: string
        primaryButtonText: string
        primaryButtonUrl: string
        secondaryButtonText: string
        secondaryButtonUrl: string
    }
    contact: {
        supportEmail: string
        supportPhone: string
        whatsappNumber?: string
        officeAddress: string
        operatingHours: string
    }
    faqs: Array<{
        id: string
        question: string
        answer: string
        category?: string
        is_active: boolean
    }>
}

export interface SubdomainConfig {
    subdomains: Array<{
        subdomain: string
        targetRegion: 'IN' | 'AE' | 'US'
        label: string
        targetPath: string
        isActive: boolean
        dnsStatus: 'active' | 'pending' | 'configured'
    }>
    autoDetectGeo: boolean
    enforceSubdomains: boolean
}

// Default Content Templates per Region
export const DEFAULT_REGIONAL_CONTENT: Record<string, RegionalCMSData> = {
    IN: {
        region: 'IN',
        announcement: {
            enabled: true,
            message: '🎉 GST 2.0 Ready! Unlimited invoicing with automated GSTR reports & e-Way bill.',
            linkText: 'Explore Features',
            linkUrl: '/features',
            theme: 'blue'
        },
        hero: {
            badge: '🇮🇳 India’s Most Loved Billing & GST Invoicing Platform',
            headline: 'Create Professional GST Invoices in Less Than 10 Seconds',
            subheadline: 'Effortless invoicing, automated WhatsApp dispatch, payment links, and real-time GST reports designed specifically for Indian small businesses and freelancers.',
            primaryButtonText: 'Start Invoicing for Free',
            primaryButtonUrl: '/signup',
            secondaryButtonText: 'View Indian Pricing (₹)',
            secondaryButtonUrl: '/pricing'
        },
        contact: {
            supportEmail: 'support@dodail.com',
            supportPhone: '+91 98765 43210',
            whatsappNumber: '+91 98765 43210',
            officeAddress: 'Cyber Gateway, Hitech City, Hyderabad, Telangana, India',
            operatingHours: 'Mon - Sat: 9:00 AM - 7:00 PM IST'
        },
        faqs: [
            {
                id: 'faq-in-1',
                question: 'Is BillBooky 100% compliant with Indian GST laws?',
                answer: 'Yes! BillBooky generates CGST, SGST, IGST, and HSN/SAC compliant invoices. You can export GSTR-1, GSTR-3B summaries and e-Way bills in one click.',
                category: 'GST & Compliance',
                is_active: true
            },
            {
                id: 'faq-in-2',
                question: 'Can I share invoices directly to my client on WhatsApp?',
                answer: 'Yes, you can send automated WhatsApp notifications with secure PDF download links and Razorpay/UPI payment collection.',
                category: 'Features',
                is_active: true
            },
            {
                id: 'faq-in-3',
                question: 'What happens after the 50 free invoices?',
                answer: 'You can upgrade anytime to Starter at ₹299/month, or claim our Lifetime Founder Deal for ₹9,999 with zero recurring fees forever.',
                category: 'Pricing',
                is_active: true
            }
        ]
    },
    AE: {
        region: 'AE',
        announcement: {
            enabled: true,
            message: '🇦🇪 FTA Approved: Bilingual Arabic & English Invoicing with 5% VAT & Corporate Tax ready.',
            linkText: 'Learn More',
            linkUrl: '/ae',
            theme: 'emerald'
        },
        hero: {
            badge: '🇦🇪 Bilingual E-Invoicing Compliant with UAE Federal Tax Authority',
            headline: 'Fast, Bilingual VAT Invoicing for UAE & Middle East Businesses',
            subheadline: 'Generate bilingual Arabic and English tax invoices with TRN validation, 5% UAE VAT calculations, multi-currency support (AED, USD, EUR), and corporate tax records.',
            primaryButtonText: 'Start Free UAE Invoicing',
            primaryButtonUrl: '/signup?region=ae',
            secondaryButtonText: 'Explore UAE Plans (AED)',
            secondaryButtonUrl: '/ae/pricing'
        },
        contact: {
            supportEmail: 'support@dodail.com',
            supportPhone: '+971 4 123 4567',
            whatsappNumber: '+971 50 123 4567',
            officeAddress: 'Downtown Dubai, Sheikh Zayed Road, Dubai, United Arab Emirates',
            operatingHours: 'Sun - Thu: 9:00 AM - 6:00 PM GST'
        },
        faqs: [
            {
                id: 'faq-ae-1',
                question: 'Are invoices bilingual in Arabic and English?',
                answer: 'Yes, all tax invoices comply with UAE FTA guidelines and include side-by-side Arabic and English translations, QR codes, and TRN numbers.',
                category: 'FTA Compliance',
                is_active: true
            },
            {
                id: 'faq-ae-2',
                question: 'Does BillBooky support 5% UAE VAT and 0% exports?',
                answer: 'Yes, standard 5% VAT, zero-rated exports, and exempt supplies are fully supported with automated tax summary reports.',
                category: 'Tax & VAT',
                is_active: true
            },
            {
                id: 'faq-ae-3',
                question: 'Can I invoice in AED, USD, and EUR?',
                answer: 'Yes, BillBooky features multi-currency invoicing with real-time conversion rates into AED for UAE tax declaration.',
                category: 'Currency',
                is_active: true
            }
        ]
    },
    US: {
        region: 'US',
        announcement: {
            enabled: true,
            message: '🌐 International Invoicing in USD: Multi-state sales tax, estimates, and automated reminders.',
            linkText: 'View Global Plans',
            linkUrl: '/us/pricing',
            theme: 'purple'
        },
        hero: {
            badge: '🇺🇸 / 🌐 Global Invoicing Built for Freelancers, Agencies & Startups',
            headline: 'Simple, Beautiful Invoicing in USD with Automated Sales Tax',
            subheadline: 'Send client estimates, recurring retainers, and professional invoices worldwide. Accept online payments via credit card, Stripe, and wire transfer with real-time aging tracking.',
            primaryButtonText: 'Try BillBooky Free',
            primaryButtonUrl: '/signup?region=us',
            secondaryButtonText: 'View USD Pricing ($)',
            secondaryButtonUrl: '/us/pricing'
        },
        contact: {
            supportEmail: 'support@dodail.com',
            supportPhone: '+1 (555) 019-2834',
            whatsappNumber: '+1 (555) 019-2834',
            officeAddress: 'Market Street, Suite 400, San Francisco, CA 94103, USA',
            operatingHours: 'Mon - Fri: 8:00 AM - 6:00 PM PST'
        },
        faqs: [
            {
                id: 'faq-us-1',
                question: 'Can I calculate US state sales taxes dynamically?',
                answer: 'Yes, you can configure state and local sales tax rules or apply standard tax overrides per line item.',
                category: 'Sales Tax',
                is_active: true
            },
            {
                id: 'faq-us-2',
                question: 'Can international clients pay in USD via Credit Card?',
                answer: 'Yes, clients can pay online through your integrated payment links with instant receipt generation.',
                category: 'Payments',
                is_active: true
            },
            {
                id: 'faq-us-3',
                question: 'Is there a Lifetime Deal available in USD?',
                answer: 'Yes, our Starter Lifetime plan is available for a one-time payment of $149 with zero monthly charges.',
                category: 'Deals',
                is_active: true
            }
        ]
    }
}

export const DEFAULT_SUBDOMAINS: SubdomainConfig = {
    subdomains: [
        {
            subdomain: 'billbooky.dodail.com',
            targetRegion: 'IN',
            label: 'Main / India Gateway',
            targetPath: '/',
            isActive: true,
            dnsStatus: 'active'
        },
        {
            subdomain: 'ae.billbooky.dodail.com',
            targetRegion: 'AE',
            label: 'UAE & Middle East Subdomain',
            targetPath: '/ae',
            isActive: true,
            dnsStatus: 'configured'
        },
        {
            subdomain: 'us.billbooky.dodail.com',
            targetRegion: 'US',
            label: 'US & Global Subdomain',
            targetPath: '/us',
            isActive: true,
            dnsStatus: 'configured'
        },
        {
            subdomain: 'app.billbooky.dodail.com',
            targetRegion: 'IN',
            label: 'Client Dashboard Portal',
            targetPath: '/dashboard',
            isActive: true,
            dnsStatus: 'configured'
        }
    ],
    autoDetectGeo: true,
    enforceSubdomains: true
}

export async function getRegionalCMS(region: 'IN' | 'AE' | 'US'): Promise<RegionalCMSData> {
    try {
        const supabase = await createClient()
        const key = `cms_region_${region.toLowerCase()}`

        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', key)
            .single()

        if (error || !data?.value) {
            return DEFAULT_REGIONAL_CONTENT[region] || DEFAULT_REGIONAL_CONTENT.IN
        }

        return {
            ...DEFAULT_REGIONAL_CONTENT[region],
            ...(data.value as Partial<RegionalCMSData>)
        }
    } catch (err) {
        console.warn(`[getRegionalCMS] Using default template for ${region}:`, err)
        return DEFAULT_REGIONAL_CONTENT[region] || DEFAULT_REGIONAL_CONTENT.IN
    }
}

export async function getAllRegionalCMS(): Promise<Record<string, RegionalCMSData>> {
    const [inData, aeData, usData] = await Promise.all([
        getRegionalCMS('IN'),
        getRegionalCMS('AE'),
        getRegionalCMS('US')
    ])

    return {
        IN: inData,
        AE: aeData,
        US: usData
    }
}

export async function saveRegionalCMS(region: 'IN' | 'AE' | 'US', content: RegionalCMSData) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) throw new Error('Unauthorized')

        const supabase = await createClient()
        const key = `cms_region_${region.toLowerCase()}`

        const { data: existing } = await supabase
            .from('system_settings')
            .select('id')
            .eq('key', key)
            .single()

        if (existing?.id) {
            const { error } = await supabase
                .from('system_settings')
                .update({
                    value: content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)

            if (error) throw error
        } else {
            const { error } = await supabase
                .from('system_settings')
                .insert({
                    key,
                    value: content,
                    description: `Regional CMS and landing content for ${region}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
        }

        await createAuditLog('cms_content_updated', 'cms', undefined, { region })

        revalidatePath('/admin/cms')
        revalidatePath('/')
        revalidatePath('/ae')
        revalidatePath('/us')
        revalidatePath('/pricing')
        revalidatePath('/ae/pricing')
        revalidatePath('/us/pricing')

        return { success: true }
    } catch (error) {
        console.error('Error saving regional CMS:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to save content' }
    }
}

export async function getSubdomainConfig(): Promise<SubdomainConfig> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'cms_subdomain_routing')
            .single()

        if (error || !data?.value) {
            return DEFAULT_SUBDOMAINS
        }

        return data.value as SubdomainConfig
    } catch (err) {
        console.warn('[getSubdomainConfig] Using default subdomains:', err)
        return DEFAULT_SUBDOMAINS
    }
}

export async function saveSubdomainConfig(config: SubdomainConfig) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) throw new Error('Unauthorized')

        const supabase = await createClient()
        const key = 'cms_subdomain_routing'

        const { data: existing } = await supabase
            .from('system_settings')
            .select('id')
            .eq('key', key)
            .single()

        if (existing?.id) {
            const { error } = await supabase
                .from('system_settings')
                .update({
                    value: config,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)

            if (error) throw error
        } else {
            const { error } = await supabase
                .from('system_settings')
                .insert({
                    key,
                    value: config,
                    description: 'Subdomain and regional gateway routing configuration',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
        }

        await createAuditLog('subdomain_routing_updated', 'system_settings')

        revalidatePath('/admin/cms')
        return { success: true }
    } catch (error) {
        console.error('Error saving subdomain routing config:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to save routing config' }
    }
}
