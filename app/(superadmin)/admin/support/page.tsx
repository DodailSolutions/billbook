// Support Tickets
import { Ticket } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'

export default function SupportManagementPage() {
    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-400 mx-auto space-y-6">
                <div>
                    <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Ticket className="h-8 w-8 text-pink-600" />
                        Support Tickets
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage customer support requests
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Open Tickets</CardTitle>
                        <CardDescription>Customer support requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center py-8 text-gray-500">
                            Support tickets will be implemented here
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
