'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        redirect('/login?message=' + encodeURIComponent('Email and password are required'))
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error.message, error)
        redirect('/login?message=' + encodeURIComponent(error.message || 'Could not authenticate user'))
    }

    if (!data.session) {
        redirect('/login?message=' + encodeURIComponent('Please check your email to confirm your account first'))
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
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
    const redirectAfter = formData.get('redirectAfter') as string

    // Log for debugging
    console.log('Signup attempt for:', email, 'with plan:', selectedPlan, 'redirect:', redirectAfter)

    if (!email || !password || !fullName) {
        return redirect('/signup?message=' + encodeURIComponent('Missing required fields'))
    }

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
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://billbooky.dodail.com'}/auth/callback`
        }
    })

    if (error) {
        console.error('Supabase signup error:', error)
        return redirect('/signup?message=' + encodeURIComponent(error.message))
    }

    // Check if email confirmation is required
    if (data?.user?.identities?.length === 0) {
        return redirect('/login?message=' + encodeURIComponent('User already exists. Please login.'))
    }

    // If user is created, store business profile in user_profiles table
    if (data?.user) {
        console.log('User created successfully:', data.user.id)
        
        try {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: data.user.id,
                    role: 'user',
                    business_name: businessName || undefined,
                    business_type: businessType || undefined,
                    owner_name: ownerName || fullName || undefined,
                    business_address: businessAddress || undefined,
                    business_phone: businessPhone || undefined,
                    business_email: businessEmail || email || undefined,
                    gstin: gstin || undefined,
                    status: 'active'
                })

            if (profileError) {
                console.error('Profile creation error:', profileError)
                // Continue anyway - user can complete profile later
            } else {
                console.log('Profile created successfully')
            }

            // Send welcome email (non-blocking)
            try {
                await sendWelcomeEmail({
                    to: email,
                    name: fullName || ownerName || email.split('@')[0]
                })
                console.log('Welcome email sent successfully')
            } catch (emailError) {
                console.error('Error sending welcome email:', emailError)
                // Don't fail signup if email fails
            }
        } catch (err) {
            console.error('Profile creation exception:', err)
            // Continue anyway - profile can be created later
        }
    }

    // If paid plan selected and session exists, redirect to payment
    // OR if redirectAfter is 'checkout', go to checkout even without session (for paid plans)
    if ((data?.session || redirectAfter === 'checkout') && selectedPlan && selectedPlan !== 'free') {
        console.log('Redirecting to checkout for plan:', selectedPlan)
        return redirect(`/pricing?checkout=${selectedPlan}`)
    }

    // If email confirmation is required, show message
    if (data?.user && !data?.session) {
        return redirect('/login?message=' + encodeURIComponent('Check your email to confirm your account before logging in.'))
    }

    revalidatePath('/', 'layout')
    return redirect('/dashboard')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}

export async function resetPassword(formData: FormData) {
    console.log('🔍 resetPassword action called')
    
    const email = formData.get('email') as string
    console.log('📧 Email received:', email)

    // Validation
    if (!email || email.trim() === '') {
        console.log('❌ Email validation failed: empty')
        redirect('/forgot-password?error=' + encodeURIComponent('Please enter your email address'))
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        console.log('❌ Email validation failed: invalid format')
        redirect('/forgot-password?error=' + encodeURIComponent('Please enter a valid email address'))
    }

    try {
        const supabase = await createClient()
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://billbooky.dodail.com'}/reset-password`
        
        console.log('🚀 Calling Supabase resetPasswordForEmail')
        console.log('📍 Redirect URL:', redirectUrl)
        console.log('📧 Email being processed:', email)

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        })

        console.log('📨 Supabase response:', { data, error })

        if (error) {
            console.error('❌ Supabase error:', {
                message: error.message,
                status: error.status,
                code: error.code,
                name: error.name
            })
            
            // Handle specific error cases
            if (error.message.includes('rate limit')) {
                redirect('/forgot-password?error=' + encodeURIComponent('Too many requests. Please try again in a few minutes.'))
            }
            
            if (error.message.includes('Invalid email')) {
                redirect('/forgot-password?error=' + encodeURIComponent('Please enter a valid email address'))
            }
            
            // Generic error with actual error message for debugging
            redirect('/forgot-password?error=' + encodeURIComponent(`Error: ${error.message}`))
        }

        console.log('✅ Reset email sent successfully')
        // Always show success even if email doesn't exist (security best practice)
        redirect('/forgot-password?success=true&email=' + encodeURIComponent(email))
    } catch (err) {
        console.error('💥 Exception in resetPassword:', err)
        redirect('/forgot-password?error=' + encodeURIComponent('An unexpected error occurred. Please try again.'))
    }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    if (!password) {
        redirect('/reset-password?message=' + encodeURIComponent('Password is required'))
    }

    if (password.length < 6) {
        redirect('/reset-password?message=' + encodeURIComponent('Password must be at least 6 characters'))
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Password update error:', error)
        redirect('/reset-password?message=' + encodeURIComponent(error.message))
    }

    redirect('/login?message=' + encodeURIComponent('Password updated successfully! Please login with your new password.'))
}
