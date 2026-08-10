'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getEmployees, getMonthlyAttendance, markAttendance } from '@/lib/payroll-actions'
import { Employee, AttendanceRecord } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, Save, Calendar, CheckSquare } from 'lucide-react'
import { MigrationBanner } from '@/components/MigrationBanner'

export default function AttendancePage() {
    const now = new Date()
    const [month, setMonth] = useState<number>(now.getMonth() + 1)
    const [year, setYear] = useState<number>(now.getFullYear())
    
    const [employees, setEmployees] = useState<Employee[]>([])
    const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<number, string>>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')

    const daysInMonth = new Date(year, month, 0).getDate()
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    const fetchAttendance = async () => {
        setLoading(true)
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
        setLoading(false)
    }

    useEffect(() => {
        fetchAttendance()
    }, [month, year])

    const toggleStatus = (empId: string, day: number) => {
        setAttendanceMap(prev => {
            const current = prev[empId][day]
            let next = 'present'
            if (current === 'present') next = 'absent'
            else if (current === 'absent') next = 'half_day'
            else if (current === 'half_day') next = 'leave'
            else if (current === 'leave') next = 'holiday'
            else next = 'present' // fallback
            
            return {
                ...prev,
                [empId]: {
                    ...prev[empId],
                    [day]: next
                }
            }
        })
    }

    const markAllPresent = (day: number) => {
        setAttendanceMap(prev => {
            const next = { ...prev }
            employees.forEach(e => {
                if (!next[e.id]) next[e.id] = {}
                next[e.id][day] = 'present'
            })
            return next
        })
    }

    const saveAttendance = async () => {
        setSaving(true)
        const records: Partial<AttendanceRecord>[] = []
        
        for (const empId of Object.keys(attendanceMap)) {
            for (const day of Object.keys(attendanceMap[empId])) {
                const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                records.push({
                    employee_id: empId,
                    attendance_date: dateStr,
                    status: attendanceMap[empId][parseInt(day)] as any
                })
            }
        }
        
        const res = await markAttendance(records)
        setSaving(false)
        if (res.success) {
            setMsg('Attendance saved successfully!')
            setTimeout(() => setMsg(''), 3000)
        } else {
            setMsg('Error saving attendance.')
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'present': return 'bg-emerald-500 hover:bg-emerald-600 text-white'
            case 'absent': return 'bg-rose-500 hover:bg-rose-600 text-white'
            case 'half_day': return 'bg-amber-500 hover:bg-amber-600 text-white'
            case 'leave': return 'bg-indigo-500 hover:bg-indigo-600 text-white'
            case 'holiday': return 'bg-sky-400 hover:bg-sky-500 text-white'
            default: return 'bg-gray-100 hover:bg-gray-200 text-gray-400'
        }
    }

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'present': return 'P'
            case 'absent': return 'A'
            case 'half_day': return 'H'
            case 'leave': return 'L'
            case 'holiday': return 'O'
            default: return '-'
        }
    }

    return (
        <div className="space-y-6 max-w-full mx-auto pb-12">
            <MigrationBanner />
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/payroll">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-emerald-600" />
                            Attendance Tracking
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Mark daily attendance for LOP calculation
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {msg && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{msg}</span>}
                    <Button onClick={saveAttendance} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                </div>
            </div>

            <Card className="border-gray-100 shadow-2xs">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="p-2.5 text-xs border border-gray-200 rounded-xl font-semibold bg-gray-50"
                        >
                            {monthNames.map((m, idx) => (
                                <option key={idx} value={idx + 1}>{m}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="p-2.5 text-xs border border-gray-200 rounded-xl font-semibold bg-gray-50 w-24"
                        />
                        <div className="flex gap-2 text-[10px] ml-auto font-bold uppercase tracking-wider text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Half-Day</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Leave</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400"></span> Holiday</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                            <table className="w-full text-left text-xs whitespace-nowrap table-fixed">
                                <thead className="bg-slate-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-3 font-semibold text-gray-500 sticky left-0 bg-slate-50 z-20 border-r border-gray-200 shadow-sm min-w-[160px] w-[160px]">Employee</th>
                                        {Array.from({ length: daysInMonth }).map((_, i) => (
                                            <th key={i} className="p-2 text-center min-w-[48px] w-[48px] font-semibold text-gray-500 border-r border-gray-100">
                                                <div className="mb-1">{i + 1}</div>
                                                <button onClick={() => markAllPresent(i + 1)} className="text-[9px] text-emerald-600 hover:bg-emerald-50 p-1 rounded-sm w-full font-bold" title="Mark All Present">
                                                    P All
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id} className="border-b border-gray-100 hover:bg-slate-50/50">
                                            <td className="p-3 sticky left-0 bg-white z-10 border-r border-gray-200 shadow-sm min-w-[160px] w-[160px]">
                                                <p className="font-bold text-gray-900 truncate">{emp.name}</p>
                                                <p className="text-[10px] text-gray-400">{emp.employee_code}</p>
                                            </td>
                                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                                const day = i + 1
                                                const status = attendanceMap[emp.id]?.[day]
                                                return (
                                                    <td key={day} className="p-1 text-center border-r border-gray-100 min-w-[48px] w-[48px]">
                                                        <button 
                                                            onClick={() => toggleStatus(emp.id, day)}
                                                            className={`w-8 h-8 rounded-md font-bold text-xs flex items-center justify-center mx-auto transition-colors ${getStatusColor(status)}`}
                                                        >
                                                            {getStatusText(status)}
                                                        </button>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
