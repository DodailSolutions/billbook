'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, RefreshCw, Bell, Settings, User, Bot, UserCog, FileBarChart, HelpCircle, MessageCircle, Briefcase, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { PlanBanner } from "./PlanBanner"
import { getMyCAProfile } from "@/lib/ca-profile-actions"

export function Sidebar() {
    const pathname = usePathname()
    const [isCA, setIsCA] = useState<boolean | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        async function checkCAStatus() {
            const profile = await getMyCAProfile()
            setIsCA(!!profile)
        }
        checkCAStatus()
    }, [])

    const routes = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            color: "text-sky-500"
        },
        {
            label: 'Invoices',
            icon: FileText,
            href: '/invoices',
            color: "text-violet-500",
        },
        {
            label: 'Recurring',
            icon: RefreshCw,
            href: '/invoices/recurring',
            color: "text-purple-500",
        },
        {
            label: 'Reminders',
            icon: Bell,
            href: '/reminders',
            color: "text-yellow-500",
        },
        {
            label: 'Customers',
            icon: Users,
            href: '/customers',
            color: "text-pink-700",
        },
        {
            label: 'AI Accountant',
            icon: Bot,
            href: '/ai-accountant',
            color: "text-emerald-500",
            badge: 'PRO'
        },
        {
            label: 'Reports',
            icon: FileBarChart,
            href: '/reports',
            color: "text-orange-500",
        },
        // Conditional: Show "CA Dashboard" for CAs, "Hire CA" for regular users
        ...(isCA !== null ? [{
            label: isCA ? 'CA Dashboard' : 'Hire CA',
            icon: isCA ? Briefcase : UserPlus,
            href: isCA ? '/ca-dashboard' : '/reports/hire-ca',
            color: "text-emerald-500",
        }] : []),
        {
            label: 'Team',
            icon: UserCog,
            href: '/team',
            color: "text-blue-500",
            badge: 'PRO'
        },
        {
            label: 'Support',
            icon: HelpCircle,
            href: '/help',
            color: "text-cyan-500",
        },
        {
            label: 'Account',
            icon: User,
            href: '/settings',
            color: "text-gray-400",
        },
        {
            label: 'Invoice Settings',
            icon: Settings,
            href: '/invoices/settings',
            color: "text-gray-400",
        },
    ]

    return (
        <div className={cn(
            "space-y-4 py-4 flex flex-col h-full bg-linear-to-b from-slate-900 to-slate-800 text-white border-r border-slate-700 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div className="px-3 py-2 flex-1 overflow-y-auto">
                {/* Collapse Toggle Button */}
                <div className="flex items-center justify-end mb-4">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-zinc-400" />
                        ) : (
                            <ChevronLeft className="h-5 w-5 text-zinc-400" />
                        )}
                    </button>
                </div>

                <Link href="/dashboard" className="flex items-center pl-3 mb-8 gap-3 group">
                    <div className="relative w-10 h-10 shrink-0">
                        <Image 
                            src="/logo-icon.svg" 
                            alt="BillBooky Logo" 
                            width={40} 
                            height={40}
                            className="transition-transform duration-200 group-hover:scale-110"
                        />
                    </div>
                    {!isCollapsed && (
                        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent transition-all duration-200 group-hover:scale-105">
                            BillBooky
                        </h1>
                    )}
                </Link>
                <div className="space-y-2">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 relative overflow-hidden",
                                pathname === route.href 
                                    ? "text-white bg-white/10 shadow-lg" 
                                    : "text-zinc-400 hover:text-white hover:bg-white/5",
                                isCollapsed && "justify-center"
                            )}
                            title={isCollapsed ? route.label : undefined}
                        >
                            {pathname === route.href && (
                                <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-violet-500/20 animate-pulse" />
                            )}
                            <div className={cn(
                                "flex items-center relative z-10",
                                isCollapsed ? "justify-center" : "flex-1"
                            )}>
                                <route.icon className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", route.color, !isCollapsed && "mr-3")} />
                                {!isCollapsed && (
                                    <>
                                        {route.label}
                                        {route.badge && (
                                            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                                {route.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 pb-4 space-y-2 shrink-0">
                {!isCollapsed && <PlanBanner />}
                <SignOutButton />
            </div>
        </div>
    )
}
