import { Users, Shield, UserCheck, UserX, Crown, ArrowLeft, Plus, Sparkles, Building2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllUsers } from './actions'
import UserManagementTable from './UserManagementTable'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    color,
    badge
}: {
    title: string
    value: number
    description: string
    icon: any
    color: 'blue' | 'emerald' | 'rose' | 'purple'
    badge?: string
}) {
    const colorMap = {
        blue: {
            bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
            text: 'text-blue-600 dark:text-blue-400'
        },
        emerald: {
            bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
            text: 'text-emerald-600 dark:text-emerald-400'
        },
        rose: {
            bg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
            text: 'text-rose-600 dark:text-rose-400'
        },
        purple: {
            bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
            text: 'text-purple-600 dark:text-purple-400'
        }
    }

    const current = colorMap[color]

    return (
        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {title}
                </span>
                <div className={`p-2 rounded-xl ${current.bg} shrink-0`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                    {value}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{description}</span>
                    {badge && (
                        <span className="font-semibold text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded-md shrink-0">
                            {badge}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default async function UsersManagementPage() {
    // 1. Strict Super Admin authorization check
    let hasAccess = false
    try {
        hasAccess = await checkSuperAdminAccess()
    } catch (error) {
        console.error('Error checking super admin access:', error)
    }

    if (!hasAccess) {
        return (
            <div className="min-h-[70vh] p-4 flex items-center justify-center">
                <Card className="max-w-md w-full border-rose-200 dark:border-rose-900 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 mb-2">
                            <Shield className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                            Super Admin Access Required
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                            You need super administrator privileges to view and manage user accounts and global permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex justify-center">
                        <Link href="/dashboard">
                            <Button variant="outline" className="text-xs">
                                Return to Client Dashboard
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 2. Fetch users defensively
    let users: any[] = []
    let loadError: string | null = null

    try {
        users = await getAllUsers()
    } catch (error) {
        console.error('Error loading users:', error)
        loadError = error instanceof Error ? error.message : 'Failed to load users'
        users = []
    }

    const stats = {
        total: users?.length || 0,
        active: users?.filter(u => u?.status === 'active')?.length || 0,
        suspended: users?.filter(u => u?.status === 'suspended')?.length || 0,
        admins: users?.filter(u => u?.role === 'super_admin' || u?.role === 'admin')?.length || 0
    }

    return (
        <div className="space-y-6">
            {/* Header with Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Command Center</span>
                        </Link>
                        <span className="text-slate-300 dark:text-slate-700">/</span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Users</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                        <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        <span>User Management</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Oversee all registered business accounts, subscription tiers, roles, and platform access.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/businesses">
                        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-slate-500" />
                            <span>Businesses</span>
                        </Button>
                    </Link>
                    <Link href="/admin/plans">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs flex items-center gap-1.5 text-white">
                            <Crown className="h-3.5 w-3.5" />
                            <span>Plans & Pricing</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Error Banner */}
            {loadError && (
                <Card className="border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3 text-rose-700 dark:text-rose-400">
                            <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Notice while loading user records</p>
                                <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{loadError}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="Total Registered"
                    value={stats.total}
                    description="All user profiles"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Active Accounts"
                    value={stats.active}
                    description="Operating normally"
                    icon={UserCheck}
                    color="emerald"
                />
                <StatCard
                    title="Suspended / Inactive"
                    value={stats.suspended}
                    description="Restricted access"
                    icon={UserX}
                    color="rose"
                />
                <StatCard
                    title="Staff & Admins"
                    value={stats.admins}
                    description="Admin & Super Admin"
                    icon={Shield}
                    color="purple"
                    badge="Privileged"
                />
            </div>

            {/* Interactive Users Table */}
            <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                All User Accounts
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Search, filter by status or tier, update permissions, or upgrade plans.
                            </CardDescription>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {users.length} Total
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <UserManagementTable initialUsers={users} />
                </CardContent>
            </Card>
        </div>
    )
}
