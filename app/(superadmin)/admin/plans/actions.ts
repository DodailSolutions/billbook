'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess } from '../actions'

export async function getAllPlans() {
    const supabase = await createClient()
    
    // Check super admin access
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) {
        return []
    }

    try {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching plans:', error)
        return []
    }
}
