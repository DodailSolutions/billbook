'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { getEmployees, getMonthlyAttendance, markAttendance } from '@/lib/payroll-actions'
import { Employee, AttendanceRecord } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
    ArrowLeft, 
    Save, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    Search, 
    Download, 
    Sparkles, 
    Sun, 
    RotateCcw, 
    Users, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    CalendarCheck, 
    CalendarX,
    Palmtree,
    ArrowRightCircle,
    ArrowLeftCircle
} from 'lucide-react'
import { MigrationBanner } from '@/components/MigrationBanner'

type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave' | 'holiday' | 'none'
type ToolMode = 'cycle' | 'present' | 'absent' | 'half_day' | 'leave' | 'holiday' | 'clear'

export default function AttendancePage() {
    const now = new Date()
    const [month, setMonth] = useState<number>(now.getMonth() + 1)
    const [year, setYear] = useState<number>(now.getFullYear())
    
    const [employees, setEmployees] = useState<Employee[]>([])
    const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<number, string>>>({})
    const [initialAttendanceMap, setInitialAttendanceMap] = useState<Record<string, Record<number, string>>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTool, setActiveTool] = useState<ToolMode>('cycle')
    
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const daysInMonth = new Date(year, month, 0).getDate()
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ]
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const isCurrentMonth = now.getFullYear() === year && (now.getMonth() + 1) === month
    const todayDate = now.getDate()

    // Fetch employee data and attendance
    const fetchAttendance = async () => {
        setLoading(true)
        try {
            const [empData, attData] = await Promise.all([
                getEmployees(),
                getMonthlyAttendance(month, year)
            ])
            
            const activeEmp = empData.filter(e => e.status === 'active')
            setEmployees(activeEmp)
            
            const map: Record<string, Record<number, string>> = {}
            activeEmp.forEach(e => { map[e.id] = {} })
            
            attData.forEach(r => {
                const date = new Date(r.attendance_date).getDate()
                if (map[r.employee_id]) {
                    map[r.employee_id][date] = r.status
                }
            })
            
            setAttendanceMap(map)
            // Clone initial state to detect unsaved changes
            setInitialAttendanceMap(JSON.parse(JSON.stringify(map)))
        } catch (err) {
            console.error('Error fetching attendance:', err)
            setMsg({ text: 'Failed to load attendance records.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAttendance()
    }, [month, year])

    // Calculate count of unsaved changes
    const unsavedChangesCount = useMemo(() => {
        let count = 0
        for (const empId of Object.keys(attendanceMap)) {
            for (let d = 1; d <= daysInMonth; d++) {
                const cur = attendanceMap[empId]?.[d] || ''
                const init = initialAttendanceMap[empId]?.[d] || ''
                if (cur !== init) count++
            }
        }
        return count
    }, [attendanceMap, initialAttendanceMap, daysInMonth])

    // Filter employees by search
    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return employees
        const q = searchQuery.toLowerCase()
        return employees.filter(e => 
            e.name.toLowerCase().includes(q) || 
            (e.employee_code && e.employee_code.toLowerCase().includes(q)) ||
            (e.designation && e.designation.toLowerCase().includes(q)) ||
            (e.department && e.department.toLowerCase().includes(q))
        )
    }, [employees, searchQuery])

    // Monthly summary stats
    const stats = useMemo(() => {
        let totalPresent = 0
        let totalAbsent = 0
        let totalHalfDay = 0
        let totalLeave = 0
        let totalHoliday = 0
        let totalMarked = 0

        employees.forEach(emp => {
            const empRecord = attendanceMap[emp.id] || {}
            Object.values(empRecord).forEach(st => {
                if (st === 'present') totalPresent++
                else if (st === 'absent') totalAbsent++
                else if (st === 'half_day') totalHalfDay++
                else if (st === 'leave') totalLeave++
                else if (st === 'holiday') totalHoliday++
                if (st) totalMarked++
            })
        })

        // Working days count (excluding Sundays)
        let workingDays = 0
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month - 1, d)
            if (date.getDay() !== 0) workingDays++
        }

        const totalExpectedDays = employees.length * workingDays
        const attendanceRate = totalExpectedDays > 0 
            ? ((totalPresent + (totalHalfDay * 0.5)) / totalExpectedDays) * 100 
            : 0

        return {
            totalEmployees: employees.length,
            workingDays,
            totalPresent,
            totalAbsent,
            totalHalfDay,
            totalLeave,
            totalHoliday,
            attendanceRate: Math.min(100, Math.max(0, attendanceRate))
        }
    }, [employees, attendanceMap, daysInMonth, year, month])

    // Day of week helper (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const getDayOfWeek = (day: number) => {
        return new Date(year, month - 1, day).getDay()
    }

    const isWeekend = (day: number) => {
        const dow = getDayOfWeek(day)
        return dow === 0 || dow === 6
    }

    const isSunday = (day: number) => {
        return getDayOfWeek(day) === 0
    }

    // Handle cell click depending on activeTool
    const handleCellClick = (empId: string, day: number) => {
        setAttendanceMap(prev => {
            const current = prev[empId]?.[day]
            let nextStatus = 'present'

            if (activeTool === 'cycle') {
                if (!current) nextStatus = 'present'
                else if (current === 'present') nextStatus = 'absent'
                else if (current === 'absent') nextStatus = 'half_day'
                else if (current === 'half_day') nextStatus = 'leave'
                else if (current === 'leave') nextStatus = 'holiday'
                else nextStatus = '' // reset
            } else if (activeTool === 'clear') {
                nextStatus = ''
            } else {
                nextStatus = activeTool
            }

            const updatedEmp = { ...(prev[empId] || {}) }
            if (nextStatus) {
                updatedEmp[day] = nextStatus
            } else {
                delete updatedEmp[day]
            }

            return {
                ...prev,
                [empId]: updatedEmp
            }
        })
    }

    // Navigation helpers
    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12)
            setYear(year - 1)
        } else {
            setMonth(month - 1)
        }
    }

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1)
            setYear(year + 1)
        } else {
            setMonth(month + 1)
        }
    }

    const handleJumpToToday = () => {
        setMonth(now.getMonth() + 1)
        setYear(now.getFullYear())
        setTimeout(() => {
            scrollToToday()
        }, 100)
    }

    // Scroll helpers
    const scrollHorizontal = (offset: number) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
        }
    }

    const scrollToToday = () => {
        if (scrollContainerRef.current && isCurrentMonth) {
            // Approx column width is 52px, employee col is 240px
            const targetX = Math.max(0, (todayDate - 3) * 52)
            scrollContainerRef.current.scrollTo({ left: targetX, behavior: 'smooth' })
        }
    }

    // Bulk actions
    const markAllPresentForDay = (day: number) => {
        setAttendanceMap(prev => {
            const next = { ...prev }
            employees.forEach(e => {
                if (!next[e.id]) next[e.id] = {}
                next[e.id][day] = 'present'
            })
            return next
        })
    }

    const markEmployeePresentAllMonth = (empId: string) => {
        setAttendanceMap(prev => {
            const nextEmp = { ...(prev[empId] || {}) }
            for (let d = 1; d <= daysInMonth; d++) {
                if (!isSunday(d)) {
                    nextEmp[d] = 'present'
                }
            }
            return {
                ...prev,
                [empId]: nextEmp
            }
        })
    }

    const markAllWeekdaysPresent = () => {
        setAttendanceMap(prev => {
            const next = { ...prev }
            employees.forEach(e => {
                const nextEmp = { ...(next[e.id] || {}) }
                for (let d = 1; d <= daysInMonth; d++) {
                    if (!isSunday(d)) {
                        nextEmp[d] = 'present'
                    }
                }
                next[e.id] = nextEmp
            })
            return next
        })
    }

    const markAllSundaysHoliday = () => {
        setAttendanceMap(prev => {
            const next = { ...prev }
            employees.forEach(e => {
                const nextEmp = { ...(next[e.id] || {}) }
                for (let d = 1; d <= daysInMonth; d++) {
                    if (isSunday(d)) {
                        nextEmp[d] = 'holiday'
                    }
                }
                next[e.id] = nextEmp
            })
            return next
        })
    }

    const resetChanges = () => {
        setAttendanceMap(JSON.parse(JSON.stringify(initialAttendanceMap)))
        setMsg({ text: 'Reverted all unsaved changes.', type: 'success' })
        setTimeout(() => setMsg(null), 3000)
    }

    // Save attendance to backend
    const saveAttendance = async () => {
        setSaving(true)
        const records: Partial<AttendanceRecord>[] = []
        
        for (const empId of Object.keys(attendanceMap)) {
            for (const day of Object.keys(attendanceMap[empId])) {
                const dayNum = parseInt(day)
                const status = attendanceMap[empId][dayNum]
                if (status) {
                    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`
                    records.push({
                        employee_id: empId,
                        attendance_date: dateStr,
                        status: status as any
                    })
                }
            }
        }
        
        try {
            const res = await markAttendance(records)
            if (res.success) {
                setInitialAttendanceMap(JSON.parse(JSON.stringify(attendanceMap)))
                setMsg({ text: `Successfully saved attendance for ${records.length} record(s)!`, type: 'success' })
                setTimeout(() => setMsg(null), 4000)
            } else {
                setMsg({ text: res.error || 'Failed to save attendance.', type: 'error' })
            }
        } catch {
            setMsg({ text: 'Error saving attendance.', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    // Export monthly attendance CSV
    const exportCSV = () => {
        const header = ['Employee Code', 'Employee Name', 'Department', 'Designation']
        for (let d = 1; d <= daysInMonth; d++) {
            header.push(`${d}-${monthNames[month - 1].slice(0, 3)}`)
        }
        header.push('Present (P)', 'Absent (A)', 'Half-Day (H)', 'Leave (L)', 'Holiday (O)', 'Payable Days')

        const rows: string[][] = [header]

        employees.forEach(emp => {
            let p = 0, a = 0, h = 0, l = 0, o = 0
            const row = [
                emp.employee_code || '',
                `"${emp.name}"`,
                `"${emp.department || ''}"`,
                `"${emp.designation || ''}"`
            ]

            for (let d = 1; d <= daysInMonth; d++) {
                const st = attendanceMap[emp.id]?.[d] || ''
                if (st === 'present') { p++; row.push('P') }
                else if (st === 'absent') { a++; row.push('A') }
                else if (st === 'half_day') { h++; row.push('H') }
                else if (st === 'leave') { l++; row.push('L') }
                else if (st === 'holiday') { o++; row.push('O') }
                else row.push('-')
            }

            const payable = p + o + l + (h * 0.5)
            row.push(p.toString(), a.toString(), h.toString(), l.toString(), o.toString(), payable.toString())
            rows.push(row)
        })

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(',')).join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `attendance_${monthNames[month - 1]}_${year}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'present': return 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xs'
            case 'absent': return 'bg-rose-500 hover:bg-rose-600 text-white shadow-2xs'
            case 'half_day': return 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
            case 'leave': return 'bg-purple-600 hover:bg-purple-700 text-white shadow-2xs'
            case 'holiday': return 'bg-sky-500 hover:bg-sky-600 text-white shadow-2xs'
            default: return 'bg-gray-100 hover:bg-gray-200 text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-500 border border-gray-200/60 dark:border-gray-700'
        }
    }

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'present': return 'P'
            case 'absent': return 'A'
            case 'half_day': return '½'
            case 'leave': return 'L'
            case 'holiday': return 'H'
            default: return '-'
        }
    }

    return (
        <div className="space-y-5 max-w-full mx-auto pb-16 px-1 sm:px-2">
            <MigrationBanner />

            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link href="/payroll">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl border-gray-300 dark:border-gray-700">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="h-6 w-6 text-blue-600" />
                                Attendance Tracking
                            </h1>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                {monthNames[month - 1]} {year}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Mark daily attendance, calculate Loss of Pay (LOP), and manage monthly payable days.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {unsavedChangesCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>{unsavedChangesCount} Unsaved Change{unsavedChangesCount > 1 ? 's' : ''}</span>
                            <button 
                                onClick={resetChanges} 
                                className="ml-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 underline cursor-pointer"
                                title="Discard unsaved changes"
                            >
                                Discard
                            </button>
                        </div>
                    )}

                    {msg && (
                        <div className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                            msg.type === 'success' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                            {msg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{msg.text}</span>
                        </div>
                    )}

                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportCSV} 
                        className="text-xs gap-1.5 h-10 px-3 border-gray-300 dark:border-gray-700"
                        title="Download CSV Spreadsheet"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </Button>

                    <Button 
                        onClick={saveAttendance} 
                        disabled={saving} 
                        className={`text-white gap-2 h-10 px-5 rounded-xl font-semibold shadow-xs ${
                            unsavedChangesCount > 0 ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400/50' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        <Save className="h-4 w-4" /> 
                        {saving ? 'Saving Records...' : 'Save Attendance'}
                    </Button>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Active Staff</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalEmployees}</span>
                        <span className="text-xs text-gray-500">employees</span>
                    </div>
                </div>

                <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                        <CalendarCheck className="w-4 h-4 text-emerald-600" />
                        <span>Attendance Rate</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.attendanceRate.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">{stats.workingDays} workdays</span>
                    </div>
                </div>

                <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                        <CalendarX className="w-4 h-4 text-rose-600" />
                        <span>Loss of Pay (LOP)</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{stats.totalAbsent}</span>
                        <span className="text-xs text-gray-500">absent days</span>
                    </div>
                </div>

                <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                        <Palmtree className="w-4 h-4 text-purple-600" />
                        <span>Leaves & Holidays</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.totalLeave + stats.totalHoliday}
                        </span>
                        <span className="text-xs text-gray-500">days combined</span>
                    </div>
                </div>
            </div>

            {/* Navigation & Stamp Tool Bar */}
            <Card className="border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
                <CardContent className="p-4 sm:p-5 space-y-4">
                    {/* Top row: Date navigation & Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Month / Year navigator */}
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handlePrevMonth} 
                                className="h-8 w-8 p-0 border-0 bg-transparent hover:bg-white dark:hover:bg-gray-700"
                                title="Previous Month"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="h-8 px-2.5 text-xs font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white cursor-pointer"
                            >
                                {monthNames.map((m, idx) => (
                                    <option key={idx} value={idx + 1}>{m}</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="h-8 w-20 px-2 text-xs font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center"
                            />

                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleNextMonth} 
                                className="h-8 w-8 p-0 border-0 bg-transparent hover:bg-white dark:hover:bg-gray-700"
                                title="Next Month"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleJumpToToday}
                                className="h-8 px-2 text-[11px] font-semibold border-0 text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg"
                            >
                                Today
                            </Button>
                        </div>

                        {/* Search Filter */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search employee..."
                                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Horizontal Scroll Controls */}
                        <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 hidden lg:inline">
                                Scroll Month:
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => scrollHorizontal(-300)}
                                className="h-8 px-2 text-xs gap-1 border-gray-200 dark:border-gray-700"
                                title="Scroll left"
                            >
                                <ArrowLeftCircle className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                <span className="hidden sm:inline">Left</span>
                            </Button>
                            {isCurrentMonth && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={scrollToToday}
                                    className="h-8 px-2.5 text-xs text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40"
                                    title="Center view on today"
                                >
                                    Today (Day {todayDate})
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => scrollHorizontal(300)}
                                className="h-8 px-2 text-xs gap-1 border-gray-200 dark:border-gray-700"
                                title="Scroll right"
                            >
                                <span className="hidden sm:inline">Right</span>
                                <ArrowRightCircle className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </Button>
                        </div>
                    </div>

                    {/* Second row: Quick Stamp Tool & Bulk Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                        {/* Stamp Selection Mode */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 shrink-0 mr-1">
                                Tool:
                            </span>
                            
                            <button
                                type="button"
                                onClick={() => setActiveTool('cycle')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors border ${
                                    activeTool === 'cycle'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                }`}
                                title="Click a cell repeatedly to cycle between Present, Absent, Half-Day, Leave, Holiday"
                            >
                                🔄 Cycle (P→A→H→L→O)
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTool('present')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors border flex items-center gap-1 ${
                                    activeTool === 'present'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                }`}
                                title="Click cells to stamp Present"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>P (Present)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTool('absent')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors border flex items-center gap-1 ${
                                    activeTool === 'absent'
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                                }`}
                                title="Click cells to stamp Absent"
                            >
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                <span>A (Absent)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTool('half_day')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors border flex items-center gap-1 ${
                                    activeTool === 'half_day'
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                }`}
                                title="Click cells to stamp Half-Day"
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>½ (Half-Day)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTool('leave')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors border flex items-center gap-1 ${
                                    activeTool === 'leave'
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                        : 'bg-purple-50 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                                }`}
                                title="Click cells to stamp Leave"
                            >
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                <span>L (Leave)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTool('holiday')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors border flex items-center gap-1 ${
                                    activeTool === 'holiday'
                                        ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                        : 'bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                                }`}
                                title="Click cells to stamp Holiday"
                            >
                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                                <span>H (Holiday)</span>
                            </button>
                        </div>

                        {/* Bulk Action Buttons */}
                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllWeekdaysPresent}
                                className="h-7 text-[11px] font-semibold gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="Mark all working days for all staff as Present"
                            >
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>Mark All Weekdays Present</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllSundaysHoliday}
                                className="h-7 text-[11px] font-semibold gap-1 text-sky-700 dark:text-sky-300 border-sky-200 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                                title="Mark all Sundays as Holidays"
                            >
                                <Sun className="w-3 h-3 text-sky-600" />
                                <span>Auto Sundays as Holiday</span>
                            </Button>
                        </div>
                    </div>

                    {/* Main Attendance Matrix with Horizontal Scroll */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3" />
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Loading monthly attendance grid...</p>
                            <p className="text-xs text-gray-400">Synchronizing employee rosters and logs</p>
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Users className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No active employees found</h3>
                            <p className="text-xs text-gray-500 mt-1 mb-4">Add your employees to the directory to start tracking attendance.</p>
                            <Link href="/payroll/employees">
                                <Button size="sm" className="bg-blue-600 text-white text-xs">Go to Employees Directory</Button>
                            </Link>
                        </div>
                    ) : (
                        <div 
                            ref={scrollContainerRef}
                            className="relative overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-inner scroll-smooth"
                            style={{ maxWidth: '100%' }}
                        >
                            <table className="text-left text-xs whitespace-nowrap border-collapse min-w-max">
                                {/* Table Header */}
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 select-none">
                                    <tr>
                                        {/* Sticky Employee Header */}
                                        <th className="p-3 font-bold sticky left-0 bg-gray-50 dark:bg-gray-800 z-40 border-r-2 border-gray-300 dark:border-gray-700 min-w-[220px] w-[220px] shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <span>Employee ({filteredEmployees.length})</span>
                                                <span className="text-[10px] text-gray-400 font-normal">Code</span>
                                            </div>
                                        </th>

                                        {/* Day Columns (1 to 31) */}
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const day = i + 1
                                            const dow = getDayOfWeek(day)
                                            const weekend = isWeekend(day)
                                            const isSundayDay = isSunday(day)
                                            const isToday = isCurrentMonth && day === todayDate

                                            return (
                                                <th 
                                                    key={day} 
                                                    className={`p-1.5 text-center min-w-[50px] w-[50px] border-r border-gray-200/80 dark:border-gray-700 ${
                                                        isToday 
                                                            ? 'bg-blue-100/90 dark:bg-blue-900/60 ring-2 ring-blue-500 ring-inset' 
                                                            : weekend 
                                                                ? 'bg-slate-100/80 dark:bg-gray-800/80 text-amber-700 dark:text-amber-400' 
                                                                : 'bg-gray-50 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    {/* Day of Week Name */}
                                                    <div className={`text-[10px] uppercase font-bold tracking-tight ${isToday ? 'text-blue-700 dark:text-blue-300' : isSundayDay ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {dayNames[dow]}
                                                    </div>

                                                    {/* Day Number */}
                                                    <div className={`text-xs font-black my-0.5 ${isToday ? 'text-blue-800 dark:text-blue-200 font-extrabold' : 'text-gray-800 dark:text-gray-200'}`}>
                                                        {day}
                                                    </div>

                                                    {/* Quick Action: Mark All Present on this day */}
                                                    <button 
                                                        type="button"
                                                        onClick={() => markAllPresentForDay(day)} 
                                                        className="text-[9px] text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-0.5 rounded-sm w-full font-bold transition-colors cursor-pointer" 
                                                        title={`Mark all employees Present on Day ${day}`}
                                                    >
                                                        P All
                                                    </button>
                                                </th>
                                            )
                                        })}

                                        {/* Summary Columns Header */}
                                        <th className="p-2.5 text-center font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 border-l-2 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                            P
                                            <div className="text-[9px] font-normal text-gray-500">Present</div>
                                        </th>
                                        <th className="p-2.5 text-center font-bold text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                            A
                                            <div className="text-[9px] font-normal text-gray-500">Absent</div>
                                        </th>
                                        <th className="p-2.5 text-center font-bold text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                            ½
                                            <div className="text-[9px] font-normal text-gray-500">Half</div>
                                        </th>
                                        <th className="p-2.5 text-center font-bold text-purple-700 dark:text-purple-300 bg-purple-50/70 dark:bg-purple-950/30 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                            L
                                            <div className="text-[9px] font-normal text-gray-500">Leave</div>
                                        </th>
                                        <th className="p-2.5 text-center font-bold text-sky-700 dark:text-sky-300 bg-sky-50/70 dark:bg-sky-950/30 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                            H
                                            <div className="text-[9px] font-normal text-gray-500">Holiday</div>
                                        </th>
                                        <th className="p-2.5 text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 min-w-[90px] w-[90px]">
                                            Payable
                                            <div className="text-[9px] font-normal text-gray-500">Days / {daysInMonth}</div>
                                        </th>
                                    </tr>
                                </thead>

                                {/* Table Body Rows */}
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {filteredEmployees.map(emp => {
                                        const empRecord = attendanceMap[emp.id] || {}

                                        // Calculate employee monthly stats
                                        let pCount = 0, aCount = 0, hCount = 0, lCount = 0, oCount = 0
                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const st = empRecord[d]
                                            if (st === 'present') pCount++
                                            else if (st === 'absent') aCount++
                                            else if (st === 'half_day') hCount++
                                            else if (st === 'leave') lCount++
                                            else if (st === 'holiday') oCount++
                                        }

                                        const payableDays = pCount + oCount + lCount + (hCount * 0.5)

                                        return (
                                            <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition-colors">
                                                {/* Sticky Employee Name & Code Column */}
                                                <td className="p-2.5 sticky left-0 bg-white dark:bg-gray-900 z-20 border-r-2 border-gray-300 dark:border-gray-700 min-w-[220px] w-[220px] shadow-sm">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="truncate">
                                                            <p className="font-bold text-gray-900 dark:text-white truncate text-xs" title={emp.name}>
                                                                {emp.name}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                                                                    {emp.employee_code || 'EMP'}
                                                                </span>
                                                                {emp.designation && (
                                                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
                                                                        {emp.designation}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Quick row button: Mark this employee full month present */}
                                                        <button
                                                            type="button"
                                                            onClick={() => markEmployeePresentAllMonth(emp.id)}
                                                            className="text-[10px] px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold cursor-pointer shrink-0"
                                                            title="Mark Present for all workdays this month"
                                                        >
                                                            P All
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Day Cells (1 to 31) */}
                                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                                    const day = i + 1
                                                    const status = empRecord[day]
                                                    const weekend = isWeekend(day)
                                                    const isToday = isCurrentMonth && day === todayDate

                                                    return (
                                                        <td 
                                                            key={day} 
                                                            className={`p-1 text-center border-r border-gray-100 dark:border-gray-800 min-w-[50px] w-[50px] ${
                                                                isToday 
                                                                    ? 'bg-blue-50/60 dark:bg-blue-950/20' 
                                                                    : weekend 
                                                                        ? 'bg-slate-50/60 dark:bg-gray-800/30' 
                                                                        : ''
                                                            }`}
                                                        >
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleCellClick(emp.id, day)}
                                                                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center mx-auto transition-transform active:scale-95 cursor-pointer ${getStatusColor(status)}`}
                                                                title={`Day ${day}: ${status ? status.toUpperCase() : 'Not Marked'} (Click to change)`}
                                                            >
                                                                {getStatusText(status)}
                                                            </button>
                                                        </td>
                                                    )
                                                })}

                                                {/* Summary Columns */}
                                                <td className="p-2 text-center font-bold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 border-l-2 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                                    {pCount}
                                                </td>
                                                <td className="p-2 text-center font-bold text-xs text-rose-700 dark:text-rose-300 bg-rose-50/40 dark:bg-rose-950/20 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                                    {aCount}
                                                </td>
                                                <td className="p-2 text-center font-bold text-xs text-amber-700 dark:text-amber-300 bg-amber-50/40 dark:bg-amber-950/20 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                                    {hCount}
                                                </td>
                                                <td className="p-2 text-center font-bold text-xs text-purple-700 dark:text-purple-300 bg-purple-50/40 dark:bg-purple-950/20 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                                    {lCount}
                                                </td>
                                                <td className="p-2 text-center font-bold text-xs text-sky-700 dark:text-sky-300 bg-sky-50/40 dark:bg-sky-950/20 border-r border-gray-200 dark:border-gray-700 min-w-[60px] w-[60px]">
                                                    {oCount}
                                                </td>
                                                <td className="p-2 text-center font-black text-xs text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30 min-w-[90px] w-[90px]">
                                                    {payableDays} <span className="text-[10px] text-gray-400 font-normal">/ {daysInMonth}</span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
