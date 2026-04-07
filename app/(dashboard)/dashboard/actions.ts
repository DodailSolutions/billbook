'use server'

import { createClient } from '@/lib/supabase/server'
import type { DashboardStats, MonthlyData, RecentInvoice } from '@/lib/types'

const emptyStats: DashboardStats = {
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    partialInvoices: 0,
    cancelledInvoices: 0,
    outstandingAmount: 0,
    monthlyData: [],
    recentInvoices: [],
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return emptyStats
        }

        // Fetch all invoices with customer info and date
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('id, invoice_number, total, status, invoice_date, amount_paid, customers(name)')
            .eq('user_id', user.id)
            .order('invoice_date', { ascending: false })

        if (error || !invoices) {
            console.error('Error fetching invoices:', error?.message)
            return emptyStats
        }

        // Aggregate totals
        const totalRevenue = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.total || 0), 0)

        const paidInvoices = invoices.filter(inv => inv.status === 'paid').length
        const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length
        const partialInvoices = invoices.filter(inv => inv.status === 'partial').length
        const cancelledInvoices = invoices.filter(inv => inv.status === 'cancelled').length

        // Outstanding = total of unpaid/partial invoices minus what's been paid
        const outstandingAmount = invoices
            .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
            .reduce((sum, inv) => sum + ((inv.total || 0) - (inv.amount_paid || 0)), 0)

        // Build monthly data for the last 12 months
        const now = new Date()
        const monthlyMap = new Map<string, MonthlyData>()

        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
            monthlyMap.set(key, { month: label, revenue: 0, invoiceCount: 0, paid: 0, pending: 0, partial: 0 })
        }

        for (const inv of invoices) {
            if (!inv.invoice_date) continue
            const key = inv.invoice_date.slice(0, 7) // "YYYY-MM"
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

        const monthlyData = Array.from(monthlyMap.values())

        // Recent invoices (last 8)
        const recentInvoices: RecentInvoice[] = invoices.slice(0, 8).map(inv => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            customer_name: (inv.customers as any)?.name || 'Unknown',
            total: inv.total || 0,
            status: inv.status,
            invoice_date: inv.invoice_date,
        }))

        return {
            totalRevenue,
            totalInvoices: invoices.length,
            paidInvoices,
            pendingInvoices,
            partialInvoices,
            cancelledInvoices,
            outstandingAmount,
            monthlyData,
            recentInvoices,
        }
    } catch (err) {
        console.error('Unexpected error in getDashboardStats:', err)
        return emptyStats
    }
}
