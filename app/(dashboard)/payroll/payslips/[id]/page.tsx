'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { getPayslip } from '@/lib/payroll-actions'
import { Payslip } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Printer, Building2, CheckCircle2, FileText } from 'lucide-react'

export default function PayslipDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [payslip, setPayslip] = useState<Payslip | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getPayslip(id).then(data => {
            setPayslip(data)
            setLoading(false)
        })
    }, [id])

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        )
    }

    if (!payslip) {
        return (
            <div className="text-center py-20">
                <h3 className="text-lg font-bold">Payslip Not Found</h3>
                <Link href="/payroll" className="mt-4 inline-block">
                    <Button variant="outline">Back to Payroll</Button>
                </Link>
            </div>
        )
    }

    const emp = payslip.employee

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/payroll">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Salary Payslip
                        </h2>
                        <p className="text-xs text-gray-500">
                            {monthNames[payslip.month - 1]} {payslip.year}
                        </p>
                    </div>
                </div>

                <Button onClick={() => window.print()} variant="outline" className="gap-2 min-h-[44px]">
                    <Printer className="h-4 w-4" /> Print Payslip
                </Button>
            </div>

            {/* Printable Payslip Document Card */}
            <Card className="border-gray-200 shadow-md bg-white">
                <CardContent className="p-6 sm:p-10 space-y-6">
                    {/* Company Header */}
                    <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-6 w-6 text-emerald-600" />
                                <h1 className="text-2xl font-black text-gray-900">BillBooky Enterprise</h1>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Official Employee Salary Slip</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                                {monthNames[payslip.month - 1].toUpperCase()} {payslip.year}
                            </span>
                        </div>
                    </div>

                    {/* Employee Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
                        <div>
                            <p className="text-gray-400 font-semibold uppercase">Employee Name</p>
                            <p className="font-bold text-gray-900 text-sm mt-0.5">{emp?.name || 'Staff'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-semibold uppercase">Employee Code</p>
                            <p className="font-mono font-bold text-gray-900 mt-0.5">{emp?.employee_code || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-semibold uppercase">Designation</p>
                            <p className="font-bold text-gray-900 mt-0.5">{emp?.designation || 'Staff'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-semibold uppercase">Department</p>
                            <p className="font-bold text-gray-900 mt-0.5">{emp?.department || 'General'}</p>
                        </div>
                    </div>

                    {/* Earnings & Deductions Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        {/* Earnings */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider border-b border-emerald-200 pb-1">
                                Earnings (Allowances)
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Basic Salary:</span>
                                    <span className="font-mono font-bold">₹{Number(payslip.basic_salary).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">House Rent Allowance (HRA):</span>
                                    <span className="font-mono font-bold">₹{Number(payslip.hra).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Conveyance Allowance:</span>
                                    <span className="font-mono font-bold">₹{Number(payslip.conveyance).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Special Allowance:</span>
                                    <span className="font-mono font-bold">₹{Number(payslip.special_allowance).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200 font-extrabold text-gray-900">
                                    <span>Gross Salary:</span>
                                    <span className="font-mono">₹{Number(payslip.gross_salary).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-extrabold text-rose-700 uppercase tracking-wider border-b border-rose-200 pb-1">
                                Statutory Deductions
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Provident Fund (PF):</span>
                                    <span className="font-mono font-bold text-rose-600">-₹{Number(payslip.pf_deduction).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Employee State Insurance (ESI):</span>
                                    <span className="font-mono font-bold text-rose-600">-₹{Number(payslip.esi_deduction).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax Deducted at Source (TDS):</span>
                                    <span className="font-mono font-bold text-rose-600">-₹{Number(payslip.tds_deduction).toFixed(2)}</span>
                                </div>
                                {payslip.other_deduction > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Other Deductions:</span>
                                        <span className="font-mono font-bold text-rose-600">-₹{Number(payslip.other_deduction).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-200 font-extrabold text-rose-700">
                                    <span>Total Deductions:</span>
                                    <span className="font-mono">-₹{Number(payslip.total_deductions).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay Highlight Banner */}
                    <div className="p-4 bg-emerald-600 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner">
                        <div>
                            <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Net Take-Home Pay</p>
                            <h2 className="text-2xl font-black">₹{Number(payslip.net_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">
                            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                            <span>Paid via Direct Bank Transfer</span>
                        </div>
                    </div>

                    {/* Footer Disclaimer */}
                    <div className="pt-6 border-t border-gray-100 text-center text-[10px] text-gray-400">
                        This is a computer-generated salary payslip issued by BillBooky. No signature required.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
