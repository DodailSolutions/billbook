'use client'

import { useState } from 'react'
import { ChartOfAccount, JournalEntry } from "@/lib/bookkeeping-types"
import { getChartOfAccounts, getJournalEntries } from "@/lib/bookkeeping-actions"
import { ChartOfAccountsView } from "./ChartOfAccountsView"
import { JournalEntryModal } from "./JournalEntryModal"
import { FinancialStatementsView } from "./FinancialStatementsView"
import { BankReconciliationView } from "./BankReconciliationView"
import { Button } from "@/components/ui/Button"
import { BookOpen, FolderTree, FileText, Landmark, Plus, ArrowRightLeft } from "lucide-react"

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

    const [activeTab, setActiveTab] = useState<'accounts' | 'journal' | 'statements' | 'bank'>('accounts')
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false)

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Bookkeeping & General Ledger
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Double-entry accounting, Chart of Accounts, P&L, Balance Sheet, Cash Flow, Trial Balance & General Ledger.
                    </p>
                </div>

                <Button 
                    onClick={() => setIsJournalModalOpen(true)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none"
                >
                    <Plus className="h-4 w-4" />
                    New Journal Entry
                </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
                <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                            activeTab === 'accounts' 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <FolderTree className="h-4 w-4 hidden sm:block" />
                        Chart of Accounts ({accounts.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('journal')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                            activeTab === 'journal' 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <ArrowRightLeft className="h-4 w-4 hidden sm:block" />
                        Journal Entries ({journalEntries.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('statements')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                            activeTab === 'statements' 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <FileText className="h-4 w-4 hidden sm:block" />
                        <span className="sm:hidden">Financials</span>
                        <span className="hidden sm:inline">Financial Statements & Reports</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('bank')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                            activeTab === 'bank' 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Landmark className="h-4 w-4 hidden sm:block" />
                        Bank Reconciliation
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
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold">General Journal Entry Log</h3>
                                <p className="text-xs text-slate-400">Audited double-entry transactions</p>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => setIsJournalModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-xs"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Post Entry
                            </Button>
                        </div>

                        {journalEntries.length === 0 ? (
                            <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400">
                                No journal entries posted yet. Click "New Journal Entry" to post a debit/credit transaction.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {journalEntries.map((entry) => (
                                    <div key={entry.id} className="p-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 sm:gap-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800">
                                                    {entry.entry_number}
                                                </span>
                                                <span className="font-bold text-gray-900 dark:text-white">{entry.description}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                                <span>Date: {entry.entry_date}</span>
                                                <span className="uppercase font-semibold text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                                                    {entry.source}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Entry Lines */}
                                        {entry.lines && entry.lines.length > 0 && (
                                            <div className="bg-slate-50 dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 text-xs space-y-1">
                                                {entry.lines.map((line, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1 sm:gap-0">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            {line.account_code} - {line.account_name} {line.memo ? `(${line.memo})` : ''}
                                                        </span>
                                                        <div className="flex items-center justify-between sm:justify-end gap-6 font-mono">
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
