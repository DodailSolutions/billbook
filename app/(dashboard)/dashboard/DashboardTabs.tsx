'use client'

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { DollarSign, FileText, CheckCircle, Clock, TrendingUp, AlertCircle, BarChart2, PieChart as PieIcon, Activity } from "lucide-react"
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

const STATUS_COLORS: Record<string, string> = {
    paid: '#10b981',
    pending: '#f59e0b',
    partial: '#3b82f6',
    cancelled: '#ef4444',
}

const statusLabel: Record<string, string> = {
    paid: 'Paid',
    sent: 'Pending',
    draft: 'Draft',
    partial: 'Partial',
    cancelled: 'Cancelled',
}

const statusBadgeClass: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    sent: 'bg-amber-100 text-amber-700',
    draft: 'bg-gray-100 text-gray-600',
    partial: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-600',
}

// Custom tooltip for revenue chart
function RevenueTooltip({ active, payload, label }: { active?: boolean, payload?: { value: number, name: string }[], label?: string }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.name === 'Revenue' ? '#10b981' : '#3b82f6' }}>
                    {p.name === 'Revenue' ? `₹${p.value.toLocaleString()}` : `${p.value} invoices`}
                </p>
            ))}
        </div>
    )
}

export function DashboardTabs({ stats }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'recent'>('overview')

    const pieData = [
        { name: 'Paid', value: stats.paidInvoices, color: '#10b981' },
        { name: 'Pending', value: stats.pendingInvoices, color: '#f59e0b' },
        { name: 'Partial', value: stats.partialInvoices, color: '#3b82f6' },
        { name: 'Cancelled', value: stats.cancelledInvoices, color: '#ef4444' },
    ].filter(d => d.value > 0)

    const collectionRate = stats.totalInvoices > 0
        ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100)
        : 0

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Activity },
        { key: 'charts', label: 'Charts', icon: BarChart2 },
        { key: 'recent', label: 'Recent Invoices', icon: FileText },
    ] as const

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Dashboard
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Overview of your business metrics and performance
                        </p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500">Collection Rate</p>
                        <p className="text-2xl font-bold text-blue-600">{collectionRate}%</p>
                    </div>
                </div>

                <div className="flex gap-1 border-b border-gray-200">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 pb-3 px-3 font-medium text-sm transition-colors relative ${
                                activeTab === key
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                            {activeTab === key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                        <Card className="border-l-4 border-l-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl md:text-2xl font-bold text-green-600">
                                    ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">From paid invoices</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Outstanding</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl md:text-2xl font-bold text-orange-600">
                                    ₹{stats.outstandingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Pending collection</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Invoices</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.totalInvoices}</div>
                                <p className="text-xs text-gray-500 mt-1">{stats.paidInvoices} paid · {stats.pendingInvoices} pending</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Collection Rate</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl md:text-2xl font-bold text-purple-600">{collectionRate}%</div>
                                <p className="text-xs text-gray-500 mt-1">{stats.partialInvoices} partial payments</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mini revenue bar chart in overview */}
                    {stats.monthlyData.length > 0 && (
                        <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    Revenue Trend — Last 12 Months
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={stats.monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                                        <Tooltip content={<RevenueTooltip />} />
                                        <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Charts Tab */}
            {activeTab === 'charts' && (
                <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Monthly Revenue Line Chart */}
                    <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Monthly Revenue & Invoice Volume
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={stats.monthlyData} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                                    <YAxis yAxisId="cnt" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <Tooltip content={<RevenueTooltip />} />
                                    <Legend />
                                    <Line yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="cnt" type="monotone" dataKey="invoiceCount" name="Invoices" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Stacked Bar Chart: invoice status per month */}
                    <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <BarChart2 className="h-5 w-5 text-blue-500" />
                                Monthly Invoice Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={230}>
                                <BarChart data={stats.monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="paid" name="Paid" stackId="a" fill="#10b981" />
                                    <Bar dataKey="partial" name="Partial" stackId="a" fill="#3b82f6" />
                                    <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Pie Chart: Invoice Status */}
                    <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <PieIcon className="h-5 w-5 text-purple-500" />
                                Invoice Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pieData.length === 0 ? (
                                <div className="flex items-center justify-center h-57.5 text-gray-400 text-sm">
                                    No invoice data yet
                                </div>
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
                                            label={({ name, percent }: { name: string, percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {pieData.map((entry) => (
                                                <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#8884d8'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} invoices`, '']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recent Invoices Tab */}
            {activeTab === 'recent' && (
                <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Recent Invoices
                            </CardTitle>
                            <Link href="/invoices" className="text-sm text-blue-600 hover:underline font-medium">
                                View all →
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.recentInvoices.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p>No invoices yet. <Link href="/invoices/new" className="text-blue-600 hover:underline">Create your first invoice</Link></p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {stats.recentInvoices.map((inv) => (
                                    <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{inv.invoice_number}</p>
                                                <p className="text-xs text-gray-500">{inv.customer_name} · {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {statusLabel[inv.status] || inv.status}
                                            </span>
                                            <span className="font-semibold text-gray-900 text-sm">₹{inv.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
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
