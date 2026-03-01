import { CreditCard, Plus, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllPlans } from './actions'

export default async function PlansManagementPage() {
    const plans = await getAllPlans()

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="h-8 w-8 text-green-600" />
                            Subscription Plans
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage subscription plans, pricing, and features
                        </p>
                    </div>
                    <Link href="/admin">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>

                {/* Plans Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={plan.is_popular ? 'border-2 border-green-500' : ''}>
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <CardTitle>{plan.name}</CardTitle>
                                    {plan.is_popular && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs rounded-full font-medium">
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {plan.currency === 'INR' && '₹'}
                                        {plan.currency === 'USD' && '$'}
                                        {plan.currency === 'AED' && 'AED '}
                                        {plan.price}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        per {plan.billing_period}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Features:</p>
                                    {Array.isArray(plan.features) && plan.features.slice(0, 5).map((feature: string, index: number) => (
                                        <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                            ✓ {feature}
                                        </p>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                        <span className={`font-medium ${
                                            plan.is_active 
                                                ? 'text-green-600' 
                                                : 'text-gray-500'
                                        }`}>
                                            {plan.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {plans.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-gray-500">No plans available</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
