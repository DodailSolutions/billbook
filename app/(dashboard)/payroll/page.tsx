'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getEmployees, getPayrollRuns, getLeaveRequests } from '@/lib/payroll-actions'
import { Employee, PayrollRun, LeaveRequest } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Users, DollarSign, Calendar, FileText, CheckCircle2, ChevronRight, UserPlus, Play, Plane, CalendarClock } from 'lucide-react'

import { MigrationBanner } from '@/components/MigrationBanner'

export default function PayrollDashboardPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [runs, setRuns] = useState<PayrollRun[]>([])
    const [leaves, setLeaves] = useState<LeaveRequest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        Promise.all([
            getEmployees(),
            getPayrollRuns(),
            getLeaveRequests('pending')
        ]).then(([empData, runData, leaveData]) => {
            setEmployees(empData)
            setRuns(runData)
            setLeaves(leaveData)
            setLoading(false)
        })
    }, [])

    const activeEmpCount = employees.filter(e => e.status === 'active').length
    const totalYtdNetPay = runs.reduce((sum, r) => sum + Number(r.total_net_pay || 0), 0)
    const latestRun = runs[0]

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <MigrationBanner />
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <DollarSign className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                            Payroll & Salary Hub
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Employee salaries, attendance, leaves, and automated payroll processing.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/payroll/attendance">
                        <Button variant="outline" className="gap-2 min-h-[44px]">
                            <CalendarClock className="h-4 w-4" />
                            Attendance
                        </Button>
                    </Link>
                    <Link href="/payroll/run">
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px]">
                            <Play className="h-4 w-4 fill-white" />
                            Run Monthly Payroll
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/payroll/employees">
                    <Card className="border-gray-100 shadow-2xs hover:border-emerald-200 transition-all cursor-pointer h-full">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employees</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{activeEmpCount}</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">Active staff on payroll</p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Users className="h-6 w-6" /></div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/payroll/leaves">
                    <Card className="border-gray-100 shadow-2xs hover:border-indigo-200 transition-all cursor-pointer h-full relative overflow-hidden">
                        {leaves.length > 0 && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">NEW</div>}
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leaves</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{leaves.length}</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">Pending requests</p>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Plane className="h-6 w-6" /></div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="border-gray-100 shadow-2xs h-full">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">YTD Net Payout</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">₹{totalYtdNetPay.toLocaleString('en-IN')}</h3>
                            <p className="text-[11px] text-emerald-700 mt-0.5">{runs.length} payroll runs</p>
                        </div>
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><DollarSign className="h-6 w-6" /></div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-2xs h-full">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Run</p>
                            <h3 className="text-lg font-bold text-gray-900 mt-1">{latestRun ? `${monthNames[latestRun.month - 1]} ${latestRun.year}` : 'None'}</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">{latestRun ? `₹${Number(latestRun.total_net_pay).toLocaleString('en-IN')} paid` : 'Process your first run'}</p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Calendar className="h-6 w-6" /></div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Payroll Runs */}
            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Payroll History & Payslips
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
                    ) : runs.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-gray-100">
                            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">No payroll runs processed yet.</p>
                            <Link href="/payroll/run" className="mt-3 inline-block">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[40px]">Process First Payroll Run</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {runs.map(run => (
                                <div key={run.id} className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900 text-base">{monthNames[run.month - 1]} {run.year}</h4>
                                                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">PROCESSED</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{run.total_employees} Employees Paid | Ledger Posted</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Total Net Pay</p>
                                            <p className="text-lg font-extrabold text-emerald-600">₹{Number(run.total_net_pay).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase">Individual Payslips</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {run.payslips?.map(ps => (
                                                <Link key={ps.id} href={`/payroll/payslips/${ps.id}`} className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 shadow-2xs flex items-center justify-between text-xs group transition-all">
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{ps.employee?.name}</p>
                                                        <p className="text-[10px] text-gray-500">Net: ₹{Number(ps.net_salary).toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                                </Link>
                                            ))}
                                        </div>
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
