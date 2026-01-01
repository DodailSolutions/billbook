'use server'

import { createClient } from '@/lib/supabase/server'

export async function checkSuperAdminAccess(): Promise<boolean> {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return false
        }

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return false
        }

        return profile.role === 'super_admin'
    } catch (error) {
        console.error('Error checking super admin access:', error)
        return false
    }
}

export async function getCurrentUserProfile() {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return null
        }

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Error fetching user profile:', profileError)
            return null
        }

        return profile
    } catch (error) {
        console.error('Error getting current user profile:', error)
        return null
    }
}

export async function createAuditLog(
    action: string,
    entityType?: string,
    entityId?: string,
    changes?: Record<string, unknown>
) {
    try {
        const supabase = await createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            changes
        })
    } catch (error) {
        console.error('Error creating audit log:', error)
    }
}
