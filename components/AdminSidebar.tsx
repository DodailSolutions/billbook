'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
    LayoutDashboard, 
    Users, 
    Building2, 
    CreditCard, 
    Tag, 
    Ticket, 
    BarChart3,
    MessageSquareQuote,
    RefreshCw,
    ArrowLeft,
    Settings,
    Shield,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    DollarSign,
    Globe
} from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { ThemeToggle } from "./ThemeToggle"

interface AdminNavSection {
    title: string
    items: Array<{
        label: string
        icon: any
        href: string
        badge?: string
    }>
}

const adminSections: AdminNavSection[] = [
    {
        title: "Overview",
        items: [
            {
                label: 'Dashboard',
                icon: LayoutDashboard,
                href: '/admin',
            },
            {
                label: 'Analytics',
                icon: BarChart3,
                href: '/admin/analytics',
            },
        ]
    },
    {
        title: "Tenants & Accounts",
        items: [
            {
                label: 'All Users',
                icon: Users,
                href: '/admin/users',
            },
            {
                label: 'Businesses',
                icon: Building2,
                href: '/admin/businesses',
            },
        ]
    },
    {
        title: "Monetization & Billing",
        items: [
            {
                label: 'Subscription Plans',
                icon: CreditCard,
                href: '/admin/plans',
            },
            {
                label: 'Payments & Revenue',
                icon: DollarSign,
                href: '/admin/payments',
            },
            {
                label: 'Refund Requests',
                icon: RefreshCw,
                href: '/admin/refunds',
            },
            {
                label: 'Coupons & Promos',
                icon: Tag,
                href: '/admin/coupons',
            },
        ]
    },
    {
        title: "Platform Operations",
        items: [
            {
                label: 'Content (CMS)',
                icon: Globe,
                href: '/admin/cms',
            },
            {
                label: 'Support Tickets',
                icon: Ticket,
                href: '/admin/support',
            },
            {
                label: 'Testimonials',
                icon: MessageSquareQuote,
                href: '/admin/testimonials',
            },
            {
                label: 'System Settings',
                icon: Settings,
                href: '/admin/settings',
            },
        ]
    }
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin'
        return pathname === href || pathname.startsWith(`${href}/`)
    }

    return (
        <div className={cn(
            "space-y-4 py-4 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-300 shadow-xs select-none",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div className="px-3 py-1 flex-1 overflow-y-auto custom-scrollbar">
                {/* Collapse Toggle & Switch to App Button */}
                <div className="flex items-center justify-between mb-3 px-1">
                    {!isCollapsed ? (
                        <Link 
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                            title="Return to Business Dashboard"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Client App</span>
                        </Link>
                    ) : (
                        <Link 
                            href="/dashboard" 
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Return to Client App"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    )}

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Company Branding */}
                <Link href="/admin" className="flex items-center pl-2 mb-5 gap-3 group">
                    <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                        <Image 
                            src="/logo-icon.svg" 
                            alt="BillBooky Logo" 
                            width={34} 
                            height={34}
                            className="transition-transform duration-200 group-hover:scale-105"
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                                    Bill<span className="text-blue-600">Booky</span>
                                </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-purple-700 dark:text-purple-300">
                                <Shield className="w-2.5 h-2.5 text-purple-600" />
                                Super Admin
                            </span>
                        </div>
                    )}
                </Link>

                {/* Categorized Admin Routes */}
                <div className="space-y-4">
                    {adminSections.map((section, idx) => (
                        <div key={section.title} className="space-y-1">
                            {!isCollapsed ? (
                                <h5 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2 mb-1">
                                    {section.title}
                                </h5>
                            ) : (
                                idx > 0 && <hr className="my-2 border-slate-100 dark:border-slate-800" />
                            )}
                            
                            {section.items.map((route) => {
                                const active = isActive(route.href)

                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        title={isCollapsed ? route.label : undefined}
                                        className={cn(
                                            "text-xs group flex p-2.5 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-150 relative",
                                            active
                                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-2xs"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon className={cn(
                                                "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                                                active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400",
                                                !isCollapsed && "mr-3"
                                            )} />
                                            {!isCollapsed && (
                                                <span className="truncate">{route.label}</span>
                                            )}
                                        </div>

                                        {/* Active Indicator Bar */}
                                        {active && (
                                            <div className="absolute right-0 top-1.5 bottom-1.5 w-1 rounded-l-full bg-blue-600 dark:bg-blue-400" />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Bottom Strip */}
            <div className="px-3 pt-2 pb-1 space-y-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Appearance</span>
                        <ThemeToggle />
                    </div>
                )}
                <SignOutButton />
            </div>
        </div>
    )
}
