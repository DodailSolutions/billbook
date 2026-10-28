import { 
    RotateCcw, 
    IndianRupee, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Receipt, 
    RefreshCw,
    Shield,
    TrendingDown
} from 'lucide-react'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { getAllRefunds } from '@/app/(dashboard)/invoices/payment-actions'
import RefundsTable from './RefundsTable'

export default async function RefundsPage() {
    const isSuperAdmin = await checkSuperAdminAccess()
    if (!isSuperAdmin) {
        redirect('/dashboard')
    }

    const refunds = await getAllRefunds()

    const stats = {
        total: refunds.length,
        pending: refunds.filter(r => r.status === 'pending').length,
        processing: refunds.filter(r => r.status === 'processing').length,
        completed: refunds.filter(r => r.status === 'completed').length,
        failed: refunds.filter(r => r.status === 'failed').length,
        totalAmount: refunds.reduce((sum, r) => sum + (r.amount || 0), 0),
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                        <RotateCcw className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Refund Management
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Review, approve, and execute Razorpay fund reversals and customer disputes.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Shield className="h-3.5 w-3.5" />
                        Razorpay Live Gateway Active
                    </span>
                </div>
            </div>

            {/* Metrics & Statistics Cards */}
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                {/* 1. Total Requests */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Requests</span>
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <Receipt className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {stats.total}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">All recorded disputes</p>
                </div>

                {/* 2. Pending Approval */}
                <div className={`rounded-2xl p-4 border shadow-2xs hover:shadow-xs transition-shadow ${
                    stats.pending > 0 
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800' 
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Pending Review
                        </span>
                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                            {stats.pending}
                        </span>
                        {stats.pending > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 uppercase">
                                Action Needed
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Awaiting admin decision</p>
                </div>

                {/* 3. In Processing */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                            In Processing
                        </span>
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                            <RefreshCw className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {stats.processing}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">With payment gateway</p>
                </div>

                {/* 4. Completed */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Completed
                        </span>
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {stats.completed}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Settled &amp; reversed</p>
                </div>

                {/* 5. Total Refunded Volume */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                            Total Volume
                        </span>
                        <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300">
                            <IndianRupee className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                        ₹{stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Cumulative refunds processed</p>
                </div>
            </div>

            {/* Refunds Data Table & Workspace */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-orange-600" />
                            Refund Requests Ledger
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Filter, inspect customer claims, and execute refunds via Razorpay API.
                        </p>
                    </div>
                </div>

                <RefundsTable refunds={refunds as any} />
            </div>
        </div>
    )
}
