'use server'

import { createClient } from '@/lib/supabase/server'
import { createRazorpayOrder, createRefund, fetchPaymentDetails } from '@/lib/razorpay'
import { revalidatePath } from 'next/cache'

export interface Payment {
    id: string
    user_id: string
    invoice_id?: string
    amount: number
    currency: string
    payment_method?: string
    payment_gateway: string
    gateway_order_id?: string
    gateway_payment_id?: string
    gateway_signature?: string
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partial_refund'
    description?: string
    metadata?: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface Refund {
    id: string
    payment_id: string
    user_id: string
    invoice_id?: string
    amount: number
    currency: string
    reason?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    processed_by?: string
    processed_at?: string
    gateway_refund_id?: string
    notes?: string
    created_at: string
    updated_at: string
}

/**
 * Create a payment order for an invoice
 */
export async function createPaymentOrder(invoiceId: string) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        // Get invoice details
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*, customer:customers(*)')
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .single()

        if (invoiceError || !invoice) {
            throw new Error('Invoice not found')
        }

        // Check if already paid
        if (invoice.status === 'paid') {
            throw new Error('Invoice is already paid')
        }

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder({
            amount: invoice.total,
            currency: 'INR',
            receipt: `inv_${invoice.invoice_number}`,
            notes: {
                invoice_id: invoiceId,
                invoice_number: invoice.invoice_number,
                customer_name: invoice.customer.name,
            },
        })

        // Save payment record in database
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                invoice_id: invoiceId,
                amount: invoice.total,
                currency: 'INR',
                payment_gateway: 'razorpay',
                gateway_order_id: razorpayOrder.id,
                status: 'pending',
                description: `Payment for invoice ${invoice.invoice_number}`,
                metadata: {
                    customer_id: invoice.customer_id,
                    customer_name: invoice.customer.name,
                },
            })
            .select()
            .single()

        if (paymentError) {
            console.error('Error creating payment record:', paymentError)
            throw new Error('Failed to create payment record')
        }

        return {
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            paymentId: payment.id,
        }
    } catch (error) {
        console.error('Error creating payment order:', error)
        throw error
    }
}

/**
 * Verify and complete payment
 */
export async function verifyAndCompletePayment(data: {
    orderId: string
    paymentId: string
    signature: string
}) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        // Find payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('gateway_order_id', data.orderId)
            .eq('user_id', user.id)
            .single()

        if (paymentError || !payment) {
            throw new Error('Payment not found')
        }

        // Fetch payment details from Razorpay
        const razorpayPayment = await fetchPaymentDetails(data.paymentId)

        // Update payment record
        const { error: updateError } = await supabase
            .from('payments')
            .update({
                gateway_payment_id: data.paymentId,
                gateway_signature: data.signature,
                status: 'completed',
                payment_method: razorpayPayment.method,
                metadata: {
                    ...(payment.metadata as Record<string, unknown> || {}),
                    razorpay_payment: razorpayPayment,
                },
            })
            .eq('id', payment.id)

        if (updateError) {
            console.error('Error updating payment:', updateError)
            throw new Error('Failed to update payment')
        }

        // Update invoice status to paid (trigger will handle this, but doing it explicitly for safety)
        if (payment.invoice_id) {
            await supabase
                .from('invoices')
                .update({ status: 'paid' })
                .eq('id', payment.invoice_id)
        }

        revalidatePath('/invoices')
        revalidatePath(`/invoices/${payment.invoice_id}`)

        return { success: true, message: 'Payment completed successfully' }
    } catch (error) {
        console.error('Error verifying payment:', error)
        throw error
    }
}

/**
 * Get payment details
 */
export async function getPayment(paymentId: string): Promise<Payment | null> {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return null
        }

        const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .eq('user_id', user.id)
            .single()

        if (error || !payment) {
            return null
        }

        return payment as Payment
    } catch (error) {
        console.error('Error fetching payment:', error)
        return null
    }
}

/**
 * Get payments for an invoice
 */
export async function getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return []
        }

        const { data: payments, error } = await supabase
            .from('payments')
            .select('*')
            .eq('invoice_id', invoiceId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            // Check if the error is due to missing table
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                console.warn('Payments table does not exist. Please run supabase-payment-schema.sql')
                return []
            }
            console.error('Error fetching invoice payments:', error.message || error)
            return []
        }

        return payments as Payment[]
    } catch (error) {
        console.error('Error fetching invoice payments:', error)
        return []
    }
}

