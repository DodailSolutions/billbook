'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, Bell, Settings, User, Menu, X, Bot, UserCog, Package, Receipt, Sparkles, BookOpen, MoreHorizontal, ShoppingBag, DollarSign, Building2, CalendarDays, CalendarOff, Briefcase, UserPlus } from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { PlanBanner } from "./PlanBanner"
import { getMyCAProfile } from "@/lib/ca-profile-actions"

const mobileTabs = [
    {
        label: 'Home',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        label: 'Invoices',
        icon: FileText,
        href: '/invoices',
    },
    {
        label: 'CRM',
        icon: Sparkles,
        href: '/crm',
    },
    {
        label: 'Books',
        icon: BookOpen,
        href: '/bookkeeping',
    },
]

export function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const [isCA, setIsCA] = useState<boolean | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        async function checkCAStatus() {
            const profile = await getMyCAProfile()
            setIsCA(!!profile)
        }
        checkCAStatus()
    }, [])

    const closeSidebar = () => setIsOpen(false)
    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

    const sections = [
        {
            title: "Core",
            items: [
                {
                    label: 'Dashboard',
                    icon: LayoutDashboard,
                    href: '/dashboard',
                    color: "text-slate-900"
                },
                {
                    label: 'AI Accountant',
                    icon: Bot,
                    href: '/ai-accountant',
                    color: "text-emerald-600",
                    badge: 'PRO'
                }
            ]
        },
        {
            title: "Sales & Customers",
            items: [
                {
                    label: 'Invoices',
                    icon: FileText,
                    href: '/invoices',
                    color: "text-slate-900"
                },
                {
                    label: 'Customers',
                    icon: Users,
                    href: '/customers',
                    color: "text-slate-900"
                },
                {
                    label: 'CRM & Pipeline',
                    icon: Sparkles,
                    href: '/crm',
                    color: "text-emerald-650",
                    badge: 'NEW'
                }
            ]
        },
        {
            title: "Purchasing & Expenses",
            items: [
                {
                    label: 'Purchase Orders',
                    icon: ShoppingBag,
                    href: '/purchase-orders',
                    color: "text-slate-900"
                },
                {
                    label: 'Vendors',
                    icon: Building2,
                    href: '/vendors',
                    color: "text-slate-700"
                },
                {
                    label: 'Expenses',
                    icon: Receipt,
                    href: '/expenses',
                    color: "text-slate-705"
                }
            ]
        },
        {
            title: "Inventory & Items",
            items: [
                {
                    label: 'Items',
                    icon: Package,
                    href: '/items',
                    color: "text-slate-700"
                },
                {
                    label: 'Inventory',
                    icon: Package,
                    href: '/inventory',
                    color: "text-slate-900"
                }
            ]
        },
        {
            title: "HR & Payroll",
            items: [
                {
                    label: 'Payroll & Salaries',
                    icon: DollarSign,
                    href: '/payroll',
                    color: "text-emerald-600"
                },
                {
                    label: 'Attendance Tracking',
                    icon: CalendarDays,
                    href: '/payroll/attendance',
                    color: "text-slate-700"
                },
                {
                    label: 'Leave Management',
                    icon: CalendarOff,
                    href: '/payroll/leaves',
                    color: "text-slate-705"
                },
                {
                    label: 'Team Directory',
                    icon: UserCog,
                    href: '/team',
                    color: "text-slate-900",
                    badge: 'PRO'
                }
            ]
        },
        {
            title: "Finance & Advisory",
            items: [
                {
                    label: 'Bookkeeping',
                    icon: BookOpen,
                    href: '/bookkeeping',
                    color: "text-emerald-650",
                    badge: 'NEW'
                },
                {
                    label: 'Reminders',
                    icon: Bell,
                    href: '/reminders',
                    color: "text-slate-700"
                },
                ...(isCA !== null ? [{
                    label: isCA ? 'CA Dashboard' : 'Hire CA',
                    icon: isCA ? Briefcase : UserPlus,
                    href: isCA ? '/ca-dashboard' : '/reports/hire-ca',
                    color: "text-emerald-600"
                }] : [])
            ]
        },
        {
            title: "Settings",
            items: [
                {
                    label: 'Invoice Settings',
                    icon: Settings,
                    href: '/invoices/settings',
                    color: "text-slate-500"
                },
                {
                    label: 'Account Settings',
                    icon: User,
                    href: '/settings',
                    color: "text-slate-500"
                }
            ]
        }
    ]

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <Image 
                            src="/logo-icon.svg" 
                            alt="BillBooky" 
                            width={32} 
                            height={32}
                        />
                    </div>
                    <span className="text-lg font-black text-slate-950">BillBooky<span className="text-emerald-600">.</span></span>
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? (
                        <X className="h-6 w-6 text-slate-900" />
                    ) : (
                        <Menu className="h-6 w-6 text-slate-900" />
                    )}
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
                    onClick={closeSidebar}
                />
            )}

            {/* Mobile Drawer Sidebar */}
            <div
                className={cn(
                    "md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white text-slate-955 border-r border-slate-200/80 transform transition-transform duration-300 ease-in-out shadow-2xl",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-4 py-5 border-b border-slate-150">
                        <Link href="/dashboard" className="flex items-center gap-3" onClick={closeSidebar}>
                            <div className="relative w-9 h-9">
                                <Image 
                                    src="/logo-icon.svg" 
                                    alt="BillBooky" 
                                    width={36} 
                                    height={36}
                                />
                            </div>
                            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                                BillBooky<span className="text-emerald-600">.</span>
                            </h1>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                        <div className="space-y-4">
                            {sections.map((section) => {
                                if (section.items.length === 0) return null

                                return (
                                    <div key={section.title} className="space-y-1">
                                        <h5 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-2 mb-1">
                                            {section.title}
                                        </h5>
                                        {section.items.map((route) => {
                                            const isActiveRoute = pathname === route.href
                                            return (
                                                <Link
                                                    key={route.href}
                                                    href={route.href}
                                                    onClick={closeSidebar}
                                                    className={cn(
                                                        "text-xs group flex p-2.5 w-full justify-start font-bold cursor-pointer rounded-xl transition-all duration-200 relative overflow-hidden",
                                                        isActiveRoute 
                                                            ? "text-emerald-900 bg-emerald-50 border border-emerald-200/50 font-bold shadow-2xs" 
                                                            : "text-slate-650 hover:text-slate-950 hover:bg-slate-50",
                                                    )}
                                                >
                                                    <div className="flex items-center flex-1 relative z-10">
                                                        <route.icon className={cn("h-4 w-4 mr-2.5", route.color)} />
                                                        {route.label}
                                                        {route.badge && (
                                                            <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                                                                {route.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="px-3 pb-4 space-y-2 border-t border-slate-150 pt-4">
                        <PlanBanner />
                        <SignOutButton />
                    </div>
                </div>
            </div>

            {/* Bottom Mobile App Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur shadow-lg">
                <div className="grid grid-cols-5 gap-1 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                    {mobileTabs.map((tab) => {
                        const active = isActive(tab.href)

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-xl py-2 text-[10px] font-bold transition-colors min-h-[44px]",
                                    active
                                        ? "bg-emerald-50 text-emerald-855 border border-emerald-200/80"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <tab.icon className={cn("h-5 w-5 mb-0.5", active ? "text-emerald-600" : "text-slate-500")} />
                                {tab.label}
                            </Link>
                        )
                    })}

                    <button
                        onClick={() => setIsOpen(true)}
                        className={cn(
                            "flex flex-col items-center justify-center rounded-xl py-2 text-[10px] font-bold transition-colors min-h-[44px]",
                            isOpen
                                ? "bg-emerald-50 text-emerald-855 border border-emerald-200/80"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                        aria-label="Open menu"
                    >
                        <MoreHorizontal className={cn("h-5 w-5 mb-0.5", isOpen ? "text-emerald-600" : "text-slate-500")} />
                        More
                    </button>
                </div>
            </nav>
        </>
    )
}
