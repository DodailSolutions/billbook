'use client'

import { useState, useEffect } from 'react'
import { ChartOfAccount, JournalEntry } from "@/lib/bookkeeping-types"
import { getChartOfAccounts, getJournalEntries } from "@/lib/bookkeeping-actions"
import { ChartOfAccountsView } from "./ChartOfAccountsView"
import { JournalEntryModal } from "./JournalEntryModal"
import { FinancialStatementsView } from "./FinancialStatementsView"
import { BankReconciliationView } from "./BankReconciliationView"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { BookOpen, FolderTree, Scale, FileText, Landmark, Plus, ArrowRightLeft } from "lucide-react"

export default function BookkeepingPage() {
    const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<'accounts' | 'journal' | 'statements' | 'bank'>('accounts')
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        const [coaData, jeData] = await Promise.all([
            getChartOfAccounts(),
            getJournalEntries()
        ])
        setAccounts(coaData)
        setJournalEntries(jeData)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <BookOpen className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                            Bookkeeping & General Ledger
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Double-entry accounting, Chart of Accounts, Trial Balance, P&L, Balance Sheet & Bank Reconciliation.
                    </p>
                </div>

                <Button 
                    onClick={() => setIsJournalModalOpen(true)}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                >
                    <Plus className="h-4 w-4" />
                    New Journal Entry
                </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${
                            activeTab === 'accounts' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <FolderTree className="h-4 w-4 hidden sm:block" />
                        Chart of Accounts ({accounts.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('journal')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${
                            activeTab === 'journal' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <ArrowRightLeft className="h-4 w-4 hidden sm:block" />
                        Journal Entries ({journalEntries.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('statements')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${
                            activeTab === 'statements' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <FileText className="h-4 w-4 hidden sm:block" />
                        <span className="sm:hidden">P&L</span>
                        <span className="hidden sm:inline">Financial Statements (P&L & BS)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('bank')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${
                            activeTab === 'bank' 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'text-gray-600 hover:bg-gray-100'
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
            ) : activeTab === 'accounts' ? (
                <ChartOfAccountsView 
                    accounts={accounts}
                    onRefresh={fetchData}
                />
            ) : activeTab === 'journal' ? (
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold">General Journal Entry Log</h3>
                                <p className="text-xs text-slate-400">Audited double-entry transactions</p>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => setIsJournalModalOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Post Entry
                            </Button>
                        </div>

                        {journalEntries.length === 0 ? (
                            <div className="p-12 text-center text-xs text-gray-500">
                                No journal entries posted yet. Click "New Journal Entry" to post a debit/credit transaction.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {journalEntries.map((entry) => (
                                    <div key={entry.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 sm:gap-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                    {entry.entry_number}
                                                </span>
                                                <span className="font-bold text-gray-900">{entry.description}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-500">
                                                <span>Date: {entry.entry_date}</span>
                                                <span className="uppercase font-semibold text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-md">
                                                    {entry.source}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Entry Lines */}
                                        {entry.lines && entry.lines.length > 0 && (
                                            <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-100 text-xs space-y-1">
                                                {entry.lines.map((line, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1 sm:gap-0">
                                                        <span className="font-medium text-gray-700">
                                                            {line.account_code} - {line.account_name} {line.memo ? `(${line.memo})` : ''}
                                                        </span>
                                                        <div className="flex items-center justify-between sm:justify-end gap-6 font-mono">
                                                            <span className={line.debit_amount > 0 ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                                                                Dr: ₹{line.debit_amount.toFixed(2)}
                                                            </span>
                                                            <span className={line.credit_amount > 0 ? 'text-gray-900 font-bold' : 'text-gray-400'}>
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
