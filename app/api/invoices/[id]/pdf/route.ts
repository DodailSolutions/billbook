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
    
    // Add print-optimized wrapper
    const pdfHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice-${invoice.invoice_number}</title>
    <style>
        @media print {
            @page {
                margin: 0;
                size: A4;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .no-print {
                display: none !important;
            }
        }
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .print-button {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        }
        .print-button:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Save as PDF</button>
    ${html}
    <script>
        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
            window.print();
        }, 500);
    </script>
</body>
</html>
    `

    return new NextResponse(pdfHtml, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="Invoice-${invoice.invoice_number}.html"`,
        },
    })
}
