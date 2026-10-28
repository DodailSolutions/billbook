import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRazorpayInstance } from '@/lib/razorpay'

// Force Node.js runtime for Razorpay SDK compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        const { amount, currency = 'INR', notes } = await request.json()
        
        // Validate currency
        const supportedCurrencies = ['INR', 'AED', 'USD', 'EUR', 'GBP']
        const finalCurrency = supportedCurrencies.includes(currency) ? currency : 'INR'
        
        // Check authentication - allow unauthenticated requests for lifetime & founder deals
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        const isLifetimePlan = notes?.plan === 'lifetime' || 
            notes?.plan === 'lifetime-professional' || 
            notes?.plan === 'founder-lifetime' || 
            notes?.plan === 'founder-yearly' ||
            notes?.plan === 'founder' ||
            (typeof notes?.plan === 'string' && (notes.plan.includes('lifetime') || notes.plan.includes('founder')))
        
        if (!isLifetimePlan && (authError || !user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Dynamically verify amount from database subscription_plans
        let orderAmount = amount
        let orderCurrency = finalCurrency
        if (notes?.plan) {
            try {
                const { data: dbPlan } = await supabase
                    .from('subscription_plans')
                    .select('price, currency, slug')
                    .or(`slug.eq.${notes.plan},slug.eq.lifetime-professional,slug.eq.founder-yearly`)
                    .eq('is_active', true)
                    .maybeSingle()

                if (dbPlan && dbPlan.price) {
                    orderAmount = Number(dbPlan.price)
                    if (supportedCurrencies.includes(dbPlan.currency)) {
                        orderCurrency = dbPlan.currency
                    }
                }
            } catch (err) {
                console.warn('Could not verify plan price in DB:', err)
            }
        }

        if (!orderAmount || orderAmount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        // Verify Razorpay credentials
        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret) {
            console.error('Razorpay credentials missing:', { keyId: !!keyId, keySecret: !!keySecret })
            return NextResponse.json(
                { error: 'Payment service not configured' },
                { status: 500 }
            )
        }

        // Create Razorpay order
        console.log('Creating Razorpay order with amount:', orderAmount * 100, 'paise')
        
        const razorpay = getRazorpayInstance()
        const orderOptions = {
            amount: Math.round(orderAmount * 100), // Razorpay expects amount in paise/fils
            currency: orderCurrency,
            receipt: `subscription_${Date.now()}`,
            notes: {
                user_id: user?.id || 'guest',
                user_email: user?.email || notes?.guest_email || '',
                ...notes
            }
        }
        
        console.log('Order options:', JSON.stringify(orderOptions, null, 2))
        
        const order = await razorpay.orders.create(orderOptions)
        
        console.log('Order created successfully:', order.id)

        return NextResponse.json({ order }, { status: 200 })
    } catch (error) {
        console.error('Error creating Razorpay order:', error)
        
        // Log detailed error information
        if (error && typeof error === 'object') {
            console.error('Error details:', JSON.stringify(error, null, 2))
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to create order'
        return NextResponse.json(
            { error: errorMessage, details: error },
            { status: 500 }
        )
    }
}
