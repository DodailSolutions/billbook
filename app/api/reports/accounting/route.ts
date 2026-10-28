import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CustomerData {
    name: string
    email: string | null
    invoiceCount: number
    totalAmount: number
    paidAmount: number
    pendingAmount: number
}

interface InvoiceData {
    invoiceNumber: string
    date: string
    customer: string
    amount: number
    status: string
    paymentMethod: string | null
}

interface AccountingReportData {
    startDate: string
    endDate: string
    summary: {
        totalRevenue: number
        totalPaid: number
        totalPending: number
        totalInvoices: number
        paidCount: number
        pendingCount: number
    }
    customers: CustomerData[]
    invoices: InvoiceData[]
    company?: {
        name: string
        gstin: string
        address: string
        email: string
        phone: string
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

        // Fetch company settings
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
                customer:customers(*)
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

        // Calculate statistics
        let totalRevenue = 0
        let totalPaid = 0
        let totalPending = 0
        let paidCount = 0
        let pendingCount = 0

        const customerMap = new Map<string, CustomerData>()

        const invoiceRows: InvoiceData[] = invList.map(inv => {
            const total = Number(inv.total || 0)
            const isPaid = inv.status === 'paid'
            const isPending = inv.status === 'pending' || inv.status === 'sent' || inv.status === 'partial'

            totalRevenue += total
            if (isPaid) {
                totalPaid += total
                paidCount++
            } else if (isPending) {
                const remaining = inv.amount_remaining !== undefined && inv.amount_remaining !== null
                    ? Number(inv.amount_remaining)
                    : total
                totalPending += remaining
                pendingCount++
            }

            const customerId = inv.customer_id || 'unknown'
            const custName = inv.customer?.name || 'Walk-in Customer'
            const custEmail = inv.customer?.email || null

            if (!customerMap.has(customerId)) {
                customerMap.set(customerId, {
                    name: custName,
                    email: custEmail,
                    invoiceCount: 0,
                    totalAmount: 0,
                    paidAmount: 0,
                    pendingAmount: 0
                })
            }

            const c = customerMap.get(customerId)!
            c.invoiceCount++
            c.totalAmount += total
            if (isPaid) {
                c.paidAmount += total
            } else if (isPending) {
                const rem = inv.amount_remaining !== undefined && inv.amount_remaining !== null
                    ? Number(inv.amount_remaining)
                    : total
                c.pendingAmount += rem
            }

            return {
                invoiceNumber: inv.invoice_number,
                date: inv.invoice_date,
                customer: custName,
                amount: total,
                status: inv.status,
                paymentMethod: inv.payment_method || null
            }
        })

        const reportData: AccountingReportData = {
            startDate,
            endDate,
            summary: {
                totalRevenue,
                totalPaid,
                totalPending,
                totalInvoices: invList.length,
                paidCount,
                pendingCount
            },
            customers: Array.from(customerMap.values()).sort((a, b) => b.totalAmount - a.totalAmount),
            invoices: invoiceRows,
            company: {
                name: settings?.company_name || 'My Business',
                gstin: settings?.company_gstin || '',
                address: settings?.company_address || '',
                email: settings?.company_email || user.email || '',
                phone: settings?.company_phone || ''
            }
        }

        if (format === 'json') {
            return NextResponse.json(reportData)
        }

        if (format === 'csv' || format === 'excel') {
            const csv = generateCSV(reportData)
            return new NextResponse('\uFEFF' + csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="Accounting-Report-${startDate}-to-${endDate}.csv"`
                }
            })
        }

        // Printable HTML
        const html = generateAccountingReportHTML(reportData)
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="Accounting-Report-${startDate}-to-${endDate}.html"`
            }
        })
    } catch (error) {
        console.error('Error generating accounting report:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

function generateCSV(data: AccountingReportData) {
    let csv = `ACCOUNTING & FINANCIAL REPORT\n`
    csv += `Company:,"${data.company?.name || 'My Business'}"\n`
    if (data.company?.gstin) csv += `GSTIN:,"${data.company.gstin}"\n`
    csv += `Period:,${data.startDate} to ${data.endDate}\n`
    csv += `Generated On:,${new Date().toLocaleDateString('en-IN')}\n\n`
    
    csv += 'EXECUTIVE SUMMARY\n'
    csv += `Total Invoices,${data.summary.totalInvoices}\n`
    csv += `Total Billed Revenue (₹),${data.summary.totalRevenue.toFixed(2)}\n`
    csv += `Total Paid / Collected (₹),${data.summary.totalPaid.toFixed(2)}\n`
    csv += `Total Pending / Receivables (₹),${data.summary.totalPending.toFixed(2)}\n`
    csv += `Paid Invoices Count,${data.summary.paidCount}\n`
    csv += `Pending Invoices Count,${data.summary.pendingCount}\n\n`
    
    csv += 'CUSTOMER SUMMARY\n'
    csv += 'Customer Name,Email,Invoice Count,Total Billed (INR),Paid Amount (INR),Pending Balance (INR)\n'
    data.customers.forEach((c: CustomerData) => {
        const safeName = `"${c.name.replace(/"/g, '""')}"`
        const safeEmail = `"${(c.email || '').replace(/"/g, '""')}"`
        csv += `${safeName},${safeEmail},${c.invoiceCount},${c.totalAmount.toFixed(2)},${c.paidAmount.toFixed(2)},${c.pendingAmount.toFixed(2)}\n`
    })
    
    csv += '\nINVOICE REGISTER\n'
    csv += 'Invoice Number,Date,Customer,Amount (INR),Status,Payment Method\n'
    data.invoices.forEach((inv: InvoiceData) => {
        const safeCust = `"${inv.customer.replace(/"/g, '""')}"`
        csv += `${inv.invoiceNumber},${inv.date},${safeCust},${inv.amount.toFixed(2)},${inv.status},"${inv.paymentMethod || 'N/A'}"\n`
    })
    
    return csv
}

function generateAccountingReportHTML(data: AccountingReportData) {
    const { startDate, endDate, summary, customers, invoices, company } = data

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accounting Report (${startDate} to ${endDate})</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #1e293b; background: #fff; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 24px; }
        .company-name { font-size: 24px; font-weight: 700; color: #5b21b6; }
        .company-details { font-size: 12px; color: #64748b; margin-top: 4px; }
        .report-title { text-align: right; }
        .report-title h1 { font-size: 20px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
        .report-period { font-size: 13px; color: #7c3aed; font-weight: 600; margin-top: 4px; }
        .actions-bar { margin-bottom: 20px; display: flex; gap: 12px; }
        .btn-print { background: #7c3aed; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-print:hover { background: #6d28d9; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
        .summary-card.highlight { background: #faf5ff; border-color: #ddd6fe; }
        .summary-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
        .summary-value { font-size: 20px; font-weight: 700; color: #0f172a; }
        .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 28px 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        .table-wrap { overflow-x: auto; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #0f172a; color: #f8fafc; text-align: left; padding: 10px 12px; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        th.text-right, td.text-right { text-align: right; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        tr:nth-child(even) td { background: #f8fafc; }
        tfoot td { font-weight: 700; background: #f1f5f9; border-top: 2px solid #cbd5e1; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .badge-paid { background: #dcfce7; color: #15803d; }
        .badge-pending { background: #fef3c7; color: #b45309; }
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
            <div class="company-name">${company?.name || 'Business Accounting Report'}</div>
            <div class="company-details">
                ${company?.gstin ? `<strong>GSTIN:</strong> ${company.gstin} &bull; ` : ''}
                ${company?.email ? `<strong>Email:</strong> ${company.email} &bull; ` : ''}
                ${company?.phone ? `<strong>Phone:</strong> ${company.phone}` : ''}
            </div>
            ${company?.address ? `<div class="company-details">${company.address}</div>` : ''}
        </div>
        <div class="report-title">
            <h1>Accounting & Revenue Report</h1>
            <div class="report-period">Period: ${new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
    </div>

    <div class="summary-grid">
        <div class="summary-card highlight">
            <div class="summary-label">Total Billed Revenue</div>
            <div class="summary-value">₹${summary.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total Paid (Collected)</div>
            <div class="summary-value" style="color: #16a34a;">₹${summary.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total Outstanding</div>
            <div class="summary-value" style="color: #ea580c;">₹${summary.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="summary-card">
            <div class="summary-label">Total Invoices</div>
            <div class="summary-value">${summary.totalInvoices} <span style="font-size:12px; font-weight:normal; color:#64748b;">(${summary.paidCount} paid, ${summary.pendingCount} pending)</span></div>
        </div>
    </div>

    <div class="section-title">Customer-Wise Breakdown</div>
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th class="text-right">Invoices</th>
                    <th class="text-right">Total Billed (₹)</th>
                    <th class="text-right">Paid (₹)</th>
                    <th class="text-right">Pending Balance (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map(c => `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.email || '-'}</td>
                    <td class="text-right">${c.invoiceCount}</td>
                    <td class="text-right">₹${c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right" style="color: #16a34a;">₹${c.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right" style="color: ${c.pendingAmount > 0 ? '#ea580c' : '#64748b'}; font-weight: ${c.pendingAmount > 0 ? '700' : 'normal'};">
                        ₹${c.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                </tr>
                `).join('')}
                ${customers.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 16px; color:#94a3b8;">No customer activity recorded for this period.</td></tr>' : ''}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>TOTALS (${customers.length} Customers)</strong></td>
                    <td class="text-right">₹${summary.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right" style="color:#16a34a;">₹${summary.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right" style="color:#ea580c;">₹${summary.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="section-title">Invoices Issued in Period</div>
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th class="text-right">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${invoices.map(inv => `
                <tr>
                    <td><strong>${inv.invoiceNumber}</strong></td>
                    <td>${new Date(inv.date).toLocaleDateString('en-IN')}</td>
                    <td>${inv.customer}</td>
                    <td>
                        <span class="badge ${inv.status === 'paid' ? 'badge-paid' : 'badge-pending'}">
                            ${inv.status}
                        </span>
                    </td>
                    <td>${inv.paymentMethod ? inv.paymentMethod.replace(/_/g, ' ') : '-'}</td>
                    <td class="text-right"><strong>₹${inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <div>Generated by BillBooky &bull; Comprehensive Accounting Suite</div>
        <div>Report Timestamp: ${new Date().toLocaleString('en-IN')}</div>
    </div>
</body>
</html>`
}
