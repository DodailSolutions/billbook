// Refunds Management
import { RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'

export default function RefundsManagementPage() {
    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <div>
                    <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <RefreshCw className="h-8 w-8 text-red-600" />
                        Refund Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Process and manage refund requests
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Refunds</CardTitle>
                        <CardDescription>Review and process refund requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center py-8 text-gray-500">
                            Refunds management will be implemented here
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
