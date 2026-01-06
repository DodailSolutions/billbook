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
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { startDate, endDate, format = 'pdf' } = await request.json()

        if (!startDate || !endDate) {
            return new NextResponse('Start date and end date are required', { status: 400 })
        }

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

        // Calculate statistics
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
        const paidInvoices = invoices.filter(inv => inv.status === 'paid')
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending')
        const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
        const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0)

        // Customer breakdown
        const customerMap = new Map()
        invoices.forEach(inv => {
            const customerId = inv.customer_id
            if (!customerMap.has(customerId)) {
                customerMap.set(customerId, {
                    name: inv.customer.name,
                    email: inv.customer.email,
                    invoiceCount: 0,
                    totalAmount: 0,
                    paidAmount: 0,
                    pendingAmount: 0
                })
            }
            const customer = customerMap.get(customerId)
            customer.invoiceCount++
            customer.totalAmount += inv.total
            if (inv.status === 'paid') {
                customer.paidAmount += inv.total
            } else {
                customer.pendingAmount += inv.total
            }
        })

        const reportData = {
            startDate,
            endDate,
            summary: {
                totalRevenue,
                totalPaid,
                totalPending,
                totalInvoices: invoices.length,
                paidCount: paidInvoices.length,
                pendingCount: pendingInvoices.length
            },
            customers: Array.from(customerMap.values()),
            invoices: invoices.map(inv => ({
                invoiceNumber: inv.invoice_number,
                date: inv.invoice_date,
                customer: inv.customer.name,
                amount: inv.total,
                status: inv.status,
                paymentMethod: inv.payment_method
            }))
        }

        if (format === 'excel') {
            // Generate CSV for Excel
            const csv = generateCSV(reportData)
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="Accounting-Report-${startDate}-to-${endDate}.csv"`
                }
            })
        }

        // Generate PDF HTML
        const html = generateAccountingReportHTML(reportData)
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Accounting-Report-${startDate}-to-${endDate}.pdf"`
            }
        })
    } catch (error) {
        console.error('Error generating accounting report:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

function generateCSV(data: AccountingReportData) {
    let csv = 'Accounting Report\n'
    csv += `Period: ${data.startDate} to ${data.endDate}\n\n`
    
    csv += 'SUMMARY\n'
    csv += `Total Revenue,${data.summary.totalRevenue}\n`
    csv += `Total Paid,${data.summary.totalPaid}\n`
    csv += `Total Pending,${data.summary.totalPending}\n`
    csv += `Total Invoices,${data.summary.totalInvoices}\n\n`
    
    csv += 'CUSTOMER BREAKDOWN\n'
    csv += 'Customer,Email,Invoice Count,Total Amount,Paid Amount,Pending Amount\n'
    data.customers.forEach((c: CustomerData) => {
        csv += `${c.name},${c.email || 'N/A'},${c.invoiceCount},${c.totalAmount},${c.paidAmount},${c.pendingAmount}\n`
    })
    
    csv += '\nINVOICE DETAILS\n'
    csv += 'Invoice Number,Date,Customer,Amount,Status,Payment Method\n'
    data.invoices.forEach((inv: InvoiceData) => {
        csv += `${inv.invoiceNumber},${inv.date},${inv.customer},${inv.amount},${inv.status},${inv.paymentMethod || 'N/A'}\n`
    })
    
    return csv
}

function generateAccountingReportHTML(data: AccountingReportData) {
    const { startDate, endDate, summary, customers, invoices } = data

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Accounting Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #7c3aed; margin-bottom: 10px; }
        .subtitle { color: #6b7280; margin-bottom: 30px; }
        .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .summary-item { text-align: center; }
        .summary-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #7c3aed; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #7c3aed; color: white; padding: 12px; text-align: left; font-size: 12px; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        tr:hover { background: #f9fafb; }
        .text-right { text-align: right; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
        .badge-paid { background: #d1fae5; color: #065f46; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .section { margin-top: 40px; }
    </style>
</head>
<body>
    <h1>Accounting Report</h1>
    <div class="subtitle">Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</div>
    
    <div class="summary">
        <h3 style="margin-bottom: 20px;">Financial Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Revenue</div>
                <div class="summary-value">₹${summary.totalRevenue.toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Collected</div>
                <div class="summary-value" style="color: #059669;">₹${summary.totalPaid.toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Pending</div>
                <div class="summary-value" style="color: #d97706;">₹${summary.totalPending.toFixed(2)}</div>
            </div>
        </div>
        <div class="summary-grid" style="margin-top: 20px;">
            <div class="summary-item">
                <div class="summary-label">Total Invoices</div>
                <div class="summary-value">${summary.totalInvoices}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Paid Invoices</div>
                <div class="summary-value" style="color: #059669;">${summary.paidCount}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Pending Invoices</div>
                <div class="summary-value" style="color: #d97706;">${summary.pendingCount}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Customer Breakdown</h3>
        <table>
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th class="text-right">Invoices</th>
                    <th class="text-right">Total Amount</th>
                    <th class="text-right">Paid</th>
                    <th class="text-right">Pending</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map((c: CustomerData) => `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.email || 'N/A'}</td>
                    <td class="text-right">${c.invoiceCount}</td>
                    <td class="text-right"><strong>₹${c.totalAmount.toFixed(2)}</strong></td>
                    <td class="text-right" style="color: #059669;">₹${c.paidAmount.toFixed(2)}</td>
                    <td class="text-right" style="color: #d97706;">₹${c.pendingAmount.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Invoice Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th class="text-right">Amount</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                </tr>
            </thead>
            <tbody>
                ${invoices.map((inv: InvoiceData) => `
                <tr>
                    <td>${inv.invoiceNumber}</td>
                    <td>${new Date(inv.date).toLocaleDateString()}</td>
                    <td>${inv.customer}</td>
                    <td class="text-right"><strong>₹${inv.amount.toFixed(2)}</strong></td>
                    <td>
                        <span class="badge ${inv.status === 'paid' ? 'badge-paid' : 'badge-pending'}">
                            ${inv.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                    </td>
                    <td>${inv.paymentMethod ? inv.paymentMethod.replace('_', ' ') : 'N/A'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280;">
        <p><strong>Note:</strong> This report is for reference purposes. Please verify all details with your records.</p>
        <p style="margin-top: 8px;">Generated on: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
    `
}
