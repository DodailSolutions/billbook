'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

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
            // If coupons table doesn't exist, return empty array
            console.log('Coupons table may not exist:', error.message)
            return []
        }
        return data || []
    } catch (error) {
        console.error('Error fetching coupons:', error)
        return []
    }
}
