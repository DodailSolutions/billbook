import { BarChart3, Building2, TrendingUp, Users, Download, Monitor, Apple, ShieldCheck, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { getBusinessTypeAnalytics } from './actions'
import { getBridgeDownloadMetrics } from '@/lib/bridge-download-actions'
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
    const [analytics, bridgeMetrics] = await Promise.all([
        getBusinessTypeAnalytics(),
        getBridgeDownloadMetrics()
    ])
    
    const totalUsers = analytics.reduce((sum, item) => sum + item.total_users, 0)
    const totalPaying = analytics.reduce((sum, item) => sum + item.paying_users, 0)
    const conversionRate = totalUsers > 0 ? ((totalPaying / totalUsers) * 100).toFixed(1) : '0'

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header with Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                            >
                                <span>← Command Center</span>
                            </Link>
                            <span className="text-slate-300 dark:text-slate-700">/</span>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Demographics & Types</span>
                        </div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-8 w-8 text-blue-600" />
                            Business Type & System Analytics
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Analyze registered businesses and Vision AI Bridge desktop companion downloads
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
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

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bridge Downloads</CardTitle>
                            <Download className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600">
                                {bridgeMetrics ? bridgeMetrics.totalDownloads : 0}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {bridgeMetrics ? `${bridgeMetrics.windowsDownloads} Win • ${bridgeMetrics.macDownloads} Mac` : '0 downloads'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Vision Bridge Download Tracking Table for Super Admin */}
                {bridgeMetrics && (
                    <Card className="border-indigo-100 shadow-sm">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                                        <Download className="w-5 h-5 text-indigo-600" />
                                        Desktop Vision Bridge Downloads Tracker
                                    </CardTitle>
                                    <CardDescription>
                                        Super Admin log of authenticated users who downloaded the Windows (.exe) and macOS (.dmg) runners
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                                        {bridgeMetrics.uniqueUsers} Unique Active Accounts
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {bridgeMetrics.userBreakdown.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    No desktop bridge downloads logged yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-4">User Account</th>
                                                <th className="py-3 px-4 text-center">Total Downloads</th>
                                                <th className="py-3 px-4 text-center">OS Breakdown</th>
                                                <th className="py-3 px-4 text-right">Last Downloaded</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {bridgeMetrics.userBreakdown.map((item) => (
                                                <tr key={item.email} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3 px-4 font-medium text-slate-900">
                                                        {item.email}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-indigo-600">
                                                        {item.count} {item.count === 1 ? 'time' : 'times'}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-600">
                                                            <span className="flex items-center gap-1"><Monitor className="w-3 h-3 text-blue-500" /> {item.osBreakdown.windows}</span>
                                                            <span className="text-slate-300">|</span>
                                                            <span className="flex items-center gap-1"><Apple className="w-3 h-3 text-slate-700" /> {item.osBreakdown.mac}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-slate-500">
                                                        {new Date(item.lastDownloaded).toLocaleString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

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
