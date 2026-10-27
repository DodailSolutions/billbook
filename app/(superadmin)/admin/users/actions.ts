'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import type { UserWithDetails, UserSubscription } from '@/lib/types-admin'

export async function getAllUsers(): Promise<UserWithDetails[]> {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            console.warn('[getAllUsers] Caller is not a verified super admin')
            return []
        }

        const supabase = await createClient()

        // 1. Fetch user profiles safely
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (profilesError) {
            console.error('[getAllUsers] Error fetching user_profiles:', profilesError)
            return []
        }

        if (!profiles || profiles.length === 0) {
            return []
        }

        // 2. Fetch user subscriptions separately to avoid PostgREST nested join failures
        const subscriptionsByUser: Record<string, UserSubscription> = {}
        try {
            const { data: subs, error: subsError } = await supabase
                .from('user_subscriptions')
                .select(`
                    id,
                    user_id,
                    status,
                    plan_id,
                    start_date,
                    end_date,
                    amount_paid,
                    currency,
                    created_at,
                    updated_at,
                    subscription_plans (
                        id,
                        name,
                        price,
                        slug,
                        billing_period
                    )
                `)

            if (!subsError && subs && Array.isArray(subs)) {
                subs.forEach((sub: any) => {
                    const planObj = Array.isArray(sub.subscription_plans)
                        ? sub.subscription_plans[0]
                        : sub.subscription_plans

                    // Prioritize active subscription if multiple exist
                    if (!subscriptionsByUser[sub.user_id] || sub.status === 'active') {
                        subscriptionsByUser[sub.user_id] = {
                            id: sub.id,
                            user_id: sub.user_id,
                            plan_id: sub.plan_id,
                            status: sub.status,
                            start_date: sub.start_date,
                            end_date: sub.end_date,
                            auto_renew: !!sub.auto_renew,
                            currency: sub.currency || 'INR',
                            amount_paid: sub.amount_paid,
                            created_at: sub.created_at,
                            updated_at: sub.updated_at,
                            plan: planObj || undefined
                        }
                    }
                })
            }
        } catch (subErr) {
            console.warn('[getAllUsers] Non-fatal: could not fetch user_subscriptions:', subErr)
        }

        // 3. Try to fetch auth user emails via Admin Client (service role)
        const authEmailMap: Record<string, string> = {}
        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                const adminClient = await createAdminClient()
                if (adminClient?.auth?.admin?.listUsers) {
                    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
                        perPage: 1000
                    })
                    if (!authError && authData?.users) {
                        authData.users.forEach(u => {
                            if (u.id && u.email) {
                                authEmailMap[u.id] = u.email
                            }
                        })
                    }
                }
            }
        } catch (authErr) {
            console.warn('[getAllUsers] Non-fatal: could not fetch auth.users (falling back to profile emails):', authErr)
        }

        // 4. Merge data safely with defensive fallbacks
        const usersWithDetails: UserWithDetails[] = profiles.map(profile => {
            const email = authEmailMap[profile.id] || profile.business_email || profile.email || 'Email not available'
            const subscription = subscriptionsByUser[profile.id]

            return {
                ...profile,
                email,
                role: profile.role || 'user',
                status: profile.status || 'active',
                created_at: profile.created_at || new Date().toISOString(),
                subscription
            }
        })

        return usersWithDetails
    } catch (error) {
        console.error('[getAllUsers] Fatal error prevented:', error)
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

export async function deleteUser(userId: string) {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            throw new Error('Unauthorized')
        }

        const supabase = await createClient()

        // 1. Mark as inactive or suspended in user_profiles
        const { error } = await supabase
            .from('user_profiles')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', userId)

        if (error) throw error

        await createAuditLog('user_deactivated', 'user', userId, { status: 'inactive' })
        
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Error deactivating user:', error)
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

        const cleanQuery = query.trim()
        if (!cleanQuery) {
            return getAllUsers()
        }

        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .or(`business_name.ilike.%${cleanQuery}%,business_id.ilike.%${cleanQuery}%,owner_name.ilike.%${cleanQuery}%`)
            .limit(50)

        return data || []
    } catch (error) {
        console.error('Error searching users:', error)
        return []
    }
}
