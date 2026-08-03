'use client'

import { useState } from 'react'
import { ChartOfAccount, AccountType, CreateAccountInput } from "@/lib/bookkeeping-types"
import { createAccount } from "@/lib/bookkeeping-actions"
import { Button } from "@/components/ui/Button"
import { Plus, FolderTree, ArrowUpRight, ArrowDownRight, Tag } from "lucide-react"

interface ChartOfAccountsViewProps {
    accounts: ChartOfAccount[]
    onRefresh: () => void
}

const TYPE_COLORS: Record<AccountType, { bg: string; text: string; border: string }> = {
    asset: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    liability: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    equity: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    revenue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    expense: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

export function ChartOfAccountsView({ accounts, onRefresh }: ChartOfAccountsViewProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [accountCode, setAccountCode] = useState('')
    const [accountName, setAccountName] = useState('')
    const [accountType, setAccountType] = useState<AccountType>('asset')
    const [category, setCategory] = useState('Current Asset')
    const [description, setDescription] = useState('')

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!accountCode || !accountName) return

        setLoading(true)
        setError(null)
        const res = await createAccount({
            account_code: accountCode.trim(),
            account_name: accountName.trim(),
            account_type: accountType,
            category: category.trim(),
            description: description.trim() || undefined
        })
        setLoading(false)

        if (!res.success) {
            setError(res.error || 'Failed to create account')
        } else {
            setAccountCode('')
            setAccountName('')
            setDescription('')
            setIsCreating(false)
            onRefresh()
        }
    }

    const accountTypesList: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense']

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FolderTree className="h-5 w-5 text-emerald-600" />
                        Chart of Accounts (GL Ledger)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Standard double-entry accounts breakdown and running balance ledger.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreating(!isCreating)}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                    <Plus className="h-4 w-4" />
                    New Account
                </Button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-slate-50 p-4 rounded-xl border border-emerald-200 space-y-3 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Create Custom General Ledger Account</h4>
                    
                    {error && (
                        <div className="p-2.5 text-xs bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Code *</label>
                            <input
                                type="text"
                                required
                                placeholder="1050"
                                value={accountCode}
                                onChange={(e) => setAccountCode(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Account Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Petty Cash Fund"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Type *</label>
                            <select
                                value={accountType}
                                onChange={(e) => {
                                    const type = e.target.value as AccountType
                                    setAccountType(type)
                                    if (type === 'asset') setCategory('Current Asset')
                                    else if (type === 'liability') setCategory('Current Liability')
                                    else if (type === 'equity') setCategory('Equity')
                                    else if (type === 'revenue') setCategory('Operating Revenue')
                                    else setCategory('Operating Expense')
                                }}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            >
                                <option value="asset">Asset</option>
                                <option value="liability">Liability</option>
                                <option value="equity">Equity</option>
                                <option value="revenue">Revenue</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Category / Group</label>
                            <input
                                type="text"
                                placeholder="e.g. Fixed Asset, Operating Expense"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Description</label>
                            <input
                                type="text"
                                placeholder="Account usage notes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setIsCreating(false)} className="text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                            {loading ? 'Saving...' : 'Add Account'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Accounts Grouped by Type */}
            <div className="space-y-4">
                {accountTypesList.map((type) => {
                    const typeAccounts = accounts.filter(a => a.account_type === type)
                    const color = TYPE_COLORS[type]
                    const totalTypeBalance = typeAccounts.reduce((acc, a) => acc + Number(a.current_balance || 0), 0)

                    return (
                        <div key={type} className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                            <div className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-200 ${color.bg}`}>
                                <h4 className={`text-xs font-bold uppercase tracking-wider ${color.text} flex items-center gap-2`}>
                                    <span>{type} ACCOUNTS</span>
                                    <span className="text-[10px] font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-gray-200">
                                        {typeAccounts.length}
                                    </span>
                                </h4>
                                <span className={`text-xs font-bold ${color.text}`}>
                                    Total: ₹{totalTypeBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100 bg-white">
                                {typeAccounts.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-gray-400">No {type} accounts configured</div>
                                ) : (
                                    typeAccounts.map((acc) => (
                                        <div key={acc.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                                                <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md shrink-0">
                                                    {acc.account_code}
                                                </span>
                                                <div>
                                                    <h5 className="text-xs font-bold text-gray-900">{acc.account_name}</h5>
                                                    <p className="text-[11px] text-gray-500">{acc.category} {acc.description ? `• ${acc.description}` : ''}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:block sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                                                <span className="text-xs font-bold text-gray-900 font-mono">
                                                    ₹{Number(acc.current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                                {acc.is_system && (
                                                    <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">System Default</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
