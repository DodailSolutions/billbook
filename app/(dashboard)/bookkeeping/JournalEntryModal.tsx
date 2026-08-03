'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/Button"
import { ChartOfAccount, CreateJournalEntryInput } from "@/lib/bookkeeping-types"
import { createJournalEntry } from "@/lib/bookkeeping-actions"
import { X, Plus, Trash2, Scale } from "lucide-react"

interface JournalEntryModalProps {
    isOpen: boolean
    onClose: () => void
    accounts: ChartOfAccount[]
    onSuccess?: () => void
}

interface LineItem {
    account_id: string
    debit_amount: string
    credit_amount: string
    memo: string
}

export function JournalEntryModal({ isOpen, onClose, accounts, onSuccess }: JournalEntryModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState('')
    const [reference, setReference] = useState('')

    const [lines, setLines] = useState<LineItem[]>([
        { account_id: accounts[0]?.id || '', debit_amount: '0', credit_amount: '0', memo: '' },
        { account_id: accounts[1]?.id || '', debit_amount: '0', credit_amount: '0', memo: '' },
    ])

    if (!isOpen) return null

    const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit_amount) || 0), 0)
    const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit_amount) || 0), 0)
    const difference = Math.abs(totalDebit - totalCredit)
    const isBalanced = difference < 0.01 && totalDebit > 0

    const handleAddLine = () => {
        setLines([...lines, { account_id: accounts[0]?.id || '', debit_amount: '0', credit_amount: '0', memo: '' }])
    }

    const handleRemoveLine = (index: number) => {
        if (lines.length <= 2) return
        setLines(lines.filter((_, i) => i !== index))
    }

    const handleLineChange = (index: number, field: keyof LineItem, value: string) => {
        const updated = [...lines]
        updated[index] = { ...updated[index], [field]: value }
        setLines(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!description.trim()) {
            setError('Entry description is required')
            return
        }

        if (!isBalanced) {
            setError(`Unbalanced entry! Debits (₹${totalDebit.toFixed(2)}) must equal Credits (₹${totalCredit.toFixed(2)}).`)
            return
        }

        setLoading(true)

        const input: CreateJournalEntryInput = {
            entry_date: entryDate,
            description: description.trim(),
            reference: reference.trim() || undefined,
            lines: lines.map(l => ({
                account_id: l.account_id,
                debit_amount: Number(l.debit_amount) || 0,
                credit_amount: Number(l.credit_amount) || 0,
                memo: l.memo.trim() || undefined
            }))
        }

        const res = await createJournalEntry(input)
        setLoading(false)

        if (!res.success) {
            setError(res.error || 'Failed to post journal entry')
        } else {
            onSuccess?.()
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-4 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white sm:rounded-2xl shadow-xl w-full h-full sm:h-auto max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-emerald-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                            New Double-Entry Journal Entry
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
                    {error && (
                        <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Entry Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={entryDate}
                                onChange={(e) => setEntryDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Description / Purpose *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Office Rent Payment"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Reference # (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. REF-1092"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    {/* Journal Lines Table */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                Ledger Account Lines
                            </h4>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleAddLine}
                                className="gap-1 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Line
                            </Button>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Desktop Table view */}
                            <div className="hidden sm:block">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-gray-600 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="p-2.5">Account Name</th>
                                            <th className="p-2.5 w-28">Debit (₹)</th>
                                            <th className="p-2.5 w-28">Credit (₹)</th>
                                            <th className="p-2.5">Memo / Note</th>
                                            <th className="p-2.5 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {lines.map((line, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="p-2">
                                                    <select
                                                        value={line.account_id}
                                                        onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                                                        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500/20"
                                                    >
                                                        {accounts.map(acc => (
                                                            <option key={acc.id} value={acc.id}>
                                                                {acc.account_code} - {acc.account_name} ({acc.account_type})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={line.debit_amount}
                                                        onChange={(e) => handleLineChange(idx, 'debit_amount', e.target.value)}
                                                        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500/20"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={line.credit_amount}
                                                        onChange={(e) => handleLineChange(idx, 'credit_amount', e.target.value)}
                                                        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500/20"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Line detail..."
                                                        value={line.memo}
                                                        onChange={(e) => handleLineChange(idx, 'memo', e.target.value)}
                                                        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:ring-2 focus:ring-emerald-500/20"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    {lines.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveLine(idx)}
                                                            className="text-gray-400 hover:text-rose-600 p-1 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile stacked view */}
                            <div className="sm:hidden divide-y divide-gray-100">
                                {lines.map((line, idx) => (
                                    <div key={idx} className="p-3 space-y-3 bg-white">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500">Line {idx + 1}</span>
                                            {lines.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLine(idx)}
                                                    className="text-gray-400 hover:text-rose-600 p-2 rounded-md bg-gray-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Account</label>
                                            <select
                                                value={line.account_id}
                                                onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
                                            >
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.account_code} - {acc.account_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Debit (₹)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.debit_amount}
                                                    onChange={(e) => handleLineChange(idx, 'debit_amount', e.target.value)}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Credit (₹)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.credit_amount}
                                                    onChange={(e) => handleLineChange(idx, 'credit_amount', e.target.value)}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Memo</label>
                                            <input
                                                type="text"
                                                placeholder="Line detail..."
                                                value={line.memo}
                                                onChange={(e) => handleLineChange(idx, 'memo', e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Balance Check Footer */}
                    <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-3 sm:gap-0 ${
                        isBalanced 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                            <span>Total Debits: ₹{totalDebit.toFixed(2)}</span>
                            <span>Total Credits: ₹{totalCredit.toFixed(2)}</span>
                        </div>
                        <div>
                            {isBalanced ? (
                                <span className="flex items-center gap-1 text-emerald-700">
                                    ✓ Balanced Entry
                                </span>
                            ) : (
                                <span>Difference: ₹{difference.toFixed(2)}</span>
                            )}
                        </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || !isBalanced} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                        >
                            {loading ? 'Posting Entry...' : 'Post Journal Entry'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
