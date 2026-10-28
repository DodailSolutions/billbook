'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
    CheckCircle2, 
    XCircle, 
    Eye, 
    Loader2, 
    Search, 
    Filter, 
    Download, 
    Plus, 
    RefreshCw, 
    ExternalLink, 
    ShieldCheck, 
    Copy, 
    Check, 
    AlertCircle,
    Calendar,
    IndianRupee,
    FileText,
    Receipt,
    Clock,
    RotateCcw,
    X,
    CreditCard,
    ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { processAdminRefund, createManualRefund, getRecentPaymentsForRefund } from './actions'

interface Payment {
    id?: string
    amount_paid?: number
    currency?: string
    gateway_payment_id?: string
    invoice?: { invoice_number: string }
    user_email?: string
}

export interface RefundWithPayment {
    id: string
    payment_id: string
    user_id: string
    invoice_id?: string
    amount: number
    currency: string
    reason?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    processed_by?: string
    processed_at?: string
    gateway_refund_id?: string
    notes?: string
    created_at: string
    updated_at: string
    payment?: Payment
}

interface RefundsTableProps {
    refunds: RefundWithPayment[]
}

export default function RefundsTable({ refunds }: RefundsTableProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all')
    const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | 'today'>('all')
    
    // Action States
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [selectedRefund, setSelectedRefund] = useState<RefundWithPayment | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    // Manual Refund Form State
    const [eligiblePayments, setEligiblePayments] = useState<any[]>([])
    const [isLoadingPayments, setIsLoadingPayments] = useState(false)
    const [selectedPaymentId, setSelectedPaymentId] = useState('')
    const [manualAmount, setManualAmount] = useState<number | ''>('')
    const [manualReason, setManualReason] = useState('')
    const [isSubmittingManual, setIsSubmittingManual] = useState(false)

    const showToast = (msg: string) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 3500)
    }

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // Open Manual Refund Modal
    const handleOpenManualModal = async () => {
        setIsCreateModalOpen(true)
        setIsLoadingPayments(true)
        try {
            const payments = await getRecentPaymentsForRefund()
            setEligiblePayments(payments)
            if (payments.length > 0) {
                setSelectedPaymentId(payments[0].id)
                setManualAmount(payments[0].amount)
            }
        } catch (e) {
            console.error('Failed to load eligible payments:', e)
        } finally {
            setIsLoadingPayments(false)
        }
    }

    const handleSelectPayment = (paymentId: string) => {
        setSelectedPaymentId(paymentId)
        const p = eligiblePayments.find(item => item.id === paymentId)
        if (p) {
            setManualAmount(p.amount)
        }
    }

    // Submit Manual Refund
    const handleSubmitManualRefund = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPaymentId || !manualAmount) return

        setIsSubmittingManual(true)
        try {
            const res = await createManualRefund(selectedPaymentId, Number(manualAmount), manualReason)
            if (res.success) {
                showToast('Manual refund request registered successfully')
                setIsCreateModalOpen(false)
                setManualReason('')
                router.refresh()
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create manual refund')
        } finally {
            setIsSubmittingManual(false)
        }
    }

    // Process single refund
    const handleProcess = async (refundId: string, approve: boolean) => {
        const actionText = approve ? 'Approve and dispatch refund via Razorpay' : 'Reject this refund request'
        if (!confirm(`Are you sure you want to ${actionText}?`)) {
            return
        }

        setProcessingId(refundId)
        try {
            const notes = approve 
                ? 'Refund approved and executed by Super Admin' 
                : 'Refund rejected by Super Admin'

            await processAdminRefund(refundId, approve, notes)
            showToast(approve ? 'Refund processed successfully via payment gateway' : 'Refund request marked as rejected')
            if (selectedRefund?.id === refundId) {
                setSelectedRefund(null)
            }
            router.refresh()
        } catch (error) {
            console.error('Error processing refund:', error)
            alert(error instanceof Error ? error.message : 'Failed to process refund')
        } finally {
            setProcessingId(null)
        }
    }

    // Export CSV
    const handleExportCSV = () => {
        if (refunds.length === 0) return
        const headers = ['Refund ID', 'Payment ID', 'Invoice', 'Amount', 'Currency', 'Status', 'Reason', 'Gateway ID', 'Created At']
        const rows = refunds.map(r => [
            r.id,
            r.payment_id,
            r.payment?.invoice?.invoice_number || 'N/A',
            r.amount,
            r.currency,
            r.status,
            `"${(r.reason || '').replace(/"/g, '""')}"`,
            r.gateway_refund_id || '',
            new Date(r.created_at).toISOString()
        ])
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `billbooky-refunds-${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast('Exported refund records to CSV')
    }

    // Filter Logic
    const filteredRefunds = useMemo(() => {
        return refunds.filter(refund => {
            // Status Filter
            if (statusFilter !== 'all' && refund.status !== statusFilter) {
                return false
            }

            // Date Filter
            if (dateFilter !== 'all') {
                const created = new Date(refund.created_at).getTime()
                const now = Date.now()
                if (dateFilter === 'today' && now - created > 24 * 60 * 60 * 1000) return false
                if (dateFilter === '7d' && now - created > 7 * 24 * 60 * 60 * 1000) return false
                if (dateFilter === '30d' && now - created > 30 * 24 * 60 * 60 * 1000) return false
            }

            // Search Filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim()
                const invoiceNumber = refund.payment?.invoice?.invoice_number?.toLowerCase() || ''
                const reason = (refund.reason || '').toLowerCase()
                const gatewayId = (refund.gateway_refund_id || '').toLowerCase()
                const refundId = refund.id.toLowerCase()
                return (
                    refundId.includes(q) || 
                    invoiceNumber.includes(q) || 
                    reason.includes(q) || 
                    gatewayId.includes(q)
                )
            }

            return true
        })
    }, [refunds, statusFilter, dateFilter, searchQuery])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Completed
                    </span>
                )
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Processing
                    </span>
                )
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending Review
                    </span>
                )
            case 'failed':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Rejected / Failed
                    </span>
                )
        }
    }

    return (
        <div className="space-y-5">
            {/* Toast Feedback */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Filter and Actions Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search by Refund ID, Invoice #, Reason, Gateway ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                            &times;
                        </button>
                    )}
                </div>

                {/* Filter Controls & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Filter */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value as any)}
                            className="bg-transparent border-none text-slate-700 dark:text-slate-300 font-semibold text-xs outline-none cursor-pointer"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>

                    {/* Export CSV */}
                    <button
                        onClick={handleExportCSV}
                        disabled={refunds.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
                        title="Download CSV"
                    >
                        <Download className="h-3.5 w-3.5 text-slate-500" />
                        <span>Export CSV</span>
                    </button>

                    {/* Razorpay Portal Link */}
                    <a
                        href="https://dashboard.razorpay.com/#/access/signin"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                    >
                        <span>Razorpay Live</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>

                    {/* Issue Refund Button */}
                    <Button
                        onClick={handleOpenManualModal}
                        className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold px-3.5 py-2 shadow-xs"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Issue Refund</span>
                    </Button>
                </div>
            </div>

            {/* Status Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto custom-scrollbar">
                {[
                    { id: 'all', label: 'All Refunds', count: refunds.length },
                    { id: 'pending', label: 'Pending Review', count: refunds.filter(r => r.status === 'pending').length },
                    { id: 'processing', label: 'Processing', count: refunds.filter(r => r.status === 'processing').length },
                    { id: 'completed', label: 'Completed', count: refunds.filter(r => r.status === 'completed').length },
                    { id: 'failed', label: 'Rejected / Failed', count: refunds.filter(r => r.status === 'failed').length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id as any)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            statusFilter === tab.id
                                ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            statusFilter === tab.id
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table or Empty State View */}
            {filteredRefunds.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center text-orange-600 shadow-xs">
                        <Receipt className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {searchQuery || statusFilter !== 'all' ? 'No Matching Refund Requests' : 'No Refund Requests Recorded'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                        {searchQuery || statusFilter !== 'all'
                            ? 'No refund records match your active search filters. Try clearing filters or searching with another term.'
                            : 'There are currently no refund requests in the system. When customers request refunds or if you issue a manual refund, they will appear here with one-click Razorpay processing.'}
                    </p>

                    {searchQuery || statusFilter !== 'all' ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('')
                                setStatusFilter('all')
                                setDateFilter('all')
                            }}
                            className="text-xs font-semibold rounded-xl"
                        >
                            Reset Filters
                        </Button>
                    ) : (
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Button
                                onClick={handleOpenManualModal}
                                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold px-4 py-2"
                            >
                                <Plus className="h-4 w-4 mr-1.5" />
                                Issue Manual Refund
                            </Button>
                            <Link href="/admin/payments">
                                <Button variant="outline" className="rounded-xl text-xs font-semibold">
                                    <CreditCard className="h-4 w-4 mr-1.5 text-blue-600" />
                                    View Payments &amp; Revenue
                                </Button>
                            </Link>
                            <Link href="/refund" target="_blank">
                                <Button variant="ghost" className="rounded-xl text-xs font-semibold text-slate-600">
                                    <ShieldCheck className="h-4 w-4 mr-1.5 text-emerald-600" />
                                    Refund Policy Rules
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Policy Highlights Cards */}
                    <div className="grid sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-left">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                14-Day Guarantee
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                                Customer subscriptions can be refunded within 14 days of original activation per platform terms.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                                <RotateCcw className="h-4 w-4 text-blue-600" />
                                Razorpay Live Sync
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                                Approving a refund triggers immediate fund reversal via Razorpay API back to the customer bank/UPI.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                                <FileText className="h-4 w-4 text-purple-600" />
                                Automatic Accounting
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                                Associated invoices and subscription plans are updated to prevent revenue discrepancies.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                                <tr>
                                    <th className="py-3 px-4">Refund Reference</th>
                                    <th className="py-3 px-4">Invoice / Transaction</th>
                                    <th className="py-3 px-4">Amount</th>
                                    <th className="py-3 px-4">Reason / Notes</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Requested On</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {filteredRefunds.map((refund) => {
                                    const payment = refund.payment
                                    return (
                                        <tr key={refund.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                            {/* Refund ID */}
                                            <td className="py-3.5 px-4 font-mono font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-900 dark:text-white font-bold">
                                                        {refund.id.slice(0, 8)}…
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(refund.id, refund.id)}
                                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                                        title="Copy full refund ID"
                                                    >
                                                        {copiedId === refund.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Invoice Number */}
                                            <td className="py-3.5 px-4">
                                                {payment?.invoice ? (
                                                    <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                        {payment.invoice.invoice_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Subscription Deal</span>
                                                )}
                                            </td>

                                            {/* Amount */}
                                            <td className="py-3.5 px-4">
                                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                                    {refund.currency === 'AED' ? 'AED ' : refund.currency === 'USD' ? '$' : '₹'}
                                                    {refund.amount.toLocaleString('en-IN')}
                                                </span>
                                            </td>

                                            {/* Reason */}
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <p className="truncate text-slate-600 dark:text-slate-300 font-medium" title={refund.reason}>
                                                    {refund.reason || 'No description provided'}
                                                </p>
                                                {refund.gateway_refund_id && (
                                                    <p className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                                                        RZP: {refund.gateway_refund_id}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(refund.status)}
                                            </td>

                                            {/* Date */}
                                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                                {new Date(refund.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* View Modal */}
                                                    <button
                                                        onClick={() => setSelectedRefund(refund)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    {/* Pending Actions */}
                                                    {refund.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleProcess(refund.id, true)}
                                                                disabled={processingId === refund.id}
                                                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors disabled:opacity-50"
                                                                title="Approve & Process Refund"
                                                            >
                                                                {processingId === refund.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    'Approve'
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleProcess(refund.id, false)}
                                                                disabled={processingId === refund.id}
                                                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors disabled:opacity-50"
                                                                title="Reject Refund"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── DETAIL INSPECTION MODAL ── */}
            {selectedRefund && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Refund Inspection</h3>
                                    <p className="text-xs text-slate-400 font-mono">ID: {selectedRefund.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRefund(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-[11px] text-slate-400 uppercase font-bold">Refund Amount</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                                        {selectedRefund.currency === 'AED' ? 'AED ' : selectedRefund.currency === 'USD' ? '$' : '₹'}
                                        {selectedRefund.amount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 uppercase font-bold">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedRefund.status)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="font-bold text-slate-500 mb-1">Payment ID</p>
                                    <p className="font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-slate-700 dark:text-slate-300 truncate">
                                        {selectedRefund.payment_id}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-500 mb-1">Invoice ID</p>
                                    <p className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-slate-700 dark:text-slate-300 font-semibold truncate">
                                        {selectedRefund.payment?.invoice?.invoice_number || selectedRefund.invoice_id || 'Subscription'}
                                    </p>
                                </div>
                            </div>

                            {selectedRefund.gateway_refund_id && (
                                <div>
                                    <p className="font-bold text-slate-500 mb-1">Razorpay Refund Reference</p>
                                    <p className="font-mono bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                        {selectedRefund.gateway_refund_id}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="font-bold text-slate-500 mb-1">Reason Stated</p>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-800 dark:text-slate-200">
                                    {selectedRefund.reason || 'No description provided'}
                                </div>
                            </div>

                            {selectedRefund.notes && (
                                <div>
                                    <p className="font-bold text-slate-500 mb-1">Admin Audit Notes</p>
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 rounded-xl border border-amber-100 dark:border-amber-800">
                                        {selectedRefund.notes}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 text-slate-400 text-[11px] flex justify-between">
                                <span>Requested: {new Date(selectedRefund.created_at).toLocaleString()}</span>
                                {selectedRefund.processed_at && (
                                    <span>Processed: {new Date(selectedRefund.processed_at).toLocaleString()}</span>
                                )}
                            </div>

                            {/* Pending Execution Actions */}
                            {selectedRefund.status === 'pending' && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                    <Button
                                        onClick={() => handleProcess(selectedRefund.id, true)}
                                        disabled={processingId === selectedRefund.id}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                        Approve via Razorpay
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleProcess(selectedRefund.id, false)}
                                        disabled={processingId === selectedRefund.id}
                                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                                    >
                                        <XCircle className="h-4 w-4 mr-1.5" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── MANUAL REFUND MODAL ── */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Issue Manual Refund</h3>
                                    <p className="text-xs text-slate-400">Select an eligible payment transaction to reverse</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitManualRefund} className="space-y-4 text-xs">
                            {/* Payment Selection */}
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Completed Transaction *
                                </label>
                                {isLoadingPayments ? (
                                    <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                        <span className="ml-2 text-slate-500">Loading recent payments…</span>
                                    </div>
                                ) : eligiblePayments.length === 0 ? (
                                    <div className="p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl">
                                        No recent completed payments found to refund.
                                    </div>
                                ) : (
                                    <select
                                        value={selectedPaymentId}
                                        onChange={(e) => handleSelectPayment(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                                    >
                                        {eligiblePayments.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                ₹{p.amount} • {p.description || p.gateway_payment_id || p.id.slice(0, 8)} ({new Date(p.created_at).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Refund Amount */}
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Refund Amount (INR ₹) *
                                </label>
                                <Input
                                    type="number"
                                    required
                                    min={1}
                                    value={manualAmount}
                                    onChange={(e) => setManualAmount(Number(e.target.value))}
                                    placeholder="e.g. 2999"
                                    className="text-xs"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Can be full or partial transaction value</p>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Refund Justification / Reason *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={manualReason}
                                    onChange={(e) => setManualReason(e.target.value)}
                                    placeholder="e.g. 14-day money-back guarantee requested by user via support ticket"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium resize-none outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    disabled={isSubmittingManual}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmittingManual || !selectedPaymentId || !manualAmount}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                                >
                                    {isSubmittingManual ? 'Creating…' : 'Submit Refund Request'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
