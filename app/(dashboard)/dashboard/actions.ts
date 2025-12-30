'use server'

import { createClient } from '@/lib/supabase/server'
import type { DashboardStats } from '@/lib/types'

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
            console.error('Auth error:', authError.message)
            return {
                totalRevenue: 0,
                totalInvoices: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
            }
        }

        if (!user) {
            console.log('No authenticated user found')
            return {
                totalRevenue: 0,
                totalInvoices: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
            }
        }

        // Get all invoices
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('total, status')
            .eq('user_id', user.id)

        if (error) {
            console.error('Error fetching invoices:', error.message, error.details, error.hint)
            return {
                totalRevenue: 0,
                totalInvoices: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
            }
        }

        if (!invoices) {
            console.log('No invoices found')
            return {
                totalRevenue: 0,
                totalInvoices: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
            }
        }

        const totalRevenue = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.total, 0)

        const paidInvoices = invoices.filter(inv => inv.status === 'paid').length
        const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length

        return {
            totalRevenue,
            totalInvoices: invoices.length,
            paidInvoices,
            pendingInvoices,
        }
    } catch (err) {
        console.error('Unexpected error in getDashboardStats:', err)
        return {
            totalRevenue: 0,
            totalInvoices: 0,
            paidInvoices: 0,
            pendingInvoices: 0,
        }
    }
}
