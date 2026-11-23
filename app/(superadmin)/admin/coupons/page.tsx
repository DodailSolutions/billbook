// Coupons Management
import { Tag, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllCoupons } from './actions'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import CouponsClientView from './CouponsClientView'

export const metadata = {
    title: 'Coupons & Promo Codes | Super Admin',
    description: 'Create and manage promotional discount codes, validity windows, and usage caps.'
}

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

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                        <Tag className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Coupons & Promotional Offers
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Create, configure, and monitor subscription discounts and seasonal campaign codes.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Admin Overview
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Error Message if any */}
            {loadError && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Tag className="h-5 w-5" />
                            <div>
                                <div className="font-medium">Notice on Coupons Data</div>
                                <div className="text-sm mt-1">{loadError}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Interactive Coupons Client View */}
            <CouponsClientView initialCoupons={coupons} />
        </div>
    )
}
