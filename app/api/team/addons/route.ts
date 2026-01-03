import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Get addon pricing
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pricing options
    const { data: pricing } = await supabase
      .from('team_addon_pricing')
      .select('*')
      .eq('is_active', true)
      .order('duration_days')

    // Get user's current plan
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    // Check if user is on lifetime plan
    const isLifetimePlan = subscription?.plan?.slug === 'lifetime'

    if (!isLifetimePlan) {
      return NextResponse.json({ 
        error: 'Additional team members are only available for Lifetime plan users',
        isEligible: false
      }, { status: 403 })
    }

    // Get user's current addons
    const { data: addons } = await supabase
      .from('team_member_addons')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())

    const activeSlots = addons?.reduce((sum, addon) => sum + addon.quantity, 0) || 0

    return NextResponse.json({
      pricing: pricing || [],
      currentAddons: addons || [],
      activeSlots,
      isEligible: true
    })
  } catch (error) {
    console.error('Error fetching addon pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Purchase additional team member slots
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quantity, billing_period } = await request.json()

    if (!quantity || !billing_period || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity or billing period' }, { status: 400 })
    }

    // Verify user is on lifetime plan
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subscription?.plan?.slug !== 'lifetime') {
      return NextResponse.json({ 
        error: 'Additional team members are only available for Lifetime plan users'
      }, { status: 403 })
    }

    // Get pricing
    const { data: pricing } = await supabase
      .from('team_addon_pricing')
      .select('*')
      .eq('billing_period', billing_period)
      .eq('is_active', true)
      .single()

    if (!pricing) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 })
    }

    const totalAmount = pricing.price_per_slot * quantity
    const amountInRupees = totalAmount / 100

    // Create Razorpay order
    const Razorpay = require('razorpay')
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    })

    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `addon_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        type: 'team_addon',
        quantity: quantity.toString(),
        billing_period,
        duration_days: pricing.duration_days.toString()
      }
    })

    return NextResponse.json({
      order_id: order.id,
      amount: totalAmount,
      amount_in_rupees: amountInRupees,
      currency: 'INR',
      quantity,
      billing_period,
      duration_days: pricing.duration_days,
      price_per_slot: pricing.price_per_slot,
      display_price: pricing.display_price
    })
  } catch (error) {
    console.error('Error creating addon order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
