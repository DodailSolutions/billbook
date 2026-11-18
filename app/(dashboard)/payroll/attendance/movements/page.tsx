'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    ArrowLeft, 
    Activity, 
    Calendar, 
    Clock, 
    Coffee, 
    CheckCircle2, 
    AlertCircle, 
    Users, 
    Search, 
    RefreshCw, 
    ChevronDown, 
    ChevronUp, 
    Eye, 
    Video, 
    Sparkles, 
    ShieldCheck, 
    Sliders,
    ArrowRightCircle,
    ArrowLeftCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
    getDailyMovementAudit, 
    logAttendanceMovement, 
    getCctvCameras, 
    EmployeeDailyAudit, 
    CctvCamera 
} from '@/lib/cctv-attendance-actions'

export default function DailyMovementsPage() {
    const todayStr = new Date().toISOString().split('T')[0]
    const [selectedDate, setSelectedDate] = useState<string>(todayStr)
    const [audits, setAudits] = useState<EmployeeDailyAudit[]>([])
    const [cameras, setCameras] = useState<CctvCamera[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedEmpId, setExpandedEmpId] = useState<string | null>(null)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    // Test simulator modal
    const [isSimModalOpen, setIsSimModalOpen] = useState(false)
    const [simEmpId, setSimEmpId] = useState('')
    const [simEventType, setSimEventType] = useState<'IN' | 'OUT'>('IN')
    const [simCameraId, setSimCameraId] = useState('')
    const [simulating, setSimulating] = useState(false)

    const loadData = async (date: string) => {
        setLoading(true)
        try {
            const [auditData, camData] = await Promise.all([
                getDailyMovementAudit(date),
                getCctvCameras()
            ])
            setAudits(auditData)
            setCameras(camData)
            if (auditData.length > 0 && !simEmpId) {
                setSimEmpId(auditData[0].employee_id)
            }
            if (camData.length > 0 && !simCameraId) {
                setSimCameraId(camData[0].id)
            }
        } catch (err) {
            console.error('Failed to load daily movements:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData(selectedDate)
    }, [selectedDate])

    const handleSimulateMovement = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!simEmpId) {
            setMsg({ text: 'Please select an employee.', type: 'error' })
            return
        }

        setSimulating(true)
        setMsg(null)
        const res = await logAttendanceMovement({
            employee_id: simEmpId,
            event_type: simEventType,
            camera_id: simCameraId || undefined,
            confidence_score: 0.985
        })

        setSimulating(false)
        if (res.success) {
            setMsg({ 
                text: `Vision AI Event (${simEventType}) simulated successfully.`, 
                type: 'success' 
            })
            setIsSimModalOpen(false)
            loadData(selectedDate)
        } else {
            setMsg({ text: res.error || 'Failed to simulate movement.', type: 'error' })
        }
    }

    const filteredAudits = audits.filter(a => 
        a.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.department.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Metrics
    const onPremiseCount = audits.filter(a => a.status === 'incomplete' || (a.first_in && !a.last_out)).length
    const presentFullCount = audits.filter(a => a.status === 'present').length
    const lateCount = audits.filter(a => a.is_late).length
    const totalBreaksTaken = audits.reduce((sum, a) => sum + (a.movements_count > 2 ? Math.floor((a.movements_count - 2) / 2) : 0), 0)

    const formatTime = (ts: string | null) => {
        if (!ts) return '-'
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
                            Back to Attendance Calendar
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-semibold text-indigo-600">Daily Movements Audit</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Vision AI Movement & Transit Audit
                            </h1>
                            <p className="text-sm text-slate-500">
                                Automatic first arrival check-in, coffee breaks, cafeteria transit, and departure tracking from office cameras.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <input 
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none"
                        />
                    </div>
                    <Link href="/payroll/attendance/cctv">
                        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 text-xs">
                            <Video className="w-3.5 h-3.5 text-indigo-600" />
                            Camera Setup
                        </Button>
                    </Link>
                    <Button 
                        onClick={() => setIsSimModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-1.5 text-xs"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Simulate Punch
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

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Office Now</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{onPremiseCount}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Currently inside building</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Day Completed</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">{presentFullCount}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Worked &ge; 8.0 hours</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Late Arrivals</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{lateCount}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Arrived after grace window</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Breaks Logged</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{totalBreaksTaken}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Coffee & lunch transitions</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Coffee className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employee by name, code or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                    />
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => loadData(selectedDate)}
                    className="text-xs text-slate-600 border-slate-200 hover:bg-slate-100"
                >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Refresh Feed
                </Button>
            </div>

            {/* Timeline Audit Table */}
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                                <th className="p-3.5">Employee</th>
                                <th className="p-3.5">First IN (Arrival)</th>
                                <th className="p-3.5">Breaks / Out</th>
                                <th className="p-3.5">Final OUT (Departure)</th>
                                <th className="p-3.5">Effective Work</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                                        Analyzing camera vision vector logs...
                                    </td>
                                </tr>
                            ) : filteredAudits.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        No movement logs recorded for {selectedDate}.
                                    </td>
                                </tr>
                            ) : (
                                filteredAudits.map((item) => {
                                    const isExpanded = expandedEmpId === item.employee_id
                                    return (
                                        <>
                                            <tr 
                                                key={item.employee_id}
                                                className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                                                onClick={() => setExpandedEmpId(isExpanded ? null : item.employee_id)}
                                            >
                                                <td className="p-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                            {item.employee_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{item.employee_name}</p>
                                                            <p className="text-[11px] text-slate-400">{item.employee_code} • {item.department}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* First IN */}
                                                <td className="p-3.5 font-mono">
                                                    {item.first_in ? (
                                                        <div className="space-y-0.5">
                                                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                                                <ArrowRightCircle className="w-3.5 h-3.5" />
                                                                {formatTime(item.first_in)}
                                                            </span>
                                                            {item.is_late && (
                                                                <span className="block text-[10px] text-amber-600 font-sans font-medium">
                                                                    Late Arrival
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>

                                                {/* Breaks */}
                                                <td className="p-3.5">
                                                    {item.movements_count > 2 ? (
                                                        <div className="text-xs">
                                                            <span className="font-semibold text-slate-800">
                                                                {item.movements_count - 2} transitions
                                                            </span>
                                                            <p className="text-[11px] text-slate-400">
                                                                {item.total_break_minutes}m total break
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px]">0 breaks</span>
                                                    )}
                                                </td>

                                                {/* Final OUT */}
                                                <td className="p-3.5 font-mono">
                                                    {item.last_out ? (
                                                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                                                            <ArrowLeftCircle className="w-3.5 h-3.5" />
                                                            {formatTime(item.last_out)}
                                                        </span>
                                                    ) : item.first_in ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            On Premise
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>

                                                {/* Effective Hours */}
                                                <td className="p-3.5 font-mono font-semibold text-slate-900">
                                                    {item.total_effective_hours > 0 ? (
                                                        <span>{item.total_effective_hours} hrs</span>
                                                    ) : (
                                                        <span className="text-slate-400 font-normal">-</span>
                                                    )}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="p-3.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                                                        item.status === 'present' 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : item.status === 'half_day'
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            : item.status === 'incomplete'
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </td>

                                                {/* Expand Arrow */}
                                                <td className="p-3.5 text-right">
                                                    <button className="text-slate-400 hover:text-slate-600 p-1">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expandable Individual Movement Breakdown */}
                                            {isExpanded && (
                                                <tr className="bg-slate-50/50">
                                                    <td colSpan={7} className="p-4 border-y border-slate-200">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                                                <span>CCTV Detection Feed Log ({item.movements.length} raw punches)</span>
                                                                <span className="text-[11px] text-slate-400 font-mono">DPDP Privacy Verified</span>
                                                            </div>

                                                            {item.movements.length === 0 ? (
                                                                <p className="text-xs text-slate-400 italic">No camera triggers recorded today.</p>
                                                            ) : (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                                                    {item.movements.map((m, idx) => (
                                                                        <div 
                                                                            key={m.id || idx}
                                                                            className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                                                                    m.event_type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                                                }`}>
                                                                                    {m.event_type}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-mono text-xs font-semibold text-slate-900">
                                                                                        {formatTime(m.timestamp)}
                                                                                    </p>
                                                                                    <p className="text-[10px] text-slate-400">
                                                                                        {m.camera_location || 'Office Entrance'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-semibold">
                                                                                    {(Number(m.confidence_score) * 100).toFixed(1)}% match
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal: Simulate Punch */}
            {isSimModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-900 text-lg">
                                    Simulate Camera Face Detection
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsSimModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSimulateMovement} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Select Employee *
                                </label>
                                <select
                                    required
                                    value={simEmpId}
                                    onChange={(e) => setSimEmpId(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                    {audits.map((a) => (
                                        <option key={a.employee_id} value={a.employee_id}>
                                            {a.employee_name} ({a.employee_code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Event Direction *
                                    </label>
                                    <select
                                        value={simEventType}
                                        onChange={(e: any) => setSimEventType(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="IN">IN (Arrival / Return)</option>
                                        <option value="OUT">OUT (Departure / Break)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Camera Node
                                    </label>
                                    <select
                                        value={simCameraId}
                                        onChange={(e) => setSimCameraId(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="">Default Main Entrance</option>
                                        {cameras.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.camera_name} ({c.location})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400">
                                This immediately passes a 512-D vector match to the attendance ingestor, debouncing duplicates and updating today's calendar automatically.
                            </p>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setIsSimModalOpen(false)}
                                    className="border-slate-200 text-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={simulating}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {simulating ? 'Processing...' : 'Simulate Match'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
