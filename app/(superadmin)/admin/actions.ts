'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { DashboardStats, VerticalAnalyticsSummary, VerticalDistributionStat } from '@/lib/types-admin'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { BUSINESS_VERTICALS, type BusinessType } from '@/lib/business-profile-types'
import { fetchEmployeeLookupMaps, isEmployeeRecord } from '@/lib/admin-employee-utils'

export async function getDashboardStats(): Promise<DashboardStats | null> {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return null
        }

        let supabase = await createClient()
        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                supabase = await createAdminClient()
            }
        } catch {
            // Fallback to standard client
        }

        // Fetch all stats concurrently in parallel for maximum performance
        const [
            paymentsRes,
            refundsRes,
            profilesRes,
            subsRes,
            ticketsRes,
            empMaps
        ] = await Promise.all([
            supabase.from('payments').select('amount, status'),
            supabase.from('refunds').select('amount, status'),
            supabase.from('user_profiles').select('id, business_email, role'),
            supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
            fetchEmployeeLookupMaps(supabase)
        ])

        const payments = paymentsRes.data || []
        const refunds = refundsRes.data || []
        const nonEmployeeProfiles = (profilesRes.data || []).filter((p: any) => !isEmployeeRecord(p, empMaps))
        const total_users = nonEmployeeProfiles.length
        const active_subscriptions = subsRes.count || 0
        const open_tickets = ticketsRes.count || 0

        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

        // Fetch distinct active users in last 24h and last 7 days
        const [active24hRes, active7dRes, inv24hRes, inv7dRes] = await Promise.all([
            supabase.from('audit_logs').select('user_id').gte('created_at', oneDayAgo),
            supabase.from('audit_logs').select('user_id').gte('created_at', sevenDaysAgo),
            supabase.from('invoices').select('user_id').gte('created_at', oneDayAgo),
            supabase.from('invoices').select('user_id').gte('created_at', sevenDaysAgo)
        ])

        const active24hUsers = new Set<string>()
        ;(active24hRes.data || []).forEach((r: any) => { if (r.user_id) active24hUsers.add(r.user_id) })
        ;(inv24hRes.data || []).forEach((r: any) => { if (r.user_id) active24hUsers.add(r.user_id) })

        const active7dUsers = new Set<string>(active24hUsers)
        ;(active7dRes.data || []).forEach((r: any) => { if (r.user_id) active7dUsers.add(r.user_id) })
        ;(inv7dRes.data || []).forEach((r: any) => { if (r.user_id) active7dUsers.add(r.user_id) })

        const active_users_today = Math.min(total_users, active24hUsers.size)
        const active_users_7d = Math.min(total_users, active7dUsers.size)
        const inactive_users_7d = Math.max(0, total_users - active_users_7d)

        const total_payments = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0)

        const total_sales = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

        const unpaid_amount = payments
            .filter(p => p.status === 'pending' || p.status === 'failed')
            .reduce((sum, p) => sum + (p.amount || 0), 0)

        const refund_amount = refunds
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + (r.amount || 0), 0)

        const pending_refunds = refunds
            .filter(r => r.status === 'pending' || r.status === 'approved')
            .length

        return {
            total_sales,
            total_payments,
            unpaid_amount,
            refund_amount,
            total_users: total_users || 0,
            active_subscriptions: active_subscriptions || 0,
            pending_refunds,
            open_tickets: open_tickets || 0,
            active_users_today,
            active_users_7d,
            inactive_users_7d
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return null
    }
}

export async function getRecentActivity() {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return []
        }

        const supabase = await createClient()

        const { data } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        return data || []
    } catch (error) {
        console.error('Error fetching recent activity:', error)
        return []
    }
}

