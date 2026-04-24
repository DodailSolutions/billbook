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
        let currency = 'INR'
        let region = 'IN'

        // Handle plan mapping and pricing
        const planMapping: Record<string, { type: string; amount: number; currency: string; region: string; months: number }> = {
            // India plans
            'starter': { type: 'starter', amount: 299, currency: 'INR', region: 'IN', months: 1 },
            'starter-yearly': { type: 'starter', amount: 2988, currency: 'INR', region: 'IN', months: 12 },
            'professional': { type: 'professional', amount: 599, currency: 'INR', region: 'IN', months: 1 },
            'professional-yearly': { type: 'professional', amount: 5988, currency: 'INR', region: 'IN', months: 12 },
            'enterprise': { type: 'enterprise', amount: 999, currency: 'INR', region: 'IN', months: 1 },
            'lifetime': { type: 'professional', amount: 9999, currency: 'INR', region: 'IN', months: 1200 },
            
            // UAE plans
            'starter-ae': { type: 'starter', amount: 49, currency: 'AED', region: 'AE', months: 1 },
            'starter-ae-yearly': { type: 'starter', amount: 490, currency: 'AED', region: 'AE', months: 12 },
            'growth-ae': { type: 'growth', amount: 99, currency: 'AED', region: 'AE', months: 1 },
            'growth-ae-yearly': { type: 'growth', amount: 990, currency: 'AED', region: 'AE', months: 12 },
            'pro-ae': { type: 'pro', amount: 199, currency: 'AED', region: 'AE', months: 1 },
            'pro-ae-yearly': { type: 'pro', amount: 1990, currency: 'AED', region: 'AE', months: 12 },
            'enterprise-ae': { type: 'enterprise', amount: 299, currency: 'AED', region: 'AE', months: 1 },
            'enterprise-ae-yearly': { type: 'enterprise', amount: 2990, currency: 'AED', region: 'AE', months: 12 },
            'lifetime-ae': { type: 'starter', amount: 499, currency: 'AED', region: 'AE', months: 1200 },
            'lifetime-growth-ae': { type: 'growth', amount: 1299, currency: 'AED', region: 'AE', months: 1200 },
            'lifetime-pro-ae': { type: 'pro', amount: 1999, currency: 'AED', region: 'AE', months: 1200 },
            'lifetime-enterprise-ae': { type: 'enterprise', amount: 2499, currency: 'AED', region: 'AE', months: 1200 },
            
            // US/International plans
            'starter-us': { type: 'starter', amount: 9, currency: 'USD', region: 'US', months: 1 },
            'starter-us-yearly': { type: 'starter', amount: 49, currency: 'USD', region: 'US', months: 12 },
            'growth-us': { type: 'growth', amount: 19, currency: 'USD', region: 'US', months: 1 },
            'growth-us-yearly': { type: 'growth', amount: 99, currency: 'USD', region: 'US', months: 12 },
            'pro-us': { type: 'pro', amount: 29, currency: 'USD', region: 'US', months: 1 },
            'pro-us-yearly': { type: 'pro', amount: 179, currency: 'USD', region: 'US', months: 12 },
            'business-us': { type: 'business', amount: 49, currency: 'USD', region: 'US', months: 1 },
            'business-us-yearly': { type: 'business', amount: 299, currency: 'USD', region: 'US', months: 12 },
            'lifetime-starter-us': { type: 'starter', amount: 149, currency: 'USD', region: 'US', months: 1200 },
            'lifetime-growth-us': { type: 'growth', amount: 249, currency: 'USD', region: 'US', months: 1200 },
            'lifetime-pro-us': { type: 'pro', amount: 399, currency: 'USD', region: 'US', months: 1200 },
            'lifetime-business-us': { type: 'business', amount: 599, currency: 'USD', region: 'US', months: 1200 }
        }

        const planConfig = planMapping[plan]
        if (!planConfig) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        planType = planConfig.type
        amount = planConfig.amount
        currency = planConfig.currency
        region = planConfig.region
        
        expiryDate = new Date()
        expiryDate.setMonth(expiryDate.getMonth() + planConfig.months)

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

        // Update user profile region
        await supabase
            .from('user_profiles')
            .update({ region })
            .eq('id', user.id)

        // Record payment in payments table if it exists
        try {
            await supabase
                .from('payments')
                .insert({
                    user_id: user.id,
                    invoice_id: null,
                    amount,
                    currency: currency,
                    payment_gateway: 'razorpay',
                    gateway_order_id: razorpay_order_id,
                    gateway_payment_id: razorpay_payment_id,
                    gateway_signature: razorpay_signature,
                    status: 'completed',
                    description: `Subscription payment for plan ${plan}`,
                    metadata: {
                        plan,
                        region,
                        subscription_context: true,
                    },
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