/**
 * Request a refund (user-initiated)
 */
export async function requestRefund(paymentId: string, reason: string) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        // Get payment details
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .eq('user_id', user.id)
            .single()

        if (paymentError || !payment) {
            throw new Error('Payment not found')
        }

        if (payment.status !== 'completed') {
            throw new Error('Only completed payments can be refunded')
        }

        // Create refund request
        const { error: refundError } = await supabase
            .from('refunds')
            .insert({
                payment_id: paymentId,
                user_id: user.id,
                invoice_id: payment.invoice_id,
                amount: payment.amount,
                currency: payment.currency,
                reason,
                status: 'pending',
            })

        if (refundError) {
            console.error('Error creating refund request:', refundError)
            throw new Error('Failed to create refund request')
        }

        revalidatePath('/invoices')
        return { success: true, message: 'Refund request submitted successfully' }
    } catch (error) {
        console.error('Error requesting refund:', error)
        throw error
    }
}

/**
 * Process refund (admin function)
 */
export async function processRefund(refundId: string, approve: boolean, notes?: string) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Not authenticated')
        }

        // Get refund details
        const { data: refund, error: refundError } = await supabase
            .from('refunds')
            .select('*, payment:payments(*)')
            .eq('id', refundId)
            .single()

        if (refundError || !refund) {
            throw new Error('Refund not found')
        }

        if (!approve) {
            // Reject refund
            await supabase
                .from('refunds')
                .update({
                    status: 'failed',
                    processed_by: user.id,
                    processed_at: new Date().toISOString(),
                    notes: notes || 'Refund rejected by admin',
                })
                .eq('id', refundId)

            return { success: true, message: 'Refund rejected' }
        }

        // Approve and process refund with Razorpay
        const payment = refund.payment as Payment
        
        if (!payment.gateway_payment_id) {
            throw new Error('Payment ID not found')
        }

        // Update status to processing
        await supabase
            .from('refunds')
            .update({ status: 'processing' })
            .eq('id', refundId)

        // Create refund in Razorpay
        const razorpayRefund = await createRefund(payment.gateway_payment_id, {
            amount: refund.amount,
            notes: {
                refund_id: refundId,
                reason: refund.reason || 'Refund requested by customer',
            },
        })

        // Update refund record
        await supabase
            .from('refunds')
            .update({
                status: 'completed',
                processed_by: user.id,
                processed_at: new Date().toISOString(),
                gateway_refund_id: razorpayRefund.id,
                notes: notes || 'Refund processed successfully',
            })
            .eq('id', refundId)

        // Update payment status
        await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('id', payment.id)

        // Update invoice status if needed
        if (payment.invoice_id) {
            await supabase
                .from('invoices')
                .update({ status: 'cancelled' })
                .eq('id', payment.invoice_id)
        }

        revalidatePath('/admin/refunds')
        revalidatePath('/admin/payments')
        
        return { success: true, message: 'Refund processed successfully' }
    } catch (error) {
        console.error('Error processing refund:', error)
        
        // Update refund status to failed
        try {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                await supabase
                    .from('refunds')
                    .update({
                        status: 'failed',
                        processed_by: user.id,
                        processed_at: new Date().toISOString(),
                        notes: `Refund processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    })
                    .eq('id', refundId)
            }
        } catch (updateError) {
            console.error('Error updating refund status:', updateError)
        }
        
        throw error
    }
}

/**
 * Get all refunds (admin)
 */
export async function getAllRefunds(): Promise<Refund[]> {
    try {
        const supabase = await createClient()
        
        const { data: refunds, error } = await supabase
            .from('refunds')
            .select('*, payment:payments(*, invoice:invoices(invoice_number))')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching refunds:', error)
            return []
        }

        return refunds as unknown as Refund[]
    } catch (error) {
        console.error('Error fetching refunds:', error)
        return []
    }
}

/**
 * Get user's refunds
 */
export async function getUserRefunds(): Promise<Refund[]> {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return []
        }

        const { data: refunds, error } = await supabase
            .from('refunds')
            .select('*, payment:payments(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching user refunds:', error)
            return []
        }

        return refunds as unknown as Refund[]
    } catch (error) {
        console.error('Error fetching user refunds:', error)
        return []
    }
}
