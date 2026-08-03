'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEmployees, processPayrollRun } from '@/lib/payroll-actions'
import { Employee } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Play, CheckCircle2, AlertCircle, DollarSign, Users, ShieldCheck } from 'lucide-react'

export default function RunPayrollPage() {
    const router = useRouter()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const now = new Date()
    const [month, setMonth] = useState<number>(now.getMonth() + 1)
    const [year, setYear] = useState<number>(now.getFullYear())

    useEffect(() => {
        getEmployees().then(data => {
            setEmployees(data.filter(e => e.status === 'active' && e.salary_structure))
            setLoading(false)
        })
    }, [])

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    const totalGross = employees.reduce((sum, e) => sum + Number(e.salary_structure?.gross_salary || 0), 0)
    const totalNet = employees.reduce((sum, e) => sum + Number(e.salary_structure?.net_salary || 0), 0)
    const totalDeductions = totalGross - totalNet

    const handleRunPayroll = async () => {
        setProcessing(true)
        setError(null)

        const res = await processPayrollRun(month, year)
        setProcessing(false)

        if (res.success) {
            router.push('/payroll')
        } else {
            setError(res.error || 'Failed to process payroll run.')
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header */}
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

            {/* Select Month Card */}
            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Select Payroll Period
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Payroll Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden min-h-[44px]"
                            >
                                {monthNames.map((m, idx) => (
                                    <option key={idx} value={idx + 1}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Payroll Year</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-hidden min-h-[44px]"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employee Preview Summary */}
            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Staff Payroll Preview ({employees.length} Employees)
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-8 text-xs text-amber-600">
                            No active employees with configured salary structures found. Please add employees first.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="p-3">Employee</th>
                                            <th className="p-3 text-right">Gross Salary</th>
                                            <th className="p-3 text-right">Deductions (PF/TDS)</th>
                                            <th className="p-3 text-right">Net Salary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {employees.map(emp => {
                                            const sal = emp.salary_structure!
                                            return (
                                                <tr key={emp.id}>
                                                    <td className="p-3">
                                                        <p className="font-bold text-gray-900">{emp.name}</p>
                                                        <p className="text-[10px] text-gray-400">{emp.employee_code} · {emp.designation}</p>
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-gray-700">₹{sal.gross_salary.toLocaleString('en-IN')}</td>
                                                    <td className="p-3 text-right font-mono text-rose-600">-₹{(sal.gross_salary - sal.net_salary).toLocaleString('en-IN')}</td>
                                                    <td className="p-3 text-right font-bold text-emerald-600 font-mono">₹{sal.net_salary.toLocaleString('en-IN')}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Box */}
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 text-xs font-semibold">
                                <div className="flex justify-between text-gray-700">
                                    <span>Total Gross Salaries:</span>
                                    <span>₹{totalGross.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-rose-600">
                                    <span>Total Statutory Deductions (PF/ESI/TDS):</span>
                                    <span>-₹{totalDeductions.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-emerald-900 text-sm font-extrabold border-t border-emerald-200 pt-2">
                                    <span>Total Net Payout:</span>
                                    <span>₹{totalNet.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-xs flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>Approving this run will auto-generate payslips for all staff and post a double-entry journal to Bookkeeping.</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Link href="/payroll">
                    <Button variant="outline" className="min-h-[44px]">Cancel</Button>
                </Link>
                <Button
                    onClick={handleRunPayroll}
                    disabled={processing || employees.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px] gap-2"
                >
                    <Play className="h-4 w-4 fill-white" />
                    {processing ? 'Processing Payroll...' : `Approve Payroll (${monthNames[month - 1]} ${year})`}
                </Button>
            </div>
        </div>
    )
}
