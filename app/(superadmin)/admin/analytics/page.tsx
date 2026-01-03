import { BarChart3, Building2, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { getBusinessTypeAnalytics } from './actions'
import Link from 'next/link'

const BUSINESS_TYPE_LABELS: Record<string, string> = {
    dental: 'Dental Clinic',
    it_company: 'IT Company',
    salon: 'Salon/Beauty Parlor',
    car_detailing: 'Car Detailing Shop',
    car_wash: 'Car & Bike Wash',
    spare_parts: 'Spare Parts Shop',
    clinic: 'Medical Clinic',
    restaurant: 'Restaurant/Cafe',
    retail: 'Retail Store',
    consulting: 'Consulting Services',
    other: 'Other'
}

export default async function AnalyticsPage() {
    const analytics = await getBusinessTypeAnalytics()
    
    const totalUsers = analytics.reduce((sum, item) => sum + item.total_users, 0)
    const totalPaying = analytics.reduce((sum, item) => sum + item.paying_users, 0)
    const conversionRate = totalUsers > 0 ? ((totalPaying / totalUsers) * 100).toFixed(1) : '0'

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-8 w-8 text-blue-600" />
                            Business Type Analytics
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Analyze which business types are using BillBooky
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers}</div>
                            <p className="text-xs text-gray-500 mt-1">Across all business types</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paying Users</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalPaying}</div>
                            <p className="text-xs text-gray-500 mt-1">With active subscriptions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                            <Building2 className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{conversionRate}%</div>
                            <p className="text-xs text-gray-500 mt-1">Free to paid conversion</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Business Type Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Business Type Distribution</CardTitle>
                        <CardDescription>See which business types are most popular</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No business data available yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {analytics.map((item) => {
                                    const label = BUSINESS_TYPE_LABELS[item.business_type] || item.business_type
                                    const payingPercentage = item.total_users > 0 
                                        ? ((item.paying_users / item.total_users) * 100).toFixed(0)
                                        : '0'
                                    const totalPercentage = totalUsers > 0
                                        ? ((item.total_users / totalUsers) * 100).toFixed(1)
                                        : '0'

                                    return (
                                        <div key={item.business_type} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{label}</h3>
                                                    <p className="text-sm text-gray-500">{totalPercentage}% of all users</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-600">{item.total_users}</div>
                                                    <div className="text-xs text-gray-500">total users</div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                                <div>
                                                    <div className="text-sm text-gray-500">Active</div>
                                                    <div className="text-lg font-semibold text-green-600">{item.active_users}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Paying</div>
                                                    <div className="text-lg font-semibold text-purple-600">{item.paying_users}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Conversion</div>
                                                    <div className="text-lg font-semibold text-orange-600">{payingPercentage}%</div>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mt-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${(item.total_users / totalUsers) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
