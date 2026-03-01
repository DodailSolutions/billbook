import { Building2, Search, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { getAllBusinesses } from './actions'

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
                        <div className="space-y-4">
                            {businesses.length === 0 ? (
                                <p className="text-center py-8 text-gray-500">No businesses found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Business Name</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Owner</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">GSTIN</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {businesses.map((business) => (
                                                <tr key={business.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {business.business_name || 'Unnamed'}
                                                        </div>
                                                        {business.business_email && (
                                                            <div className="text-sm text-gray-500">{business.business_email}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                                        {business.owner_name || 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                                        {business.gstin || 'Not provided'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            business.status === 'active' 
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                        }`}>
                                                            {business.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(business.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
