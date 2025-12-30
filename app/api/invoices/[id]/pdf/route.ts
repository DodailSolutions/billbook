import { NextResponse } from 'next/server'
import { getInvoice } from '@/app/(dashboard)/invoices/actions'
import { generateInvoicePDF } from '@/lib/pdf'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const invoice = await getInvoice(id)

    if (!invoice) {
        return new NextResponse('Invoice not found', { status: 404 })
    }

    const html = await generateInvoicePDF(invoice)

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `inline; filename="invoice-${invoice.invoice_number}.html"`,
        },
    })
}
