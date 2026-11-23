'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, RefreshCw, Bell, Settings, User, Bot, UserCog, FileBarChart, HelpCircle, Briefcase, UserPlus, ChevronLeft, ChevronRight, Package, Receipt, Sparkles, BookOpen, ShoppingBag, DollarSign, Building2, CalendarDays, CalendarOff, Mail, Video, ShieldCheck, Barcode, Zap, Hotel, Palette, Plug } from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { PlanBanner } from "./PlanBanner"
import { getMyCAProfile } from "@/lib/ca-profile-actions"
import { getBusinessProfile } from "@/lib/business-profile-actions"
import type { BusinessType } from "@/lib/business-profile-types"
import { isPosSupported, isProposalSupported } from "@/lib/business-profile-types"

export function Sidebar() {
    const pathname = usePathname()
    const [isCA, setIsCA] = useState<boolean | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [businessProfile, setBusinessProfile] = useState<{
        businessType: BusinessType;
        features: Record<string, boolean>;
    }>({
        businessType: 'services',
        features: {}
    })

    useEffect(() => {
        async function loadProfile() {
            try {
                const [caProfile, bProfile] = await Promise.all([
                    getMyCAProfile(),
                    getBusinessProfile()
                ])
                setIsCA(!!caProfile)
                if (bProfile) {
                    setBusinessProfile({
                        businessType: bProfile.businessType,
                        features: (bProfile.config?.features || {}) as Record<string, boolean>
                    })
                }
            } catch (err) {
                console.error("Error loading sidebar profile:", err)
            }
        }
        loadProfile()

        const handleVerticalChanged = (e: any) => {
            if (e?.detail) {
                loadProfile()
            }
        }
        window.addEventListener('billbook:vertical-changed', handleVerticalChanged)
        return () => window.removeEventListener('billbook:vertical-changed', handleVerticalChanged)
    }, [])

    const isServiceOrSoftware = ['software_it', 'digital_marketing', 'freelancer', 'services', 'ca_accounting', 'tours_and_travels'].includes(businessProfile.businessType)

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
                    color: "text-blue-600",
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
                    label: 'Organizations',
                    icon: Building2,
                    href: '/organizations',
                    color: "text-indigo-600",
                    badge: 'B2B'
                },
                {
                    label: 'Customers / Contacts',
                    icon: Users,
                    href: '/customers',
                    color: "text-slate-900"
                },
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
                    label: 'CRM & Pipeline',
                    icon: Sparkles,
                    href: '/crm',
                    color: "text-blue-600",
                    badge: 'NEW'
                },
                ...(isProposalSupported(businessProfile.businessType) || businessProfile.features?.hasProposals ? [{
                    label: 'Proposals & RFPs',
                    icon: FileText,
                    href: '/proposals',
                    color: "text-purple-600",
                    badge: 'AI'
                }] : []),
                ...(isPosSupported(businessProfile.businessType) ? [{
                    label: 'Counter POS',
                    icon: Zap,
                    href: '/pos',
                    color: "text-amber-600",
                    badge: 'FAST'
                }] : []),
                ...(businessProfile.features?.hasPmsRoomGrid || ['resorts_farmhouses', 'camping_outdoors', 'resorts_farmhouses_camping'].includes(businessProfile.businessType) ? [{
                    label: 'Estate & Campsite PMS',
                    icon: Hotel,
                    href: '/estate-pms',
                    color: "text-emerald-700",
                    badge: 'PMS'
                }] : []),
                ...(businessProfile.features?.hasBOMCosting || businessProfile.businessType === 'art_crafts' ? [{
                    label: 'Art Studio & COA',
                    icon: Palette,
                    href: '/art-studio',
                    color: "text-pink-600",
                    badge: 'STUDIO'
                }] : [])
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
                },
                {
                    label: 'Barcodes & Labels',
                    icon: Barcode,
                    href: '/settings/barcode',
                    color: "text-indigo-600",
                    badge: 'NEW'
                }
            ]
        },
        {
            title: "HR & Team Operations",
            items: [
                {
                    label: 'HR Command Center',
                    icon: ShieldCheck,
                    href: '/hr-dashboard',
                    color: "text-indigo-600",
                    badge: 'NEW'
                },
                {
                    label: 'Manager Operations',
                    icon: Briefcase,
                    href: '/manager-dashboard',
                    color: "text-slate-900"
                },
                {
                    label: 'Payroll & Salaries',
                    icon: DollarSign,
                    href: '/payroll',
                    color: "text-blue-600"
                },
                {
                    label: 'Employees',
                    icon: Users,
                    href: '/payroll/employees',
                    color: "text-slate-700"
                },
                {
                    label: 'Attendance Tracking',
                    icon: CalendarDays,
                    href: '/payroll/attendance',
                    color: "text-slate-700"
                },
                {
                    label: 'CCTV Vision & Streams',
                    icon: Video,
                    href: '/payroll/attendance/cctv',
                    color: "text-indigo-600",
                    badge: 'AI'
                },
                {
                    label: 'Leave Management',
                    icon: CalendarOff,
                    href: '/payroll/leaves',
                    color: "text-slate-700"
                },
                {
                    label: 'Team & Roles',
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
                    color: "text-blue-600",
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
                    color: "text-blue-600"
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
                    label: 'Email & Templates',
                    icon: Mail,
                    href: '/settings/email',
                    color: "text-blue-600",
                    badge: 'NEW'
                },
                {
                    label: 'Integrations',
                    icon: Plug,
                    href: '/integrations',
                    color: "text-indigo-600",
                    badge: 'NEW'
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
        <div 
            data-tour="sidebar"
            className={cn(
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
                            Bill<span className="text-blue-600">Booky</span>
                        </span>
                    )}
                </Link>

                {/* Active Industry Vertical Badge */}
                {!isCollapsed && (
                    <div data-tour="vertical-selector" className="mx-1 mb-4 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate font-semibold capitalize">
                                {businessProfile.businessType.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <span 
                            title="Industry vertical is locked to preserve accounting and tax consistency. Contact Super Admin to change."
                            className="text-[10px] text-slate-400 flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded-md font-medium shrink-0 cursor-default"
                        >
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            Locked
                        </span>
                    </div>
                )}

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
                                    const tourAttr = route.href === '/invoices' 
                                        ? 'quick-invoice' 
                                        : route.href === '/integrations' 
                                        ? 'integrations' 
                                        : undefined

                                    return (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            data-tour={tourAttr}
                                            className={cn(
                                                "text-xs group flex p-2.5 w-full justify-start font-bold cursor-pointer rounded-xl transition-all duration-200 relative overflow-hidden",
                                                isActive 
                                                    ? "text-blue-900 bg-blue-50 border border-blue-200/50 shadow-2xs font-bold" 
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
                                                            <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
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
                <button
                    type="button"
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('billbook:restart-tour'))
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                    title="Take Product Tour"
                >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    {!isCollapsed && <span>Take Tour</span>}
                </button>
                {!isCollapsed && <PlanBanner />}
                <SignOutButton />
            </div>
        </div>
    )
}
