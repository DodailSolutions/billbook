import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check super admin access
    const isSuperAdmin = await checkSuperAdminAccess()
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Super admin access required.' },
        { status: 403 }
      )
    }

    const { userId, planId, duration } = await request.json()

    if (!userId || !planId || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, planId, duration' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
      .single()

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          end_date: endDate.toISOString(),
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        console.error('Update subscription error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          amount_paid: plan.price,
          currency: plan.currency || 'INR',
          payment_method: 'admin_upgrade'
        })

      if (insertError) {
        console.error('Insert subscription error:', insertError)
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        )
      }
    }

    // Log the action in payment_history
    await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        amount: plan.price,
        currency: plan.currency || 'INR',
        payment_method: 'admin_upgrade',
        status: 'completed',
        metadata: {
          plan_id: planId,
          plan_name: plan.name,
          duration_days: duration,
          upgraded_by: 'super_admin'
        }
      })

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded user to ${plan.name} plan for ${duration} days`,
      subscription: {
        plan: plan.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Upgrade plan error:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade user plan' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch available plans
export async function GET() {
  try {
    const isSuperAdmin = await checkSuperAdminAccess()
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('id, name, slug, price, billing_period')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch plans' },
        { status: 500 }
      )
    }

    return NextResponse.json({ plans })

  } catch (error) {
    console.error('Fetch plans error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
