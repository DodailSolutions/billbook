'use server'

import { createClient } from '@/lib/supabase/server'

export interface BusinessTypeAnalytics {
    business_type: string
    total_users: number
    active_users: number
    paying_users: number
}

export async function getBusinessTypeAnalytics(): Promise<BusinessTypeAnalytics[]> {
    try {
        const supabase = await createClient()
        
        const { data, error } = await supabase
            .from('business_type_analytics')
            .select('*')
            .order('total_users', { ascending: false })

        if (error) {
            console.error('Error fetching business analytics:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Exception fetching business analytics:', error)
        return []
    }
}

export async function getUsersByBusinessType(businessType: string) {
    try {
        const supabase = await createClient()
        
        const { data, error } = await supabase
            .from('user_profiles')
            .select(`
                id,
                business_name,
                owner_name,
                business_email,
                business_phone,
                status,
                created_at
            `)
            .eq('business_type', businessType)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching users by business type:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Exception fetching users:', error)
        return []
    }
}