export async function getVerticalDistributionStats(): Promise<VerticalAnalyticsSummary> {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return {
                totalTenants: 0,
                totalActiveVerticals: 0,
                totalUntappedVerticals: 0,
                topVertical: null,
                verticals: []
            }
        }

        let supabase = await createClient()
        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                supabase = await createAdminClient()
            }
        } catch {
            // Fallback to standard client
        }

        // Fetch all user profiles with business_type
        const [{ data: profiles }, empMaps] = await Promise.all([
            supabase
                .from('user_profiles')
                .select('id, business_email, business_type, status, role'),
            fetchEmployeeLookupMaps(supabase)
        ])

        // Fetch invoice aggregates per user to associate volume per vertical
        const { data: invoices } = await supabase
            .from('invoices')
            .select('user_id, total, status')

        // Build invoice aggregations map by user_id
        const userInvoiceMap = new Map<string, { count: number; totalSales: number }>()
        if (invoices) {
            for (const inv of invoices) {
                const current = userInvoiceMap.get(inv.user_id) || { count: 0, totalSales: 0 }
                current.count += 1
                current.totalSales += Number(inv.total || 0)
                userInvoiceMap.set(inv.user_id, current)
            }
        }

        // Tally profiles by vertical (exclude super admins and company employees)
        const validProfiles = (profiles || []).filter(
            (p: any) => p.role !== 'superadmin' && p.role !== 'super_admin' && !isEmployeeRecord(p, empMaps)
        )
        const totalTenants = validProfiles.length

        const verticalMap = new Map<string, {
            users: number
            activeUsers: number
            invoices: number
            sales: number
        }>()

        for (const [key] of Object.entries(BUSINESS_VERTICALS)) {
            verticalMap.set(key, { users: 0, activeUsers: 0, invoices: 0, sales: 0 })
        }

        for (const p of validProfiles) {
            const rawType = (p.business_type as string) || 'retail'
            const matchedKey = BUSINESS_VERTICALS[rawType as BusinessType] 
                ? rawType 
                : 'retail'
            
            const stats = verticalMap.get(matchedKey) || { users: 0, activeUsers: 0, invoices: 0, sales: 0 }
            stats.users += 1
            if (p.status === 'active') {
                stats.activeUsers += 1
            }

            const invData = userInvoiceMap.get(p.id)
            if (invData) {
                stats.invoices += invData.count
                stats.sales += invData.totalSales
            }

            verticalMap.set(matchedKey, stats)
        }

        const resultList: VerticalDistributionStat[] = Object.entries(BUSINESS_VERTICALS).map(([key, config]) => {
            const counts = verticalMap.get(key) || { users: 0, activeUsers: 0, invoices: 0, sales: 0 }
            const percentage = totalTenants > 0 ? Number(((counts.users / totalTenants) * 100).toFixed(1)) : 0
            
            let status: 'leader' | 'growing' | 'early' | 'untapped' = 'untapped'
            if (counts.users === 0) {
                status = 'untapped'
            } else if (percentage >= 25 || counts.users >= 10) {
                status = 'leader'
            } else if (counts.users >= 3 || percentage >= 5) {
                status = 'growing'
            } else {
                status = 'early'
            }

            return {
                id: key,
                name: config.name,
                category: config.category,
                icon: config.icon,
                primaryColor: config.primaryColor,
                tagline: config.tagline,
                userCount: counts.users,
                percentage,
                activeUserCount: counts.activeUsers,
                totalInvoices: counts.invoices,
                totalSales: counts.sales,
                status
            }
        })

        // Sort: leaders first, then by userCount desc, untapped last
        resultList.sort((a, b) => {
            if (a.userCount !== b.userCount) return b.userCount - a.userCount
            return a.name.localeCompare(b.name)
        })

        const activeVerticals = resultList.filter(v => v.userCount > 0)
        const untappedVerticals = resultList.filter(v => v.userCount === 0)
        const topVertical = activeVerticals.length > 0 
            ? {
                id: activeVerticals[0].id,
                name: activeVerticals[0].name,
                count: activeVerticals[0].userCount,
                percentage: activeVerticals[0].percentage
            }
            : null

        return {
            totalTenants,
            totalActiveVerticals: activeVerticals.length,
            totalUntappedVerticals: untappedVerticals.length,
            topVertical,
            verticals: resultList
        }
    } catch (err) {
        console.error('Error fetching vertical distribution stats:', err)
        return {
            totalTenants: 0,
            totalActiveVerticals: 0,
            totalUntappedVerticals: 0,
            topVertical: null,
            verticals: []
        }
    }
}
