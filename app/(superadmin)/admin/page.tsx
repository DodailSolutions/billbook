import Link from 'next/link'
import Image from 'next/image'
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
    MessageSquareQuote,
    ArrowLeft,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Sparkles,
    Activity,
    Layers
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getDashboardStats, getRecentActivity } from './actions'
import type { LucideIcon } from 'lucide-react'

function MetricCard({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend,
    iconBg,
    iconColor,
    badge
}: { 
    title: string
    value: string | number
    description: string
    icon: LucideIcon
    trend?: string
    iconBg: string
    iconColor: string
    badge?: string
}) {
    return (
        <Card className="relative overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs transition-all duration-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {title}
                </span>
                <div className={`p-2 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                    {value}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{description}</span>
                    {trend && (
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md shrink-0">
                            <TrendingUp className="h-3 w-3" />
                            {trend}
                        </span>
                    )}
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

function HubActionCard({ 
    title, 
    description, 
    icon: Icon, 
    href, 
    badge,
    color = "blue"
}: {
    title: string
    description: string
    icon: LucideIcon
    href: string
    badge?: string
    color?: "blue" | "indigo" | "emerald" | "purple" | "amber" | "rose"
}) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white",
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white",
        rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white"
    }

    return (
        <Link href={href} className="block group h-full">
            <div className="h-full p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${colorStyles[color]}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        {badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                {badge}
                            </span>
                        )}
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default async function SuperAdminDashboard() {
    const stats = await getDashboardStats()
    const recentActivity = await getRecentActivity()

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-6 shadow-md text-center">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-2">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-red-600 text-lg">Super Admin Access Denied</CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-1">
                            Your account does not possess platform super administrator privileges.
                        </CardDescription>
                    </CardHeader>
                    <div className="pt-2">
                        <Link href="/dashboard">
                            <Button size="sm" className="bg-blue-600 text-white text-xs">
                                Return to Client Dashboard
                            </Button>
                        </Link>
                    </div>
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

    const conversionRate = stats.total_users > 0 
        ? ((stats.active_subscriptions / stats.total_users) * 100).toFixed(1) 
        : '0.0'

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Top Brand & Executive Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                            <Image 
                                src="/logo-icon.svg" 
                                alt="BillBooky" 
                                width={30} 
                                height={30}
                            />
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                            Bill<span className="text-blue-600">Booky</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 ml-1">
                            <Shield className="w-2.5 h-2.5 text-purple-600" />
                            Super Admin Console
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Platform-wide revenue, multi-tenant businesses, system settings, and subscription governance.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Platform Online</span>
                    </div>

                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9 border-slate-300 dark:border-slate-700">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Client App</span>
                        </Button>
                    </Link>

                    <Link href="/admin/users">
                        <Button size="sm" className="text-xs gap-1.5 h-9 bg-blue-600 hover:bg-blue-700 text-white">
                            <Users className="w-3.5 h-3.5" />
                            <span>Manage Users</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Platform Revenue & Financial KPIs */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                        Financial Overview
                    </h3>
                    <span className="text-[11px] text-slate-400">All-time platform transactions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Gross Sales Volume"
                        value={formatCurrency(stats.total_sales)}
                        description="All platform invoices & charges"
                        icon={TrendingUp}
                        iconBg="bg-blue-50 dark:bg-blue-950/40"
                        iconColor="text-blue-600 dark:text-blue-400"
                        trend="+12.5% MoM"
                    />
                    <MetricCard
                        title="Completed Payments"
                        value={formatCurrency(stats.total_payments)}
                        description="Realized payment collections"
                        icon={CreditCard}
                        iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        trend="Settled"
                    />
                    <MetricCard
                        title="Pending / Unpaid"
                        value={formatCurrency(stats.unpaid_amount)}
                        description="Unsettled customer payments"
                        icon={AlertCircle}
                        iconBg="bg-amber-50 dark:bg-amber-950/40"
                        iconColor="text-amber-600 dark:text-amber-400"
                    />
                    <MetricCard
                        title="Total Refunds"
                        value={formatCurrency(stats.refund_amount)}
                        description={`${stats.pending_refunds} pending request(s)`}
                        icon={RefreshCw}
                        iconBg="bg-rose-50 dark:bg-rose-950/40"
                        iconColor="text-rose-600 dark:text-rose-400"
                        badge={stats.pending_refunds > 0 ? `${stats.pending_refunds} Pending` : undefined}
                    />
                </div>
            </div>

            {/* Platform Tenants & Growth KPIs */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        Tenant & User Metrics
                    </h3>
                    <span className="text-[11px] text-slate-400">Active user accounts & accounts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Users"
                        value={stats.total_users.toLocaleString('en-IN')}
                        description="Registered user accounts"
                        icon={Users}
                        iconBg="bg-purple-50 dark:bg-purple-950/40"
                        iconColor="text-purple-600 dark:text-purple-400"
                        trend="+24 this mo"
                    />
                    <MetricCard
                        title="Active Subscriptions"
                        value={stats.active_subscriptions.toLocaleString('en-IN')}
                        description="Paid plan members"
                        icon={CreditCard}
                        iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                        iconColor="text-indigo-600 dark:text-indigo-400"
                        badge="Paid Tier"
                    />
                    <MetricCard
                        title="Support Tickets"
                        value={stats.open_tickets}
                        description="Open client requests"
                        icon={Ticket}
                        iconBg="bg-cyan-50 dark:bg-cyan-950/40"
                        iconColor="text-cyan-600 dark:text-cyan-400"
                        badge={stats.open_tickets > 0 ? 'Needs Attention' : 'All Resolved'}
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${conversionRate}%`}
                        description="Registered to paid subscribers"
                        icon={Sparkles}
                        iconBg="bg-teal-50 dark:bg-teal-950/40"
                        iconColor="text-teal-600 dark:text-teal-400"
                        trend="Healthy"
                    />
                </div>
            </div>

            {/* Categorized Command Hub */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        Super Admin Command Center
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Section 1: Tenant Governance */}
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <Users className="w-4 h-4 text-blue-600" />
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Tenant Governance
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                            <HubActionCard
                                title="User Management"
                                description="Inspect accounts, assign super-admin privileges, and override subscriptions."
                                icon={Users}
                                href="/admin/users"
                                color="blue"
                            />
                            <HubActionCard
                                title="Business Catalog"
                                description="Directory of registered business profiles, GSTINs, and organization owners."
                                icon={Building2}
                                href="/admin/businesses"
                                color="indigo"
                            />
                            <HubActionCard
                                title="Business Type Analytics"
                                description="Deep dive into customer business types and enterprise demographics."
                                icon={BarChart3}
                                href="/admin/analytics"
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Section 2: Monetization & Pricing */}
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Billing & Plans
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                            <HubActionCard
                                title="Subscription Plans"
                                description="Configure Starter, Professional, and Lifetime plans and pricing tiers."
                                icon={CreditCard}
                                href="/admin/plans"
                                color="emerald"
                            />
                            <HubActionCard
                                title="Payments Ledger"
                                description="Audit razorpay orders, webhook receipts, and gateway transaction IDs."
                                icon={DollarSign}
                                href="/admin/payments"
                                color="emerald"
                            />
                            <HubActionCard
                                title="Coupons & Discounts"
                                description="Create and manage marketing coupon codes and percentage discounts."
                                icon={Tag}
                                href="/admin/coupons"
                                color="amber"
                            />
                        </div>
                    </div>

                    {/* Section 3: Platform Operations */}
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <Settings className="w-4 h-4 text-slate-600" />
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Operations & Settings
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                            <HubActionCard
                                title="Support Desk"
                                description="Respond to user tickets, assign priority, and troubleshoot issues."
                                icon={Ticket}
                                href="/admin/support"
                                color="rose"
                            />
                            <HubActionCard
                                title="Refund Approvals"
                                description="Review, approve, or decline user payment refund requests."
                                icon={RefreshCw}
                                href="/admin/refunds"
                                color="rose"
                            />
                            <HubActionCard
                                title="System & SMTP Settings"
                                description="Configure email delivery settings, credentials, and platform flags."
                                icon={Settings}
                                href="/admin/settings"
                                color="blue"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Logs & System Activity */}
            <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            Recent Platform Audit Events
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Immutable security and system transaction logs
                        </CardDescription>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Last 10 Actions</span>
                </CardHeader>
                <CardContent>
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No security incidents or audit logs recorded</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Platform operations are proceeding normally.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentActivity.map((log: any) => (
                                <div 
                                    key={log.id} 
                                    className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-lg transition-colors text-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {log.action}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                {log.entity_type && (
                                                    <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">
                                                        {log.entity_type}
                                                    </span>
                                                )}
                                                {log.ip_address && (
                                                    <span>IP: {log.ip_address}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-[11px] text-slate-400 shrink-0 font-medium">
                                        {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
