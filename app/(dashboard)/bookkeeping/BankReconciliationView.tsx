'use client'

import { useState, useEffect } from 'react'
import { BankAccount } from "@/lib/bookkeeping-types"
import { getBankAccounts, createBankAccount, reconcileBankAccount } from "@/lib/bookkeeping-actions"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Landmark, Plus, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

export function BankReconciliationView() {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddingAccount, setIsAddingAccount] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

    // New Bank Account Form State
    const [bankName, setBankName] = useState('')
    const [accountName, setAccountName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [ifscCode, setIfscCode] = useState('')
    const [initialBalance, setInitialBalance] = useState('0')

    // Reconciliation Form State
    const [statementDate, setStatementDate] = useState(new Date().toISOString().split('T')[0])
    const [statementBalance, setStatementBalance] = useState('')
    const [reconNotes, setReconNotes] = useState('')
    const [reconStatus, setReconStatus] = useState<{ success: boolean; msg: string } | null>(null)

    const fetchAccounts = async () => {
        setLoading(true)
        const data = await getBankAccounts()
        setBankAccounts(data)
        if (data.length > 0 && !selectedAccount) {
            setSelectedAccount(data[0])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bankName || !accountName || !accountNumber) return

        const res = await createBankAccount({
            bank_name: bankName.trim(),
            account_name: accountName.trim(),
            account_number: accountNumber.trim(),
            ifsc_code: ifscCode.trim() || undefined,
            initial_balance: Number(initialBalance) || 0
        })

        if (res.success) {
            setBankName('')
            setAccountName('')
            setAccountNumber('')
            setIfscCode('')
            setInitialBalance('0')
            setIsAddingAccount(false)
            fetchAccounts()
        }
    }

    const handleReconcile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedAccount || !statementBalance) return

        setReconStatus(null)
        const stmtBal = Number(statementBalance)
        const res = await reconcileBankAccount(
            selectedAccount.id,
            statementDate,
            stmtBal,
            reconNotes.trim() || undefined
        )

        if (res.success) {
            const diff = stmtBal - selectedAccount.current_balance
            if (diff === 0) {
                setReconStatus({ success: true, msg: '🎉 Perfect Match! Bank account fully reconciled with general ledger.' })
            } else {
                setReconStatus({ success: false, msg: `Reconciliation recorded with a difference of ₹${Math.abs(diff).toFixed(2)}.` })
            }
            fetchAccounts()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-indigo-600" />
                        Bank Account Reconciliation
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Match physical bank statements against your recorded ledger balance.
                    </p>
                </div>

                <Button
                    onClick={() => setIsAddingAccount(!isAddingAccount)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                    <Plus className="h-4 w-4" />
                    Add Bank Account
                </Button>
            </div>

            {/* Add Bank Account Modal / Form */}
            {isAddingAccount && (
                <form onSubmit={handleCreateAccount} className="bg-slate-50 p-4 rounded-xl border border-indigo-200 space-y-3 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Add Business Bank Account</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Bank Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="HDFC Bank"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Account Holder / Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="Acme Pvt Ltd Operating"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Account Number *</label>
                            <input
                                type="text"
                                required
                                placeholder="50100012345678"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">IFSC Code</label>
                            <input
                                type="text"
                                placeholder="HDFC0001234"
                                value={ifscCode}
                                onChange={(e) => setIfscCode(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Current Ledger Balance (₹)</label>
                            <input
                                type="number"
                                placeholder="100000"
                                value={initialBalance}
                                onChange={(e) => setInitialBalance(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingAccount(false)} className="text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                            Save Bank Account
                        </Button>
                    </div>
                </form>
            )}

            {/* Bank Accounts Grid */}
            {bankAccounts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-gray-500">No bank accounts linked yet. Click "Add Bank Account" above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Account Selector Cards */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Select Bank Account</h4>
                        {bankAccounts.map((acc) => (
                            <div
                                key={acc.id}
                                onClick={() => setSelectedAccount(acc)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    selectedAccount?.id === acc.id 
                                        ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20' 
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-gray-900">{acc.bank_name}</h5>
                                    <span className="text-[10px] font-semibold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                        {acc.account_type}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 font-medium">{acc.account_name}</p>
                                <p className="text-[11px] font-mono text-gray-400 mt-0.5">Acc: •••• {acc.account_number.slice(-4)}</p>
                                
                                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[11px] text-gray-500">Ledger Balance</span>
                                    <span className="text-xs font-bold text-emerald-600 font-mono">
                                        ₹{Number(acc.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reconciliation Panel */}
                    {selectedAccount && (
                        <div className="md:col-span-2 space-y-4">
                            <Card className="border-gray-100 shadow-2xs">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 border-b border-gray-100 pb-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">
                                                Reconcile {selectedAccount.bank_name} ({selectedAccount.account_name})
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Enter your bank statement ending balance to compute variance.
                                            </p>
                                        </div>
                                        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 self-start sm:self-auto">
                                            Ledger: ₹{Number(selectedAccount.current_balance).toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    {reconStatus && (
                                        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                                            reconStatus.success 
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}>
                                            {reconStatus.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />}
                                            <span>{reconStatus.msg}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleReconcile} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                                    Statement Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={statementDate}
                                                    onChange={(e) => setStatementDate(e.target.value)}
                                                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                                    Statement Ending Balance (₹) *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    placeholder="e.g. 100000"
                                                    value={statementBalance}
                                                    onChange={(e) => setStatementBalance(e.target.value)}
                                                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl font-semibold"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                                Reconciliation Notes / Uncleared Checks
                                            </label>
                                            <textarea
                                                rows={2}
                                                placeholder="e.g. ₹5,000 pending customer deposit in transit..."
                                                value={reconNotes}
                                                onChange={(e) => setReconNotes(e.target.value)}
                                                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl"
                                            />
                                        </div>

                                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                            Run Reconciliation Audit
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
