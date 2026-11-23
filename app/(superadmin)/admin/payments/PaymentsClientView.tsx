'use client'

import { useState } from 'react'
import { 
    DollarSign, 
    TrendingUp, 
    CreditCard, 
    Calendar, 
    Search, 
    Download, 
    Copy, 
    Check, 
    ArrowUpRight, 
    Filter, 
    ShieldCheck, 
    RefreshCw,
    IndianRupee,
    Receipt,
    Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UnifiedPayment } from './actions'

interface PaymentsClientViewProps {
    payments: UnifiedPayment[]
}

const STATUS_BADGES = {
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
    failed: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
    refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300',
}

export default function PaymentsClientView({ payments }: PaymentsClientViewProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'subscription' | 'invoice_settlement'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const filteredPayments = payments.filter(p => {
        const matchesType = typeFilter === 'all' || p.type === typeFilter
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter
        const matchesSearch = !searchQuery.trim() ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.gateway_transaction_id && p.gateway_transaction_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.user_email && p.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.business_name && p.business_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.user_name && p.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.plan_name && p.plan_name.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesType && matchesStatus && matchesSearch
    })

    const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0)

    const thisMonthRevenue = payments
        .filter(p => {
            if (p.status !== 'completed') return false
            const date = new Date(p.created_at)
            const now = new Date()
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0)

    const completedCount = payments.filter(p => p.status === 'completed').length
    const successRate = payments.length > 0 ? Math.round((completedCount / payments.length) * 100) : 100

    const exportToCSV = () => {
        const headers = ['Transaction ID', 'Type', 'Amount', 'Currency', 'Status', 'Method', 'Customer Name', 'Customer Email', 'Business', 'Date']
        const rows = filteredPayments.map(p => [
            p.gateway_transaction_id || p.id,
            p.type,
            p.amount,
            p.currency,
            p.status,
            p.payment_method,
            `"${p.user_name || ''}"`,
            `"${p.user_email || ''}"`,
            `"${p.business_name || ''}"`,
            new Date(p.created_at).toISOString()
        ])

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `billbook-transactions-${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* Stats Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Total Collected
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-600">
                            ₹{totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Gross completed transactions</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600">
                            This Month Revenue
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-blue-600">
                            ₹{thisMonthRevenue.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Current calendar month</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Total Volume
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {payments.length}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{completedCount} successful charges</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-purple-600">
                            Gateway Success
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-purple-600">
                            {successRate}%
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Payment completion rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tx ID, user email, or business..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Type Filter */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['all', 'subscription', 'invoice_settlement'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                                    typeFilter === type
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {type === 'all' ? 'All Types' : type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>

                    <Button
                        onClick={exportToCSV}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 h-9 rounded-xl font-semibold"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Transactions Table */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
                <CardHeader className="bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 py-3.5 px-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                Transaction Journal ({filteredPayments.length})
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Detailed record of all platform revenues, subscription charges, and customer settlements.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredPayments.length === 0 ? (
                        <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                            <Receipt className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                            <p>No transaction records found matching your filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                                        <th className="py-3 px-5">Customer & Business</th>
                                        <th className="py-3 px-4">Transaction / Plan</th>
                                        <th className="py-3 px-4">Amount</th>
                                        <th className="py-3 px-4">Channel / Method</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-5 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {filteredPayments.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    {p.business_name || p.user_name || 'Individual Merchant'}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-mono">
                                                    {p.user_email || `User: ${p.user_id?.substring(0, 8)}...`}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                                    {p.description}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                                    <span className="font-mono">
                                                        {p.gateway_transaction_id ? p.gateway_transaction_id.substring(0, 16) + '...' : p.id.substring(0, 12)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(p.id, p.gateway_transaction_id || p.id)}
                                                        className="text-slate-400 hover:text-slate-600"
                                                        title="Copy ID"
                                                    >
                                                        {copiedId === p.id ? (
                                                            <Check className="h-3 w-3 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                                ₹{p.amount.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                                                    {p.payment_method}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[p.status || 'completed']}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-right text-[11px] text-slate-500 whitespace-nowrap">
                                                {new Date(p.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
