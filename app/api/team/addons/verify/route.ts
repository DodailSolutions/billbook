import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      quantity,
      billing_period,
      duration_days,
      price_per_slot
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration_days)

    // Create addon record
    const { data: addon, error: addonError } = await supabase
      .from('team_member_addons')
      .insert({
        user_id: user.id,
        quantity,
        price_per_slot,
        billing_period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        razorpay_order_id,
        razorpay_payment_id,
        auto_renew: false
      })
      .select()
      .single()

    if (addonError) {
      console.error('Error creating addon:', addonError)
      return NextResponse.json({ error: 'Failed to activate addon' }, { status: 500 })
    }

    // Log in payment history
    await supabase.from('payment_history').insert({
      user_id: user.id,
      plan_id: null, // This is an addon, not a plan
      amount: price_per_slot * quantity,
      currency: 'INR',
      payment_method: 'razorpay',
      razorpay_order_id,
      razorpay_payment_id,
      status: 'completed',
      metadata: {
        type: 'team_addon',
        quantity,
        billing_period,
        duration_days,
        addon_id: addon.id
      }
    })

    // Log activity
    await supabase.from('team_activity_log').insert({
      owner_id: user.id,
      actor_id: user.id,
      action: 'addon_purchased',
      details: {
        quantity,
        billing_period,
        price_per_slot,
        total_amount: price_per_slot * quantity,
        duration_days,
        end_date: endDate.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      addon,
      message: `Successfully added ${quantity} team member slot(s)!`
    })
  } catch (error) {
    console.error('Error verifying addon payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
