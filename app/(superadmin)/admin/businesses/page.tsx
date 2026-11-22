import { Building2, Search, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { getAllBusinesses } from './actions'
import { BusinessesClientTable } from './BusinessesClientTable'

export default async function BusinessesManagementPage() {
    const businesses = await getAllBusinesses()

    const stats = {
        total: businesses.length,
        active: businesses.filter(b => b.status === 'active').length,
        suspended: businesses.filter(b => b.status === 'suspended').length
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                        >
                            <span>← Command Center</span>
                        </Link>
                        <span className="text-slate-300 dark:text-slate-700">/</span>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Businesses</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-purple-600" />
                        Business Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage all businesses and companies on the platform
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Businesses
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Active
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Suspended
                            </CardTitle>
                            <Users className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Businesses List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Businesses</CardTitle>
                                <CardDescription>Companies registered on the platform</CardDescription>
                            </div>
                            <Link href="/admin">
                                <Button variant="outline">Back to Dashboard</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <BusinessesClientTable initialBusinesses={businesses} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
