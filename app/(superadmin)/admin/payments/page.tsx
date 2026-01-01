// Payments Management
import { DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'

export default function PaymentsManagementPage() {
    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-400 mx-auto space-y-6">
                <div>
                    <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <DollarSign className="h-8 w-8 text-emerald-600" />
                        Payments & Transactions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View all payment transactions and history
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>Complete payment history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center py-8 text-gray-500">
                            Payments management will be implemented here
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
