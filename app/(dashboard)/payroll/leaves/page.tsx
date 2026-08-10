'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLeaveRequests, getLeaveTypes, applyLeave, getEmployees, approveLeave, rejectLeave, getAllLeaveBalances } from '@/lib/payroll-actions'
import { LeaveRequest, LeaveType, Employee, EmployeeLeaveBalance } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Check, X, Plane, Calendar } from 'lucide-react'
import { MigrationBanner } from '@/components/MigrationBanner'

export default function LeavesPage() {
    const [tab, setTab] = useState<'requests' | 'balances' | 'apply'>('requests')
    const [requests, setRequests] = useState<LeaveRequest[]>([])
    const [types, setTypes] = useState<LeaveType[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [balances, setBalances] = useState<EmployeeLeaveBalance[]>([])
    const [loading, setLoading] = useState(true)

    const [empId, setEmpId] = useState('')
    const [leaveTypeId, setLeaveTypeId] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [reason, setReason] = useState('')

    const currentYear = new Date().getFullYear()

    const fetchData = async () => {
        setLoading(true)
        const [reqs, typs, emps, bals] = await Promise.all([
            getLeaveRequests(),
            getLeaveTypes(),
            getEmployees(),
            getAllLeaveBalances(currentYear)
        ])
        setRequests(reqs)
        setTypes(typs)
        setEmployees(emps.filter(e => e.status === 'active'))
        setBalances(bals)
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
                        <Plane className="h-5 w-5 text-emerald-600" />
                        Leave Management
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Track requests, approve leaves, and view balances.
                    </p>
                </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button onClick={() => setTab('requests')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'requests' ? 'bg-white shadow-xs text-emerald-700' : 'text-gray-500 hover:text-gray-900'}`}>Leave Requests</button>
                <button onClick={() => setTab('balances')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'balances' ? 'bg-white shadow-xs text-emerald-700' : 'text-gray-500 hover:text-gray-900'}`}>Leave Balances</button>
                <button onClick={() => setTab('apply')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'apply' ? 'bg-white shadow-xs text-emerald-700' : 'text-gray-500 hover:text-gray-900'}`}>Apply Leave</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
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
                        <Card className="border-gray-100 shadow-2xs">
                            <CardContent className="p-0">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="p-4">Employee</th>
                                            <th className="p-4">Leave Type</th>
                                            <th className="p-4">Quota</th>
                                            <th className="p-4">Used</th>
                                            <th className="p-4">Remaining</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {balances.map(bal => {
                                            const emp = employees.find(e => e.id === bal.employee_id)
                                            return (
                                                <tr key={bal.id}>
                                                    <td className="p-4 font-bold text-gray-900">{emp?.name}</td>
                                                    <td className="p-4">{bal.leave_type?.name}</td>
                                                    <td className="p-4 font-mono">{bal.total_quota}</td>
                                                    <td className="p-4 font-mono text-rose-600">{bal.used}</td>
                                                    <td className="p-4 font-mono font-bold text-emerald-600">{bal.remaining}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
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
                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Submit Leave Request</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
