'use client'

import { useState } from 'react'
import { ChartOfAccount, JournalEntry } from "@/lib/bookkeeping-types"
import { getChartOfAccounts, getJournalEntries } from "@/lib/bookkeeping-actions"
import { ChartOfAccountsView } from "./ChartOfAccountsView"
import { JournalEntryModal } from "./JournalEntryModal"
import { FinancialStatementsView } from "./FinancialStatementsView"
import { BankReconciliationView } from "./BankReconciliationView"
import { Button } from "@/components/ui/Button"
import { 
    BookOpen, 
    FolderTree, 
    FileText, 
    Landmark, 
    Plus, 
    ArrowRightLeft, 
    Download, 
    ShieldCheck, 
    IndianRupee, 
    TrendingUp, 
    TrendingDown, 
    Wallet,
    Users
} from "lucide-react"
import Link from 'next/link'

interface BookkeepingClientViewProps {
    initialAccounts?: ChartOfAccount[]
    initialJournalEntries?: JournalEntry[]
}

export function BookkeepingClientView({
    initialAccounts = [],
    initialJournalEntries = []
}: BookkeepingClientViewProps) {
    const [accounts, setAccounts] = useState<ChartOfAccount[]>(initialAccounts)
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries)
    const [loading, setLoading] = useState(false)
    const [isExportingTally, setIsExportingTally] = useState(false)

    const [activeTab, setActiveTab] = useState<'accounts' | 'journal' | 'statements' | 'bank'>('accounts')
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false)

    // Calculate quick executive metrics for non-accountant business owners
    const cashBankBalance = accounts
        .filter(a => a.account_code === '1010' || a.account_code === '1020' || a.category?.toLowerCase().includes('bank') || a.category?.toLowerCase().includes('cash'))
        .reduce((sum, a) => sum + Number(a.current_balance || 0), 0)

    const receivables = accounts
        .filter(a => a.account_code === '1100' || a.category?.toLowerCase().includes('receivable'))
        .reduce((sum, a) => sum + Number(a.current_balance || 0), 0)

    const payables = accounts
        .filter(a => a.account_code === '2010' || a.category?.toLowerCase().includes('payable'))
        .reduce((sum, a) => sum + Number(a.current_balance || 0), 0)

    const totalRevenue = accounts
        .filter(a => a.account_type === 'revenue')
        .reduce((sum, a) => sum + Number(a.current_balance || 0), 0)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [coaData, jeData] = await Promise.all([
                getChartOfAccounts().catch(e => {
                    console.error('Failed to load CoA:', e)
                    return []
                }),
                getJournalEntries().catch(e => {
                    console.error('Failed to load journal entries:', e)
                    return []
                })
            ])
            setAccounts(coaData || [])
            setJournalEntries(jeData || [])
        } catch (err) {
            console.error('Unexpected error loading bookkeeping data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleTallyExport = async () => {
        setIsExportingTally(true)
        try {
            window.location.href = '/api/bookkeeping/tally-export'
        } catch (e) {
            console.error('Error exporting Tally XML:', e)
        } finally {
            setTimeout(() => setIsExportingTally(false), 2000)
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
            {/* Header & Quick Action Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl shrink-0">
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Bookkeeping & ERP Ledger
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Automated double-entry accounts, Tally sync, P&L, and CA audit delegation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTallyExport}
                        disabled={isExportingTally}
                        className="text-xs font-semibold gap-1.5 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Download standard XML envelope for Tally Prime and Tally.ERP 9"
                    >
                        <Download className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{isExportingTally ? 'Exporting...' : 'Tally XML Sync'}</span>
                    </Button>

                    <Link href="/settings/ca-access">
                        <Button
                            type="button"
                            variant="outline"
                            className="text-xs font-semibold gap-1.5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40"
                        >
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                            <span>CA Access</span>
                        </Button>
                    </Link>

                    <Button 
                        onClick={() => setIsJournalModalOpen(true)}
                        className="text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Post Entry</span>
                    </Button>
                </div>
            </div>

            {/* Business Snapshot KPI Cards (Optimized for Mobile iPhone 16 viewports) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                {/* Cash & Bank in Hand */}
                <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Cash & Bank</span>
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                            <Wallet className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="text-base sm:text-xl font-black text-gray-900 dark:text-white font-mono">
                        ₹{cashBankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Available Liquid Funds</p>
                </div>

                {/* Total Sales Revenue */}
                <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Sales Revenue</span>
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600">
                            <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="text-base sm:text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                        ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Total Booked Income</p>
                </div>

                {/* Accounts Receivable */}
                <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Receivables</span>
                        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600">
                            <IndianRupee className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        ₹{receivables.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Due from Customers</p>
                </div>

                {/* Accounts Payable */}
                <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Payables</span>
                        <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/50 text-rose-600">
                            <TrendingDown className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <div className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                        ₹{payables.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Pending to Vendors</p>
                </div>
            </div>

            {/* Navigation Tabs (Smooth horizontal scrolling for iPhone and mobile) */}
            <div className="border-b border-gray-200 dark:border-gray-800 pb-1">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none py-1">
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                            activeTab === 'accounts' 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <FolderTree className="h-3.5 w-3.5" />
                        <span>Accounts ({accounts.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('journal')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                            activeTab === 'journal' 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        <span>Journal Log ({journalEntries.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('statements')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                            activeTab === 'statements' 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Financial Statements & P&L</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('bank')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                            activeTab === 'bank' 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Landmark className="h-3.5 w-3.5" />
                        <span>Bank Reconciliation</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            ) : activeTab === 'accounts' ? (
                <ChartOfAccountsView 
                    accounts={accounts}
                    onRefresh={fetchData}
                />
            ) : activeTab === 'journal' ? (
                <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-2xs bg-white dark:bg-gray-900">
                        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold">General Journal Entry Log</h3>
                                <p className="text-[10px] sm:text-xs text-slate-400">Audited double-entry transactions</p>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => setIsJournalModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-xs px-2.5 py-1 sm:px-3 sm:py-1.5"
                            >
                                <Plus className="h-3 w-3 mr-1" /> Post Entry
                            </Button>
                        </div>

                        {journalEntries.length === 0 ? (
                            <div className="p-10 text-center text-xs text-gray-500 dark:text-gray-400">
                                No journal entries posted yet. Click "Post Entry" to post a debit/credit transaction.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {journalEntries.map((entry) => (
                                    <div key={entry.id} className="p-3 sm:p-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 sm:gap-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800 text-[11px]">
                                                    {entry.entry_number}
                                                </span>
                                                <span className="font-bold text-gray-900 dark:text-white">{entry.description}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[11px]">
                                                <span>{entry.entry_date}</span>
                                                <span className="uppercase font-semibold text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                                                    {entry.source}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Entry Lines */}
                                        {entry.lines && entry.lines.length > 0 && (
                                            <div className="bg-slate-50 dark:bg-gray-800/60 p-2 sm:p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 text-xs space-y-1">
                                                {entry.lines.map((line, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-0.5 sm:gap-0">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            {line.account_code} - {line.account_name} {line.memo ? `(${line.memo})` : ''}
                                                        </span>
                                                        <div className="flex items-center justify-between sm:justify-end gap-4 font-mono text-[10px] sm:text-[11px]">
                                                            <span className={line.debit_amount > 0 ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400'}>
                                                                Dr: ₹{line.debit_amount.toFixed(2)}
                                                            </span>
                                                            <span className={line.credit_amount > 0 ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400'}>
                                                                Cr: ₹{line.credit_amount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'statements' ? (
                <FinancialStatementsView />
            ) : (
                <BankReconciliationView />
            )}

            {/* Journal Entry Modal */}
            <JournalEntryModal 
                isOpen={isJournalModalOpen}
                onClose={() => setIsJournalModalOpen(false)}
                accounts={accounts}
                onSuccess={fetchData}
            />
        </div>
    )
}
