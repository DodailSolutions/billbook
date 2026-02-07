'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
    Shield, 
    LayoutDashboard, 
    Users, 
    Building2, 
    CreditCard, 
    Tag, 
    Ticket, 
    BarChart3,
    MessageSquareQuote,
    RefreshCw,
    ArrowLeft
} from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { ThemeToggle } from "./ThemeToggle"

const adminRoutes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin',
        color: "text-blue-500"
    },
    {
        label: 'Users',
        icon: Users,
        href: '/admin/users',
        color: "text-purple-500",
    },
    {
        label: 'Businesses',
        icon: Building2,
        href: '/admin/businesses',
        color: "text-indigo-500",
    },
    {
        label: 'Plans',
        icon: CreditCard,
        href: '/admin/plans',
        color: "text-green-500",
    },
    {
        label: 'Coupons',
        icon: Tag,
        href: '/admin/coupons',
        color: "text-yellow-500",
    },
    {
        label: 'Payments',
        icon: CreditCard,
        href: '/admin/payments',
        color: "text-emerald-500",
    },
    {
        label: 'Refunds',
        icon: RefreshCw,
        href: '/admin/refunds',
        color: "text-red-500",
    },
    {
        label: 'Support',
        icon: Ticket,
        href: '/admin/support',
        color: "text-cyan-500",
    },
    {
        label: 'Analytics',
        icon: BarChart3,
        href: '/admin/analytics',
        color: "text-orange-500",
    },
    {
        label: 'Testimonials',
        icon: MessageSquareQuote,
        href: '/admin/testimonials',
        color: "text-pink-500",
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-linear-to-b from-slate-900 to-slate-800 text-white border-r border-slate-700">
            <div className="px-3 py-2 flex-1 overflow-y-auto">
                <Link href="/admin" className="flex items-center pl-3 mb-6 gap-3 group">
                    <div className="relative w-10 h-10 shrink-0 flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                            Super Admin
                        </h1>
                        <p className="text-xs text-gray-400">Admin Panel</p>
                    </div>
                </Link>

                {/* Back to Dashboard Link */}
                <Link
                    href="/dashboard"
                    className="text-sm flex items-center p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 text-zinc-400 hover:text-white hover:bg-white/5 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-3" />
                    Back to Dashboard
                </Link>

                <div className="space-y-1">
                    {adminRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 relative overflow-hidden",
                                pathname === route.href 
                                    ? "text-white bg-white/10 shadow-lg" 
                                    : "text-zinc-400 hover:text-white hover:bg-white/5",
                            )}
                        >
                            {pathname === route.href && (
                                <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-violet-500/20 animate-pulse" />
                            )}
                            <div className="flex items-center flex-1 relative z-10">
                                <route.icon className={cn("h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 pb-4 space-y-2 shrink-0">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-zinc-400">Theme</span>
                    <ThemeToggle />
                </div>
                <SignOutButton />
            </div>
        </div>
    )
}
