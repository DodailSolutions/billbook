'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Home, Plane, FileText, LogOut, Menu, X, DollarSign } from 'lucide-react'

export default function EmployeePortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [userName, setUserName] = useState('Employee')
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    const supabase = createClient()

    useEffect(() => {
        const verifyEmployee = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Check if they are actually an employee
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role, business_name')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'employee') {
                // If they are not an employee, send them to the employer dashboard
                router.push('/dashboard')
                return
            }

            // Get employee name
            const { data: emp } = await supabase
                .from('employees')
                .select('name')
                .eq('employee_user_id', user.id)
                .single()

            if (emp) {
                setUserName(emp.name)
            }
            setLoading(false)
        }

        verifyEmployee()
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navigation = [
        { name: 'Dashboard', href: '/employee/dashboard', icon: Home },
        { name: 'My Leaves', href: '/employee/leaves', icon: Plane },
        { name: 'My Payslips', href: '/employee/payslips', icon: FileText },
    ]

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                    <span className="text-xs text-gray-500 font-semibold">Loading Employee Portal...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex overflow-hidden bg-slate-50">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 border-r border-slate-200 bg-white">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <Link href="/employee/dashboard" className="flex items-center px-6 mb-8 gap-3 group">
                            <Image 
                                src="/logo-icon.svg" 
                                alt="BillBooky Logo" 
                                width={36} 
                                height={36}
                                className="transition-transform duration-200 group-hover:scale-110"
                            />
                            <span className="text-xl font-black text-slate-950 tracking-tight">
                                BillBooky<span className="text-emerald-600">.</span>
                            </span>
                        </Link>
                        
                        <div className="px-6 mb-6">
                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Employee Portal</p>
                                    <p className="text-xs font-bold text-gray-900 truncate" title={userName}>{userName}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="flex-1 px-4 space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                                            isActive
                                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/50'
                                                : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <item.icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-emerald-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
                        <button
                            onClick={handleSignOut}
                            className="group flex items-center px-4 py-3 text-xs font-bold text-gray-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all w-full"
                        >
                            <LogOut className="mr-3 h-5 w-5 shrink-0 text-gray-450 group-hover:text-rose-600" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <div className="fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                        <Image src="/logo-icon.svg" alt="BillBooky Logo" width={28} height={28} />
                        <span className="text-base font-black text-slate-950 tracking-tight">Portal</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-slate-100"
                    >
                        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {isMobileOpen && (
                    <div className="fixed inset-0 z-30 flex">
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)} />
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white pt-16 pb-4">
                            <nav className="flex-1 px-4 space-y-1 mt-4">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`group flex items-center px-4 py-3 text-xs font-bold rounded-xl ${
                                                isActive
                                                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/50'
                                                    : 'text-gray-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </nav>
                            <div className="p-4 border-t border-slate-200">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center px-4 py-3 text-xs font-bold text-gray-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl w-full"
                                >
                                    <LogOut className="mr-3 h-5 w-5 text-gray-450" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-linear-to-br from-slate-50 via-white to-slate-50 pt-16 md:pt-0">
                    <div className="py-6 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
