// Coupons Management
import { Tag, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function CouponsManagementPage() {
    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-400 mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Tag className="h-8 w-8 text-orange-600" />
                            Coupons & Offers
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Create and manage discount codes and promotional offers
                        </p>
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Coupon
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Coupons</CardTitle>
                        <CardDescription>Manage your discount codes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center py-8 text-gray-500">
                            Coupons management will be implemented here
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
