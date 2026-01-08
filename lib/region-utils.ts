'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export type Region = 'IN' | 'AE'

export interface RegionalSettings {
    region: Region
    currency: string
    taxType: 'GST' | 'VAT'
    taxLabel: string
    taxIdLabel: string
    taxRate: number
    showHsnSac: boolean
    showGstBreakdown: boolean
    showArabic: boolean
    dateFormat: string
    numberFormat: string
}

const REGIONAL_DEFAULTS: Record<Region, RegionalSettings> = {
    IN: {
        region: 'IN',
        currency: 'INR',
        taxType: 'GST',
        taxLabel: 'GST',
        taxIdLabel: 'GSTIN',
        taxRate: 18,
        showHsnSac: true,
        showGstBreakdown: true,
        showArabic: false,
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'en-IN'
    },
    AE: {
        region: 'AE',
        currency: 'AED',
        taxType: 'VAT',
        taxLabel: 'VAT',
        taxIdLabel: 'TRN',
        taxRate: 5,
        showHsnSac: false,
        showGstBreakdown: false,
        showArabic: true,
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'en-AE'
    }
}

/**
 * Get user's region from database or detect from geo-location
 */
export async function getUserRegion(): Promise<Region> {
    try {
        const supabase = await createClient()
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            // Fallback to cookie-based region detection
            return await getRegionFromCookie()
        }

        // Check user profile for saved region
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('region')
            .eq('id', user.id)
            .single()

        if (profile?.region) {
            return profile.region as Region
        }

        // Detect from cookie or default to India
        return await getRegionFromCookie()
    } catch (error) {
        console.error('Error getting user region:', error)
        return 'IN' // Default to India
    }
}

/**
 * Get region from cookie (set by proxy.ts geo-detection)
 */
async function getRegionFromCookie(): Promise<Region> {
    try {
        const cookieStore = await cookies()
        const regionCookie = cookieStore.get('region-preference')
        
        if (regionCookie?.value === 'ae') {
            return 'AE'
        }
        
        return 'IN'
    } catch {
        return 'IN'
    }
}

/**
 * Get regional settings for user
 */
export async function getRegionalSettings(): Promise<RegionalSettings> {
    const region = await getUserRegion()
    return REGIONAL_DEFAULTS[region]
}

/**
 * Update user's region in database
 */
export async function updateUserRegion(region: Region): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Update user profile
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ region })
            .eq('id', user.id)

        if (updateError) {
            console.error('Error updating region:', updateError)
            return { success: false, error: updateError.message }
        }

        // Also set cookie for immediate effect
        const cookieStore = await cookies()
        cookieStore.set('region-preference', region === 'AE' ? 'ae' : 'in', {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: '/'
        })

        return { success: true }
    } catch (error) {
        console.error('Error in updateUserRegion:', error)
        return { success: false, error: 'Failed to update region' }
    }
}

/**
 * Format currency based on region
 */
export function formatCurrency(amount: number, region?: Region): string {
    const settings = REGIONAL_DEFAULTS[region || 'IN']
    
    const formatter = new Intl.NumberFormat(settings.numberFormat, {
        style: 'currency',
        currency: settings.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
    
    return formatter.format(amount)
}

/**
 * Get tax label for region
 */
export function getTaxLabel(region?: Region): string {
    const settings = REGIONAL_DEFAULTS[region || 'IN']
    return settings.taxLabel
}

/**
 * Get tax ID label for region
 */
export function getTaxIdLabel(region?: Region): string {
    const settings = REGIONAL_DEFAULTS[region || 'IN']
    return settings.taxIdLabel
}

/**
 * Check if region uses HSN/SAC codes
 */
export function shouldShowHsnSac(region?: Region): boolean {
    const settings = REGIONAL_DEFAULTS[region || 'IN']
    return settings.showHsnSac
}

/**
 * Check if region uses GST breakdown (CGST/SGST/IGST)
 */
export function shouldShowGstBreakdown(region?: Region): boolean {
    const settings = REGIONAL_DEFAULTS[region || 'IN']
    return settings.showGstBreakdown
}

/**
 * Check if region supports Arabic
 */
export function shouldShowArabic(region?: Region): boolean {
    const settings = REGIONAL_DEFAULTS[region || 'IN']
    return settings.showArabic
}

/**
 * Get default tax rate for region
 */
export function getDefaultTaxRate(region?: Region): number {
    const settings = REGIONAL_DEFAULTS[region || 'IN']
    return settings.taxRate
}

/**
 * Initialize regional settings for new user
 */
export async function initializeRegionalSettings(): Promise<void> {
    try {
        const supabase = await createClient()
        const region = await getUserRegion()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) return

        // Update user profile with detected region
        await supabase
            .from('user_profiles')
            .update({ region })
            .eq('id', user.id)

        // Initialize invoice settings with regional defaults
        const settings = REGIONAL_DEFAULTS[region]
        
        const { data: existingSettings } = await supabase
            .from('invoice_settings')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!existingSettings) {
            await supabase
                .from('invoice_settings')
                .insert({
                    user_id: user.id,
                    show_hsn_sac: settings.showHsnSac,
                    show_gst_breakdown: settings.showGstBreakdown,
                    show_arabic: settings.showArabic,
                    tax_label: settings.taxLabel,
                    tax_id_label: settings.taxIdLabel
                })
        }
    } catch (error) {
        console.error('Error initializing regional settings:', error)
    }
}
