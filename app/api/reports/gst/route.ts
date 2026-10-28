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
        totalTaxable: number
        totalValue: number
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

        const body = await request.json()
        const { startDate, endDate, format = 'csv' } = body

        if (!startDate || !endDate) {
            return new NextResponse('Start date and end date are required', { status: 400 })
        }

        // Fetch company profile from invoice_settings
        const { data: settings } = await supabase
            .from('invoice_settings')
            .select('company_name, company_gstin, company_address, company_phone, company_email')
            .eq('user_id', user.id)
            .maybeSingle()

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

        const invList = invoices || []

        // Calculate GST summary
        let totalCGST = 0
        let totalSGST = 0
        let totalIGST = 0
        let totalIntraState = 0
        let totalInterState = 0
        let reverseChargeCount = 0
        let totalTaxable = 0
        let totalValue = 0

        const reportData: InvoiceData[] = invList.map(invoice => {
            const cgst = Number(invoice.cgst_amount || 0)
            const sgst = Number(invoice.sgst_amount || 0)
            const igst = Number(invoice.igst_amount || 0)
            const subtotal = Number(invoice.subtotal || 0)
            const total = Number(invoice.total || 0)

            totalCGST += cgst
            totalSGST += sgst
            totalIGST += igst
            totalTaxable += subtotal
            totalValue += total

            const supplyType = invoice.supply_type || (igst > 0 ? 'inter-state' : 'intra-state')

            if (supplyType === 'intra-state') {
                totalIntraState += total
            } else {
                totalInterState += total
            }

            if (invoice.reverse_charge_applicable) {
                reverseChargeCount++
            }

            const customerName = invoice.customer?.name || 'Walk-in Customer'
            const gstin = invoice.customer?.gstin || 'Unregistered'

            return {
                invoiceNumber: invoice.invoice_number,
                date: invoice.invoice_date,
                customer: customerName,
                gstin: gstin,
                supplyType: supplyType,
                subtotal: subtotal,
                cgst: cgst,
                sgst: sgst,
                igst: igst,
                total: total,
                reverseCharge: !!invoice.reverse_charge_applicable
            }
        })

        const summaryData = {
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
                totalInvoices: reportData.length,
                totalTaxable,
                totalValue
            },
            company: {
                name: settings?.company_name || 'My Business',
                gstin: settings?.company_gstin || '',
                address: settings?.company_address || '',
                email: settings?.company_email || user.email || '',
                phone: settings?.company_phone || ''
            }
        }

        if (format === 'json') {
            return NextResponse.json(summaryData)
        }

        if (format === 'csv' || format === 'excel') {
            const csv = generateGSTCSV(summaryData)
            return new NextResponse('\uFEFF' + csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="GST-Report-${startDate}-to-${endDate}.csv"`
                }
            })
        }

        // Printable HTML report
        const html = generateGSTReportHTML(summaryData)
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="GST-Report-${startDate}-to-${endDate}.html"`
            }
        })
    } catch (error) {
        console.error('Error generating GST report:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

function generateGSTCSV(data: GSTReportData & { company?: { name: string; gstin: string } }) {
    let csv = `GST REPORT (GSTR-1 COMPLIANCE)\n`
    csv += `Company:,"${data.company?.name || 'My Business'}"\n`
    if (data.company?.gstin) csv += `GSTIN:,"${data.company.gstin}"\n`
    csv += `Period:,${data.startDate} to ${data.endDate}\n`
    csv += `Generated On:,${new Date().toLocaleDateString('en-IN')}\n\n`

    csv += `TAX SUMMARY\n`
    csv += `Total Invoices,${data.summary.totalInvoices}\n`
    csv += `Taxable Value (₹),${data.summary.totalTaxable.toFixed(2)}\n`
    csv += `Total CGST (₹),${data.summary.totalCGST.toFixed(2)}\n`
    csv += `Total SGST (₹),${data.summary.totalSGST.toFixed(2)}\n`
    csv += `Total IGST (₹),${data.summary.totalIGST.toFixed(2)}\n`
    csv += `Total GST (₹),${(data.summary.totalCGST + data.summary.totalSGST + data.summary.totalIGST).toFixed(2)}\n`
    csv += `Total Invoice Value (₹),${data.summary.totalValue.toFixed(2)}\n`
    csv += `Intra-State Supplies (₹),${data.summary.totalIntraState.toFixed(2)}\n`
    csv += `Inter-State Supplies (₹),${data.summary.totalInterState.toFixed(2)}\n`
    csv += `Reverse Charge Invoices,${data.summary.reverseChargeCount}\n\n`

    csv += `INVOICE REGISTER\n`
    csv += `Invoice Number,Date,Customer Name,GSTIN,Supply Type,Reverse Charge,Taxable Value (INR),CGST (INR),SGST (INR),IGST (INR),Total GST (INR),Invoice Total (INR)\n`

    data.invoices.forEach(inv => {
        const safeCust = `"${(inv.customer || '').replace(/"/g, '""')}"`
        const totalGst = inv.cgst + inv.sgst + inv.igst
        csv += `${inv.invoiceNumber},${inv.date},${safeCust},${inv.gstin},${inv.supplyType},${inv.reverseCharge ? 'Y' : 'N'},${inv.subtotal.toFixed(2)},${inv.cgst.toFixed(2)},${inv.sgst.toFixed(2)},${inv.igst.toFixed(2)},${totalGst.toFixed(2)},${inv.total.toFixed(2)}\n`
    })

    return csv
}

function generateGSTReportHTML(data: GSTReportData & { company?: { name: string; gstin: string; address?: string; phone?: string; email?: string } }) {
    const { startDate, endDate, invoices, summary, company } = data
    const totalGst = summary.totalCGST + summary.totalSGST + summary.totalIGST

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GST Report (${startDate} to ${endDate})</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #1e293b; background: #fff; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
        .company-name { font-size: 24px; font-weight: 700; color: #1e3a8a; }
        .company-details { font-size: 12px; color: #64748b; margin-top: 4px; }
        .report-title { text-align: right; }
        .report-title h1 { font-size: 20px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
        .report-period { font-size: 13px; color: #2563eb; font-weight: 600; margin-top: 4px; }
        .actions-bar { margin-bottom: 20px; display: flex; gap: 12px; }
        .btn-print { background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-print:hover { background: #1d4ed8; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
        .summary-card.highlight { background: #eff6ff; border-color: #bfdbfe; }
        .summary-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
        .summary-value { font-size: 20px; font-weight: 700; color: #0f172a; }
        .tax-breakdown-bar { display: flex; gap: 16px; background: #f1f5f9; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; font-weight: 500; }
        .table-wrap { overflow-x: auto; margin-top: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #0f172a; color: #f8fafc; text-align: left; padding: 10px 12px; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        th.text-right, td.text-right { text-align: right; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        tr:nth-child(even) td { background: #f8fafc; }
        tfoot td { font-weight: 700; background: #f1f5f9; border-top: 2px solid #cbd5e1; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .badge-intra { background: #dbeafe; color: #1e40af; }
        .badge-inter { background: #fef3c7; color: #92400e; }
        .badge-rc { background: #fee2e2; color: #991b1b; margin-left: 4px; }
        .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
        @media print {
            body { padding: 0; }
            .actions-bar { display: none; }
        }
    </style>
</head>
<body>
    <div class="actions-bar">
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
        <div>
            <div class="company-name">${company?.name || 'Business Report'}</div>
            <div class="company-details">
                ${company?.gstin ? `<strong>GSTIN:</strong> ${company.gstin} &bull; ` : ''}
                ${company?.email ? `<strong>Email:</strong> ${company.email} &bull; ` : ''}
                ${company?.phone ? `<strong>Phone:</strong> ${company.phone}` : ''}
            </div>
            ${company?.address ? `<div class="company-details">${company.address}</div>` : ''}
        </div>
        <div class="report-title">
            <h1>GST Outward Supplies (GSTR-1)</h1>
            <div class="report-period">Period: ${new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
    </div>

    <div class="summary-grid">
        <div class="summary-card highlight">
            <div class="summary-label">Total Taxable Value</div>
            <div class="summary-value">₹${summary.totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card highlight">
            <div class="summary-label">Total GST Collected</div>
            <div class="summary-value">₹${totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total Invoice Value</div>
            <div class="summary-value">₹${summary.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total Invoices</div>
            <div class="summary-value">${summary.totalInvoices}</div>
        </div>
    </div>

    <div class="tax-breakdown-bar">
        <div><strong>CGST:</strong> ₹${summary.totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div>&bull;</div>
        <div><strong>SGST:</strong> ₹${summary.totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div>&bull;</div>
        <div><strong>IGST:</strong> ₹${summary.totalIGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div>&bull;</div>
        <div><strong>Intra-State Sales:</strong> ₹${summary.totalIntraState.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div>&bull;</div>
        <div><strong>Inter-State Sales:</strong> ₹${summary.totalInterState.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        ${summary.reverseChargeCount > 0 ? `<div>&bull;</div><div><strong>Reverse Charge:</strong> ${summary.reverseChargeCount}</div>` : ''}
    </div>

    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>GSTIN</th>
                    <th>Type</th>
                    <th class="text-right">Taxable (₹)</th>
                    <th class="text-right">CGST (₹)</th>
                    <th class="text-right">SGST (₹)</th>
                    <th class="text-right">IGST (₹)</th>
                    <th class="text-right">Total (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${invoices.map(inv => `
                <tr>
                    <td><strong>${inv.invoiceNumber}</strong></td>
                    <td>${new Date(inv.date).toLocaleDateString('en-IN')}</td>
                    <td>${inv.customer}</td>
                    <td><code>${inv.gstin}</code></td>
                    <td>
                        <span class="badge ${inv.supplyType === 'intra-state' ? 'badge-intra' : 'badge-inter'}">
                            ${inv.supplyType === 'intra-state' ? 'Intra' : 'Inter'}
                        </span>
                        ${inv.reverseCharge ? '<span class="badge badge-rc">RC</span>' : ''}
                    </td>
                    <td class="text-right">${inv.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">${inv.cgst > 0 ? inv.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}</td>
                    <td class="text-right">${inv.sgst > 0 ? inv.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}</td>
                    <td class="text-right">${inv.igst > 0 ? inv.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}</td>
                    <td class="text-right"><strong>₹${inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                </tr>
                `).join('')}
                ${invoices.length === 0 ? '<tr><td colspan="10" style="text-align:center; padding: 24px; color:#94a3b8;">No invoices found for this date range.</td></tr>' : ''}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5"><strong>TOTALS (${invoices.length} Invoices)</strong></td>
                    <td class="text-right">₹${summary.totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">₹${summary.totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">₹${summary.totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">₹${summary.totalIGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">₹${summary.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="footer">
        <div>Generated by BillBooky &bull; Clean GST Filing & Accounting</div>
        <div>Report Timestamp: ${new Date().toLocaleString('en-IN')}</div>
    </div>
</body>
</html>`
}
