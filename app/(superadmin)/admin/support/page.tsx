import { Ticket, Clock, CheckCircle2, AlertTriangle, MessageSquare, Shield, ArrowLeft, Filter, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getSupportTickets, getSupportStats } from '@/lib/support-actions'
import { SupportTicketsClientTable } from './SupportTicketsClientTable'

export const metadata = {
    title: 'Support Tickets & SLA Manager | Super Admin',
    description: 'Manage customer inquiries, live chat requests, and SLA performance.'
}

export default async function SupportManagementPage() {
    const [tickets, stats] = await Promise.all([
        getSupportTickets(),
        getSupportStats()
    ])

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
                            <Ticket className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Support & Helpdesk Command
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        SLA resolution tracking, customer live chat inquiries, and escalation queue.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Admin Overview
                        </Button>
                    </Link>
                </div>
            </div>

            {/* SLA & Ticket Metrics Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <Card className="border-gray-200 dark:border-gray-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Total Inquiries
                        </CardTitle>
                        <Ticket className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">
                            {stats.total}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">All customer tickets</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                            Open & Active
                        </CardTitle>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-amber-600 font-mono">
                            {stats.open + stats.inProgress}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{stats.open} unassigned, {stats.inProgress} in progress</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                            SLA Breached
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-black font-mono ${stats.slaBreached > 0 ? 'text-rose-600' : 'text-gray-900 dark:text-white'}`}>
                            {stats.slaBreached}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{stats.slaComplianceRate}% compliance rate</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                            Resolved
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-600 font-mono">
                            {stats.resolved + stats.closed}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">Closed & settled</p>
                    </CardContent>
                </Card>
            </div>

            {/* Interactive Tickets Table with Status Updating & SLA Badges */}
            <SupportTicketsClientTable initialTickets={tickets} />
        </div>
    )
}
