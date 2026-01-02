'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UserProfile {
    id: string
    email: string
    full_name?: string
    phone?: string
    created_at: string
}

export async function getUserProfile() {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return null
        }

        return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            phone: user.user_metadata?.phone || '',
            created_at: user.created_at || ''
        }
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return null
    }
}

export async function updateProfile(data: { full_name?: string; phone?: string }) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: data.full_name,
                phone: data.phone
            }
        })

        if (error) {
            console.error('Error updating profile:', error)
            throw new Error('Failed to update profile')
        }

        revalidatePath('/settings')
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
