import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getInvoice } from '@/app/(dashboard)/invoices/actions'
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

    // Try fetching via getInvoice (supports both UUID and invoice_number)
    let invoice = await getInvoice(id)

    // Resilient fallback direct query if not returned by getInvoice
    if (!invoice) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        const { data: directInvoice } = await supabase
            .from('invoices')
            .select('id, invoice_number, total, due_date, invoice_date, user_id, customer:customers(email, name)')
            .eq('user_id', user.id)
            .eq(isUuid ? 'id' : 'invoice_number', id)
            .maybeSingle()

        if (directInvoice) {
            invoice = directInvoice as any
        }
    }

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
    const pdfUrl = `${origin}/invoices/${invoice.id || id}`
    const paymentUrl = `${origin}/invoices/${invoice.id || id}`

    const totalFormatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(Number(invoice.total) || 0)

    const rawDate = (invoice as any).invoice_date || (invoice as any).date
    const variables: Record<string, string> = {
        customer_name: customerName,
        invoice_number: invoice.invoice_number,
        total_amount: totalFormatted,
        due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'On Receipt',
        issue_date: rawDate ? new Date(rawDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
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

        // Phase 27: Non-blocking communication log in crm_communications
        try {
            await supabase.from('crm_communications').insert([
                {
                    user_id: user.id,
                    invoice_id: invoice.id || id,
                    customer_id: (invoice as any).customer_id || null,
                    channel: 'email',
                    direction: 'outbound',
                    recipient: customerEmail,
                    subject: `Invoice ${invoice.invoice_number}`,
                    body_preview: `Sent invoice ${invoice.invoice_number} (${totalFormatted}) to ${customerName}`,
                    status: 'sent',
                },
            ])
        } catch {
            // Table may not be migrated yet; ignore safely
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to send email'
        console.error('[send-email] caught error:', errMsg)
        return NextResponse.json({ error: errMsg }, { status: 500 })
    }
}
