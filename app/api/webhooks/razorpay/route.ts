import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function createWebhookSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for webhook processing')
    }

    return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-razorpay-signature')

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            )
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
        if (!webhookSecret) {
            console.error('Razorpay webhook secret not configured')
            return NextResponse.json(
                { error: 'Webhook not configured' },
                { status: 500 }
            )
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(body, signature, webhookSecret)
        if (!isValid) {
            console.error('Invalid webhook signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        const event = JSON.parse(body)
        const supabase = createWebhookSupabaseClient()

        console.log('Razorpay webhook event:', event.event)

        // Handle different webhook events
        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment.entity, supabase)
                break

            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment.entity, supabase)
                break

            case 'refund.processed':
                await handleRefundProcessed(event.payload.refund.entity, supabase)
                break

            case 'refund.failed':
                await handleRefundFailed(event.payload.refund.entity, supabase)
                break

            default:
                console.log('Unhandled webhook event:', event.event)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

async function handlePaymentCaptured(payment: {
    id: string
    order_id: string
    amount: number
    status: string
    method: string
    notes?: Record<string, string>
}, supabase: ReturnType<typeof createWebhookSupabaseClient>) {
    try {
        // 1. Find payment by gateway_order_id if recorded beforehand
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('*')
            .eq('gateway_order_id', payment.order_id)
            .maybeSingle()

        if (existingPayment) {
            // Update payment status
            const { error: updateError } = await supabase
                .from('payments')
                .update({
                    gateway_payment_id: payment.id,
                    status: 'completed',
                    payment_method: payment.method,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingPayment.id)

            if (updateError) {
                console.error('Error updating payment:', updateError)
                return
            }

            // Update invoice status
            if (existingPayment.invoice_id) {
                await supabase
                    .from('invoices')
                    .update({ status: 'paid' })
                    .eq('id', existingPayment.invoice_id)
            }

            console.log('Payment captured successfully for existing record:', payment.id)
            return
        }

        // 2. Fallback: Check if payment notes contain invoice_id or user_id
        const notes = payment.notes || {}
        const invoiceId = notes.invoice_id || notes.invoiceId || null
        const userId = notes.user_id || notes.userId || null
        const planSlug = notes.plan_slug || notes.planSlug || null

        if (invoiceId) {
            // Mark invoice as paid
            const { data: updatedInvoice } = await supabase
                .from('invoices')
                .update({ status: 'paid' })
                .eq('id', invoiceId)
                .select('id, user_id, total')
                .maybeSingle()

            // Record into payments table
            await supabase.from('payments').insert([{
                gateway_order_id: payment.order_id || null,
                gateway_payment_id: payment.id,
                invoice_id: invoiceId,
                user_id: updatedInvoice?.user_id || userId || null,
                amount: payment.amount ? payment.amount / 100 : (updatedInvoice?.total || 0),
                status: 'completed',
                payment_method: payment.method,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }])

            console.log(`Payment captured via webhook for invoice ${invoiceId}: ${payment.id}`)
            return
        }

        // 3. Subscription purchase via webhook
        if (userId && planSlug) {
            const { data: plan } = await supabase
                .from('subscription_plans')
                .select('id, name')
                .eq('slug', planSlug)
                .maybeSingle()

            if (plan) {
                const now = new Date()
                const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
                await supabase.from('user_subscriptions').upsert({
                    user_id: userId,
                    plan_id: plan.id,
                    status: 'active',
                    start_date: now.toISOString(),
                    end_date: oneYearLater.toISOString(),
                    payment_method: 'razorpay',
                }, { onConflict: 'user_id' })

                await supabase.from('user_profiles').update({
                    plan_name: planSlug
                }).eq('id', userId)

                console.log(`Subscription activated via webhook for user ${userId}, plan ${planSlug}`)
                return
            }
        }

        console.log('Payment captured with no matched order/invoice:', payment.id, 'order:', payment.order_id)
    } catch (error) {
        console.error('Error handling payment captured:', error)
    }
}

async function handlePaymentFailed(payment: {
    id: string
    order_id: string
    error_code?: string
    error_description?: string
}, supabase: ReturnType<typeof createWebhookSupabaseClient>) {
    try {
        const { error } = await supabase
            .from('payments')
            .update({
                gateway_payment_id: payment.id,
                status: 'failed',
                metadata: {
                    error_code: payment.error_code,
                    error_description: payment.error_description,
                },
                updated_at: new Date().toISOString(),
            })
            .eq('gateway_order_id', payment.order_id)

        if (error) {
            console.error('Error updating failed payment:', error)
        }

        console.log('Payment failed:', payment.id)
    } catch (error) {
        console.error('Error handling payment failed:', error)
    }
}

async function handleRefundProcessed(refund: {
    id: string
    payment_id: string
    amount: number
    status: string
}, supabase: ReturnType<typeof createWebhookSupabaseClient>) {
    try {
        // Find refund by gateway refund ID
        const { data: existingRefund } = await supabase
            .from('refunds')
            .select('*, payment:payments(*)')
            .eq('gateway_refund_id', refund.id)
            .single()

        if (!existingRefund) {
            console.error('Refund not found:', refund.id)
            return
        }

        // Update refund status
        await supabase
            .from('refunds')
            .update({
                status: 'completed',
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingRefund.id)

        // Update payment status
        const payment = existingRefund.payment as { id: string; amount: number; invoice_id?: string }
        await supabase
            .from('payments')
            .update({
                status: refund.amount >= payment.amount ? 'refunded' : 'partial_refund',
                updated_at: new Date().toISOString(),
            })
            .eq('id', payment.id)

        // Update invoice status if fully refunded
        if (payment.invoice_id && refund.amount >= payment.amount) {
            await supabase
                .from('invoices')
                .update({ status: 'cancelled' })
                .eq('id', payment.invoice_id)
        }

        console.log('Refund processed successfully:', refund.id)
    } catch (error) {
        console.error('Error handling refund processed:', error)
    }
}

async function handleRefundFailed(refund: {
    id: string
    payment_id: string
}, supabase: ReturnType<typeof createWebhookSupabaseClient>) {
    try {
        await supabase
            .from('refunds')
            .update({
                status: 'failed',
                updated_at: new Date().toISOString(),
            })
            .eq('gateway_refund_id', refund.id)

        console.log('Refund failed:', refund.id)
    } catch (error) {
        console.error('Error handling refund failed:', error)
    }
}
