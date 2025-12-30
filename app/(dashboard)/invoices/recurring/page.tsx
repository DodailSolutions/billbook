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
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                                No recurring invoices yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Set up recurring invoices to automate your billing process
                            </p>
                            <Link href="/invoices/recurring/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Recurring Invoice
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
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
