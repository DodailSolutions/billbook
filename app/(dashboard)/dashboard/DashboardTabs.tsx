'use client'

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import {
    IndianRupee, FileText, TrendingUp, TrendingDown,
    BarChart2, PieChart as PieIcon, Activity,
    ArrowUpRight, ArrowDownRight, Users, AlertCircle,
} from "lucide-react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import type { DashboardStats } from "@/lib/types"

interface DashboardTabsProps {
    stats: DashboardStats
}

const PIE_COLORS: Record<string, string> = {
    Paid: '#10b981',
    Pending: '#f59e0b',
    'Part Payment': '#3b82f6',
    Cancelled: '#ef4444',
}

const CLIENT_COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981']

const statusLabel: Record<string, string> = {
    paid: 'Paid', sent: 'Pending', draft: 'Draft', partial: 'Partial', cancelled: 'Cancelled',
}

const statusBadgeClass: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    sent: 'bg-amber-100 text-amber-700',
    draft: 'bg-gray-100 text-gray-600',
    partial: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-600',
}

function formatINR(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
    return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function ChartTooltip({
    active, payload, label,
}: {
    active?: boolean
    payload?: Array<{ value: number; name: string; color: string }>
    label?: string
}) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-sm min-w-36">
            <p className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wide">{label}</p>
            {payload.map(p => (
                <div key={p.name} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: p.color }} />
                        {p.name}
                    </span>
                    <span className="font-bold" style={{ color: p.color }}>
                        {typeof p.value === 'number' ? formatINR(p.value) : p.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

export function DashboardTabs({ stats }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'clients' | 'recent'>('overview')

    const prevM = stats.monthlyData[stats.monthlyData.length - 2]
    const thisM = stats.monthlyData[stats.monthlyData.length - 1]
    const revenueChange = prevM && prevM.revenue > 0
        ? +((((thisM?.revenue ?? 0) - prevM.revenue) / prevM.revenue) * 100).toFixed(1)
        : null
    const expensesChange = prevM && prevM.expenses > 0
        ? +((((thisM?.expenses ?? 0) - prevM.expenses) / prevM.expenses) * 100).toFixed(1)
        : null

    const profitMargin = stats.totalRevenue > 0
        ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)
        : '0.0'

    const pieData = [
        { name: 'Paid', value: stats.paidInvoices },
        { name: 'Pending', value: stats.pendingInvoices },
        { name: 'Part Payment', value: stats.partialInvoices },
        { name: 'Cancelled', value: stats.cancelledInvoices },
    ].filter(d => d.value > 0)

    const clientPieData = stats.topClients.map(c => ({
        name: c.name.split(' ').slice(0, 2).join(' '),
        value: c.revenue,
    }))

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Activity },
        { key: 'analytics', label: 'Reports', icon: BarChart2 },
        { key: 'clients', label: 'Clients', icon: Users },
        { key: 'recent', label: 'Recent', icon: FileText },
    ] as const

    function TrendBadge({ change, inverse = false }: { change: number | null; inverse?: boolean }) {
        if (change === null) return <p className="text-xs text-gray-400 mt-1">No previous data</p>
        const isPositive = change >= 0
        const isGood = inverse ? !isPositive : isPositive
        return (
            <p className={`text-xs mt-1 flex items-center gap-0.5 font-medium ${isGood ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {isPositive ? '+' : ''}{change}% from last month
            </p>
        )
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl px-4 sm:px-6 pt-5 sm:pt-6 pb-0 shadow-sm border border-gray-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Real-time business finance overview</p>
                    </div>
                    <div className="inline-flex w-fit items-center gap-2 bg-emerald-50 rounded-xl px-3 sm:px-4 py-2">
                        <span className="text-xs text-gray-500">Collection Rate</span>
                        <span className="text-base sm:text-lg font-bold text-emerald-600">{stats.collectionRate}%</span>
                    </div>
                </div>
                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
                    <div className="flex w-max sm:w-auto gap-1">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 pb-3 px-3 font-medium text-sm whitespace-nowrap transition-all relative ${
                                activeTab === key ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                            {activeTab === key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                            )}
                        </button>
                    ))}
                    </div>
                </div>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 font-medium">Total Revenue</span>
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <IndianRupee className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-word">{formatINR(stats.totalRevenue)}</p>
                                <TrendBadge change={revenueChange} />
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 font-medium">Total Expenses</span>
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <TrendingDown className="h-5 w-5 text-red-500" />
                                    </div>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-word">{formatINR(stats.totalExpenses)}</p>
                                <TrendBadge change={expensesChange} inverse />
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 font-medium">Net Profit</span>
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stats.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                        <TrendingUp className={`h-5 w-5 ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
                                    </div>
                                </div>
                                <p className={`text-xl sm:text-2xl font-bold wrap-break-word ${stats.netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                    {formatINR(stats.netProfit)}
                                </p>
                                <p className={`text-xs mt-1 font-medium ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {profitMargin}% margin
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 font-medium">Pending Invoices</span>
                                    <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-violet-600" />
                                    </div>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-word">{formatINR(stats.outstandingAmount)}</p>
                                <p className="text-xs text-gray-400 mt-1">{stats.pendingInvoices + stats.partialInvoices} unpaid</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-800">Revenue vs Expenses</CardTitle>
                            <p className="text-xs text-gray-400">Month-over-month comparison for the past 12 months</p>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={stats.monthlyData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v)} width={56} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }}
                                        formatter={(value) => (
                                            <span style={{ color: value === 'Revenue' ? '#3b82f6' : '#ef4444' }}>{value}</span>
                                        )}
                                    />
                                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2.5}
                                        dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#3b82f6' }}
                                        activeDot={{ r: 6, fill: '#3b82f6' }} />
                                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2.5}
                                        dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#ef4444' }}
                                        activeDot={{ r: 6, fill: '#ef4444' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-800">Invoice Status Distribution</CardTitle>
                            <p className="text-xs text-gray-400">{stats.totalInvoices} total · {stats.collectionRate}% collection rate</p>
                        </CardHeader>
                        <CardContent>
                            {pieData.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-gray-400 text-sm flex-col gap-2">
                                    <PieIcon className="h-10 w-10 opacity-20" />
                                    No invoice data yet
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
                                    <div className="w-full sm:w-[45%]">
                                    <ResponsiveContainer width="100%" height={160}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                                {pieData.map(entry => (
                                                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#8884d8'} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} invoices`, '']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    </div>
                                    <div className="w-full sm:flex-1 space-y-2.5">
                                        {pieData.map(d => (
                                            <div key={d.name} className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="h-3 w-3 rounded-full shrink-0" style={{ background: PIE_COLORS[d.name] }} />
                                                    {d.name}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-800">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    </div>
                </>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'analytics' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold text-gray-800">Cash Flow Analysis</CardTitle>
                                <p className="text-xs text-gray-400">Monthly inflow vs outflow</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={stats.monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v)} width={48} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                        <Line type="monotone" dataKey="revenue" name="Cash Inflow" stroke="#10b981" strokeWidth={2.5}
                                            dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#10b981' }}
                                            activeDot={{ r: 6, fill: '#10b981' }} />
                                        <Line type="monotone" dataKey="expenses" name="Cash Outflow" stroke="#ef4444" strokeWidth={2.5}
                                            dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#ef4444' }}
                                            activeDot={{ r: 6, fill: '#ef4444' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold text-gray-800">Revenue by Client</CardTitle>
                                <p className="text-xs text-gray-400">Top client contribution</p>
                            </CardHeader>
                            <CardContent>
                                {clientPieData.length === 0 ? (
                                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm flex-col gap-2">
                                        <Users className="h-10 w-10 opacity-20" />
                                        No client data yet
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie
                                                data={clientPieData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={88}
                                                paddingAngle={3}
                                                dataKey="value"
                                                label={({ name, value }: { name?: string; value?: number }) =>
                                                    `${name ?? ''}: ${formatINR(value ?? 0)}`
                                                }
                                                labelLine
                                            >
                                                {clientPieData.map((_, i) => (
                                                    <Cell key={i} fill={CLIENT_COLORS[i % CLIENT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [formatINR(Number(value)), 'Revenue']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-800">Expense Breakdown</CardTitle>
                            <p className="text-xs text-gray-400">
                                {stats.expenseBreakdown.length > 0
                                    ? `Total: ${formatINR(stats.totalExpenses)} across ${stats.expenseBreakdown.length} categories`
                                    : 'Add expenses to see breakdown by category'}
                            </p>
                        </CardHeader>
                        <CardContent>
                            {stats.expenseBreakdown.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-gray-400 text-sm flex-col gap-2">
                                    <BarChart2 className="h-10 w-10 opacity-20" />
                                    No expense data yet
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {stats.expenseBreakdown.map(cat => (
                                        <div key={cat.name}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                                                <span className="text-sm text-gray-500 font-medium">
                                                    {formatINR(cat.amount)} ({cat.percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <BarChart2 className="h-4 w-4 text-blue-500" />
                                Monthly Invoice Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={230}>
                                <BarChart data={stats.monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="paid" name="Paid" stackId="a" fill="#10b981" />
                                    <Bar dataKey="partial" name="Partial" stackId="a" fill="#6366f1" />
                                    <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* CLIENTS TAB */}
            {activeTab === 'clients' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                Top Clients by Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.topClients.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center gap-2">
                                    <Users className="h-10 w-10 opacity-20" />
                                    No client data yet
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {stats.topClients.map((client, i) => (
                                        <div key={client.name} className="flex items-center gap-4 py-3.5">
                                            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 truncate">{client.name}</p>
                                                <p className="text-xs text-gray-400">{client.invoiceCount} invoice{client.invoiceCount !== 1 ? 's' : ''}</p>
                                            </div>
                                            <span className="text-base font-bold text-blue-600">{formatINR(client.revenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                            <p className="text-sm text-gray-500 mb-1">Average Invoice Value</p>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-700 wrap-break-word">{formatINR(stats.avgInvoiceValue)}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                            <p className="text-sm text-gray-500 mb-1">Collection Rate</p>
                            <p className="text-2xl sm:text-3xl font-bold text-emerald-700">{stats.collectionRate}%</p>
                            <p className="text-xs text-gray-400 mt-1">{stats.paidInvoices} paid · {stats.partialInvoices} partial</p>
                        </div>
                        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                            <p className="text-sm text-gray-500 mb-1">Average Payment Time</p>
                            <p className="text-2xl sm:text-3xl font-bold text-purple-700">{stats.avgPaymentTime} days</p>
                            <p className="text-xs text-gray-400 mt-1">From invoice date to payment</p>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                            <p className="text-sm text-gray-500 mb-1">Outstanding Amount</p>
                            <p className="text-2xl sm:text-3xl font-bold text-amber-700 wrap-break-word">{formatINR(stats.outstandingAmount)}</p>
                            <p className="text-xs text-gray-400 mt-1">{stats.pendingInvoices + stats.partialInvoices} unpaid invoices</p>
                        </div>
                    </div>
                </div>
            )}

            {/* RECENT TAB */}
            {activeTab === 'recent' && (
                <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold text-gray-800">Recent Invoices</CardTitle>
                                <p className="text-xs text-gray-400 mt-0.5">Last 8 invoices</p>
                            </div>
                            <Link href="/invoices" className="text-sm text-blue-600 hover:underline font-medium">
                                View all
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.recentInvoices.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No invoices yet.</p>
                                <Link href="/invoices/new" className="text-sm text-blue-600 hover:underline mt-1 block">
                                    Create your first invoice
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats.recentInvoices.map(inv => (
                                    <Link key={inv.id} href={`/invoices/${inv.id}`}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{inv.invoice_number}</p>
                                                <p className="text-xs text-gray-400">
                                                    {inv.customer_name} · {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBadgeClass[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {statusLabel[inv.status] || inv.status}
                                            </span>
                                            <span className="font-bold text-gray-900 text-sm min-w-16 text-right">
                                                {formatINR(inv.total)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
