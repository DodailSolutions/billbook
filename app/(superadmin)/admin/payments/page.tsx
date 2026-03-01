import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllPayments } from './actions'

export default async function PaymentsManagementPage() {
    const payments = await getAllPayments()

    const stats = {
        total: payments.length,
        totalRevenue: payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
        thisMonth: payments.filter(p => {
            const date = new Date(p.created_at)
            const now = new Date()
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        }).length
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="h-8 w-8 text-emerald-600" />
                            Payments & Transactions
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            View and manage all payment transactions
                        </p>
                    </div>
                    <Link href="/admin">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Transactions
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Revenue
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                This Month
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payments List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest payment activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No payments found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">User</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Plan</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Method</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.slice(0, 50).map((payment) => (
                                            <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                    {payment.user_id?.substring(0, 8)}...
                                                </td>
                                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                                    {payment.subscription_plans?.name || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                                    ₹{(payment.amount_paid || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                                    {payment.payment_method || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
