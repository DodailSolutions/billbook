'use client'

import { useState, useEffect } from 'react'
import { getEmployeeLeaves, getEmployeePortalData, applyEmployeeLeave, getLeaveTypes } from '@/lib/payroll-actions'
import { LeaveRequest, EmployeeLeaveBalance, LeaveType } from '@/lib/payroll-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, User, Plane, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export default function EmployeeLeavesPage() {
    const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>([])
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
    
    // Form States
    const [leaveTypeId, setLeaveTypeId] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [reason, setReason] = useState('')
    
    const [loading, setLoading] = useState(true)
    const [formLoading, setFormLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const loadData = async () => {
        setLoading(true)
        const portalData = await getEmployeePortalData()
        setLeaveBalances(portalData.leaveBalances)
        
        const requests = await getEmployeeLeaves()
        setLeaveRequests(requests)

        const types = await getLeaveTypes()
        setLeaveTypes(types)
        if (types.length > 0) {
            setLeaveTypeId(types[0].id)
        }
        
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        if (!leaveTypeId || !fromDate || !toDate) {
            setErrorMessage('Please fill in all required fields.')
            setFormLoading(false)
            return
        }

        const from = new Date(fromDate)
        const to = new Date(toDate)
        if (to < from) {
            setErrorMessage('End date cannot be earlier than start date.')
            setFormLoading(false)
            return
        }

        const res = await applyEmployeeLeave({
            leaveTypeId,
            fromDate,
            toDate,
            reason
        })

        setFormLoading(false)
        if (res.success) {
            setSuccessMessage('Leave application submitted successfully! Waiting for employer approval.')
            setReason('')
            setFromDate('')
            setToDate('')
            // Reload requests & balances
            loadData()
        } else {
            setErrorMessage(res.error || 'Failed to submit leave request.')
        }
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
            {/* Page Title */}
            <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                    Leave Management
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Apply for leaves, view balances, and track your history.
                </p>
            </div>

            {/* Leave Balance Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {leaveBalances.map(b => (
                    <Card key={b.id} className="border-gray-100 shadow-xs">
                        <CardContent className="p-4 flex flex-col justify-between">
                            <span className="font-bold text-gray-700 text-xs truncate block">{b.leave_type?.name || 'Leave'}</span>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-900">{b.remaining}</span>
                                <span className="text-xs text-gray-400">/ {b.total_quota} days left</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div 
                                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.max(0, Math.min(100, (b.remaining / b.total_quota) * 100))}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {leaveBalances.length === 0 && (
                    <Card className="col-span-2 md:col-span-4 border-dashed border-gray-200">
                        <CardContent className="p-6 text-center text-xs text-gray-400 italic">
                            No active leave balances assigned for the current year.
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Apply Leave Form */}
                <Card className="border-gray-100 shadow-xs md:col-span-1 h-fit">
                    <CardHeader className="p-5 border-b border-gray-100">
                        <CardTitle className="text-xs font-bold text-gray-705 uppercase tracking-wider">Apply for Leave</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
                            {successMessage && (
                                <div className="p-3 bg-emerald-50 text-emerald-850 rounded-xl font-medium border border-emerald-100 flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{successMessage}</span>
                                </div>
                            )}
                            {errorMessage && (
                                <div className="p-3 bg-rose-50 text-rose-850 rounded-xl font-medium border border-rose-100 flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div>
                                <label className="block font-semibold text-gray-650 mb-1">Leave Type *</label>
                                <select
                                    value={leaveTypeId}
                                    onChange={(e) => setLeaveTypeId(e.target.value)}
                                    className="w-full p-2 border border-gray-250 rounded-lg bg-white"
                                    required
                                >
                                    {leaveTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-655 mb-1">From Date *</label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full p-2 border border-gray-250 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-655 mb-1">To Date *</label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full p-2 border border-gray-250 rounded-lg"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-655 mb-1">Reason for Leave</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter details..."
                                    rows={3}
                                    className="w-full p-2 border border-gray-255 rounded-lg"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-emerald-650 hover:bg-emerald-700 text-white font-bold"
                                disabled={formLoading}
                            >
                                {formLoading ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Leave History List */}
                <Card className="border-gray-100 shadow-xs md:col-span-2">
                    <CardHeader className="p-5 border-b border-gray-100">
                        <CardTitle className="text-xs font-bold text-gray-705 uppercase tracking-wider">Leave Applications History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200/80 text-gray-400 font-semibold uppercase tracking-wider">
                                        <th className="p-4">Leave Type</th>
                                        <th className="p-4">Duration</th>
                                        <th className="p-4">Total Days</th>
                                        <th className="p-4">Reason</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-gray-800">
                                    {leaveRequests.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50/50">
                                            <td className="p-4 font-bold">{r.leave_type?.name}</td>
                                            <td className="p-4 text-gray-500 whitespace-nowrap">
                                                {new Date(r.from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                {' - '}
                                                {new Date(r.to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 font-semibold">{r.total_days} {r.total_days === 1 ? 'day' : 'days'}</td>
                                            <td className="p-4 max-w-[200px] truncate" title={r.reason || ''}>{r.reason || '-'}</td>
                                            <td className="p-4 whitespace-nowrap">
                                                {r.status === 'approved' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                                                    </span>
                                                )}
                                                {r.status === 'rejected' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-800 border border-rose-100" title={r.rejection_reason || ''}>
                                                        <XCircle className="h-3.5 w-3.5" /> Rejected
                                                    </span>
                                                )}
                                                {r.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-100">
                                                        <AlertCircle className="h-3.5 w-3.5" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {leaveRequests.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                                                No leave applications found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
