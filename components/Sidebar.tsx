'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, RefreshCw, Bell, Settings, User, Bot, UserCog, FileBarChart, HelpCircle, Briefcase, UserPlus, ChevronLeft, ChevronRight, Package, Receipt, Sparkles, BookOpen, ShoppingBag, DollarSign, Building2, CalendarDays, CalendarOff } from "lucide-react"
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
                },
                {
                    label: 'Reports',
                    icon: FileBarChart,
                    href: '/reports',
                    color: "text-slate-700"
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
                    label: 'Recurring Invoices',
                    icon: RefreshCw,
                    href: '/invoices/recurring',
                    color: "text-slate-700"
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
                    color: "text-slate-700"
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
                    color: "text-slate-700"
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
            title: "Settings & Help",
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
                },
                {
                    label: 'Help & Support',
                    icon: HelpCircle,
                    href: '/help',
                    color: "text-slate-500"
                }
            ]
        }
    ]

    return (
        <div className={cn(
            "space-y-4 py-4 flex flex-col h-full bg-white border-r border-slate-200/80 text-slate-955 transition-all duration-300 shadow-xs select-none",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div className="px-3 py-2 flex-1 overflow-y-auto custom-scrollbar">
                {/* Collapse Toggle Button */}
                <div className="flex items-center justify-end mb-4">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-slate-650" />
                        ) : (
                            <ChevronLeft className="h-5 w-5 text-slate-655" />
                        )}
                    </button>
                </div>

                {/* Company Branding */}
                <Link href="/dashboard" className="flex items-center pl-3 mb-6 gap-3 group">
                    <div className="relative w-9 h-9 shrink-0">
                        <Image 
                            src="/logo-icon.svg" 
                            alt="BillBooky Logo" 
                            width={36} 
                            height={36}
                            className="transition-transform duration-200 group-hover:scale-110"
                        />
                    </div>
                    {!isCollapsed && (
                        <span className="text-2xl font-black text-slate-950 tracking-tight">
                            BillBooky<span className="text-emerald-600">.</span>
                        </span>
                    )}
                </Link>

                {/* Nested Categorized Routes */}
                <div className="space-y-4">
                    {sections.map((section, idx) => {
                        if (section.items.length === 0) return null

                        return (
                            <div key={section.title} className="space-y-1">
                                {!isCollapsed ? (
                                    <h5 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-2 mb-1">
                                        {section.title}
                                    </h5>
                                ) : (
                                    idx > 0 && <hr className="my-2 border-slate-100" />
                                )}
                                
                                {section.items.map((route) => {
                                    const isActive = pathname === route.href
                                    return (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            className={cn(
                                                "text-xs group flex p-2.5 w-full justify-start font-bold cursor-pointer rounded-xl transition-all duration-200 relative overflow-hidden",
                                                isActive 
                                                    ? "text-emerald-900 bg-emerald-50 border border-emerald-200/50 shadow-2xs font-bold" 
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                                                isCollapsed && "justify-center"
                                            )}
                                            title={isCollapsed ? route.label : undefined}
                                        >
                                            <div className={cn(
                                                "flex items-center relative z-10",
                                                isCollapsed ? "justify-center" : "flex-1"
                                            )}>
                                                <route.icon className={cn(
                                                    "h-4 w-4 transition-transform duration-200 group-hover:scale-110", 
                                                    route.color, 
                                                    !isCollapsed && "mr-2.5"
                                                )} />
                                                {!isCollapsed && (
                                                    <>
                                                        <span className="truncate">{route.label}</span>
                                                        {route.badge && (
                                                            <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                                                                {route.badge}
                                                            </span>
                                                        )}
                                                    </>
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
            
            {/* Collapse / Sidebar footer */}
            <div className="px-3 pb-4 space-y-2 shrink-0 border-t border-slate-100 pt-4">
                {!isCollapsed && <PlanBanner />}
                <SignOutButton />
            </div>
        </div>
    )
}
