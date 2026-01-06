import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface InvoiceData {
    invoiceNumber: string
    date: string
    customer: string
    gstin: string
    supplyType: string
    subtotal: number
    cgst: number
    sgst: number
    igst: number
    total: number
    reverseCharge: boolean
}

interface GSTReportData {
    startDate: string
    endDate: string
    invoices: InvoiceData[]
    summary: {
        totalCGST: number
        totalSGST: number
        totalIGST: number
        totalIntraState: number
        totalInterState: number
        reverseChargeCount: number
        totalInvoices: number
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { startDate, endDate } = await request.json()

        if (!startDate || !endDate) {
            return new NextResponse('Start date and end date are required', { status: 400 })
        }

        // Fetch invoices for the date range
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select(`
                *,
                customer:customers(*),
                invoice_items(*)
            `)
            .eq('user_id', user.id)
            .gte('invoice_date', startDate)
            .lte('invoice_date', endDate)
            .order('invoice_date', { ascending: true })

        if (error) {
            console.error('Error fetching invoices:', error)
            return new NextResponse('Failed to fetch invoices', { status: 500 })
        }

        // Calculate GST summary
        let totalCGST = 0
        let totalSGST = 0
        let totalIGST = 0
        let totalIntraState = 0
        let totalInterState = 0
        let reverseChargeCount = 0

        const reportData = invoices.map(invoice => {
            totalCGST += invoice.cgst_amount || 0
            totalSGST += invoice.sgst_amount || 0
            totalIGST += invoice.igst_amount || 0

            if (invoice.supply_type === 'intra-state') {
                totalIntraState += invoice.total
            } else {
                totalInterState += invoice.total
            }

            if (invoice.reverse_charge_applicable) {
                reverseChargeCount++
            }

            return {
                invoiceNumber: invoice.invoice_number,
                date: invoice.invoice_date,
                customer: invoice.customer.name,
                gstin: invoice.customer.gstin || 'N/A',
                supplyType: invoice.supply_type,
                subtotal: invoice.subtotal,
                cgst: invoice.cgst_amount || 0,
                sgst: invoice.sgst_amount || 0,
                igst: invoice.igst_amount || 0,
                total: invoice.total,
                reverseCharge: invoice.reverse_charge_applicable
            }
        })

        // Generate PDF HTML
        const html = generateGSTReportHTML({
            startDate,
            endDate,
            invoices: reportData,
            summary: {
                totalCGST,
                totalSGST,
                totalIGST,
                totalIntraState,
                totalInterState,
                reverseChargeCount,
                totalInvoices: invoices.length
            }
        })

        // Return HTML for now (in production, you'd convert this to PDF using a library like puppeteer)
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="GST-Report-${startDate}-to-${endDate}.pdf"`
            }
        })
    } catch (error) {
        console.error('Error generating GST report:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

function generateGSTReportHTML(data: GSTReportData) {
    const { startDate, endDate, invoices, summary } = data

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>GST Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #1e40af; margin-bottom: 10px; }
        .subtitle { color: #6b7280; margin-bottom: 30px; }
        .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .summary-item { text-align: center; }
        .summary-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #1e40af; color: white; padding: 12px; text-align: left; font-size: 12px; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        tr:hover { background: #f9fafb; }
        .text-right { text-align: right; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
        .badge-intra { background: #dbeafe; color: #1e40af; }
        .badge-inter { background: #fef3c7; color: #92400e; }
        .badge-rc { background: #fecaca; color: #991b1b; }
    </style>
</head>
<body>
    <h1>GST Report</h1>
    <div class="subtitle">Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</div>
    
    <div class="summary">
        <h3 style="margin-bottom: 20px;">Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total CGST</div>
                <div class="summary-value">₹${summary.totalCGST.toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total SGST</div>
                <div class="summary-value">₹${summary.totalSGST.toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total IGST</div>
                <div class="summary-value">₹${summary.totalIGST.toFixed(2)}</div>
            </div>
        </div>
        <div class="summary-grid" style="margin-top: 20px;">
            <div class="summary-item">
                <div class="summary-label">Intra-State Sales</div>
                <div class="summary-value">₹${summary.totalIntraState.toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Inter-State Sales</div>
                <div class="summary-value">₹${summary.totalInterState.toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Invoices</div>
                <div class="summary-value">${summary.totalInvoices}</div>
            </div>
        </div>
        ${summary.reverseChargeCount > 0 ? `
        <div style="margin-top: 20px; padding: 12px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
            <strong>Reverse Charge Applicable:</strong> ${summary.reverseChargeCount} invoice(s)
        </div>
        ` : ''}
    </div>

    <h3>Invoice Details</h3>
    <table>
        <thead>
            <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>GSTIN</th>
                <th>Type</th>
                <th class="text-right">Subtotal</th>
                <th class="text-right">CGST</th>
                <th class="text-right">SGST</th>
                <th class="text-right">IGST</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoices.map((inv: InvoiceData) => `
            <tr>
                <td>${inv.invoiceNumber}</td>
                <td>${new Date(inv.date).toLocaleDateString()}</td>
                <td>${inv.customer}</td>
                <td>${inv.gstin}</td>
                <td>
                    <span class="badge ${inv.supplyType === 'intra-state' ? 'badge-intra' : 'badge-inter'}">
                        ${inv.supplyType === 'intra-state' ? 'Intra-State' : 'Inter-State'}
                    </span>
                    ${inv.reverseCharge ? '<span class="badge badge-rc">RC</span>' : ''}
                </td>
                <td class="text-right">₹${inv.subtotal.toFixed(2)}</td>
                <td class="text-right">₹${inv.cgst.toFixed(2)}</td>
                <td class="text-right">₹${inv.sgst.toFixed(2)}</td>
                <td class="text-right">₹${inv.igst.toFixed(2)}</td>
                <td class="text-right"><strong>₹${inv.total.toFixed(2)}</strong></td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280;">
        <p><strong>Note:</strong> This report is for reference purposes. Please verify all details before filing GST returns.</p>
        <p style="margin-top: 8px;">Generated on: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
    `
}
