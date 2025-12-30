'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Login error:', error)
            return redirect('/login?message=Could not authenticate user')
        }

        revalidatePath('/', 'layout')
        return redirect('/dashboard')
    } catch (error) {
        console.error('Login exception:', error)
        return redirect('/login?message=An error occurred during login')
    }
}

export async function signup(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://billbook-steel.vercel.app'}/auth/callback`
            }
        })

        if (error) {
            console.error('Signup error:', error)
            return redirect('/signup?message=' + encodeURIComponent(error.message))
        }

        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
            return redirect('/login?message=' + encodeURIComponent('User already exists. Please login.'))
        }

        // If email confirmation is required, show message
        if (data?.user && !data?.session) {
            return redirect('/login?message=' + encodeURIComponent('Check your email to confirm your account before logging in.'))
        }

        revalidatePath('/', 'layout')
        return redirect('/dashboard')
    } catch (error) {
        console.error('Signup exception:', error)
        return redirect('/signup?message=' + encodeURIComponent('An error occurred during signup'))
    }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}
