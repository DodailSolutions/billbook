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

        // Update invoice status
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                status: 'paid',
                payment_method: paymentMethod,
                payment_notes: paymentNotes || null,
                paid_at: new Date().toISOString()
            })
            .eq('id', invoiceId)
            .eq('user_id', user.id)

        if (updateError) {
            console.error('Error updating invoice:', updateError)
            return NextResponse.json(
                { error: 'Failed to update invoice' },
                { status: 500 }
            )
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
