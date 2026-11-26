import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getInvoice } from '@/app/(dashboard)/invoices/actions'
import { getInvoiceSettings } from '@/app/(dashboard)/invoices/settings/actions'
import { generateIrnForInvoice, getGspConfigStatus } from '@/lib/gst-gsp'

export async function GET(
    _request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase
        .from('invoice_einvoice_records')
        .select('*')
        .eq('invoice_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    return NextResponse.json({
        record: data || null,
        gsp: getGspConfigStatus(),
    })
}

export async function POST(
    _request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [invoice, settings] = await Promise.all([
        getInvoice(id),
        getInvoiceSettings(),
    ])

    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const result = await generateIrnForInvoice(invoice, settings?.company_gstin)
    if (!result.success) {
        return NextResponse.json(result, { status: result.configured ? 400 : 503 })
    }

    await supabase.from('invoice_einvoice_records').insert([
        {
            invoice_id: invoice.id,
            user_id: user.id,
            irn: result.irn,
            ack_no: result.ackNo,
            ack_date: result.ackDate,
            signed_qr_code: result.signedQrCode,
            eway_bill_no: result.ewayBillNo || null,
            status: 'generated',
            raw_response: result,
        },
    ])

    return NextResponse.json(result)
}
