'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import type { UserWithDetails, UserSubscription } from '@/lib/types-admin'
import type { BusinessType } from '@/lib/business-profile-types'
import { fetchEmployeeLookupMaps, isEmployeeRole } from '@/lib/admin-employee-utils'

export async function getAllUsers(): Promise<UserWithDetails[]> {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            console.warn('[getAllUsers] Caller is not a verified super admin')
            return []
        }

        // Use service role admin client if available to see all users regardless of RLS
        let dataClient = await createClient()
        let adminClient: any = null
        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                adminClient = await createAdminClient()
                dataClient = adminClient
            }
        } catch (e) {
            console.warn('[getAllUsers] Admin client unavailable, using standard client:', e)
        }

        // 1. Fetch user profiles safely
        const { data: profiles, error: profilesError } = await dataClient
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (profilesError) {
            console.error('[getAllUsers] Error fetching user_profiles:', profilesError)
        }

        const profileList = profiles || []
        const profileMap = new Map<string, any>()
        profileList.forEach((p: any) => {
            if (p.id) profileMap.set(p.id, p)
        })

        // 2. Fetch user subscriptions separately to avoid PostgREST nested join failures
        const subscriptionsByUser: Record<string, UserSubscription> = {}
        try {
            const { data: subs, error: subsError } = await dataClient
                .from('user_subscriptions')
                .select(`
                    id,
                    user_id,
                    status,
                    plan_id,
                    start_date,
                    end_date,
                    trial_ends_at,
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

                    // Prioritize trial or active subscription
                    const existing = subscriptionsByUser[sub.user_id]
                    if (!existing || sub.status === 'active' || (sub.status === 'trial' && existing.status !== 'active')) {
                        subscriptionsByUser[sub.user_id] = {
                            id: sub.id,
                            user_id: sub.user_id,
                            plan_id: sub.plan_id,
                            status: sub.status,
                            start_date: sub.start_date,
                            end_date: sub.end_date,
                            trial_ends_at: sub.trial_ends_at,
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

        // 3. Fetch team_members and employees to distinguish company employees from standalone free users
        const { byUserId: employeeByUserId, byEmail: employeeByEmail } = await fetchEmployeeLookupMaps(dataClient)

        const resolveEmployeeDetails = (userId: string, email?: string, role?: string) => {
            const normalizedEmail = email ? email.toLowerCase() : ''
            const empMatch = employeeByUserId.get(userId) || (normalizedEmail ? employeeByEmail.get(normalizedEmail) : undefined)
            const hasEmployeeRole = isEmployeeRole(role)

            if (!empMatch && !hasEmployeeRole) {
                return { is_employee: false }
            }

            const employerProfile = empMatch?.employerId ? profileMap.get(empMatch.employerId) : undefined
            const employerName = employerProfile?.business_name || employerProfile?.owner_name || undefined

            return {
                is_employee: true,
                employer_id: empMatch?.employerId,
                employer_name: employerName,
                employee_designation: empMatch?.designation,
                employee_role: empMatch?.roleName || (hasEmployeeRole ? role!.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Employee')
            }
        }

        // 4. Fetch all auth.users directly via admin client if available (includes unconfirmed / newly created signups)
        const allAuthUsers: any[] = []
        try {
            if (adminClient?.auth?.admin?.listUsers) {
                const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
                    perPage: 1000
                })
                if (!authError && authData?.users) {
                    allAuthUsers.push(...authData.users)
                }
            }
        } catch (authErr) {
            console.warn('[getAllUsers] Non-fatal: could not fetch auth.users:', authErr)
        }

        // 4. Merge data safely: ensure every user in auth.users or user_profiles appears in admin
        const mergedUsers: UserWithDetails[] = []
        const handledUserIds = new Set<string>()

        // Process auth.users first
        allAuthUsers.forEach(authUser => {
            handledUserIds.add(authUser.id)
            const profile = profileMap.get(authUser.id) || {}
            const meta = authUser.user_metadata || {}
            const subscription = subscriptionsByUser[authUser.id]

            // If subscription not in user_subscriptions table yet, synthesize from metadata if present
            let resolvedSub: any = subscription
            if (!resolvedSub && (meta.selected_plan || meta.is_trial)) {
                resolvedSub = {
                    id: `trial-${authUser.id}`,
                    user_id: authUser.id,
                    plan_id: meta.selected_plan || 'trial',
                    status: meta.is_trial ? 'trial' : 'active',
                    start_date: authUser.created_at,
                    end_date: new Date(new Date(authUser.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    currency: 'INR',
                    amount_paid: 0,
                    auto_renew: false,
                    created_at: authUser.created_at,
                    updated_at: authUser.created_at,
                    plan: {
                        id: meta.selected_plan || 'trial',
                        name: meta.selected_plan ? meta.selected_plan.charAt(0).toUpperCase() + meta.selected_plan.slice(1) : 'Trial',
                        slug: meta.selected_plan || 'trial',
                        description: 'Trial Plan',
                        price: 0,
                        currency: 'INR',
                        billing_period: 'monthly' as const,
                        features: [],
                        limits: {},
                        is_active: true,
                        is_popular: false,
                        sort_order: 99,
                        created_at: authUser.created_at,
                        updated_at: authUser.created_at,
                    }
                }
            }

            const resolvedEmail = authUser.email || profile.business_email || profile.email || 'Email not available'
            const resolvedRole = profile.role || (authUser.app_metadata?.role as any) || meta.role || 'user'
            const empDetails = resolveEmployeeDetails(authUser.id, authUser.email || profile.business_email || profile.email, resolvedRole)

            mergedUsers.push({
                id: authUser.id,
                email: resolvedEmail,
                role: resolvedRole,
                status: profile.status || 'active',
                business_name: profile.business_name || meta.business_name || meta.owner_name || authUser.email?.split('@')[0],
                owner_name: profile.owner_name || meta.owner_name || meta.full_name,
                business_type: profile.business_type || meta.business_type,
                business_phone: profile.business_phone || meta.business_phone,
                business_address: profile.business_address || meta.business_address,
                gstin: profile.gstin || meta.gstin,
                created_at: profile.created_at || authUser.created_at || new Date().toISOString(),
                updated_at: profile.updated_at || authUser.updated_at || new Date().toISOString(),
                subscription: resolvedSub,
                ...empDetails
            })
        })

        // Process any remaining profiles not in auth.users list
        profileList.forEach((profile: any) => {
            if (!handledUserIds.has(profile.id)) {
                handledUserIds.add(profile.id)
                const subscription = subscriptionsByUser[profile.id]
                const resolvedRole = profile.role || 'user'
                const empDetails = resolveEmployeeDetails(profile.id, profile.business_email || profile.email, resolvedRole)
                mergedUsers.push({
                    ...profile,
                    email: profile.business_email || profile.email || 'Email not available',
                    role: resolvedRole,
                    status: profile.status || 'active',
                    created_at: profile.created_at || new Date().toISOString(),
                    subscription,
                    ...empDetails
                })
            }
        })

        // Sort by newest first
        mergedUsers.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

        return mergedUsers
    } catch (error) {
        console.error('[getAllUsers] Fatal error prevented:', error)
        return []
    }
}

async function getAdminDataClient() {
    const standardClient = await createClient()
    let dataClient = standardClient
    try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            dataClient = await createAdminClient()
        }
    } catch {
        // Fallback to standard client
    }
    return { standardClient, dataClient }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'inactive') {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            throw new Error('Unauthorized')
        }

        const { standardClient, dataClient } = await getAdminDataClient()
        const { data: { user: currentUser } } = await standardClient.auth.getUser()
        if (currentUser?.id === userId && status !== 'active') {
            throw new Error('Cannot suspend or deactivate your own super admin account')
        }

        const { error } = await dataClient
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

        const { standardClient, dataClient } = await getAdminDataClient()
        const { data: { user: currentUser } } = await standardClient.auth.getUser()
        if (currentUser?.id === userId && role !== 'super_admin') {
            throw new Error('Cannot demote your own super admin account')
        }

        const { error } = await dataClient
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

export async function updateUserBusinessType(userId: string, businessType: BusinessType) {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            throw new Error('Unauthorized: only super administrators can reassign business verticals')
        }

        let dataClient = await createClient()
        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                dataClient = await createAdminClient()
            }
        } catch (e) {
            console.warn('[updateUserBusinessType] Admin client fallback:', e)
        }

        const { error } = await dataClient
            .from('user_profiles')
            .update({ 
                business_type: businessType, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', userId)

        if (error) throw error

        // Also synchronize invoice_settings so getBusinessProfile() immediately reflects the new vertical
        try {
            await dataClient
                .from('invoice_settings')
                .upsert({
                    user_id: userId,
                    business_type: businessType,
                    business_metadata: {
                        industry: businessType,
                        vertical: businessType
                    },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })
        } catch (setErr) {
            console.warn('[updateUserBusinessType] invoice_settings sync warning:', setErr)
        }

        await createAuditLog('user_business_type_updated', 'user', userId, { business_type: businessType })
        
        revalidatePath('/admin/users')
        revalidatePath('/admin/businesses')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error('Error updating user business type:', error)
        throw error
    }
}

export async function deleteUser(userId: string) {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            throw new Error('Unauthorized')
        }

        const { standardClient, dataClient } = await getAdminDataClient()
        const { data: { user: currentUser } } = await standardClient.auth.getUser()
        if (currentUser?.id === userId) {
            throw new Error('Cannot deactivate your own super admin account')
        }

        // 1. Mark as inactive or suspended in user_profiles
        const { error } = await dataClient
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
