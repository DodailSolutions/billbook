import { getComprehensiveReportsData } from './actions'
import { ReportsDashboard } from './ReportsDashboard'

export const metadata = {
    title: 'Reports & Statements | BillBooky',
    description: 'GST compliance reports, P&L statements, customer aging, and accounting exports.'
}

export default async function ReportsPage() {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()

    // Default to current month
    const startDate = new Date(y, m, 1).toISOString().split('T')[0]
    const endDate = new Date(y, m + 1, 0).toISOString().split('T')[0]

    const result = await getComprehensiveReportsData(startDate, endDate)

    // Fallback payload if query failed or user is not logged in
    const defaultData = result.data || {
        startDate,
        endDate,
        kpis: {
            totalRevenue: 0,
            totalTaxable: 0,
            totalGST: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalPaid: 0,
            totalPending: 0,
            totalOverdue: 0,
            totalInvoices: 0,
            paidCount: 0,
            pendingCount: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0
        },
        gstSummary: {
            b2b: { count: 0, taxable: 0, tax: 0, total: 0 },
            b2c: { count: 0, taxable: 0, tax: 0, total: 0 },
            intraStateTotal: 0,
            interStateTotal: 0,
            reverseChargeCount: 0,
            reverseChargeTotal: 0
        },
        invoices: [],
        aging: {
            buckets: {
                current: 0,
                days1to30: 0,
                days31to60: 0,
                days61to90: 0,
                days90Plus: 0
            },
            customers: []
        },
        items: [],
        expenses: {
            total: 0,
            categories: []
        },
        company: {
            name: 'My Business',
            gstin: '',
            address: '',
            email: '',
            phone: ''
        }
    }

    return <ReportsDashboard initialData={defaultData} />
}
