import { NextResponse } from 'next/server'
import { getInvoice } from '@/app/(dashboard)/invoices/actions'
import { generateInvoicePDF } from '@/lib/pdf'

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const url = new URL(request.url)
        const mode = url.searchParams.get('mode') || 'download'
        
        console.log('PDF Route - Invoice ID:', id, 'Mode:', mode)
        
        const invoice = await getInvoice(id)

        if (!invoice) {
            console.error('Invoice not found:', id)
            return new NextResponse('Invoice not found', { status: 404 })
        }

        const html = await generateInvoicePDF(invoice)
    
    // Add enhanced print-optimized wrapper
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
            .toolbar {
                display: none !important;
            }
        }
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f3f4f6;
        }
        .toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        .toolbar-title {
            color: white;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .toolbar-actions {
            display: flex;
            gap: 12px;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .btn-primary {
            background: white;
            color: #3b82f6;
        }
        .btn-primary:hover {
            background: #f9fafb;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .btn-secondary {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        .btn-secondary:hover {
            background: rgba(255,255,255,0.3);
        }
        .content-wrapper {
            margin-top: 70px;
            padding: 20px;
            display: flex;
            justify-content: center;
        }
        .invoice-preview {
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            max-width: 900px;
            width: 100%;
        }
        @media (max-width: 768px) {
            .toolbar {
                flex-direction: column;
                gap: 12px;
                padding: 16px;
            }
            .toolbar-actions {
                width: 100%;
                justify-content: center;
            }
            .content-wrapper {
                margin-top: 140px;
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="toolbar no-print">
        <div class="toolbar-title">
            📄 Invoice ${invoice.invoice_number}
        </div>
        <div class="toolbar-actions">
            <button class="btn btn-secondary" onclick="window.close()" title="Close preview">
                ✕ Close
            </button>
            <button class="btn btn-primary" onclick="window.print()" title="Save as PDF or Print">
                🖨️ Download PDF
            </button>
        </div>
    </div>
    <div class="content-wrapper">
        <div class="invoice-preview">
            ${html}
        </div>
    </div>
    <script>
        // Auto-trigger print dialog in download mode
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'download') {
            setTimeout(() => {
                window.print();
            }, 800);
        }
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + P for print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
            // Escape to close
            if (e.key === 'Escape') {
                window.close();
            }
        });
        
        // Show helpful message after print dialog closes
        window.addEventListener('afterprint', () => {
            console.log('PDF generated successfully!');
        });
    </script>
</body>
</html>
    `

    return new NextResponse(pdfHtml, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="Invoice-${invoice.invoice_number}.html"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    })
    } catch (error) {
        console.error('Error in PDF route:', error)
        return new NextResponse(
            `Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { status: 500 }
        )
    }
}
