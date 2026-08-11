'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getEmployeePortalData } from '@/lib/payroll-actions'
import { Employee, EmployeeLeaveBalance } from '@/lib/payroll-types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, User, FileText, Plane, Briefcase, Landmark, Percent } from 'lucide-react'

export default function EmployeeDashboard() {
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, halfDay: 0, total: 0 })
    const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const data = await getEmployeePortalData()
            setEmployee(data.employee)
            setAttendanceStats(data.attendanceStats)
            setLeaveBalances(data.leaveBalances)
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
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
            {/* Greeting Header */}
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                    Welcome back, {employee.name}!
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Check your monthly payslips, apply for leaves, and review your profile details.
                </p>
            </div>

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Profile Card */}
                <Card className="border-gray-100 shadow-xs md:col-span-2">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <User className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Employment Profile</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-gray-400 block mb-0.5">Employee ID</span>
                                <span className="font-bold text-gray-900">{employee.employee_code}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-0.5">Designation</span>
                                <span className="font-bold text-gray-900">{employee.designation || 'Not specified'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block mb-0.5">Department</span>
                                <span className="font-bold text-gray-900">{employee.department || 'Not specified'}</span>
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
                            <Landmark className="h-5 w-5 text-emerald-600" />
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

            {/* Attendance & Leave Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Attendance Quick Stats */}
                <Card className="border-gray-100 shadow-xs">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Attendance (Current Month)</h3>
                            </div>
                            <Link href="/employee/leaves" className="text-xs text-emerald-600 hover:underline font-bold">Details</Link>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present</span>
                                <span className="text-lg font-black text-emerald-900">{attendanceStats.present}</span>
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
                            {leaveBalances.slice(0, 3).map(b => (
                                <div key={b.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                                    <span className="font-bold text-gray-800 block truncate">{b.leave_type?.name || 'Leave'}</span>
                                    <span className="text-lg font-black text-slate-900 mt-1 block">{b.remaining} / {b.total_quota}</span>
                                    <span className="text-[10px] text-gray-400 block mt-0.5">Days Left</span>
                                </div>
                            ))}
                            {leaveBalances.length === 0 && (
                                <p className="text-xs text-gray-400 italic col-span-3 py-2">No active leave balances.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/employee/leaves">
                    <Button variant="outline" className="w-full justify-between p-6 h-auto border-slate-200/80 bg-white hover:bg-slate-50 rounded-2xl group transition-all shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-650 rounded-xl">
                                <Plane className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-sm text-gray-900">Leaves Self-Service</h4>
                                <p className="text-[10px] text-gray-450 font-normal">Apply for leave, check approval status</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-emerald-600 transition-transform group-hover:translate-x-1">→</span>
                    </Button>
                </Link>
                <Link href="/employee/payslips">
                    <Button variant="outline" className="w-full justify-between p-6 h-auto border-slate-200/80 bg-white hover:bg-slate-50 rounded-2xl group transition-all shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-sm text-gray-900">My Payslips Hub</h4>
                                <p className="text-[10px] text-gray-450 font-normal">View monthly payroll receipts, download PDF</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-indigo-600 transition-transform group-hover:translate-x-1">→</span>
                    </Button>
                </Link>
            </div>
        </div>
    )
}
