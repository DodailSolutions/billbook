'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Trash2, Calendar, FileText, IndianRupee, Layers } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteExpenseAction } from './actions'
import { formatDate } from '@/lib/utils'

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
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    // Filters
    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = 
            exp.expense_number.toLowerCase().includes(search.toLowerCase()) ||
            (exp.payee_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (exp.vendors?.vendor_name || '').toLowerCase().includes(search.toLowerCase())
        
        const matchesCategory = selectedCategory === '' || exp.expense_categories?.category_name === selectedCategory
        const matchesType = selectedType === '' || exp.expense_type === selectedType

        return matchesSearch && matchesCategory && matchesType
    })

    // KPI Aggregates
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.total_amount || 0), 0)
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

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="relative overflow-hidden border border-gray-100 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Outflow</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatINR(totalExpenses)}</h3>
                            </div>
                            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                                <IndianRupee className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border border-gray-100 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Average Expense</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatINR(avgExpense)}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-50 rounded-xl">
                                <Layers className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border border-gray-100 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Transactions</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{expenseCount}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                                <FileText className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search by Payee, Vendor or Expense No..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Category Filter */}
                    <div className="relative flex-1 md:flex-initial">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="mileage">Mileage</option>
                            <option value="asset_purchase">Asset Purchase</option>
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50/75">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-600">Date</TableHead>
                            <TableHead className="font-semibold text-gray-600">Expense No.</TableHead>
                            <TableHead className="font-semibold text-gray-600">Payee / Vendor</TableHead>
                            <TableHead className="font-semibold text-gray-600">Category</TableHead>
                            <TableHead className="font-semibold text-gray-600">Payment Type</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-right">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-600 text-center w-16">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                                    No matching expenses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExpenses.map((exp) => (
                                <TableRow key={exp.id} className="hover:bg-gray-50/50">
                                    <TableCell className="text-gray-900 font-medium">
                                        {formatDate(exp.expense_date)}
                                    </TableCell>
                                    <TableCell className="text-gray-500 font-mono text-xs">
                                        {exp.expense_number}
                                    </TableCell>
                                    <TableCell className="text-gray-900 font-semibold">
                                        {exp.vendors?.vendor_name || exp.payee_name || '-'}
                                    </TableCell>
                                    <TableCell className="text-gray-700">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {exp.expense_categories?.category_name || 'Other'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-500 capitalize">
                                        {exp.expense_type.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell className="text-gray-900 font-bold text-right">
                                        {formatINR(exp.total_amount)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(exp.id)}
                                            disabled={isDeleting === exp.id}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
