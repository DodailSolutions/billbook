'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import type { UserWithDetails } from '@/lib/types-admin'

export async function getAllUsers(): Promise<UserWithDetails[]> {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return []
        }

        const supabase = await createClient()

        // Get user profiles with auth users
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select(`
                *,
                user_subscriptions (
                    id,
                    status,
                    plan_id,
                    subscription_plans (name, price)
                )
            `)
            .order('created_at', { ascending: false })

        if (!profiles) return []

        // Get user emails from auth.users (requires admin access)
        const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()

        // Merge data
        const usersWithDetails: UserWithDetails[] = profiles.map(profile => {
            const authUser = authUsers?.find(u => u.id === profile.id)
            const subscription = profile.user_subscriptions?.[0]

            return {
                ...profile,
                email: authUser?.email,
                subscription: subscription as any
            }
        })

        return usersWithDetails
    } catch (error) {
        console.error('Error fetching users:', error)
        return []
    }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'inactive') {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            throw new Error('Unauthorized')
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('user_profiles')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', userId)

        if (error) throw error

        await createAuditLog('user_status_updated', 'user', userId, { status })
        
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Error updating user status:', error)
        throw error
    }
}

export async function updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin') {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            throw new Error('Unauthorized')
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('user_profiles')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId)

        if (error) throw error

        await createAuditLog('user_role_updated', 'user', userId, { role })
        
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Error updating user role:', error)
        throw error
    }
}

export async function searchUsers(query: string) {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return []
        }

        const supabase = await createClient()

        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .or(`business_name.ilike.%${query}%,business_id.ilike.%${query}%`)
            .limit(50)

        return data || []
    } catch (error) {
        console.error('Error searching users:', error)
        return []
    }
}
