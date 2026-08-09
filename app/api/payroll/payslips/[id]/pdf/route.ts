import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePayslipPDF } from '@/lib/pdf'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const url = new URL(request.url)
        const mode = url.searchParams.get('mode') || 'download'
        
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: payslip, error } = await supabase
            .from('payslips')
            .select(`
                *,
                employee:employees(*)
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !payslip) {
            return new NextResponse('Payslip not found', { status: 404 })
        }

        const html = await generatePayslipPDF(payslip as any)

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const monthName = monthNames[payslip.month - 1]
        const filename = `Payslip-${payslip.employee?.name?.replace(/\s+/g, '_')}-${monthName}-${payslip.year}`

        const pdfHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${filename}</title>
    <style>
        @media print {
            @page {
                margin: 1cm 1.5cm;
                size: A4;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .content-wrapper {
                margin-top: 0 !important;
                padding: 0 !important;
                display: block !important;
            }
            .payslip-preview {
                box-shadow: none !important;
                border-radius: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
        }
        .toolbar-title {
            color: white;
            font-size: 18px;
            font-weight: 700;
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
            color: #059669;
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
        .payslip-preview {
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
            📄 Payslip - ${payslip.employee?.name} (${monthName} ${payslip.year})
        </div>
        <div class="toolbar-actions">
            <button class="btn btn-secondary" onclick="window.close()" title="Close window">
                ✕ Close
            </button>
            <button class="btn btn-primary" onclick="window.print()" title="Download as PDF or Print">
                🖨️ Save / Print PDF
            </button>
        </div>
    </div>
    <div class="content-wrapper">
        <div class="payslip-preview">
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
    </script>
</body>
</html>
        `

        // If mode is 'html', return just the raw HTML
        if (mode === 'html') {
            return new NextResponse(html, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            })
        }

        // Return preview page
        return new NextResponse(pdfHtml, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="${filename}.html"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        })
    } catch (error) {
        console.error('PDF generation error:', error)
        return new NextResponse('Error generating PDF', { status: 500 })
    }
}
