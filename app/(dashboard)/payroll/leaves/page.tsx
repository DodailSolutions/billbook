'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    getLeaveRequests, 
    getLeaveTypes, 
    applyLeave, 
    getEmployees, 
    approveLeave, 
    rejectLeave, 
    getAllLeaveBalances,
    getCompanyHolidays,
    saveCompanyHolidays,
    type CompanyHoliday
} from '@/lib/payroll-actions'
import { LeaveRequest, LeaveType, Employee, EmployeeLeaveBalance } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Check, X, Plane, Calendar, Plus, Edit3, Trash2, ShieldCheck, Sparkles } from 'lucide-react'
import { MigrationBanner } from '@/components/MigrationBanner'
import { EditLeaveBalanceModal } from './EditLeaveBalanceModal'
import { HolidayCalendarModal } from './HolidayCalendarModal'

export default function LeavesPage() {
    const [tab, setTab] = useState<'requests' | 'balances' | 'holidays' | 'apply'>('requests')
    const [requests, setRequests] = useState<LeaveRequest[]>([])
    const [types, setTypes] = useState<LeaveType[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [balances, setBalances] = useState<EmployeeLeaveBalance[]>([])
    const [holidays, setHolidays] = useState<CompanyHoliday[]>([])
    const [loading, setLoading] = useState(true)

    // Modals
    const [editingBalance, setEditingBalance] = useState<{ balance: EmployeeLeaveBalance; employeeName: string } | null>(null)
    const [isAddHolidayOpen, setIsAddHolidayOpen] = useState(false)

    const [empId, setEmpId] = useState('')
    const [leaveTypeId, setLeaveTypeId] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [reason, setReason] = useState('')

    const currentYear = new Date().getFullYear()

    const fetchData = async () => {
        setLoading(true)
        const [reqs, typs, emps, bals, hols] = await Promise.all([
            getLeaveRequests(),
            getLeaveTypes(),
            getEmployees(),
            getAllLeaveBalances(currentYear),
            getCompanyHolidays(currentYear)
        ])
        setRequests(reqs)
        setTypes(typs)
        setEmployees(emps.filter(e => e.status === 'active'))
        setBalances(bals)
        setHolidays(hols)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault()
        const from = new Date(fromDate)
        const to = new Date(toDate)
        const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 3600 * 24)) + 1

        const res = await applyLeave({
            employee_id: empId,
            leave_type_id: leaveTypeId,
            from_date: fromDate,
            to_date: toDate,
            total_days: days,
            reason
        })

        if (res.success) {
            setTab('requests')
            fetchData()
        }
    }

    const handleApprove = async (id: string) => {
        await approveLeave(id)
        fetchData()
    }

    const handleReject = async (id: string) => {
        const reason = window.prompt("Rejection reason:")
        if (reason !== null) {
            await rejectLeave(id, reason)
            fetchData()
        }
    }

    const handleHolidayAdded = async (holiday: CompanyHoliday) => {
        const updated = [...holidays, holiday].sort((a, b) => a.date.localeCompare(b.date))
        setHolidays(updated)
        await saveCompanyHolidays(updated)
    }

    const handleDeleteHoliday = async (id: string) => {
        if (!confirm('Are you sure you want to remove this company holiday?')) return
        const updated = holidays.filter(h => h.id !== id)
        setHolidays(updated)
        await saveCompanyHolidays(updated)
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <MigrationBanner />

            {/* Modals */}
            {editingBalance && (
                <EditLeaveBalanceModal
                    balance={editingBalance.balance}
                    employeeName={editingBalance.employeeName}
                    onClose={() => setEditingBalance(null)}
                    onSuccess={() => fetchData()}
                />
            )}

            {isAddHolidayOpen && (
                <HolidayCalendarModal
                    onClose={() => setIsAddHolidayOpen(false)}
                    onHolidayAdded={handleHolidayAdded}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/payroll">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Plane className="h-5 w-5 text-blue-600" />
                            Leave & Holiday Management
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Track leave requests, customize employee quotas, and manage company holidays.
                        </p>
                    </div>
                </div>

                {tab === 'holidays' && (
                    <Button
                        size="sm"
                        onClick={() => setIsAddHolidayOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 gap-1.5"
                    >
                        <Plus className="h-4 w-4" /> Add Company Holiday
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit gap-1">
                <button onClick={() => setTab('requests')} className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'requests' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Leave Requests</button>
                <button onClick={() => setTab('balances')} className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'balances' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Leave Balances</button>
                <button onClick={() => setTab('holidays')} className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'holidays' ? 'bg-white dark:bg-slate-900 shadow-xs text-indigo-700 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Holiday Calendar ({holidays.length})</button>
                <button onClick={() => setTab('apply')} className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'apply' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Apply Leave</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            ) : (
                <>
                    {tab === 'requests' && (
                        <div className="space-y-4">
                            {requests.length === 0 ? (
                                <Card className="border-gray-100 shadow-2xs"><CardContent className="p-12 text-center text-gray-500">No leave requests found.</CardContent></Card>
                            ) : (
                                requests.map(req => (
                                    <Card key={req.id} className="border-gray-100 shadow-2xs">
                                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{req.employee?.name}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        req.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>{req.status}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    <span className="font-semibold text-gray-700">{req.leave_type?.name}</span> • {new Date(req.from_date).toLocaleDateString()} to {new Date(req.to_date).toLocaleDateString()} ({req.total_days} days)
                                                </p>
                                                {req.reason && <p className="text-xs text-gray-400 mt-1 italic">"{req.reason}"</p>}
                                                {req.rejection_reason && <p className="text-xs text-rose-500 mt-1">Rejected: {req.rejection_reason}</p>}
                                            </div>
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button onClick={() => handleReject(req.id)} variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                                                        <X className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                    <Button onClick={() => handleApprove(req.id)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                        <Check className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {tab === 'balances' && (
                        <Card className="border-gray-100 shadow-2xs overflow-hidden">
                            <CardContent className="p-0 overflow-x-auto">
                                <table className="w-full text-left text-xs min-w-[500px]">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-gray-500 uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="p-4">Employee</th>
                                            <th className="p-4">Leave Type</th>
                                            <th className="p-4">Annual Quota</th>
                                            <th className="p-4">Used</th>
                                            <th className="p-4">Remaining</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {balances.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                                    No leave balances recorded.
                                                </td>
                                            </tr>
                                        ) : (
                                            balances.map(bal => {
                                                const emp = employees.find(e => e.id === bal.employee_id)
                                                return (
                                                    <tr key={bal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                        <td className="p-4 font-bold text-gray-900 dark:text-white">{emp?.name || 'Employee'}</td>
                                                        <td className="p-4">{bal.leave_type?.name}</td>
                                                        <td className="p-4 font-mono font-semibold">{bal.total_quota} days</td>
                                                        <td className="p-4 font-mono text-rose-600">{bal.used} days</td>
                                                        <td className="p-4 font-mono font-bold text-emerald-600">{bal.remaining} days</td>
                                                        <td className="p-4 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingBalance({ balance: bal, employeeName: emp?.name || 'Employee' })}
                                                                className="text-xs h-7 px-2.5 gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" /> Edit Quota
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}

                    {tab === 'holidays' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Card className="p-4 border-slate-200 dark:border-slate-800">
                                    <div className="text-xs text-slate-500 font-medium">Total Holidays in {currentYear}</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{holidays.length} Days</div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Corporate & statutory holidays</p>
                                </Card>
                                <Card className="p-4 border-slate-200 dark:border-slate-800">
                                    <div className="text-xs text-slate-500 font-medium">Paid Holidays</div>
                                    <div className="text-2xl font-bold text-emerald-600 mt-1">
                                        {holidays.filter(h => h.is_paid).length} Days
                                    </div>
                                    <p className="text-[11px] text-emerald-600 mt-0.5">100% wage protected</p>
                                </Card>
                                <Card className="p-4 border-slate-200 dark:border-slate-800">
                                    <div className="text-xs text-slate-500 font-medium">Payroll Integration</div>
                                    <div className="text-sm font-bold text-indigo-600 mt-1 flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4" /> Auto-Synced
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Zero Loss-of-Pay deductions on holidays</p>
                                </Card>
                            </div>

                            <Card className="border-gray-100 shadow-2xs overflow-hidden">
                                <CardContent className="p-0 overflow-x-auto">
                                    <table className="w-full text-left text-xs min-w-[550px]">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-gray-500 uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="p-4">Holiday Name</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Classification</th>
                                                <th className="p-4">Wage Status</th>
                                                <th className="p-4">Description</th>
                                                <th className="p-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {holidays.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                                        No holidays scheduled. Click "Add Company Holiday" above to declare one.
                                                    </td>
                                                </tr>
                                            ) : (
                                                holidays.map(hol => {
                                                    const dateObj = new Date(hol.date)
                                                    const formatted = dateObj.toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })

                                                    return (
                                                        <tr key={hol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                            <td className="p-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                                                                <span>{hol.name}</span>
                                                            </td>
                                                            <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 font-mono">
                                                                {formatted}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                    hol.type === 'national' ? 'bg-blue-100 text-blue-700' :
                                                                    hol.type === 'festival' ? 'bg-purple-100 text-purple-700' :
                                                                    hol.type === 'corporate' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                    {hol.type}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                {hol.is_paid ? (
                                                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                                        <Check className="w-3.5 h-3.5" /> Paid Holiday
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-500">Unpaid / Optional</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-slate-500 text-[11px]">
                                                                {hol.description || '—'}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button
                                                                    onClick={() => handleDeleteHoliday(hol.id)}
                                                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                                                    title="Remove Holiday"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {tab === 'apply' && (
                        <Card className="border-gray-100 shadow-2xs max-w-xl">
                            <CardContent className="p-6">
                                <form onSubmit={handleApply} className="space-y-4 text-sm">
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Employee</label>
                                        <select required value={empId} onChange={e => setEmpId(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg bg-white">
                                            <option value="">Select Employee</option>
                                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Leave Type</label>
                                        <select required value={leaveTypeId} onChange={e => setLeaveTypeId(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg bg-white">
                                            <option value="">Select Leave Type</option>
                                            {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.is_paid ? 'Paid' : 'Unpaid'})</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">From Date</label>
                                            <input required type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">To Date</label>
                                            <input required type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Reason (Optional)</label>
                                        <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg h-24" />
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Submit Leave Request</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
