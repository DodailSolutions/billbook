'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import type { UserWithDetails, UserSubscription } from '@/lib/types-admin'

export async function getAllUsers(): Promise<UserWithDetails[]> {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            console.log('User is not super admin')
            return []
        }

        const supabase = await createClient()

        // Get user profiles with auth users
        const { data: profiles, error: profilesError } = await supabase
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

        if (profilesError) {
            console.error('Error fetching user profiles:', profilesError)
            return []
        }

        if (!profiles) return []

        // Try to get user emails from auth.users (requires admin access)
        // If this fails, we'll return profiles without emails
        let authUsers: any[] = []
        
        try {
            const authResponse = await supabase.auth.admin.listUsers()
            if (authResponse.data?.users) {
                authUsers = authResponse.data.users
            }
        } catch (authError) {
            console.error('Could not fetch auth users (continuing without emails):', authError)
        }

        // Merge data - works with or without auth users
        const usersWithDetails: UserWithDetails[] = profiles.map(profile => {
            const authUser = authUsers.find(u => u.id === profile.id)
            const subscription = profile.user_subscriptions?.[0]

            return {
                ...profile,
                email: authUser?.email || profile.business_email || 'Email not available',
                subscription: subscription as UserSubscription | undefined
            }
        })

        return usersWithDetails
    } catch (error) {
        console.error('Error in getAllUsers:', error)
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
