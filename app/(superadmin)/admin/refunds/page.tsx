import { DollarSign, RefreshCw } from 'lucide-react'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getAllRefunds } from '@/app/(dashboard)/invoices/payment-actions'
import RefundsTable from './RefundsTable'

export default async function RefundsPage() {
    const isSuperAdmin = await checkSuperAdminAccess()
    if (!isSuperAdmin) {
        redirect('/dashboard')
    }

    const refunds = await getAllRefunds()

    const stats = {
        total: refunds.length,
        pending: refunds.filter(r => r.status === 'pending').length,
        processing: refunds.filter(r => r.status === 'processing').length,
        completed: refunds.filter(r => r.status === 'completed').length,
        totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0),
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <RefreshCw className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Refund Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Review and process refund requests
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {stats.pending}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.processing}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.completed}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ₹{stats.totalAmount.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Refunds Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Refund Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <RefundsTable refunds={refunds} />
                </CardContent>
            </Card>
        </div>
    )
}
