import Link from 'next/link'
import { getEmployee, getSalaryRevisions, getLeaveBalances } from '@/lib/payroll-actions'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Edit, User, Building2, Briefcase, Calendar, CreditCard, Banknote, History, ChevronRight } from 'lucide-react'

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const employee = await getEmployee(id)
    const currentYear = new Date().getFullYear()
    
    if (!employee) {
        return (
            <div className="text-center py-20">
                <h3 className="text-lg font-bold">Employee Not Found</h3>
                <Link href="/payroll/employees" className="mt-4 inline-block">
                    <Button variant="outline">Back to Directory</Button>
                </Link>
            </div>
        )
    }

    const [revisions, leaves] = await Promise.all([
        getSalaryRevisions(id),
        getLeaveBalances(id, currentYear)
    ])

    const sal = employee.salary_structure

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/payroll/employees">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {employee.name}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                                {employee.status}
                            </span>
                        </h2>
                        <p className="text-xs text-gray-500">
                            {employee.employee_code} · {employee.designation || 'Staff'}
                        </p>
                    </div>
                </div>
                {/* Edit Button could be added here later */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Personal & Work Details */}
                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                                Profile Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Email Address</p>
                                    <p className="font-medium text-gray-900">{employee.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Phone Number</p>
                                    <p className="font-medium text-gray-900">{employee.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Department</p>
                                    <p className="font-medium text-gray-900">{employee.department || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Date of Joining</p>
                                    <p className="font-medium text-gray-900">{new Date(employee.date_of_joining).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold mb-1">PAN Number</p>
                                    <p className="font-mono text-gray-900">{employee.pan_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold mb-1">Bank Account / IFSC</p>
                                    <p className="font-mono text-gray-900">{employee.bank_account_number || 'N/A'} {employee.ifsc_code ? `(${employee.ifsc_code})` : ''}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Salary Structure */}
                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                                Current Salary Structure
                            </h3>
                            {sal ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Basic Salary</p>
                                            <p className="font-mono font-bold text-gray-900">₹{sal.basic_salary.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">HRA</p>
                                            <p className="font-mono font-bold text-gray-900">₹{sal.hra.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Conveyance</p>
                                            <p className="font-mono font-bold text-gray-900">₹{sal.conveyance.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Medical</p>
                                            <p className="font-mono font-bold text-gray-900">₹{(sal.medical_allowance || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Travel</p>
                                            <p className="font-mono font-bold text-gray-900">₹{(sal.travel_allowance || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Special</p>
                                            <p className="font-mono font-bold text-gray-900">₹{sal.special_allowance.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-rose-500 mb-1">PF Deduction</p>
                                            <p className="font-mono font-bold text-rose-600">-₹{sal.pf_deduction.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-rose-500 mb-1">ESI Deduction</p>
                                            <p className="font-mono font-bold text-rose-600">-₹{sal.esi_deduction.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-rose-500 mb-1">TDS Deduction</p>
                                            <p className="font-mono font-bold text-rose-600">-₹{sal.tds_deduction.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl mt-4">
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Monthly Net Pay</p>
                                        </div>
                                        <p className="text-xl font-black text-emerald-700">₹{sal.net_salary.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No salary structure configured.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Salary Revisions Timeline */}
                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                                <History className="h-4 w-4" /> Salary Revision History
                            </h3>
                            {revisions.length === 0 ? (
                                <p className="text-sm text-gray-500">No previous salary revisions.</p>
                            ) : (
                                <div className="space-y-4">
                                    {revisions.map((rev) => (
                                        <div key={rev.id} className="relative pl-6 border-l-2 border-emerald-200 py-2">
                                            <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7.5px] top-3 shadow-[0_0_0_4px_white]"></div>
                                            <div className="mb-1 text-xs text-gray-400">
                                                Effective: <span className="font-semibold text-gray-700">{new Date(rev.effective_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm font-bold">
                                                <span className="text-gray-500 line-through">₹{rev.old_net_salary.toLocaleString('en-IN')}</span>
                                                <ChevronRight className="h-4 w-4 text-gray-300" />
                                                <span className="text-emerald-600">₹{rev.new_net_salary.toLocaleString('en-IN')}</span>
                                            </div>
                                            {rev.reason && <p className="text-xs text-gray-500 mt-1 italic">"{rev.reason}"</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Leave Balances */}
                    <Card className="border-gray-100 shadow-2xs">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Leave Balances ({currentYear})
                            </h3>
                            {leaves.length === 0 ? (
                                <p className="text-sm text-gray-500">No leave quotas found.</p>
                            ) : (
                                <div className="space-y-5">
                                    {leaves.map(lb => (
                                        <div key={lb.id} className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-700">{lb.leave_type?.name}</span>
                                                <span className="text-gray-500">{lb.remaining} / {lb.total_quota} left</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500 rounded-full transition-all" 
                                                    style={{ width: `${(lb.used / lb.total_quota) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 text-right">{lb.used} days used</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
