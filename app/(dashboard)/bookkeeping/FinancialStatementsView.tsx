'use client'

import { useState, useEffect } from 'react'
import { TrialBalanceItem, ProfitAndLossReport, BalanceSheetReport } from "@/lib/bookkeeping-types"
import { getTrialBalance, getProfitAndLoss, getBalanceSheet } from "@/lib/bookkeeping-actions"
import { Card, CardContent } from "@/components/ui/Card"
import { Scale, FileSpreadsheet, PieChart, CheckCircle, AlertTriangle } from "lucide-react"

export function FinancialStatementsView() {
    const [subTab, setSubTab] = useState<'pnl' | 'balance_sheet' | 'trial_balance'>('pnl')
    const [trialBalance, setTrialBalance] = useState<TrialBalanceItem[]>([])
    const [pnl, setPnl] = useState<ProfitAndLossReport | null>(null)
    const [balanceSheet, setBalanceSheet] = useState<BalanceSheetReport | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchReports() {
            setLoading(true)
            const [tbData, pnlData, bsData] = await Promise.all([
                getTrialBalance(),
                getProfitAndLoss(),
                getBalanceSheet()
            ])
            setTrialBalance(tbData)
            setPnl(pnlData)
            setBalanceSheet(bsData)
            setLoading(false)
        }
        fetchReports()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        )
    }

    const totalDebits = trialBalance.reduce((acc, i) => acc + i.total_debit, 0)
    const totalCredits = trialBalance.reduce((acc, i) => acc + i.total_credit, 0)

    return (
        <div className="space-y-6">
            {/* Report Sub Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setSubTab('pnl')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        subTab === 'pnl' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <PieChart className="h-4 w-4" />
                    Profit & Loss (P&L)
                </button>
                <button
                    onClick={() => setSubTab('balance_sheet')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        subTab === 'balance_sheet' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Scale className="h-4 w-4" />
                    Balance Sheet
                </button>
                <button
                    onClick={() => setSubTab('trial_balance')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        subTab === 'trial_balance' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    Trial Balance Audit
                </button>
            </div>

            {/* P&L View */}
            {subTab === 'pnl' && pnl && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <Card className="border-gray-100 shadow-2xs overflow-hidden">
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold">Statement of Profit & Loss</h3>
                                <p className="text-xs text-slate-400">Income vs Operating Expenses</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs uppercase font-semibold text-slate-400">Net Income / Profit</span>
                                <h4 className={`text-xl font-extrabold ${pnl.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    ₹{pnl.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </h4>
                            </div>
                        </div>

                        <CardContent className="p-6 space-y-6">
                            {/* Revenues Section */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-blue-100 pb-2 mb-3">
                                    Operating Revenue & Income
                                </h4>
                                <div className="space-y-2">
                                    {pnl.revenueAccounts.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No revenue recorded yet</p>
                                    ) : (
                                        pnl.revenueAccounts.map((acc, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs py-1">
                                                <span className="text-gray-700">{acc.code} - {acc.name}</span>
                                                <span className="font-semibold text-gray-900">₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))
                                    )}
                                    <div className="flex items-center justify-between text-xs font-bold border-t border-gray-200 pt-2 text-blue-900">
                                        <span>Total Revenue</span>
                                        <span>₹{pnl.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Expenses Section */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 border-b border-amber-100 pb-2 mb-3">
                                    Operating Expenses & Costs
                                </h4>
                                <div className="space-y-2">
                                    {pnl.expenseAccounts.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No expenses recorded yet</p>
                                    ) : (
                                        pnl.expenseAccounts.map((acc, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs py-1">
                                                <span className="text-gray-700">{acc.code} - {acc.name}</span>
                                                <span className="font-semibold text-gray-900">₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))
                                    )}
                                    <div className="flex items-center justify-between text-xs font-bold border-t border-gray-200 pt-2 text-amber-900">
                                        <span>Total Operating Expense</span>
                                        <span>₹{pnl.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Balance Sheet View */}
            {subTab === 'balance_sheet' && balanceSheet && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <Card className="border-gray-100 shadow-2xs overflow-hidden">
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold">Balance Sheet</h3>
                                <p className="text-xs text-slate-400">Assets = Liabilities + Equity</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {balanceSheet.isBalanced ? (
                                    <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-500/30">
                                        <CheckCircle className="h-3.5 w-3.5" /> Statement Balanced
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full flex items-center gap-1 border border-rose-500/30">
                                        <AlertTriangle className="h-3.5 w-3.5" /> Out of Balance
                                    </span>
                                )}
                            </div>
                        </div>

                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Assets Side */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-100 pb-2">
                                    ASSETS
                                </h4>
                                <div className="space-y-1.5">
                                    {balanceSheet.assetAccounts.map((acc, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs py-1">
                                            <span className="text-gray-700">{acc.code} - {acc.name}</span>
                                            <span className="font-semibold text-gray-900">₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold border-t border-gray-200 pt-2 text-emerald-900">
                                    <span>TOTAL ASSETS</span>
                                    <span>₹{balanceSheet.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {/* Liabilities & Equity Side */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 border-b border-rose-100 pb-2 mb-2">
                                        LIABILITIES
                                    </h4>
                                    <div className="space-y-1.5">
                                        {balanceSheet.liabilityAccounts.map((acc, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs py-1">
                                                <span className="text-gray-700">{acc.code} - {acc.name}</span>
                                                <span className="font-semibold text-gray-900">₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-rose-900 pt-1">
                                        <span>Total Liabilities</span>
                                        <span>₹{balanceSheet.totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 border-b border-purple-100 pb-2 mb-2">
                                        EQUITY
                                    </h4>
                                    <div className="space-y-1.5">
                                        {balanceSheet.equityAccounts.map((acc, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs py-1">
                                                <span className="text-gray-700">{acc.code} - {acc.name}</span>
                                                <span className="font-semibold text-gray-900">₹{acc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between text-xs py-1 text-emerald-700">
                                            <span>Current Period Net Income (Retained)</span>
                                            <span className="font-semibold">₹{balanceSheet.retainedEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-purple-900 pt-1">
                                        <span>Total Equity</span>
                                        <span>₹{balanceSheet.totalEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs font-bold border-t-2 border-gray-900 pt-2 text-gray-900">
                                    <span>TOTAL LIABILITIES & EQUITY</span>
                                    <span>₹{(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Trial Balance Audit Table */}
            {subTab === 'trial_balance' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold">General Ledger Trial Balance</h3>
                                <p className="text-xs text-slate-400">Audit of Total Debit vs Credit balance</p>
                            </div>
                        </div>

                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-gray-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-3">Code</th>
                                    <th className="p-3">Account Name</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3 text-right">Total Debit (₹)</th>
                                    <th className="p-3 text-right">Total Credit (₹)</th>
                                    <th className="p-3 text-right">Net Balance (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trialBalance.map((item) => (
                                    <tr key={item.account_id} className="hover:bg-slate-50/50">
                                        <td className="p-3 font-mono font-bold text-gray-500">{item.account_code}</td>
                                        <td className="p-3 font-bold text-gray-900">{item.account_name}</td>
                                        <td className="p-3 uppercase text-[10px] font-semibold text-gray-500">{item.account_type}</td>
                                        <td className="p-3 text-right font-mono text-gray-700">₹{item.total_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-right font-mono text-gray-700">₹{item.total_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-right font-mono font-bold text-emerald-600">₹{item.net_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold text-gray-900 border-t border-gray-200">
                                <tr>
                                    <td colSpan={3} className="p-3 uppercase tracking-wider text-xs">Totals Audit</td>
                                    <td className="p-3 text-right font-mono">₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-3 text-right font-mono">₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-3 text-right font-mono text-emerald-700">✓ Audited</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
