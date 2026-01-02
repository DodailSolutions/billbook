import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { createClient } from '@/lib/supabase/server'

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
        const supabase = await createClient()

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
}, supabase: Awaited<ReturnType<typeof createClient>>) {
    try {
        // Find payment by order ID
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('*')
            .eq('gateway_order_id', payment.order_id)
            .single()

        if (!existingPayment) {
            console.error('Payment not found for order:', payment.order_id)
            return
        }

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

        console.log('Payment captured successfully:', payment.id)
    } catch (error) {
        console.error('Error handling payment captured:', error)
    }
}

async function handlePaymentFailed(payment: {
    id: string
    order_id: string
    error_code?: string
    error_description?: string
}, supabase: Awaited<ReturnType<typeof createClient>>) {
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
}, supabase: Awaited<ReturnType<typeof createClient>>) {
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
}, supabase: Awaited<ReturnType<typeof createClient>>) {
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
