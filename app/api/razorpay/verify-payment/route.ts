import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Force Node.js runtime for crypto compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan
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

        // Payment is verified, now update user subscription
        // Calculate expiry based on plan
        let expiryDate: Date
        let planType = plan
        let amount = 0

        switch (plan) {
            case 'starter':
                amount = 299
                expiryDate = new Date()
                expiryDate.setMonth(expiryDate.getMonth() + 1)
                break
            case 'professional':
                amount = 599
                expiryDate = new Date()
                expiryDate.setMonth(expiryDate.getMonth() + 1)
                break
            case 'enterprise':
                amount = 999
                expiryDate = new Date()
                expiryDate.setMonth(expiryDate.getMonth() + 1)
                break
            case 'lifetime':
                amount = 9999
                expiryDate = new Date()
                expiryDate.setFullYear(expiryDate.getFullYear() + 100) // Lifetime = 100 years
                planType = 'professional' // Lifetime is professional features
                break
            default:
                return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // Insert into user_subscriptions table
        const { error: subError } = await supabase
            .from('user_subscriptions')
            .upsert({
                user_id: user.id,
                plan_type: planType,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: expiryDate.toISOString(),
                payment_id: razorpay_payment_id,
                amount: amount,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })

        if (subError) {
            console.error('Error updating subscription:', subError)
            return NextResponse.json(
                { error: 'Failed to update subscription' },
                { status: 500 }
            )
        }

        // Record payment in payments table if it exists
        try {
            await supabase
                .from('payments')
                .insert({
                    user_id: user.id,
                    razorpay_order_id,
                    razorpay_payment_id,
                    amount: amount * 100, // Store in paise
                    currency: 'INR',
                    status: 'success',
                    plan_type: plan,
                    created_at: new Date().toISOString()
                })
            console.log('Payment recorded successfully')
        } catch (err) {
            console.error('Error recording payment:', err)
            // Don't fail the request if payment recording fails
        }

        return NextResponse.json(
            { success: true, message: 'Payment verified and subscription updated' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
