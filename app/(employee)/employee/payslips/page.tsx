'use client'

import { useState, useEffect } from 'react'
import { getEmployeePayslips } from '@/lib/payroll-actions'
import { Payslip } from '@/lib/payroll-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, Download, Eye, Calendar } from 'lucide-react'

export default function EmployeePayslipsPage() {
    const [payslips, setPayslips] = useState<Payslip[]>([])
    const [loading, setLoading] = useState(true)

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    useEffect(() => {
        const fetchPayslips = async () => {
            const data = await getEmployeePayslips()
            setPayslips(data)
            setLoading(false)
        }
        fetchPayslips()
    }, [])

    const handleDownloadPDF = (payslipId: string) => {
        window.open(`/api/payroll/payslips/${payslipId}/pdf`, '_blank')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                    My Payslips
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Access and download your official monthly payslips.
                </p>
            </div>

            {/* Payslips List Card */}
            <Card className="border-gray-100 shadow-xs">
                <CardHeader className="p-5 border-b border-gray-100">
                    <CardTitle className="text-xs font-bold text-gray-705 uppercase tracking-wider">Processed Payslips</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200/80 text-gray-450 font-semibold uppercase tracking-wider">
                                    <th className="p-4">Pay Period</th>
                                    <th className="p-4">Gross Earnings</th>
                                    <th className="p-4">Deductions</th>
                                    <th className="p-4">Net Take-Home</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-gray-800">
                                {payslips.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50/50">
                                        <td className="p-4 font-bold flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>{monthNames[p.month - 1]} {p.year}</span>
                                        </td>
                                        <td className="p-4 font-semibold text-gray-900">₹{p.gross_salary.toLocaleString('en-IN')}</td>
                                        <td className="p-4 text-rose-600 font-medium">-₹{p.total_deductions.toLocaleString('en-IN')}</td>
                                        <td className="p-4 text-emerald-800 font-extrabold">₹{p.net_salary.toLocaleString('en-IN')}</td>
                                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                                            <Button
                                                onClick={() => handleDownloadPDF(p.id)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3 text-xs inline-flex items-center gap-1.5"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Download PDF
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {payslips.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-400 italic">
                                            No payslips processed or released yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
