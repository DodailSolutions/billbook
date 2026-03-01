// Coupons Management
import { Tag, Plus, TrendingUp, Percent } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllCoupons } from './actions'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export default async function CouponsManagementPage() {
    // Check super admin access
    let hasAccess = false
    try {
        hasAccess = await checkSuperAdminAccess()
    } catch (error) {
        console.error('Error checking access:', error)
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to access this page. Super admin access is required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Visit the <Link href="/admin/test" className="text-blue-600 underline">diagnostics page</Link> to check your access level.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Try to load coupons
    let coupons: any[] = []
    let loadError: string | null = null
    
    try {
        coupons = await getAllCoupons()
    } catch (error) {
        console.error('Error loading coupons:', error)
        loadError = error instanceof Error ? error.message : 'Failed to load coupons'
        coupons = []
    }

    const stats = {
        total: coupons?.length || 0,
        active: coupons?.filter(c => c?.is_active)?.length || 0,
        totalUses: coupons?.reduce((sum, c) => sum + (c?.uses_count || 0), 0) || 0
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Tag className="h-8 w-8 text-orange-600" />
                            Coupons & Offers
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Create and manage discount codes and promotional offers
                        </p>
                    </div>
                    <Link href="/admin">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>

                {/* Error Message */}
                {loadError && (
                    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Tag className="h-5 w-5" />
                                <div>
                                    <div className="font-medium">Failed to Load Coupons</div>
                                    <div className="text-sm mt-1">{loadError}</div>
                                    <div className="text-sm mt-2">
                                        Try the <Link href="/admin/test" className="underline">diagnostics page</Link> to troubleshoot.
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Coupons
                            </CardTitle>
                            <Tag className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Active Coupons
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
                                Total Uses
                            </CardTitle>
                            <Percent className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.totalUses}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Coupons List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Coupons</CardTitle>
                        <CardDescription>Manage your discount codes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {coupons.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No coupons found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Code</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Discount</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Uses</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Valid Until</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((coupon) => (
                                            <tr key={coupon.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="py-3 px-4">
                                                    <div className="font-mono font-bold text-gray-900 dark:text-white">
                                                        {coupon.code}
                                                    </div>
                                                    {coupon.description && (
                                                        <div className="text-sm text-gray-500">{coupon.description}</div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                                    {coupon.discount_type === 'percentage' 
                                                        ? `${coupon.discount_value}%`
                                                        : `₹${coupon.discount_value}`
                                                    }
                                                </td>
                                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                                    {coupon.uses_count} {coupon.max_uses && `/ ${coupon.max_uses}`}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        coupon.is_active
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}>
                                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {coupon.valid_until 
                                                        ? new Date(coupon.valid_until).toLocaleDateString()
                                                        : 'No expiry'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
