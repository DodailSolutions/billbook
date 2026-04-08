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

        // Phase 1: update core status + amount columns (exist after partial-payment migration)
        const { error: coreError } = await supabase
            .from('invoices')
            .update({
                status: 'paid',
                amount_paid: invoice.total,
                amount_remaining: 0,
                is_partial_payment: false,
            })
            .eq('id', invoiceId)
            .eq('user_id', user.id)

        if (coreError) {
            // amount_paid etc. may not exist yet — fall back to just status
            const { error: minimalError } = await supabase
                .from('invoices')
                .update({ status: 'paid' })
                .eq('id', invoiceId)
                .eq('user_id', user.id)
            if (minimalError) {
                console.error('Error updating invoice status:', minimalError)
                return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
            }
        }

        // Phase 2: update optional columns (exist after invoice-payment-method migration)
        // Errors here are non-fatal — core status is already saved above
        await supabase
            .from('invoices')
            .update({
                payment_method: paymentMethod,
                payment_notes: paymentNotes || null,
                paid_at: new Date().toISOString(),
            })
            .eq('id', invoiceId)
            .eq('user_id', user.id)

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
