'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { BusinessType } from './business-profile-types'
import { BUSINESS_VERTICALS } from './business-profile-types'
import { INDUSTRY_CATALOG_PRESETS } from './industry-catalog-presets'

/**
 * Get active business vertical and configuration for current organization
 */
export async function getBusinessProfile(): Promise<{
    businessType: BusinessType
    metadata: Record<string, any>
    config: typeof BUSINESS_VERTICALS[BusinessType]
}> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return {
                businessType: 'standard',
                metadata: {},
                config: BUSINESS_VERTICALS.standard
            }
        }

        const { data } = await supabase
            .from('invoice_settings')
            .select('business_type, business_metadata')
            .eq('user_id', user.id)
            .maybeSingle()

        const rawType = (data?.business_type as BusinessType) || 'standard'
        const validProfile = BUSINESS_VERTICALS[rawType] ? rawType : 'standard'

        return {
            businessType: validProfile,
            metadata: data?.business_metadata || {},
            config: BUSINESS_VERTICALS[validProfile]
        }
    } catch {
        return {
            businessType: 'standard',
            metadata: {},
            config: BUSINESS_VERTICALS.standard
        }
    }
}

/**
 * Switch or update business vertical and seed starter items if catalog is empty
 */
export async function updateBusinessProfile(
    businessType: BusinessType,
    metadata?: Record<string, any>,
    seedStarterItems = true
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return { success: false, error: 'Unauthorized' }

        // Security check: Switching industry vertical is strictly restricted to Super Admin
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

        if (profile?.role !== 'superadmin') {
            return { 
                success: false, 
                error: 'Interactive industry switching is restricted to Super Administrators. Users select their vertical during registration.' 
            }
        }

        // Update invoice_settings
        const { error: settingsError } = await supabase
            .from('invoice_settings')
            .upsert({
                user_id: user.id,
                business_type: businessType,
                business_metadata: metadata || {},
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (settingsError) {
            console.error('Error updating business profile in settings:', settingsError)
            return { success: false, error: settingsError.message }
        }

        // Also update user_profiles
        try {
            await supabase
                .from('user_profiles')
                .update({
                    business_type: businessType,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
        } catch {
            // non-blocking
        }

        // Optionally seed industry starter catalog if user has 0 items
        if (seedStarterItems) {
            const { count } = await supabase
                .from('saved_items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            if (!count || count === 0) {
                const presets = INDUSTRY_CATALOG_PRESETS[businessType] || []
                if (presets.length > 0) {
                    const toInsert = presets.map(p => ({
                        user_id: user.id,
                        name: p.name,
                        unit_price: p.unit_price,
                        gst_rate: p.gst_rate,
                        hsn_sac_code: p.hsn_sac_code || null,
                        description: p.description || p.name
                    }))

                    await supabase.from('saved_items').insert(toInsert)
                }
            }
        }

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (err: any) {
        console.error('Failed to update business profile:', err)
        return { success: false, error: err?.message || 'Update failed' }
    }
}

/**
 * Staff / Stylist Commission Engine
 */
export async function getStaffSplits(businessType?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase
        .from('staff_revenue_splits')
        .select('*')
        .eq('user_id', user.id)

    if (businessType) query = query.eq('business_type', businessType)

    const { data } = await query.order('created_at', { ascending: false })
    return data || []
}

export async function saveStaffSplit(input: {
    id?: string
    staffMemberId: string
    staffName: string
    businessType: BusinessType
    serviceCommissionPercent: number
    retailCommissionPercent?: number
    chairRentDaily?: number
    fixedStipend?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const payload = {
        user_id: user.id,
        staff_member_id: input.staffMemberId,
        staff_name: input.staffName,
        business_type: input.businessType,
        service_commission_percent: input.serviceCommissionPercent,
        retail_commission_percent: input.retailCommissionPercent ?? 10.00,
        chair_rent_daily: input.chairRentDaily ?? 0,
        fixed_stipend: input.fixedStipend ?? 0,
        updated_at: new Date().toISOString()
    }

    if (input.id) {
        const { error } = await supabase
            .from('staff_revenue_splits')
            .update(payload)
            .eq('id', input.id)
            .eq('user_id', user.id)
        if (error) return { success: false, error: error.message }
    } else {
        const { error } = await supabase
            .from('staff_revenue_splits')
            .insert(payload)
        if (error) return { success: false, error: error.message }
    }

    revalidatePath('/team')
    return { success: true }
}

/**
 * PMS Units & Stays (Resorts, Farmhouses, Camping)
 */
export async function getPmsUnits() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('pms_units')
        .select('*')
        .eq('user_id', user.id)
        .order('unit_number', { ascending: true })

    return data || []
}

export async function updatePmsUnitStatus(unitId: string, status: 'open' | 'occupied' | 'cleaning' | 'maintenance') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('pms_units')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', unitId)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/hospitality/pms')
    return { success: true }
}
