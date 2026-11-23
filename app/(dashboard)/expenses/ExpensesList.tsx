'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    Search, 
    Filter, 
    Trash2, 
    Calendar, 
    FileText, 
    IndianRupee, 
    Layers, 
    UploadCloud, 
    FileSpreadsheet, 
    Repeat, 
    Car, 
    TrendingUp, 
    Clock, 
    CheckCircle2 
} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteExpenseAction } from './actions'
import { formatDate } from '@/lib/utils'
import { ExpenseExcelImportModal } from './ExpenseExcelImportModal'

interface ExpenseRow {
    id: string
    expense_number: string
    expense_date: string
    expense_type: string
    payee_name: string | null
    amount: number
    tax_amount: number
    total_amount: number
    payment_method: string | null
    payment_reference?: string | null
    expense_categories: { category_name: string } | null
    vendors: { vendor_name: string } | null
}

interface ExpensesListProps {
    initialExpenses: any[]
    categories: any[]
    vendors: any[]
}

function formatINR(n: number) {
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        maximumFractionDigits: 0 
    }).format(n)
}

export function ExpensesList({ initialExpenses, categories, vendors }: ExpensesListProps) {
    const router = useRouter()
    const [expenses, setExpenses] = useState<ExpenseRow[]>(initialExpenses)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'monthly' | 'yearly' | 'recurring' | 'one_time'>('all')
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)

    const todayStr = new Date().toISOString().slice(0, 10)
    const thisMonthPrefix = todayStr.slice(0, 7) // "YYYY-MM"
    const thisYearPrefix = todayStr.slice(0, 4) // "YYYY"

    // Filters
    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = 
            exp.expense_number.toLowerCase().includes(search.toLowerCase()) ||
            (exp.payee_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (exp.vendors?.vendor_name || '').toLowerCase().includes(search.toLowerCase())
        
        const matchesCategory = selectedCategory === '' || exp.expense_categories?.category_name === selectedCategory
        const matchesType = selectedType === '' || exp.expense_type === selectedType

        // Period & Recurrence Filter
        let matchesTime = true
        const isRecurring = exp.expense_type.includes('recurring') || (exp.payment_reference || '').includes('Cycle:')

        if (timeFilter === 'daily') {
            matchesTime = exp.expense_date === todayStr
        } else if (timeFilter === 'monthly') {
            matchesTime = exp.expense_date.startsWith(thisMonthPrefix)
        } else if (timeFilter === 'yearly') {
            matchesTime = exp.expense_date.startsWith(thisYearPrefix)
        } else if (timeFilter === 'recurring') {
            matchesTime = isRecurring
        } else if (timeFilter === 'one_time') {
            matchesTime = !isRecurring
        }

        return matchesSearch && matchesCategory && matchesType && matchesTime
    })

    // KPI Aggregates
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.total_amount || 0), 0)
    const recurringExpenses = filteredExpenses.filter(e => e.expense_type.includes('recurring') || (e.payment_reference || '').includes('Cycle:'))
    const recurringMonthlyCommitment = recurringExpenses.reduce((sum, e) => sum + (e.total_amount || 0), 0)
    const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0
    const expenseCount = filteredExpenses.length

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return

        setIsDeleting(id)
        try {
            const res = await deleteExpenseAction(id)
            if (res.success) {
                setExpenses(prev => prev.filter(e => e.id !== id))
                router.refresh()
            } else {
                alert(res.error || 'Failed to delete expense')
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('An error occurred while deleting the expense')
        } finally {
            setIsDeleting(null)
        }
    }

    const handleImportSuccess = () => {
        router.refresh()
        // Refresh local view
        window.location.reload()
    }

    return (
        <div className="space-y-6">
            {/* Import Modal */}
            {isImportModalOpen && (
                <ExpenseExcelImportModal
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={handleImportSuccess}
                />
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden border border-gray-100 bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Period Outflow</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{formatINR(totalExpenses)}</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">{filteredExpenses.length} ledger entries</p>
                            </div>
                            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                                <IndianRupee className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border border-gray-100 bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Recurring Commitments</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-purple-700 mt-1">{formatINR(recurringMonthlyCommitment)}</h3>
                                <p className="text-[10px] text-purple-600 mt-0.5">SaaS, rent, fleet EMIs & retainers</p>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <Repeat className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border border-gray-100 bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Average Expense</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{formatINR(avgExpense)}</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Per-transaction average</p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Layers className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border border-gray-100 bg-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Transactions</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{expenseCount}</h3>
                                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Active filtered ledger</p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Period Breakdown Filter Pills & Excel Import Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                    {[
                        { id: 'all', label: 'All Expenses' },
                        { id: 'daily', label: 'Daily (Today)' },
                        { id: 'monthly', label: 'Monthly (This Month)' },
                        { id: 'yearly', label: 'Yearly (Annual / FY)' },
                        { id: 'recurring', label: '🔄 Recurring Only' },
                        { id: 'one_time', label: 'One-Time Only' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setTimeFilter(tab.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                                timeFilter === tab.id
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsImportModalOpen(true)}
                    className="text-xs h-9 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 shrink-0 font-semibold"
                >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Import Excel / CSV
                </Button>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search by Payee, Vendor, Vehicle or Expense No..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 w-full text-xs h-9"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Category Filter */}
                    <div className="relative flex-1 md:flex-initial">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-9"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Expense Type Filter */}
                    <div className="relative flex-1 md:flex-initial">
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-9"
                        >
                            <option value="">All Payment Types</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="mileage">Mileage / Fleet</option>
                            <option value="asset_purchase">Asset Purchase</option>
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                <Table>
                    <TableHeader className="bg-gray-50/75">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-600 text-xs">Date</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-xs">Expense No.</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-xs">Payee / Description</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-xs">Category</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-xs">Recurrence / Type</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-right text-xs">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-center w-16 text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-gray-400 text-xs">
                                    No matching expenses found in this filter view.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExpenses.map((exp) => {
                                const isVehicle = (exp.expense_categories?.category_name || '').toLowerCase().includes('vehicle') || (exp.payee_name || '').toLowerCase().includes('fuel')
                                const isRecurring = exp.expense_type.includes('recurring') || (exp.payment_reference || '').includes('Cycle:')

                                return (
                                    <TableRow key={exp.id} className="hover:bg-gray-50/50">
                                        <TableCell className="text-gray-900 font-medium text-xs font-mono">
                                            {formatDate(exp.expense_date)}
                                        </TableCell>
                                        <TableCell className="text-gray-500 font-mono text-[11px]">
                                            {exp.expense_number}
                                        </TableCell>
                                        <TableCell className="text-gray-900 font-semibold text-xs">
                                            <div className="flex items-center gap-1.5">
                                                {isVehicle && <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                                <span>{exp.vendors?.vendor_name || exp.payee_name || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-700">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                isVehicle 
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {exp.expense_categories?.category_name || 'Other'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-xs">
                                            {isRecurring ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                                                    <Repeat className="w-3 h-3" /> Recurring
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-500 capitalize">
                                                    {exp.expense_type.replace('_', ' ')}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 font-bold text-right text-xs font-mono">
                                            {formatINR(exp.total_amount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(exp.id)}
                                                disabled={isDeleting === exp.id}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
