import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInvoiceEmail } from '@/lib/email'

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number, user_id, customer:customers(email, name)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer
    const customerEmail = customer?.email

    if (!customerEmail) {
        return NextResponse.json({ error: 'Customer has no email address on file' }, { status: 400 })
    }

    const origin = new URL(request.url).origin
    const pdfUrl = `${origin}/invoices/${id}`

    try {
        const result = await sendInvoiceEmail({
            to: customerEmail,
            invoiceNumber: invoice.invoice_number,
            pdfUrl,
        })

        if (!result.success) {
            const errObj = 'error' in result ? result.error : undefined
            const errMsg = errObj instanceof Error ? errObj.message : String(errObj ?? 'Failed to send email')
            console.error('[send-email] email error:', errMsg)
            return NextResponse.json({ error: errMsg }, { status: 500 })
        }
        return NextResponse.json({ success: true })
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to send email'
        console.error('[send-email] caught error:', errMsg)
        return NextResponse.json({ error: errMsg }, { status: 500 })
    }
}
