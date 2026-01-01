// Plans Management
import { CreditCard, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function PlansManagementPage() {
    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <CreditCard className="h-8 w-8 text-green-600" />
                            Subscription Plans
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage subscription plans, pricing, and features
                        </p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Plan
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Available Plans</CardTitle>
                        <CardDescription>Configure your subscription tiers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center py-8 text-gray-500">
                            Plans management will be implemented here
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
