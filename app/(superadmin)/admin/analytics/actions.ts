'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { fetchEmployeeLookupMaps, isEmployeeRecord } from '@/lib/admin-employee-utils'

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
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return []
        }

        let supabase = await createClient()
        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                supabase = await createAdminClient()
            }
        } catch {
            // Fallback to standard client
        }

        const [{ data, error }, empMaps] = await Promise.all([
            supabase
                .from('user_profiles')
                .select(`
                    id,
                    role,
                    business_name,
                    owner_name,
                    business_email,
                    business_phone,
                    status,
                    created_at
                `)
                .eq('business_type', businessType)
                .order('created_at', { ascending: false }),
            fetchEmployeeLookupMaps(supabase)
        ])

        if (error) {
            console.error('Error fetching users by business type:', error)
            return []
        }

        return (data || []).filter((u: any) => !isEmployeeRecord(u, empMaps))
    } catch (error) {
        console.error('Exception fetching users:', error)
        return []
    }
}
