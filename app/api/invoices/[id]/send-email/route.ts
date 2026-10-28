import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendClientEmailWithSettings } from '@/lib/client-email'

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
        .select('id, invoice_number, total, due_date, date, user_id, customer:customers(email, name)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer
    const customerEmail = customer?.email
    const customerName = customer?.name || 'Valued Client'

    if (!customerEmail) {
        return NextResponse.json({ error: 'Customer has no email address on file' }, { status: 400 })
    }

    // Fetch company settings
    const { data: companySettings } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    const origin = new URL(request.url).origin
    const pdfUrl = `${origin}/invoices/${id}`
    const paymentUrl = `${origin}/invoices/${id}`

    const totalFormatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(Number(invoice.total) || 0)

    const variables: Record<string, string> = {
        customer_name: customerName,
        invoice_number: invoice.invoice_number,
        total_amount: totalFormatted,
        due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'On Receipt',
        issue_date: invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
        company_name: companySettings?.company_name || 'My Business',
        company_email: companySettings?.company_email || user.email || '',
        company_phone: companySettings?.company_phone || '',
        invoice_url: pdfUrl,
        payment_url: paymentUrl,
    }

    try {
        const result = await sendClientEmailWithSettings({
            userId: user.id,
            to: customerEmail,
            templateType: 'invoice_delivery',
            variables,
        })

        if (!result.success) {
            console.error('[send-email] email error:', result.error)
            return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to send email'
        console.error('[send-email] caught error:', errMsg)
        return NextResponse.json({ error: errMsg }, { status: 500 })
    }
}
