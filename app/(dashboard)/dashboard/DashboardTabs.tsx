'use client'

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { IndianRupee, FileText, CheckCircle, Clock, TrendingUp, TrendingDown, AlertCircle, BarChart2, PieChart as PieIcon, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
    LineChart,
    Line,
    AreaChart,
    Area,
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
    Partial: '#3b82f6',
    Cancelled: '#ef4444',
}

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
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
    return `₹${n.toFixed(0)}`
}

function RevenueTooltip({ active, payload, label }: { active?: boolean, payload?: Array<{ value: number, name: string, color: string }>, label?: string }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-sm min-w-32">
            <p className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wide">{label}</p>
            {payload.map(p => (
                <div key={p.name} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ background: p.color }} />
                        {p.name}
                    </span>
                    <span className="font-bold" style={{ color: p.color }}>
                        {p.name === 'Invoices' ? p.value : `₹${p.value.toLocaleString('en-IN')}`}
                    </span>
                </div>
            ))}
        </div>
    )
}

export function DashboardTabs({ stats }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'recent'>('overview')

    // Month-over-month trend
    const prevMonth = stats.monthlyData[stats.monthlyData.length - 2]
    const thisMonth = stats.monthlyData[stats.monthlyData.length - 1]
    const revenueChange = prevMonth && prevMonth.revenue > 0
        ? +((((thisMonth?.revenue ?? 0) - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1)
        : null
    const invoiceChange = prevMonth && prevMonth.invoiceCount > 0
        ? +((((thisMonth?.invoiceCount ?? 0) - prevMonth.invoiceCount) / prevMonth.invoiceCount) * 100).toFixed(1)
        : null

    const pieData = [
        { name: 'Paid', value: stats.paidInvoices },
        { name: 'Pending', value: stats.pendingInvoices },
        { name: 'Partial', value: stats.partialInvoices },
        { name: 'Cancelled', value: stats.cancelledInvoices },
    ].filter(d => d.value > 0)

    const collectionRate = stats.totalInvoices > 0
        ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100)
        : 0

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Activity },
        { key: 'charts', label: 'Analytics', icon: BarChart2 },
        { key: 'recent', label: 'Recent Invoices', icon: FileText },
    ] as const

    function TrendBadge({ change }: { change: number | null }) {
        if (change === null) return <p className="text-xs text-gray-400 mt-1">No previous data</p>
        const up = change >= 0
        return (
            <p className={`text-xs mt-1 flex items-center gap-0.5 font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {up ? '+' : ''}{change}% from last month
            </p>
        )
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl px-6 pt-6 pb-0 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Overview of your business finances</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
                        <span className="text-xs text-gray-500">Collection Rate</span>
                        <span className="text-lg font-bold text-blue-600">{collectionRate}%</span>
                    </div>
                </div>
                <div className="flex gap-1">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 pb-3 px-3 font-medium text-sm transition-all relative rounded-t-lg ${
                                activeTab === key ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                            {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Revenue */}
                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 font-medium">Total Revenue</span>
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                        <IndianRupee className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </p>
                                <TrendBadge change={revenueChange} />
                            </CardContent>
                        </Card>

                        {/* Outstanding */}
                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 font-medium">Outstanding</span>
                                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₹{stats.outstandingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{stats.pendingInvoices + stats.partialInvoices} unpaid invoices</p>
                            </CardContent>
                        </Card>

                        {/* Total Invoices */}
                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 font-medium">Total Invoices</span>
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                                <TrendBadge change={invoiceChange} />
                            </CardContent>
                        </Card>

                        {/* Collection Rate */}
                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-500 font-medium">Net Collected</span>
                                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{collectionRate}%</p>
                                <p className="text-xs text-gray-400 mt-1">{stats.paidInvoices} paid · {stats.partialInvoices} partial</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Revenue Area Chart */}
                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold text-gray-800">Revenue vs Outstanding</CardTitle>
                                <p className="text-xs text-gray-400">Month-over-month for the past 12 months</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={stats.monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="pendGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v)} width={48} />
                                        <Tooltip content={<RevenueTooltip />} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Invoice Status Pie */}
                        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold text-gray-800">Invoice Status</CardTitle>
                                <p className="text-xs text-gray-400">Distribution by payment status</p>
                            </CardHeader>
                            <CardContent>
                                {pieData.length === 0 ? (
                                    <div className="flex items-center justify-center h-52 text-gray-400 text-sm flex-col gap-2">
                                        <PieIcon className="h-10 w-10 opacity-20" />
                                        No data yet
                                    </div>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                                                    {pieData.map((entry) => (
                                                        <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#8884d8'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [`${value} invoices`, '']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="space-y-1.5 mt-2">
                                            {pieData.map(d => (
                                                <div key={d.name} className="flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1.5 text-gray-600">
                                                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[d.name] }} />
                                                        {d.name}
                                                    </span>
                                                    <span className="font-semibold text-gray-800">{d.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* ── ANALYTICS TAB ── */}
            {activeTab === 'charts' && (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {/* Revenue Line Chart — full width */}
                    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                Monthly Revenue & Invoice Volume
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={stats.monthlyData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v)} width={52} />
                                    <YAxis yAxisId="cnt" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
                                    <Tooltip content={<RevenueTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                    <Line yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#10b981' }} activeDot={{ r: 6, fill: '#10b981' }} />
                                    <Line yAxisId="cnt" type="monotone" dataKey="invoiceCount" name="Invoices" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#fff', strokeWidth: 2, stroke: '#6366f1' }} activeDot={{ r: 5, fill: '#6366f1' }} strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Stacked Bar */}
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

                    {/* Pie Chart */}
                    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <PieIcon className="h-4 w-4 text-purple-500" />
                                Invoice Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pieData.length === 0 ? (
                                <div className="flex items-center justify-center h-52 text-gray-400 text-sm">No invoice data yet</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={230}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ name, percent }: { name?: string; percent?: number }) =>
                                                `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                                            }
                                            labelLine={false}
                                        >
                                            {pieData.map((entry) => (
                                                <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#8884d8'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} invoices`, '']} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── RECENT INVOICES TAB ── */}
            {activeTab === 'recent' && (
                <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold text-gray-800">Recent Invoices</CardTitle>
                                <p className="text-xs text-gray-400 mt-0.5">Last 8 invoices created</p>
                            </div>
                            <Link href="/invoices" className="text-sm text-blue-600 hover:underline font-medium">
                                View all →
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.recentInvoices.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No invoices yet.</p>
                                <Link href="/invoices/new" className="text-sm text-blue-600 hover:underline mt-1 block">Create your first invoice →</Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats.recentInvoices.map((inv) => (
                                    <Link key={inv.id} href={`/invoices/${inv.id}`}
                                        className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{inv.invoice_number}</p>
                                                <p className="text-xs text-gray-400">{inv.customer_name} · {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBadgeClass[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {statusLabel[inv.status] || inv.status}
                                            </span>
                                            <span className="font-bold text-gray-900 text-sm min-w-16 text-right">
                                                ₹{inv.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
