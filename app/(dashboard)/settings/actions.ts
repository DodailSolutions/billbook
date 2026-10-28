'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UserProfile {
    id: string
    email: string
    full_name?: string
    phone?: string
    owner_name?: string
    business_name?: string
    business_type?: string
    business_address?: string
    business_phone?: string
    business_email?: string
    gstin?: string
    role?: string
    status?: string
    created_at: string
}

export interface UpdateProfileInput {
    full_name?: string
    phone?: string
    business_name?: string
    business_type?: string
    business_address?: string
    business_phone?: string
    business_email?: string
    gstin?: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return null
        }

        // Fetch DB user profile
        const { data: dbProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        return {
            id: user.id,
            email: user.email || '',
            full_name: dbProfile?.owner_name || user.user_metadata?.full_name || '',
            phone: dbProfile?.business_phone || user.user_metadata?.phone || '',
            owner_name: dbProfile?.owner_name || user.user_metadata?.full_name || '',
            business_name: dbProfile?.business_name || user.user_metadata?.business_name || '',
            business_type: dbProfile?.business_type || 'Sole Proprietorship',
            business_address: dbProfile?.business_address || '',
            business_phone: dbProfile?.business_phone || user.user_metadata?.phone || '',
            business_email: dbProfile?.business_email || user.email || '',
            gstin: dbProfile?.gstin || '',
            role: dbProfile?.role || 'user',
            status: dbProfile?.status || 'active',
            created_at: dbProfile?.created_at || user.created_at || ''
        }
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return null
    }
}

export async function updateProfile(data: UpdateProfileInput) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        // 1. Update Auth user metadata
        await supabase.auth.updateUser({
            data: {
                full_name: data.full_name,
                phone: data.phone || data.business_phone,
                business_name: data.business_name
            }
        })

        // 2. Update user_profiles table in Supabase
        const profilePayload: Record<string, any> = {
            updated_at: new Date().toISOString()
        }
        if (data.full_name !== undefined) profilePayload.owner_name = data.full_name
        if (data.business_name !== undefined) profilePayload.business_name = data.business_name
        if (data.business_type !== undefined) profilePayload.business_type = data.business_type
        if (data.business_address !== undefined) profilePayload.business_address = data.business_address
        if (data.business_phone !== undefined) {
            profilePayload.business_phone = data.business_phone
        } else if (data.phone !== undefined) {
            profilePayload.business_phone = data.phone
        }
        if (data.business_email !== undefined) profilePayload.business_email = data.business_email
        if (data.gstin !== undefined) profilePayload.gstin = data.gstin.toUpperCase().trim()

        const { error: profileError } = await supabase
            .from('user_profiles')
            .update(profilePayload)
            .eq('id', user.id)

        if (profileError) {
            console.warn('Could not update user_profiles table (non-blocking):', profileError)
        }

        revalidatePath('/settings')
        revalidatePath('/dashboard')
        revalidatePath('/invoices')
        return { success: true, message: 'Profile updated successfully' }
    } catch (error) {
        console.error('Error updating profile:', error)
        throw error
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword
        })

        if (signInError) {
            throw new Error('Current password is incorrect')
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (updateError) {
            console.error('Error updating password:', updateError)
            throw new Error('Failed to update password')
        }

        return { success: true, message: 'Password changed successfully' }
    } catch (error: unknown) {
        console.error('Error changing password:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to change password')
    }
}

export async function updateEmail(newEmail: string, password: string) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        // Verify password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: password
        })

        if (signInError) {
            throw new Error('Password is incorrect')
        }

        // Update email
        const { error: updateError } = await supabase.auth.updateUser({
            email: newEmail
        })

        if (updateError) {
            console.error('Error updating email:', updateError)
            throw new Error('Failed to update email')
        }

        return { 
            success: true, 
            message: 'Verification email sent. Please check your inbox to confirm the change.' 
        }
    } catch (error: unknown) {
        console.error('Error updating email:', error)
        throw new Error(error instanceof Error ? error.message : 'Failed to update email')
    }
}
