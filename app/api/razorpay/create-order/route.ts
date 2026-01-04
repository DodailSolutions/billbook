import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRazorpayInstance } from '@/lib/razorpay'

// Force Node.js runtime for Razorpay SDK compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        const { amount, currency = 'INR', notes } = await request.json()
        
        // Check authentication - allow unauthenticated requests for lifetime plan
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        const isLifetimePlan = notes?.plan === 'lifetime'
        
        if (!isLifetimePlan && (authError || !user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!amount || amount <= 0) {
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
        console.log('Creating Razorpay order with amount:', amount * 100, 'paise')
        
        const razorpay = getRazorpayInstance()
        const orderOptions = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
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
