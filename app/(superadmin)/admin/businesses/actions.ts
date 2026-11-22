'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import type { BusinessType } from '@/lib/business-profile-types'

export async function getAllBusinesses() {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return []
        }

        const supabase = await createClient()

        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .not('business_name', 'is', null)
            .order('created_at', { ascending: false })

        return data || []
    } catch (error) {
        console.error('Error fetching businesses:', error)
        return []
    }
}

export async function updateBusinessCategory(businessId: string, businessType: BusinessType) {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            throw new Error('Unauthorized')
        }

        let dataClient = await createClient()
        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                dataClient = await createAdminClient()
            }
        } catch (e) {
            console.warn('[updateBusinessCategory] Admin client fallback:', e)
        }

        const { error } = await dataClient
            .from('user_profiles')
            .update({ 
                business_type: businessType, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', businessId)

        if (error) throw error

        await createAuditLog('business_category_updated', 'user', businessId, { business_type: businessType })

        revalidatePath('/admin/businesses')
        revalidatePath('/admin/users')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error('Error updating business category:', error)
        throw error
    }
}
