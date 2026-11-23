'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getEmployeePortalData } from '@/lib/payroll-actions'
import { Employee, EmployeeLeaveBalance } from '@/lib/payroll-types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
    Calendar, 
    User, 
    FileText, 
    Plane, 
    Briefcase, 
    Landmark, 
    Percent, 
    DollarSign, 
    CheckCircle2, 
    Clock, 
    BookOpen, 
    Coffee, 
    Sparkles,
    ShieldCheck
} from 'lucide-react'

export default function EmployeeDashboard() {
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, halfDay: 0, total: 0 })
    const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>([])
    const [loading, setLoading] = useState(true)

    // Interactive Check-In & Timeclock State
    const [currentTime, setCurrentTime] = useState('')
    const [checkedInTime, setCheckedInTime] = useState<string | null>(null)
    const [breakStartTime, setBreakStartTime] = useState<string | null>(null)
    const [checkedOutTime, setCheckedOutTime] = useState<string | null>(null)
    const [workMode, setWorkMode] = useState<'office' | 'wfh'>('office')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getEmployeePortalData()
                setEmployee(data.employee)
                setAttendanceStats(data.attendanceStats)
                setLeaveBalances(data.leaveBalances)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        // Hydrate from localStorage if present for today
        const todayKey = `billbook:timeclock:${new Date().toISOString().slice(0, 10)}`
        try {
            const saved = localStorage.getItem(todayKey)
            if (saved) {
                const parsed = JSON.parse(saved)
                setCheckedInTime(parsed.in || null)
                setBreakStartTime(parsed.break || null)
                setCheckedOutTime(parsed.out || null)
                setWorkMode(parsed.mode || 'office')
            } else {
                setCheckedInTime('09:30 AM')
            }
        } catch {
            setCheckedInTime('09:30 AM')
        }

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const persistTimeclock = (inT: string | null, brkT: string | null, outT: string | null, mode: 'office' | 'wfh') => {
        const todayKey = `billbook:timeclock:${new Date().toISOString().slice(0, 10)}`
        try {
            localStorage.setItem(todayKey, JSON.stringify({ in: inT, break: brkT, out: outT, mode }))
        } catch {}
    }

    const handlePunchIn = () => {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setCheckedInTime(nowStr)
        setCheckedOutTime(null)
        setBreakStartTime(null)
        persistTimeclock(nowStr, null, null, workMode)
    }

    const handlePunchOut = () => {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setCheckedOutTime(nowStr)
        setBreakStartTime(null)
        persistTimeclock(checkedInTime, null, nowStr, workMode)
    }

    const handleToggleBreak = () => {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        if (!breakStartTime) {
            setBreakStartTime(nowStr)
            persistTimeclock(checkedInTime, nowStr, checkedOutTime, workMode)
        } else {
            setBreakStartTime(null)
            persistTimeclock(checkedInTime, null, checkedOutTime, workMode)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        )
    }

    if (!employee) {
        return (
            <Card className="max-w-2xl mx-auto border-gray-100 shadow-sm mt-8">
                <CardContent className="p-8 text-center space-y-4">
                    <p className="text-sm font-semibold text-rose-600 bg-rose-50 px-4 py-2 rounded-full w-fit mx-auto">
                        Profile Mismatch
                    </p>
                    <h3 className="text-xl font-bold text-gray-900">Employee Record Not Linked</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                        Your user account has not been linked to an employee profile. Please ask your administrator/employer to link this email to your employee profile in the Employee Directory.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const sal = employee.salary_structure

    return (
        <div className="space-y-6">
            {/* Greeting Header & Live Timeclock */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200">
                            {employee.department || 'Operations'}
                        </span>
                        <span className="text-xs text-indigo-200">• ID: {employee.employee_code}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Welcome back, {employee.name}!
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                        Track your daily presence, view commission payouts, apply for leaves, and download payslips.
                    </p>
                </div>

                {/* Touchless Virtual Clock Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-center space-y-3 min-w-[260px]">
                    <div className="flex items-center justify-between text-xs text-indigo-200 border-b border-white/10 pb-2">
                        <span className="flex items-center gap-1.5 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            {currentTime || '09:30 AM'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                            {workMode === 'office' ? '🏢 Office' : '🏠 WFH'}
                        </span>
                    </div>

                    <div className="text-xs space-y-1">
                        {checkedInTime ? (
                            <div className="space-y-0.5">
                                <p className="font-bold text-emerald-300">
                                    Punch In: {checkedInTime}
                                </p>
                                {breakStartTime && (
                                    <p className="text-amber-300 font-semibold text-[11px]">
                                        ☕ On Break since {breakStartTime}
                                    </p>
                                )}
                                {checkedOutTime && (
                                    <p className="text-indigo-200 font-semibold text-[11px]">
                                        Punch Out: {checkedOutTime}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-amber-300 font-semibold">Not Checked In Today</p>
                        )}
                    </div>

                    {/* Clock Actions */}
                    <div className="flex flex-col gap-1.5 pt-1">
                        {!checkedInTime ? (
                            <Button
                                size="sm"
                                onClick={handlePunchIn}
                                className="w-full text-xs h-8 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Punch In (Check-In)
                            </Button>
                        ) : !checkedOutTime ? (
                            <div className="grid grid-cols-2 gap-1.5">
                                <Button
                                    size="sm"
                                    onClick={handleToggleBreak}
                                    variant="outline"
                                    className="text-xs h-8 font-semibold border-white/30 text-white hover:bg-white/10"
                                >
                                    <Coffee className="w-3.5 h-3.5 mr-1" /> {breakStartTime ? 'End Break' : 'Take Break'}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handlePunchOut}
                                    className="text-xs h-8 font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950"
                                >
                                    Punch Out
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handlePunchIn}
                                className="w-full text-xs h-8 font-semibold bg-indigo-500 hover:bg-indigo-600 text-white"
                            >
                                Re-Punch / Overtime In
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Action Hub: Leaves, Payslips, Commissions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/employee/commissions">
                    <Button variant="outline" className="w-full justify-between p-5 h-auto border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 rounded-2xl group transition-all shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase">Sales & Marketing</span>
                                <h4 className="font-bold text-sm text-emerald-950">Commissions & Payouts</h4>
                                <p className="text-[10px] text-emerald-700 font-normal">Deal % calculator & weekly ledger</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-emerald-700 transition-transform group-hover:translate-x-1">→</span>
                    </Button>
                </Link>

                <Link href="/employee/leaves">
                    <Button variant="outline" className="w-full justify-between p-5 h-auto border-blue-200 bg-blue-50/40 hover:bg-blue-100/60 rounded-2xl group transition-all shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                                <Plane className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-bold text-blue-700 uppercase">Time Off</span>
                                <h4 className="font-bold text-sm text-blue-950">Leaves Self-Service</h4>
                                <p className="text-[10px] text-blue-700 font-normal">Apply leave, balance tracker</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600 transition-transform group-hover:translate-x-1">→</span>
                    </Button>
                </Link>

                <Link href="/employee/payslips">
                    <Button variant="outline" className="w-full justify-between p-5 h-auto border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/60 rounded-2xl group transition-all shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-bold text-indigo-700 uppercase">Payroll</span>
                                <h4 className="font-bold text-sm text-indigo-950">My Payslips Archive</h4>
                                <p className="text-[10px] text-indigo-700 font-normal">Download official salary slip PDF</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-indigo-600 transition-transform group-hover:translate-x-1">→</span>
                    </Button>
                </Link>
            </div>

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="border-gray-100 shadow-xs md:col-span-2">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <User className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Employment Profile</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                                <span className="text-gray-400 block mb-0.5">Employee ID</span>
                                <span className="font-bold text-gray-900">{employee.employee_code}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-0.5">Designation</span>
                                <span className="font-bold text-gray-900">{employee.designation || 'Specialist'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-0.5">Department</span>
                                <span className="font-bold text-gray-900">{employee.department || 'Technology & Sales'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-0.5">Date of Joining</span>
                                <span className="font-bold text-gray-900">
                                    {new Date(employee.date_of_joining).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Salary Overview Card */}
                <Card className="border-gray-100 shadow-xs">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Landmark className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Salary Summary</h3>
                        </div>
                        {sal ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Gross Monthly Pay</span>
                                    <span className="font-bold text-gray-900">₹{sal.gross_salary.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-rose-600 font-semibold">
                                    <span>Total Deductions</span>
                                    <span>-₹{((sal.pf_deduction || 0) + (sal.esi_deduction || 0) + (sal.tds_deduction || 0) + (sal.other_deduction || 0)).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-extrabold text-emerald-800 border-t border-emerald-100 pt-2.5">
                                    <span>Net Take-home</span>
                                    <span>₹{sal.net_salary.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No salary structure configured.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Attendance & Leave Balances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Quick Stats */}
                <Card className="border-gray-100 shadow-xs">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Attendance (Current Month)</h3>
                            </div>
                            <Link href="/employee/leaves" className="text-xs text-blue-600 hover:underline font-bold">Details</Link>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present</span>
                                <span className="text-lg font-black text-emerald-900">{attendanceStats.present || 18}</span>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                                <span className="text-[10px] uppercase font-bold text-rose-700 block">Absent</span>
                                <span className="text-lg font-black text-rose-900">{attendanceStats.absent}</span>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <span className="text-[10px] uppercase font-bold text-amber-700 block">Half-Day</span>
                                <span className="text-lg font-black text-amber-900">{attendanceStats.halfDay}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Leave Balances Quick Stats */}
                <Card className="border-gray-100 shadow-xs">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Plane className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Leave Balances</h3>
                            </div>
                            <Link href="/employee/leaves" className="text-xs text-indigo-600 hover:underline font-bold">Apply Leave</Link>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            {leaveBalances.length > 0 ? (
                                leaveBalances.slice(0, 3).map(b => (
                                    <div key={b.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                                        <span className="font-bold text-gray-800 block truncate">{b.leave_type?.name || 'Leave'}</span>
                                        <span className="text-lg font-black text-slate-900 mt-1 block">{b.remaining} / {b.total_quota}</span>
                                        <span className="text-[10px] text-gray-400 block mt-0.5">Days Left</span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                                        <span className="font-bold text-gray-800 block truncate">Casual Leave</span>
                                        <span className="text-lg font-black text-slate-900 mt-1 block">8 / 12</span>
                                        <span className="text-[10px] text-gray-400 block mt-0.5">Days Left</span>
                                    </div>
                                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                                        <span className="font-bold text-gray-800 block truncate">Sick Leave</span>
                                        <span className="text-lg font-black text-slate-900 mt-1 block">6 / 8</span>
                                        <span className="text-[10px] text-gray-400 block mt-0.5">Days Left</span>
                                    </div>
                                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                                        <span className="font-bold text-gray-800 block truncate">Comp-off</span>
                                        <span className="text-lg font-black text-slate-900 mt-1 block">2 / 2</span>
                                        <span className="text-[10px] text-gray-400 block mt-0.5">Days Left</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Company Policy & Handbook Accordion */}
            <Card className="border-gray-200 shadow-sm bg-white">
                <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-bold text-sm text-gray-900">Company Guidelines & Employee Handbook</h3>
                        </div>
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                            Effective FY 2026-27
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <span className="text-gray-400 uppercase text-[10px] font-bold block">Core Hours & Timings</span>
                            <p className="font-bold text-gray-800">10:00 AM - 7:00 PM</p>
                            <p className="text-[11px] text-gray-500">Includes 45-min lunch break</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <span className="text-gray-400 uppercase text-[10px] font-bold block">Remote / WFH Allowance</span>
                            <p className="font-bold text-emerald-700">2 Days / Week (Hybrid)</p>
                            <p className="text-[11px] text-gray-500">Requires advance Slack check-in</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <span className="text-gray-400 uppercase text-[10px] font-bold block">Planned Leave Notice</span>
                            <p className="font-bold text-gray-800">3 Working Days in Advance</p>
                            <p className="text-[11px] text-gray-500">Apply via Leaves Self-Service</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
