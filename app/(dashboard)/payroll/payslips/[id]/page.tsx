'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { getPayslip } from '@/lib/payroll-actions'
import { getInvoiceSettings, InvoiceSettings } from '@/app/(dashboard)/invoices/settings/actions'
import { Payslip } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Printer, Building2, CheckCircle2, Download, FileText } from 'lucide-react'

export default function PayslipDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [payslip, setPayslip] = useState<Payslip | null>(null)
    const [settings, setSettings] = useState<InvoiceSettings | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getPayslip(id), getInvoiceSettings()]).then(([data, stgs]) => {
            setPayslip(data)
            setSettings(stgs)
            setLoading(false)
        })
    }, [id])

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>
    if (!payslip) return <div className="text-center py-20"><h3 className="text-lg font-bold">Payslip Not Found</h3><Link href="/payroll" className="mt-4 inline-block"><Button variant="outline">Back to Payroll</Button></Link></div>

    const emp = payslip.employee

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/payroll">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Salary Payslip</h2>
                        <p className="text-xs text-gray-500">{monthNames[payslip.month - 1]} {payslip.year}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={() => window.print()} variant="outline" className="gap-2 min-h-[44px]">
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                    <a href={`/api/payroll/payslips/${id}/pdf`} target="_blank">
                        <Button className="gap-2 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Download className="h-4 w-4" /> Download PDF
                        </Button>
                    </a>
                </div>
            </div>

            <Card className="border-gray-200 shadow-md bg-white">
                <CardContent className="p-6 sm:p-10 space-y-6">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                {settings?.company_logo_url ? (
                                    <img src={settings.company_logo_url} alt="Logo" className="h-8 object-contain" />
                                ) : (
                                    <Building2 className="h-6 w-6 text-emerald-600" />
                                )}
                                <h1 className="text-2xl font-black" style={{ color: settings?.company_name_color || '#111827' }}>
                                    {settings?.company_name || 'Your Company'}
                                </h1>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{settings?.company_address}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800 tracking-wider uppercase mb-1">PAYSLIP</h2>
                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                                {monthNames[payslip.month - 1].toUpperCase()} {payslip.year}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-gray-100">
                        <div><p className="text-gray-400 font-semibold uppercase">Employee Name</p><p className="font-bold text-gray-900 text-sm mt-0.5">{emp?.name}</p></div>
                        <div><p className="text-gray-400 font-semibold uppercase">Employee Code</p><p className="font-mono font-bold text-gray-900 mt-0.5">{emp?.employee_code}</p></div>
                        <div><p className="text-gray-400 font-semibold uppercase">Designation</p><p className="font-bold text-gray-900 mt-0.5">{emp?.designation || '-'}</p></div>
                        <div><p className="text-gray-400 font-semibold uppercase">Department</p><p className="font-bold text-gray-900 mt-0.5">{emp?.department || '-'}</p></div>
                        <div><p className="text-gray-400 font-semibold uppercase">Date of Joining</p><p className="font-bold text-gray-900 mt-0.5">{emp?.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : '-'}</p></div>
                        <div><p className="text-gray-400 font-semibold uppercase">PAN Number</p><p className="font-mono font-bold text-gray-900 mt-0.5">{emp?.pan_number || '-'}</p></div>
                        <div><p className="text-gray-400 font-semibold uppercase">Bank A/C</p><p className="font-mono font-bold text-gray-900 mt-0.5">{emp?.bank_account_number || '-'}</p></div>
                        <div><p className="text-gray-400 font-semibold uppercase">IFSC</p><p className="font-mono font-bold text-gray-900 mt-0.5">{emp?.ifsc_code || '-'}</p></div>
                    </div>

                    <div className="flex justify-between items-center bg-blue-50/50 p-4 border border-blue-100 rounded-xl text-xs">
                        <div className="flex gap-8">
                            <div><span className="text-gray-500 font-semibold mr-2">Total Working Days:</span><span className="font-bold">{payslip.working_days || '-'}</span></div>
                            <div><span className="text-gray-500 font-semibold mr-2">Days Present:</span><span className="font-bold">{payslip.days_present || '-'}</span></div>
                            <div><span className="text-rose-500 font-semibold mr-2">LOP Days:</span><span className="font-bold text-rose-600">{payslip.lop_days || 0}</span></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-3">
                            <h3 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider border-b border-emerald-200 pb-1">Earnings</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-gray-600">Basic Salary:</span><span className="font-mono font-bold">₹{Number(payslip.basic_salary).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">HRA:</span><span className="font-mono font-bold">₹{Number(payslip.hra).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Conveyance:</span><span className="font-mono font-bold">₹{Number(payslip.conveyance).toFixed(2)}</span></div>
                                {payslip.medical_allowance ? <div className="flex justify-between"><span className="text-gray-600">Medical Allowance:</span><span className="font-mono font-bold">₹{Number(payslip.medical_allowance).toFixed(2)}</span></div> : null}
                                {payslip.travel_allowance ? <div className="flex justify-between"><span className="text-gray-600">Travel Allowance:</span><span className="font-mono font-bold">₹{Number(payslip.travel_allowance).toFixed(2)}</span></div> : null}
                                <div className="flex justify-between"><span className="text-gray-600">Special Allowance:</span><span className="font-mono font-bold">₹{Number(payslip.special_allowance).toFixed(2)}</span></div>
                                <div className="flex justify-between pt-2 border-t border-gray-200 font-extrabold text-gray-900"><span>Gross Earnings:</span><span className="font-mono">₹{Number(payslip.gross_salary).toFixed(2)}</span></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-extrabold text-rose-700 uppercase tracking-wider border-b border-rose-200 pb-1">Deductions</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-gray-600">Provident Fund (PF):</span><span className="font-mono font-bold text-rose-600">-₹{Number(payslip.pf_deduction).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Employee State Insurance (ESI):</span><span className="font-mono font-bold text-rose-600">-₹{Number(payslip.esi_deduction).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Professional Tax (PT):</span><span className="font-mono font-bold text-rose-600">-₹{Number(payslip.professional_tax || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Tax Deducted at Source (TDS):</span><span className="font-mono font-bold text-rose-600">-₹{Number(payslip.tds_deduction).toFixed(2)}</span></div>
                                {payslip.other_deduction > 0 && <div className="flex justify-between"><span className="text-gray-600">Other Deductions:</span><span className="font-mono font-bold text-rose-600">-₹{Number(payslip.other_deduction).toFixed(2)}</span></div>}
                                <div className="flex justify-between pt-2 border-t border-gray-200 font-extrabold text-rose-700"><span>Total Deductions:</span><span className="font-mono">-₹{Number(payslip.total_deductions).toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-emerald-600 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner">
                        <div>
                            <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Net Take-Home Pay</p>
                            <h2 className="text-2xl font-black">₹{Number(payslip.net_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">
                            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                            <span>Salary Disbursed</span>
                        </div>
                    </div>

                    {(settings?.show_stamp && settings.company_stamp_url) || (settings?.show_signature && settings.digital_signature_url) ? (
                        <div className="flex justify-end gap-12 pt-8 border-t border-gray-100">
                            {settings.show_stamp && settings.company_stamp_url && (
                                <div className="text-center">
                                    <img src={settings.company_stamp_url} alt="Stamp" className="h-20 object-contain mx-auto" />
                                </div>
                            )}
                            {settings.show_signature && settings.digital_signature_url && (
                                <div className="text-center">
                                    <img src={settings.digital_signature_url} alt="Signature" className="h-16 object-contain border-b border-gray-300 pb-1 mb-1 mx-auto" />
                                    <p className="text-[10px] text-gray-500 font-semibold">Authorized Signatory</p>
                                </div>
                            )}
                        </div>
                    ) : null}

                    <div className="pt-6 border-t border-gray-100 text-center text-[10px] text-gray-400">
                        This is a computer-generated salary payslip issued by {settings?.company_name || 'BillBooky'}. No signature required unless specified.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
