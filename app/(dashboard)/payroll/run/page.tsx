'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEmployees, processPayrollRun, getMonthlyAttendance } from '@/lib/payroll-actions'
import { Employee, AttendanceRecord } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Play, CheckCircle2, AlertCircle, DollarSign, Users, ShieldCheck, CalendarClock } from 'lucide-react'
import { MigrationBanner } from '@/components/MigrationBanner'

export default function RunPayrollPage() {
    const router = useRouter()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const now = new Date()
    const [month, setMonth] = useState<number>(now.getMonth() + 1)
    const [year, setYear] = useState<number>(now.getFullYear())

    useEffect(() => {
        setLoading(true)
        Promise.all([getEmployees(), getMonthlyAttendance(month, year)]).then(([empData, attData]) => {
            setEmployees(empData.filter(e => e.status === 'active' && e.salary_structure))
            setAttendance(attData)
            setLoading(false)
        })
    }, [month, year])

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    const daysInMonth = new Date(year, month, 0).getDate()
    let workingDays = 0
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d)
        if (date.getDay() !== 0 && date.getDay() !== 6) workingDays++
    }

    const getEmpAttendanceStats = (empId: string) => {
        const empAtt = attendance.filter(a => a.employee_id === empId)
        let present = 0
        empAtt.forEach(a => {
            if (a.status === 'present' || a.status === 'holiday' || a.status === 'leave') present += 1
            if (a.status === 'half_day') present += 0.5
        })
        const lop = Math.max(0, workingDays - present)
        return { present, lop }
    }

    let totalGross = 0
    let totalDeductions = 0
    let totalNet = 0

    const previewData = employees.map(emp => {
        const sal = emp.salary_structure!
        const stats = getEmpAttendanceStats(emp.id)
        
        const prorationFactor = workingDays > 0 ? Math.max(0, (workingDays - stats.lop) / workingDays) : 1

        const basic = Number(sal.basic_salary || 0) * prorationFactor
        const gross = ((sal.basic_salary || 0) + (sal.hra || 0) + (sal.conveyance || 0) + (sal.special_allowance || 0) + (sal.medical_allowance || 0) + (sal.travel_allowance || 0)) * prorationFactor
        
        const pfBase = Math.min(basic, 15000)
        const pf = Math.round(pfBase * 0.12)
        const esi = gross <= 21000 ? Math.round(gross * 0.0075) : 0
        let pt = 0
        if (gross > 20000) pt = 200
        else if (gross > 15000) pt = 150

        const tds = Number(sal.tds_deduction || 0)
        const other = Number(sal.other_deduction || 0)

        const deductions = pf + esi + pt + tds + other
        const net = gross - deductions

        totalGross += gross
        totalDeductions += deductions
        totalNet += net

        return { emp, stats, gross, deductions, net, pt }
    })

    const handleRunPayroll = async () => {
        setProcessing(true)
        setError(null)
        const res = await processPayrollRun(month, year)
        setProcessing(false)
        if (res.success) router.push('/payroll')
        else setError(res.error || 'Failed to process payroll run.')
    }

    const hasLop = previewData.some(d => d.stats.lop > 0)

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <MigrationBanner />
            <div className="flex items-center gap-3">
                <Link href="/payroll">
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Play className="h-5 w-5 text-emerald-600 fill-emerald-600" />
                        Run Monthly Payroll
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Calculate monthly employee payouts and auto-log bookkeeping ledger entries.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">
                    {error}
                </div>
            )}

            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Select Payroll Period</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Payroll Month</label>
                            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden min-h-[44px]">
                                {monthNames.map((m, idx) => <option key={idx} value={idx + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Payroll Year</label>
                            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden min-h-[44px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Staff Payroll Preview ({employees.length} Employees)
                        </h3>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {workingDays} Working Days
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-8 text-xs text-amber-600">No active employees with configured salary structures found.</div>
                    ) : (
                        <div className="space-y-4">
                            {hasLop && (
                                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Some employees have Loss of Pay (LOP) days. Their salaries have been pro-rated.</span>
                                </div>
                            )}

                            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead className="bg-slate-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="p-3">Employee</th>
                                            <th className="p-3 text-center">Attendance</th>
                                            <th className="p-3 text-right">Gross Salary</th>
                                            <th className="p-3 text-right">PT/TDS</th>
                                            <th className="p-3 text-right">Deductions</th>
                                            <th className="p-3 text-right">Net Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {previewData.map(d => (
                                            <tr key={d.emp.id} className="hover:bg-slate-50/50">
                                                <td className="p-3">
                                                    <p className="font-bold text-gray-900">{d.emp.name}</p>
                                                    <p className="text-[10px] text-gray-400">{d.emp.employee_code}</p>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-bold text-gray-700">{d.stats.present} / {workingDays}</span>
                                                        {d.stats.lop > 0 && <span className="text-[10px] text-rose-500 font-bold">{d.stats.lop} LOP</span>}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right font-mono text-gray-700">₹{d.gross.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td className="p-3 text-right text-[10px] text-gray-500">PT: ₹{d.pt}<br/>TDS: ₹{d.emp.salary_structure?.tds_deduction || 0}</td>
                                                <td className="p-3 text-right font-mono text-rose-600">-₹{d.deductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td className="p-3 text-right font-bold text-emerald-600 font-mono">₹{d.net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 text-xs font-semibold">
                                <div className="flex justify-between text-gray-700"><span>Total Gross Salaries:</span><span>₹{totalGross.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
                                <div className="flex justify-between text-rose-600"><span>Total Deductions:</span><span>-₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
                                <div className="flex justify-between text-emerald-900 text-sm font-extrabold border-t border-emerald-200 pt-2"><span>Total Net Payout:</span><span>₹{totalNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
                            </div>

                            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-xs flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>Approving this run will auto-generate payslips for all staff and post a double-entry journal to Bookkeeping.</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Link href="/payroll"><Button variant="outline" className="min-h-[44px]">Cancel</Button></Link>
                <Button onClick={handleRunPayroll} disabled={processing || employees.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px] gap-2">
                    <Play className="h-4 w-4 fill-white" />
                    {processing ? 'Processing Payroll...' : `Approve Payroll (${monthNames[month - 1]} ${year})`}
                </Button>
            </div>
        </div>
    )
}
