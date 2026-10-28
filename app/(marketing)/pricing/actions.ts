'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Activate a 14-day free trial on a chosen plan for authenticated user
 */
export async function activatePlanTrial(planSlug: string): Promise<{
    success: boolean
    redirectUrl: string
    error?: string
}> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // If not authenticated, redirect to signup with trial param
        if (!user) {
            return {
                success: false,
                redirectUrl: `/signup?plan=${planSlug}&trial=true`
            }
        }

        // Fetch plan ID from database
        const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id, name, slug')
            .eq('slug', planSlug)
            .maybeSingle()

        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)

        // Check if user already has a subscription
        const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('id, status, plan_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (existingSub) {
            const { error: updateError } = await supabase
                .from('user_subscriptions')
                .update({
                    plan_id: plan?.id || existingSub.plan_id,
                    status: 'trial',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    trial_ends_at: endDate.toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingSub.id)

            if (updateError) {
                console.error('[activatePlanTrial] Error updating subscription:', updateError)
                return { success: false, redirectUrl: '', error: updateError.message }
            }
        } else if (plan?.id) {
            const { error: insertError } = await supabase
                .from('user_subscriptions')
                .insert({
                    user_id: user.id,
                    plan_id: plan.id,
                    status: 'trial',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    trial_ends_at: endDate.toISOString(),
                    payment_method: 'free_trial'
                })

            if (insertError) {
                console.error('[activatePlanTrial] Error creating subscription:', insertError)
                return { success: false, redirectUrl: '', error: insertError.message }
            }
        }

        // Update user profile plan_name
        await supabase
            .from('user_profiles')
            .update({
                plan_name: planSlug,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        revalidatePath('/pricing')
        revalidatePath('/dashboard')

        return {
            success: true,
            redirectUrl: `/dashboard?trial=activated&plan=${planSlug}`
        }
    } catch (err: unknown) {
        console.error('[activatePlanTrial] caught error:', err)
        return {
            success: false,
            redirectUrl: '',
            error: err instanceof Error ? err.message : 'Failed to activate trial'
        }
    }
}
