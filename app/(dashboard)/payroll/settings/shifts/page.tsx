'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    ArrowLeft, 
    Clock, 
    Plus, 
    CheckCircle2, 
    AlertCircle, 
    Trash2, 
    Sliders, 
    Sparkles, 
    Sun, 
    Moon, 
    Coffee, 
    CalendarCheck, 
    Star,
    Layers
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
    getPayrollShifts, 
    savePayrollShift, 
    deletePayrollShift, 
    PayrollShift 
} from '@/lib/cctv-attendance-actions'

export default function ShiftsSettingsPage() {
    const [shifts, setShifts] = useState<PayrollShift[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    // Form state
    const [editingShift, setEditingShift] = useState<PayrollShift | null>(null)
    const [shiftName, setShiftName] = useState('General Shift')
    const [startTime, setStartTime] = useState('09:30')
    const [endTime, setEndTime] = useState('18:30')
    const [gracePeriodMins, setGracePeriodMins] = useState(15)
    const [minFullDayHours, setMinFullDayHours] = useState(8.0)
    const [minHalfDayHours, setMinHalfDayHours] = useState(4.0)
    const [isDefault, setIsDefault] = useState(false)

    const loadShifts = async () => {
        setLoading(true)
        try {
            const data = await getPayrollShifts()
            setShifts(data)
        } catch (err) {
            console.error('Failed to load shifts:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadShifts()
    }, [])

    const openCreateModal = () => {
        setEditingShift(null)
        setShiftName('General Shift')
        setStartTime('09:30')
        setEndTime('18:30')
        setGracePeriodMins(15)
        setMinFullDayHours(8.0)
        setMinHalfDayHours(4.0)
        setIsDefault(shifts.length === 0)
        setIsModalOpen(true)
    }

    const openEditModal = (shift: PayrollShift) => {
        setEditingShift(shift)
        setShiftName(shift.shift_name)
        setStartTime(shift.start_time.slice(0, 5))
        setEndTime(shift.end_time.slice(0, 5))
        setGracePeriodMins(shift.grace_period_mins)
        setMinFullDayHours(shift.min_full_day_hours)
        setMinHalfDayHours(shift.min_half_day_hours)
        setIsDefault(shift.is_default)
        setIsModalOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!shiftName.trim()) {
            setMsg({ text: 'Shift name is required.', type: 'error' })
            return
        }

        setSaving(true)
        setMsg(null)
        const res = await savePayrollShift({
            id: editingShift?.id,
            shift_name: shiftName,
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`,
            grace_period_mins: Number(gracePeriodMins),
            min_full_day_hours: Number(minFullDayHours),
            min_half_day_hours: Number(minHalfDayHours),
            is_default: Boolean(isDefault)
        })

        setSaving(false)
        if (res.success) {
            setMsg({ text: `Shift "${shiftName}" saved successfully.`, type: 'success' })
            setIsModalOpen(false)
            loadShifts()
        } else {
            setMsg({ text: res.error || 'Failed to save shift.', type: 'error' })
        }
    }

    const handleSetDefault = async (shift: PayrollShift) => {
        const res = await savePayrollShift({
            id: shift.id,
            shift_name: shift.shift_name,
            start_time: shift.start_time,
            end_time: shift.end_time,
            grace_period_mins: shift.grace_period_mins,
            min_full_day_hours: shift.min_full_day_hours,
            min_half_day_hours: shift.min_half_day_hours,
            is_default: true
        })
        if (res.success) {
            loadShifts()
            setMsg({ text: `"${shift.shift_name}" is now the default organization shift.`, type: 'success' })
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete shift "${name}"?`)) return
        const res = await deletePayrollShift(id)
        if (res.success) {
            setShifts(prev => prev.filter(s => s.id !== id))
            setMsg({ text: `Shift "${name}" deleted.`, type: 'success' })
        }
    }

    const formatTimeDisplay = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number)
        const period = h >= 12 ? 'PM' : 'AM'
        const hour = h % 12 || 12
        return `${hour}:${m < 10 ? '0' + m : m} ${period}`
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link 
                            href="/payroll/attendance"
                            className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Attendance
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-semibold text-indigo-600">Shift Timings</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Shift Timings & Grace Period Rules
                            </h1>
                            <p className="text-sm text-slate-500">
                                Configure organization working hours, late arrival grace windows, and automated half-day/full-day thresholds.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={openCreateModal}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Shift
                    </Button>
                </div>
            </div>

            {/* Notification Messages */}
            {msg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
                    msg.type === 'success' 
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50/80 border-rose-200 text-rose-800'
                }`}>
                    {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                    <span>{msg.text}</span>
                </div>
            )}

            {/* Shifts Overview Cards */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Configured Organization Shifts</h2>
                        <p className="text-xs text-slate-500">
                            The Vision AI camera logs use these shift rules to automatically flag late arrivals and calculate effective working hours.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
                        <Clock className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-600">Loading Shifts...</p>
                    </div>
                ) : shifts.length === 0 ? (
                    <div className="py-16 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No Shifts Configured Yet</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                            Set up your general office shift timings so camera check-ins can calculate late marks and effective hours accurately.
                        </p>
                        <Button 
                            onClick={openCreateModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Create General Shift (09:30 AM - 06:30 PM)
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shifts.map((shift) => (
                            <Card 
                                key={shift.id} 
                                className={`border shadow-sm bg-white overflow-hidden flex flex-col justify-between transition-all ${
                                    shift.is_default ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-200'
                                }`}
                            >
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                                shift.is_default ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                <Sun className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base">{shift.shift_name}</h3>
                                                {shift.is_default ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5">
                                                        <Star className="w-3 h-3 fill-indigo-600" />
                                                        Default Organization Shift
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Custom Shift</span>
                                                )}
                                            </div>
                                        </div>

                                        {!shift.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(shift)}
                                                className="text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50"
                                            >
                                                Make Default
                                            </button>
                                        )}
                                    </div>

                                    {/* Timings Badge */}
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-around text-center">
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Start Time</p>
                                            <p className="text-sm font-bold text-slate-900 mt-0.5">
                                                {formatTimeDisplay(shift.start_time)}
                                            </p>
                                        </div>
                                        <div className="h-8 w-px bg-slate-200" />
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">End Time</p>
                                            <p className="text-sm font-bold text-slate-900 mt-0.5">
                                                {formatTimeDisplay(shift.end_time)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rules Grid */}
                                    <div className="space-y-2 text-xs text-slate-600 pt-1">
                                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500">Grace Period (Late Buffer):</span>
                                            <span className="font-semibold text-indigo-600">{shift.grace_period_mins} mins</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500">Full-Day Minimum:</span>
                                            <span className="font-semibold text-slate-900">{shift.min_full_day_hours} hrs effective</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-slate-500">Half-Day Threshold:</span>
                                            <span className="font-semibold text-slate-900">{shift.min_half_day_hours} hrs effective</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="border-t border-slate-100 p-3 bg-slate-50/60 flex items-center justify-between">
                                    <button 
                                        onClick={() => openEditModal(shift)}
                                        className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                                    >
                                        <Sliders className="w-3.5 h-3.5" />
                                        Edit Timings
                                    </button>
                                    {!shift.is_default && (
                                        <button 
                                            onClick={() => handleDelete(shift.id, shift.shift_name)}
                                            className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Create or Edit Shift */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-900 text-lg">
                                    {editingShift ? 'Edit Shift Configuration' : 'Create Organization Shift'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Shift Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. General Shift, Night Shift"
                                    value={shiftName}
                                    onChange={(e) => setShiftName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Start Time *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        End Time *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Grace Period (Minutes)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="120"
                                    value={gracePeriodMins}
                                    onChange={(e) => setGracePeriodMins(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Arrivals within {gracePeriodMins} mins after start time won't be flagged as late.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Full-Day Threshold (Hrs)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="1"
                                        max="16"
                                        value={minFullDayHours}
                                        onChange={(e) => setMinFullDayHours(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Half-Day Threshold (Hrs)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="1"
                                        max="12"
                                        value={minHalfDayHours}
                                        onChange={(e) => setMinHalfDayHours(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isDefaultShift"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <label htmlFor="isDefaultShift" className="text-xs font-medium text-slate-700 select-none">
                                    Set as default shift for all active employees
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border-slate-200 text-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {saving ? 'Saving...' : editingShift ? 'Save Changes' : 'Create Shift'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
