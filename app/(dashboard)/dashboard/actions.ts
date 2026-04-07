'use server'

import { createClient } from '@/lib/supabase/server'
import type { DashboardStats, MonthlyData, RecentInvoice, TopClient, ExpenseCategory } from '@/lib/types'

const EXPENSE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#06b6d4']

const emptyStats: DashboardStats = {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    partialInvoices: 0,
    cancelledInvoices: 0,
    outstandingAmount: 0,
    avgInvoiceValue: 0,
    avgPaymentTime: 0,
    collectionRate: 0,
    monthlyData: [],
    recentInvoices: [],
    topClients: [],
    expenseBreakdown: [],
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return emptyStats
        }

        // Fetch all invoices with customer info + updated_at for payment time calc
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('id, invoice_number, total, status, invoice_date, amount_paid, updated_at, customers(name)')
            .eq('user_id', user.id)
            .order('invoice_date', { ascending: false })

        if (error || !invoices) {
            console.error('Error fetching invoices:', error?.message)
            return emptyStats
        }

        // Fetch expenses with category join (graceful — table may not be migrated yet)
        type ExpenseRow = { expense_date: string; total_amount: number; expense_categories: { category_name: string } | null }
        let expensesData: ExpenseRow[] = []
        const { data: exp, error: expError } = await supabase
            .from('expenses')
            .select('expense_date, total_amount, expense_categories(category_name)')
            .eq('user_id', user.id)
        if (!expError && exp) {
            expensesData = exp as unknown as ExpenseRow[]
        }

        // ── Invoice aggregates ──────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getName = (inv: any) => (inv.customers as { name: string } | null)?.name || 'Unknown'

        const paidInvs = invoices.filter(inv => inv.status === 'paid')
        const partialInvs = invoices.filter(inv => inv.status === 'partial')
        // Total revenue = fully paid invoices + amounts already collected on partial invoices
        const totalRevenue =
            paidInvs.reduce((sum, inv) => sum + (inv.total || 0), 0) +
            partialInvs.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0)
        const paidInvoices = paidInvs.length
        const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length
        const partialInvoices = partialInvs.length
        const cancelledInvoices = invoices.filter(inv => inv.status === 'cancelled').length

        const outstandingAmount = invoices
            .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
            .reduce((sum, inv) => sum + ((inv.total || 0) - (inv.amount_paid || 0)), 0)

        const nonCancelledInvs = invoices.filter(i => i.status !== 'cancelled')
        const avgInvoiceValue = nonCancelledInvs.length > 0
            ? Math.round(nonCancelledInvs.reduce((s, i) => s + (i.total || 0), 0) / nonCancelledInvs.length)
            : 0
        const collectionRate = invoices.length > 0 ? Math.round(((paidInvoices + partialInvoices) / invoices.length) * 100) : 0

        // Average payment time (days) — invoice_date → updated_at for paid invoices
        let avgPaymentTime = 0
        const paidWithDates = paidInvs.filter(inv => inv.invoice_date && inv.updated_at)
        if (paidWithDates.length > 0) {
            const totalDays = paidWithDates.reduce((sum, inv) => {
                const invoiced = new Date(inv.invoice_date).getTime()
                const paid = new Date(inv.updated_at).getTime()
                return sum + Math.max(0, Math.round((paid - invoiced) / 86400000))
            }, 0)
            avgPaymentTime = Math.round(totalDays / paidWithDates.length)
        }

        // ── Top clients (all non-cancelled invoices, use amount_paid for partial) ──────────────
        const clientMap = new Map<string, { revenue: number; invoiceCount: number }>()
        for (const inv of invoices.filter(i => i.status !== 'cancelled')) {
            const name = getName(inv)
            const existing = clientMap.get(name) || { revenue: 0, invoiceCount: 0 }
            existing.revenue += inv.status === 'partial' ? (inv.amount_paid || 0) : (inv.total || 0)
            existing.invoiceCount++
            clientMap.set(name, existing)
        }
        const topClients: TopClient[] = Array.from(clientMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // ── Expense aggregates ───────────────────────────────────
        const totalExpenses = expensesData.reduce((sum, e) => sum + (e.total_amount || 0), 0)
        const netProfit = totalRevenue - totalExpenses

        const categoryMap = new Map<string, number>()
        for (const exp of expensesData) {
            const cat = (exp.expense_categories as { category_name: string } | null)?.category_name || 'Other'
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + (exp.total_amount || 0))
        }
        const expenseBreakdown: ExpenseCategory[] = Array.from(categoryMap.entries())
            .map(([name, amount]) => ({
                name,
                amount,
                percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
                color: '',
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 8)
            .map((item, i) => ({ ...item, color: EXPENSE_COLORS[i] }))

        // ── Monthly data (last 12 months) ────────────────────────
        const now = new Date()
        const monthlyMap = new Map<string, MonthlyData>()

        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
            monthlyMap.set(key, { month: label, revenue: 0, expenses: 0, invoiceCount: 0, paid: 0, pending: 0, partial: 0 })
        }

        for (const inv of invoices) {
            if (!inv.invoice_date) continue
            const key = inv.invoice_date.slice(0, 7)
            const entry = monthlyMap.get(key)
            if (!entry) continue
            entry.invoiceCount++
            if (inv.status === 'paid') {
                entry.revenue += inv.total || 0
                entry.paid++
            } else if (inv.status === 'partial') {
                entry.revenue += inv.amount_paid || 0
                entry.partial++
            } else if (inv.status === 'sent' || inv.status === 'draft') {
                entry.pending++
            }
        }

        for (const exp of expensesData) {
            if (!exp.expense_date) continue
            const key = exp.expense_date.slice(0, 7)
            const entry = monthlyMap.get(key)
            if (!entry) continue
            entry.expenses += exp.total_amount || 0
        }

        const monthlyData = Array.from(monthlyMap.values())

        // ── Recent invoices ──────────────────────────────────────
        const recentInvoices: RecentInvoice[] = invoices.slice(0, 8).map(inv => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            customer_name: getName(inv),
            total: inv.total || 0,
            status: inv.status,
            invoice_date: inv.invoice_date,
        }))

        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            totalInvoices: invoices.length,
            paidInvoices,
            pendingInvoices,
            partialInvoices,
            cancelledInvoices,
            outstandingAmount,
            avgInvoiceValue,
            avgPaymentTime,
            collectionRate,
            monthlyData,
            recentInvoices,
            topClients,
            expenseBreakdown,
        }
    } catch (err) {
        console.error('Unexpected error in getDashboardStats:', err)
        return emptyStats
    }
}
