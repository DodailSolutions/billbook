import Link from 'next/link'
import { Plus, Calendar, Package, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getRecurringInvoices } from './actions'
import RecurringInvoiceActions from './RecurringInvoiceActions'
import { formatDate } from '@/lib/utils'

export default async function RecurringInvoicesPage() {
    const recurringInvoices = await getRecurringInvoices()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Recurring Invoices
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Automate monthly and yearly invoice generation
                    </p>
                </div>
                <Link href="/invoices/recurring/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Recurring Invoice
                    </Button>
                </Link>
            </div>

            {recurringInvoices.length === 0 ? (
                <div className="space-y-8">
                    <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Create. Set. Repeat.
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Set up a profile to periodically create and send invoices to your customers.
                            </p>
                            
                            <Link href="/invoices/recurring/new">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all">
                                    CREATE NEW RECURRING INVOICE
                                </Button>
                            </Link>
                            
                            <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Import Recurring Invoices
                            </button>
                        </div>
                    </Card>

                    {/* Lifecycle Diagram */}
                    <Card className="p-8 bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                            Life cycle of a Recurring Invoice
                        </h3>
                        
                        <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto">
                            {/* Step 1: Recurring Profile */}
                            <div className="flex flex-col items-center">
                                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="font-semibold text-gray-900 dark:text-white">RECURRING PROFILE</span>
                                    </div>
                                </div>
                                <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600"></div>
                            </div>

                            {/* Step 2: Invoices */}
                            <div className="flex flex-col items-center">
                                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="font-semibold text-gray-900 dark:text-white">INVOICES</span>
                                    </div>
                                </div>
                                <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600"></div>
                            </div>

                            {/* Step 3: Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                    <svg className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">SAVE AS DRAFT</span>
                                </div>

                                <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                    <svg className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">SENT INVOICES</span>
                                </div>

                                <div className="flex flex-col items-center p-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-400 rounded-lg">
                                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">CHARGE AUTOMATICALLY</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">AND SEND INVOICES</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recurringInvoices.map((recurringInvoice) => {
                        const items = recurringInvoice.recurring_invoice_items || []
                        const subtotal = items.reduce(
                            (sum, item) => sum + item.quantity * item.unit_price,
                            0
                        )
                        const gstAmount = (subtotal * recurringInvoice.gst_percentage) / 100
                        const total = subtotal + gstAmount

                        return (
                            <Card key={recurringInvoice.id} className="hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                                <div className="p-6 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-2xl font-extrabold text-gray-900" style={{ color: 'var(--foreground)' }}>
                                                    {recurringInvoice.customer.name}
                                                </h3>
                                                {recurringInvoice.is_active ? (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                        Paused
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-base font-medium text-gray-600" style={{ color: 'var(--foreground)' }}>
                                                {recurringInvoice.customer.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Frequency Badge */}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                        <span className="text-base font-semibold text-purple-600 dark:text-purple-300 capitalize">
                                            {recurringInvoice.frequency}
                                        </span>
                                    </div>

                                    {/* Amount */}
                                    <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-gray-600" style={{ color: 'var(--foreground)' }}>Invoice Amount</span>
                                            <span className="text-3xl font-extrabold text-gray-900" style={{ color: 'var(--foreground)' }}>
                                                ₹{total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Next Invoice Date */}
                                    <div className="flex items-center gap-2 text-base">
                                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                        <span className="font-medium text-gray-600" style={{ color: 'var(--foreground)' }}>Next invoice:</span>
                                        <span className="font-bold text-gray-900" style={{ color: 'var(--foreground)' }}>
                                            {formatDate(recurringInvoice.next_invoice_date)}
                                        </span>
                                    </div>

                                    {/* Items Count */}
                                    <div className="flex items-center gap-2 text-base font-medium text-gray-600" style={{ color: 'var(--foreground)' }}>
                                        <Package className="h-5 w-5" />
                                        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                                    </div>

                                    {/* Actions */}
                                    <RecurringInvoiceActions 
                                        recurringInvoice={recurringInvoice}
                                    />
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
