'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Users, 
    Calendar, 
    Clock, 
    Video, 
    Activity, 
    DollarSign, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    Camera, 
    Coffee, 
    ShieldCheck, 
    Sparkles, 
    Plus,
    FileText,
    CalendarOff,
    Building2,
    TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getEmployees } from '@/lib/payroll-actions'
import { getCctvCameras, getDailyMovementAudit, getPayrollShifts, EmployeeDailyAudit, CctvCamera, PayrollShift } from '@/lib/cctv-attendance-actions'
import { Employee } from '@/lib/payroll-types'

export default function HrDashboardPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [cameras, setCameras] = useState<CctvCamera[]>([])
    const [shifts, setShifts] = useState<PayrollShift[]>([])
    const [audits, setAudits] = useState<EmployeeDailyAudit[]>([])
    const [loading, setLoading] = useState(true)

    const todayStr = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })

    useEffect(() => {
        async function loadHrData() {
            setLoading(true)
            try {
                const [empData, camData, shiftData, auditData] = await Promise.all([
                    getEmployees(),
                    getCctvCameras(),
                    getPayrollShifts(),
                    getDailyMovementAudit()
                ])
                setEmployees(empData.filter(e => e.status === 'active'))
                setCameras(camData)
                setShifts(shiftData)
                setAudits(auditData)
            } catch (err) {
                console.error('Error loading HR dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        loadHrData()
    }, [])

    const activeEmployeesCount = employees.length
    const onPremiseCount = audits.filter(a => a.status === 'incomplete' || (a.first_in && !a.last_out)).length
    const fullDayPresentCount = audits.filter(a => a.status === 'present').length
    const lateArrivalsCount = audits.filter(a => a.is_late).length
    const activeCamerasCount = cameras.filter(c => c.is_active).length

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            HR Executive & Team Governance Portal
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            HR Operations Command Center
                        </h1>
                        <p className="text-indigo-200 text-sm mt-1 max-w-xl">
                            {todayStr} • Manage touchless CCTV camera attendance, flexible shift rules, employee records, and monthly salary disbursement.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/payroll/attendance/cctv">
                            <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-sm text-xs gap-1.5 h-9">
                                <Video className="w-4 h-4 text-indigo-600" />
                                Camera Streams ({activeCamerasCount} Live)
                            </Button>
                        </Link>
                        <Link href="/payroll/run">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm text-xs gap-1.5 h-9 border border-indigo-400/30">
                                <DollarSign className="w-4 h-4" />
                                Run Monthly Payroll
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
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Staff</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{activeEmployeesCount}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Enrolled employees</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Office Now</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{onPremiseCount}</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Live CCTV Detection</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Arrivals Today</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{lateArrivalsCount}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Past grace window</p>
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
                            <p className="text-2xl font-bold text-blue-600 mt-1">{fullDayPresentCount}</p>
                            <p className="text-xs text-slate-500 mt-0.5">&ge; 8.0 effective hours</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* HR Shortcuts & Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Touchless Biometrics Card */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                            <Camera className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Vision AI Camera Hub
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Manage office IP / CCTV cameras and live transit audit logs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/payroll/attendance/cctv" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-semibold text-slate-800">CCTV Stream Connector</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/attendance/movements" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-slate-800">Movements & Break Audit</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/settings/shifts" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs font-semibold text-slate-800">Shift Timings & Grace Rules</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Employee Lifecycle Card */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                            <Users className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Employee & Team Lifecycle
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Directory, face enrollment, salary structures, and role assignments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/payroll/employees" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-slate-800">Employee Directory & Faces</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/leaves" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarOff className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-semibold text-slate-800">Leave Approvals & Balances</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/team" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-slate-800">Team Roles & Member Invites</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Payroll & Compensation Card */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Payroll & Salary Runs
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Automated LOP deduction, statutory PF/ESI, and payslip generation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/payroll/run" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-slate-800">Run Monthly Payroll</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/payslips" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-slate-800">Payslip PDF Archive</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/attendance" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-semibold text-slate-800">Monthly Attendance Grid</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Live Today's Presence Feed */}
            <Card className="border-slate-200 shadow-xs bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900">Today's Staff Presence Feed</CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Real-time camera check-ins and break transitions captured across office entrances.
                        </CardDescription>
                    </div>
                    <Link href="/payroll/attendance/movements">
                        <Button variant="outline" size="sm" className="text-xs border-slate-200 text-slate-700">
                            Full Movements Audit →
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="pt-2">
                    {loading ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                            Syncing with vision camera nodes...
                        </div>
                    ) : audits.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                            No employee attendance records logged yet today.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {audits.slice(0, 6).map((item) => (
                                <div key={item.employee_id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                            {item.employee_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900">{item.employee_name}</p>
                                            <p className="text-[11px] text-slate-400">{item.employee_code} • {item.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-mono">
                                        <div>
                                            <span className="text-slate-400 text-[10px] block font-sans">First Arrival</span>
                                            <span className="font-semibold text-slate-800">
                                                {item.first_in ? new Date(item.first_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-slate-400 text-[10px] block font-sans">Effective</span>
                                            <span className="font-semibold text-indigo-600">
                                                {item.total_effective_hours > 0 ? `${item.total_effective_hours}h` : '-'}
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
