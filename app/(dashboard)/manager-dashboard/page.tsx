'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Briefcase, 
    Users, 
    FileText, 
    Package, 
    Activity, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles, 
    Plus, 
    TrendingUp, 
    ArrowRight,
    Coffee,
    CalendarCheck,
    CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getDailyMovementAudit, EmployeeDailyAudit } from '@/lib/cctv-attendance-actions'
import { getEmployees } from '@/lib/payroll-actions'
import { Employee } from '@/lib/payroll-types'

export default function ManagerDashboardPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [audits, setAudits] = useState<EmployeeDailyAudit[]>([])
    const [loading, setLoading] = useState(true)

    const todayStr = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })

    useEffect(() => {
        async function loadManagerData() {
            setLoading(true)
            try {
                const [empData, auditData] = await Promise.all([
                    getEmployees(),
                    getDailyMovementAudit()
                ])
                setEmployees(empData.filter(e => e.status === 'active'))
                setAudits(auditData)
            } catch (err) {
                console.error('Error loading manager dashboard:', err)
            } finally {
                setLoading(false)
            }
        }
        loadManagerData()
    }, [])

    const totalTeamCount = employees.length
    const onPremiseCount = audits.filter(a => a.status === 'incomplete' || (a.first_in && !a.last_out)).length
    const lateCount = audits.filter(a => a.is_late).length
    const fullDayCount = audits.filter(a => a.status === 'present').length

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                            Manager Operations & Oversight
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Operations Command Center
                        </h1>
                        <p className="text-slate-300 text-sm mt-1 max-w-xl">
                            {todayStr} • Team attendance monitoring, live movement tracking, invoice operations, and inventory governance.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/payroll/attendance/movements">
                            <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-sm text-xs gap-1.5 h-9">
                                <Activity className="w-4 h-4 text-emerald-600" />
                                Team Movements Feed
                            </Button>
                        </Link>
                        <Link href="/invoices/new">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm text-xs gap-1.5 h-9">
                                <Plus className="w-4 h-4" />
                                Create Invoice
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Team Members</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{totalTeamCount}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Assigned to team</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On Premise Today</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{onPremiseCount}</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Live Camera Ingestion</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{lateCount}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Checked in past grace</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Day Completed</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{fullDayCount}</p>
                            <p className="text-xs text-slate-500 mt-0.5">&ge; 8.0 effective hours</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Manager Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Team Attendance Card */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                            <Activity className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Team Attendance & Transit
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Inspect real-time arrivals, coffee breaks, and departure times.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/payroll/attendance/movements" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">Daily Movements Audit</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/attendance" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">Monthly Attendance Grid</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/leaves" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">Review Leave Requests</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Sales & Billing Card */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                            <FileText className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Invoicing & Customers
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Monitor customer receivables, draft invoices, and GST compliance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/invoices" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">Invoices & Receivables</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/customers" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">Customer Directory</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/crm" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">CRM & Deal Pipeline</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Inventory & Operations */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                            <Package className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Stock & Inventory
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Warehouse stock levels, purchase orders, and vendor supplies.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/inventory" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">Inventory Stock Levels</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/purchase-orders" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">Purchase Orders (PO)</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/vendors" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">Vendor Directory</span>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Team Presence Feed */}
            <Card className="border-slate-200 shadow-xs bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900">Today's Team Presence</CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Live attendance detections streamed from office entry cameras.
                        </CardDescription>
                    </div>
                    <Link href="/payroll/attendance/movements">
                        <Button variant="outline" size="sm" className="text-xs border-slate-200 text-slate-700">
                            View All →
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="pt-2">
                    {loading ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                            Loading presence logs...
                        </div>
                    ) : audits.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                            No team movements recorded yet today.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {audits.slice(0, 6).map((item) => (
                                <div key={item.employee_id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                                            {item.employee_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900">{item.employee_name}</p>
                                            <p className="text-[11px] text-slate-400">{item.employee_code} • {item.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-mono">
                                        <div>
                                            <span className="text-slate-400 text-[10px] block font-sans">Arrival</span>
                                            <span className="font-semibold text-slate-800">
                                                {item.first_in ? new Date(item.first_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </span>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize font-sans ${
                                            item.status === 'present' 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                : item.status === 'incomplete'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
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
