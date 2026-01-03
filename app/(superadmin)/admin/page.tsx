import Link from 'next/link'
import { 
    Users, 
    Building2, 
    CreditCard, 
    Ticket, 
    Settings,
    DollarSign,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    Tag,
    Shield,
    BarChart3,
    MessageSquareQuote
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getDashboardStats, getRecentActivity } from './actions'

import type { LucideIcon } from 'lucide-react'

function StatCard({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend,
    colorClass 
}: { 
    title: string
    value: string | number
    description: string
    icon: LucideIcon
    trend?: string
    colorClass: string
}) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                </p>
                {trend && (
                    <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {trend}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function QuickActionCard({ 
    title, 
    description, 
    icon: Icon, 
    href, 
    colorClass 
}: {
    title: string
    description: string
    icon: LucideIcon
    href: string
    colorClass: string
}) {
    return (
        <Link href={href}>
            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
            </Card>
        </Link>
    )
}

export default async function SuperAdminDashboard() {
    const stats = await getDashboardStats()
    const recentActivity = await getRecentActivity()

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="p-6">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Access Denied
                        </CardTitle>
                        <CardDescription>
                            You don&apos;t have super admin privileges.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                            <Shield className="h-10 w-10 text-blue-600" />
                            Super Admin Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Welcome back! Here&apos;s what&apos;s happening today.
                        </p>
                    </div>
                    <Link href="/admin/settings">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Sales"
                        value={formatCurrency(stats.total_sales)}
                        description="All time revenue"
                        icon={DollarSign}
                        trend="+12.5% from last month"
                        colorClass="bg-gradient-to-br from-green-500 to-green-600"
                    />
                    <StatCard
                        title="Total Payments"
                        value={formatCurrency(stats.total_payments)}
                        description="Completed payments"
                        icon={CreditCard}
                        trend="+8.2% from last month"
                        colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Unpaid Amount"
                        value={formatCurrency(stats.unpaid_amount)}
                        description="Pending collections"
                        icon={AlertCircle}
                        colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
                    />
                    <StatCard
                        title="Refunds"
                        value={formatCurrency(stats.refund_amount)}
                        description={`${stats.pending_refunds} pending`}
                        icon={RefreshCw}
                        colorClass="bg-gradient-to-br from-red-500 to-red-600"
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        description="Registered users"
                        icon={Users}
                        trend="+23 this month"
                        colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                    <StatCard
                        title="Active Subscriptions"
                        value={stats.active_subscriptions}
                        description="Paying customers"
                        icon={CreditCard}
                        colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
                    />
                    <StatCard
                        title="Open Tickets"
                        value={stats.open_tickets}
                        description="Support requests"
                        icon={Ticket}
                        colorClass="bg-gradient-to-br from-pink-500 to-pink-600"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value="24.5%"
                        description="Trial to paid"
                        icon={TrendingUp}
                        trend="+3.2% from last month"
                        colorClass="bg-gradient-to-br from-teal-500 to-teal-600"
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <QuickActionCard
                            title="Business Analytics"
                            description="View business type insights"
                            icon={BarChart3}
                            href="/admin/analytics"
                            colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
                        />
                        <QuickActionCard
                            title="Manage Users"
                            description="View and manage all users"
                            icon={Users}
                            href="/admin/users"
                            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
                        />
                        <QuickActionCard
                            title="Businesses"
                            description="Manage all companies"
                            icon={Building2}
                            href="/admin/businesses"
                            colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
                        />
                        <QuickActionCard
                            title="Subscription Plans"
                            description="Configure plans & pricing"
                            icon={CreditCard}
                            href="/admin/plans"
                            colorClass="bg-gradient-to-br from-green-500 to-green-600"
                        />
                        <QuickActionCard
                            title="Coupons & Offers"
                            description="Create discount codes"
                            icon={Tag}
                            href="/admin/coupons"
                            colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
                        />
                        <QuickActionCard
                            title="Payments"
                            description="View all transactions"
                            icon={DollarSign}
                            href="/admin/payments"
                            colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
                        />
                        <QuickActionCard
                            title="Refunds"
                            description="Process refund requests"
                            icon={RefreshCw}
                            href="/admin/refunds"
                            colorClass="bg-gradient-to-br from-red-500 to-red-600"
                        />
                        <QuickActionCard
                            title="Support Tickets"
                            description="Customer support"
                            icon={Ticket}
                            href="/admin/support"
                            colorClass="bg-gradient-to-br from-pink-500 to-pink-600"
                        />
                        <QuickActionCard
                            title="Testimonials"
                            description="Manage customer reviews"
                            icon={MessageSquareQuote}
                            href="/admin/testimonials"
                            colorClass="bg-gradient-to-br from-yellow-500 to-yellow-600"
                        />
                        <QuickActionCard
                            title="Settings"
                            description="System configuration"
                            icon={Settings}
                            href="/admin/settings"
                            colorClass="bg-gradient-to-br from-gray-500 to-gray-600"
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest system events and actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No recent activity</p>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((log) => (
                                    <div 
                                        key={log.id} 
                                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {log.action}
                                            </p>
                                            {log.entity_type && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {log.entity_type}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(log.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
