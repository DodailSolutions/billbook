import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { invoiceId, amount, paymentMethod, paymentNotes } = await request.json()

        // Validate required fields
        if (!invoiceId || !amount) {
            return NextResponse.json({ error: 'Invoice ID and amount are required' }, { status: 400 })
        }

        // Validate amount is positive
        if (amount <= 0) {
            return NextResponse.json({ error: 'Payment amount must be greater than 0' }, { status: 400 })
        }

        // Get the invoice to verify ownership and check amounts
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('id, user_id, total, amount_paid, amount_remaining')
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .single()

        if (invoiceError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Check if payment amount exceeds remaining amount
        const currentRemaining = invoice.amount_remaining ?? (invoice.total - (invoice.amount_paid ?? 0))
        if (amount > currentRemaining) {
            return NextResponse.json({ 
                error: `Payment amount ₹${amount.toFixed(2)} exceeds remaining balance of ₹${currentRemaining.toFixed(2)}` 
            }, { status: 400 })
        }

        // Insert payment record
        const { data: payment, error: paymentError } = await supabase
            .from('invoice_payments')
            .insert({
                invoice_id: invoiceId,
                user_id: user.id,
                amount,
                payment_method: paymentMethod,
                payment_notes: paymentNotes,
                payment_date: new Date().toISOString()
            })
            .select()
            .single()

        if (paymentError) {
            console.error('Payment insert error:', paymentError)
            return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
        }

        // The database trigger will automatically update the invoice amounts and status
        // But we'll also update paid_at if this completes the payment
        const newAmountPaid = (invoice.amount_paid ?? 0) + amount
        if (newAmountPaid >= invoice.total) {
            await supabase
                .from('invoices')
                .update({ 
                    paid_at: new Date().toISOString(),
                    payment_method: paymentMethod,
                    payment_notes: paymentNotes
                })
                .eq('id', invoiceId)
        }

        return NextResponse.json({ 
            success: true, 
            payment,
            message: 'Payment recorded successfully' 
        })

    } catch (error) {
        console.error('Partial payment error:', error)
        return NextResponse.json({ 
            error: 'Internal server error' 
        }, { status: 500 })
    }
}

// Get payment history for an invoice
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const invoiceId = searchParams.get('invoiceId')

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
        }

        const { data: payments, error } = await supabase
            .from('invoice_payments')
            .select('*')
            .eq('invoice_id', invoiceId)
            .eq('user_id', user.id)
            .order('payment_date', { ascending: false })

        if (error) {
            console.error('Error fetching payments:', error)
            return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
        }

        return NextResponse.json({ payments })

    } catch (error) {
        console.error('Get payments error:', error)
        return NextResponse.json({ 
            error: 'Internal server error' 
        }, { status: 500 })
    }
}
