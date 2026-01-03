'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, RefreshCw, Bell, Settings, User, Bot, UserCog } from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { PlanBanner } from "./PlanBanner"
import { ThemeToggle } from "./ThemeToggle"

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
        label: 'Team',
        icon: UserCog,
        href: '/team',
        color: "text-blue-500",
        badge: 'PRO'
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

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-linear-to-b from-slate-900 to-slate-800 text-white border-r border-slate-700">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14 gap-3 group">
                    <div className="relative w-10 h-10 shrink-0">
                        <Image 
                            src="/logo-icon.svg" 
                            alt="BillBooky Logo" 
                            width={40} 
                            height={40}
                            className="transition-transform duration-200 group-hover:scale-110"
                        />
                    </div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent transition-all duration-200 group-hover:scale-105">
                        BillBooky
                    </h1>
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
                            )}
                        >
                            {pathname === route.href && (
                                <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-violet-500/20 animate-pulse" />
                            )}
                            <div className="flex items-center flex-1 relative z-10">
                                <route.icon className={cn("h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110", route.color)} />
                                {route.label}
                                {route.badge && (
                                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                        {route.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 pb-2 space-y-2">
                <PlanBanner />
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-zinc-400">Theme</span>
                    <ThemeToggle />
                </div>
                <SignOutButton />
            </div>
        </div>
    )
}
