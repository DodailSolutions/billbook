import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { sendWelcomeEmail, sendPurchaseConfirmationEmail } from '@/lib/email'

// Force Node.js runtime for crypto compatibility
export const runtime = 'nodejs'

/**
 * Verify payment from guest users (before account creation)
 * This endpoint doesn't require authentication
 */
export async function POST(request: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan,
            email,
            password,
            fullName,
            businessType,
            businessName,
            ownerName,
            businessAddress,
            businessPhone,
            businessEmail,
            gstin
        } = await request.json()

        // Verify signature
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        if (!keySecret) {
            throw new Error('Razorpay key secret not configured')
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            )
        }

        // Payment is verified, now create the account
        const supabase = await createClient()

        // Create auth user with auto-confirm to skip email verification
        const { data: authData, error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: undefined
            }
        })

        if (signupError || !authData.user) {
            console.error('Signup error:', signupError)
            return NextResponse.json(
                { error: signupError?.message || 'Failed to create account' },
                { status: 400 }
            )
        }

        const userId = authData.user.id

        // Sign in the user immediately
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (loginError) {
            console.error('Auto-login error:', loginError)
            // Don't fail - user can login manually
        }

        // Calculate expiry based on plan
        let expiryDate: Date
        let planType = plan
        let amount = 0

        switch (plan) {
            case 'lifetime':
                amount = 9999
                expiryDate = new Date()
                expiryDate.setFullYear(expiryDate.getFullYear() + 100) // Lifetime = 100 years
                planType = 'professional' // Lifetime is professional features
                break
            default:
                return NextResponse.json({ error: 'Invalid plan for guest payment' }, { status: 400 })
        }

        // Create user profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: userId,
                business_type: businessType || undefined,
                business_name: businessName || undefined,
                owner_name: ownerName || fullName || undefined,
                business_address: businessAddress || undefined,
                business_phone: businessPhone || undefined,
                business_email: businessEmail || email || undefined,
                gstin: gstin || undefined,
                created_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't fail if profile creation fails
        }

        // Create subscription with lifetime access
        const { error: subError } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                plan_type: planType,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: expiryDate.toISOString(),
                payment_id: razorpay_payment_id,
                amount: amount,
                created_at: new Date().toISOString()
            })

        if (subError) {
            console.error('Error creating subscription:', subError)
            return NextResponse.json(
                { error: 'Account created but failed to activate subscription' },
                { status: 500 }
            )
        }

        // Record payment
        try {
            await supabase
                .from('payments')
                .insert({
                    user_id: userId,
                    razorpay_order_id,
                    razorpay_payment_id,
                    amount: amount * 100, // Store in paise
                    currency: 'INR',
                    status: 'success',
                    plan_type: plan,
                    created_at: new Date().toISOString()
                })
        } catch (err) {
            console.error('Error recording payment:', err)
            // Don't fail the request if payment recording fails
        }

        // Send welcome and purchase confirmation emails
        try {
            await Promise.all([
                sendWelcomeEmail({
                    to: email,
                    name: fullName || ownerName || email.split('@')[0]
                }),
                sendPurchaseConfirmationEmail({
                    to: email,
                    name: fullName || ownerName || email.split('@')[0],
                    plan: plan,
                    amount: amount,
                    paymentId: razorpay_payment_id
                })
            ])
            console.log('Welcome and purchase confirmation emails sent successfully')
        } catch (emailError) {
            console.error('Error sending emails:', emailError)
            // Don't fail the request if email sending fails
        }

        return NextResponse.json(
            { 
                success: true, 
                message: 'Account created with lifetime access',
                userId: userId
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error verifying guest payment:', error)
        return NextResponse.json(
            { error: 'Failed to verify payment and create account' },
            { status: 500 }
        )
    }
}
