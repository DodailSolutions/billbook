'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, RefreshCw, Bell, Settings, User, Menu, X, Bot, UserCog } from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { PlanBanner } from "./PlanBanner"

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

export function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const closeSidebar = () => setIsOpen(false)

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <Image 
                            src="/logo-icon.svg" 
                            alt="BillBooky" 
                            width={32} 
                            height={32}
                        />
                    </div>
                    <span className="text-lg font-bold text-white">BillBooky</span>
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? (
                        <X className="h-6 w-6 text-white" />
                    ) : (
                        <Menu className="h-6 w-6 text-white" />
                    )}
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={closeSidebar}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={cn(
                    "md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-4 py-6 border-b border-slate-700">
                        <Link href="/dashboard" className="flex items-center gap-3" onClick={closeSidebar}>
                            <div className="relative w-10 h-10">
                                <Image 
                                    src="/logo-icon.svg" 
                                    alt="BillBooky" 
                                    width={40} 
                                    height={40}
                                />
                            </div>
                            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                BillBooky
                            </h1>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto px-3 py-4">
                        <div className="space-y-2">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    onClick={closeSidebar}
                                    className={cn(
                                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200 relative overflow-hidden",
                                        pathname === route.href 
                                            ? "text-white bg-white/10 shadow-lg" 
                                            : "text-zinc-400 hover:text-white hover:bg-white/5",
                                    )}
                                >
                                    {pathname === route.href && (
                                        <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-violet-500/20" />
                                    )}
                                    <div className="flex items-center flex-1 relative z-10">
                                        <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
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

                    {/* Bottom Section */}
                    <div className="px-3 pb-4 space-y-2 border-t border-slate-700 pt-4">
                        <PlanBanner />
                        <SignOutButton />
                    </div>
                </div>
            </div>
        </>
    )
}
