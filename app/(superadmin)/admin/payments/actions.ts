'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess } from '../actions'

export async function getAllPayments() {
    const supabase = await createClient()
    
    // Check super admin access
    const hasAccess = await checkSuperAdminAccess()
    if (!hasAccess) {
        return []
    }

    try {
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans(
                    id,
                    name,
                    price
                )
            `)
            .not('amount_paid', 'is', null)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching payments:', error)
        return []
    }
}
