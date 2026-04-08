import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
    try {
        const { invoiceId, paymentMethod, paymentNotes } = await request.json()

        if (!invoiceId || !paymentMethod) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch the invoice to get total amount
        const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('total')
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Update invoice status and amounts
        // Try full update first (needs invoice-payment-method + partial-payment migrations)
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                status: 'paid',
                payment_method: paymentMethod,
                payment_notes: paymentNotes || null,
                paid_at: new Date().toISOString(),
                amount_paid: invoice.total,
                amount_remaining: 0,
                is_partial_payment: false,
            })
            .eq('id', invoiceId)
            .eq('user_id', user.id)

        if (updateError) {
            // Column might not exist — fall back to minimal update
            const isColumnError = updateError.code === '42703' || updateError.message?.includes('column') || updateError.message?.includes('does not exist')
            if (isColumnError) {
                const { error: fallbackError } = await supabase
                    .from('invoices')
                    .update({ status: 'paid' })
                    .eq('id', invoiceId)
                    .eq('user_id', user.id)
                if (fallbackError) {
                    console.error('Error updating invoice (fallback):', fallbackError)
                    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
                }
            } else {
                console.error('Error updating invoice:', updateError)
                return NextResponse.json(
                    { error: 'Failed to update invoice' },
                    { status: 500 }
                )
            }
        }

        revalidatePath('/invoices')
        revalidatePath(`/invoices/${invoiceId}`)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in mark-paid API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
