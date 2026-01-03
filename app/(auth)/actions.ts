'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (!email || !password) {
            return redirect('/login?message=' + encodeURIComponent('Email and password are required'))
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Login error:', error.message, error)
            return redirect('/login?message=' + encodeURIComponent(error.message || 'Could not authenticate user'))
        }

        if (!data.session) {
            return redirect('/login?message=' + encodeURIComponent('Please check your email to confirm your account first'))
        }

        revalidatePath('/', 'layout')
        return redirect('/dashboard')
    } catch (error) {
        console.error('Login exception:', error)
        const errorMessage = error instanceof Error ? error.message : 'An error occurred during login'
        return redirect('/login?message=' + encodeURIComponent(errorMessage))
    }
}

export async function signup(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const businessType = formData.get('businessType') as string
        const businessName = formData.get('businessName') as string
        const ownerName = formData.get('ownerName') as string
        const businessAddress = formData.get('businessAddress') as string
        const businessPhone = formData.get('businessPhone') as string
        const businessEmail = formData.get('businessEmail') as string
        const gstin = formData.get('gstin') as string
        const selectedPlan = formData.get('selectedPlan') as string

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    business_type: businessType,
                    business_name: businessName,
                    owner_name: ownerName || fullName,
                    business_address: businessAddress,
                    business_phone: businessPhone,
                    business_email: businessEmail || email,
                    gstin: gstin,
                    selected_plan: selectedPlan || 'free',
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

        // If user is created, store business profile in user_profiles table
        if (data?.user) {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: data.user.id,
                    role: 'user',
                    business_name: businessName,
                    business_type: businessType,
                    owner_name: ownerName || fullName,
                    business_address: businessAddress,
                    business_phone: businessPhone,
                    business_email: businessEmail || email,
                    gstin: gstin,
                    status: 'active'
                })

            if (profileError) {
                console.error('Profile creation error:', profileError)
            }
        }

        // If paid plan selected and session exists, redirect to payment
        if (data?.session && selectedPlan && selectedPlan !== 'free') {
            return redirect(`/pricing?checkout=${selectedPlan}`)
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
