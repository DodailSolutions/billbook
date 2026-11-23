'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

export interface CouponInput {
    code: string
    description?: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    currency?: string
    max_uses?: number | null
    min_purchase_amount?: number | null
    valid_from?: string
    valid_until?: string | null
    is_active?: boolean
}

export async function getAllCoupons() {
    const supabase = await createClient()
    
    // Check super admin access
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) {
        return []
    }

    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.log('Coupons table may not exist or error:', error.message)
            return []
        }
        return data || []
    } catch (error) {
        console.error('Error fetching coupons:', error)
        return []
    }
}

export async function createCoupon(coupon: CouponInput) {
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const cleanCode = coupon.code.trim().toUpperCase()
    if (!cleanCode) throw new Error('Coupon code is required')

    const newRecord = {
        code: cleanCode,
        description: coupon.description?.trim() || null,
        discount_type: coupon.discount_type || 'percentage',
        discount_value: Number(coupon.discount_value) || 0,
        currency: coupon.currency || 'INR',
        max_uses: coupon.max_uses ? Number(coupon.max_uses) : null,
        min_purchase_amount: coupon.min_purchase_amount ? Number(coupon.min_purchase_amount) : null,
        valid_from: coupon.valid_from || new Date().toISOString(),
        valid_until: coupon.valid_until || null,
        is_active: coupon.is_active ?? true,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('coupons')
        .insert(newRecord)
        .select()
        .single()

    if (error) {
        console.error('Error creating coupon:', error)
        throw new Error(error.message || 'Failed to create coupon')
    }

    try {
        await createAuditLog('create_coupon', 'coupon', data.id, { code: cleanCode, discount_value: newRecord.discount_value })
    } catch (e) {
        console.warn('Audit log write error:', e)
    }

    revalidatePath('/admin/coupons')
    return { success: true, coupon: data }
}

export async function updateCoupon(id: string, coupon: Partial<CouponInput>) {
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) throw new Error('Unauthorized')

    const supabase = await createClient()

    const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString()
    }

    if (coupon.code) updatePayload.code = coupon.code.trim().toUpperCase()
    if (coupon.description !== undefined) updatePayload.description = coupon.description?.trim() || null
    if (coupon.discount_type) updatePayload.discount_type = coupon.discount_type
    if (coupon.discount_value !== undefined) updatePayload.discount_value = Number(coupon.discount_value)
    if (coupon.max_uses !== undefined) updatePayload.max_uses = coupon.max_uses ? Number(coupon.max_uses) : null
    if (coupon.min_purchase_amount !== undefined) updatePayload.min_purchase_amount = coupon.min_purchase_amount ? Number(coupon.min_purchase_amount) : null
    if (coupon.valid_until !== undefined) updatePayload.valid_until = coupon.valid_until || null
    if (coupon.is_active !== undefined) updatePayload.is_active = coupon.is_active

    const { data, error } = await supabase
        .from('coupons')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating coupon:', error)
        throw new Error(error.message || 'Failed to update coupon')
    }

    try {
        await createAuditLog('update_coupon', 'coupon', id, updatePayload)
    } catch (e) {
        console.warn('Audit log write error:', e)
    }

    revalidatePath('/admin/coupons')
    return { success: true, coupon: data }
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { error } = await supabase
        .from('coupons')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        console.error('Error toggling coupon status:', error)
        throw new Error(error.message || 'Failed to toggle coupon status')
    }

    try {
        await createAuditLog('toggle_coupon_status', 'coupon', id, { is_active: isActive })
    } catch (e) {
        console.warn('Audit log write error:', e)
    }

    revalidatePath('/admin/coupons')
    return { success: true }
}

export async function deleteCoupon(id: string) {
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting coupon:', error)
        throw new Error(error.message || 'Failed to delete coupon')
    }

    try {
        await createAuditLog('delete_coupon', 'coupon', id, {})
    } catch (e) {
        console.warn('Audit log write error:', e)
    }

    revalidatePath('/admin/coupons')
    return { success: true }
}
