'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

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
