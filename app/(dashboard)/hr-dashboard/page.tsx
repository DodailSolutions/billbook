'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Users, 
    Calendar, 
    Clock, 
    Video, 
    Activity, 
    DollarSign, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    Camera, 
    Coffee, 
    ShieldCheck, 
    Sparkles, 
    Plus,
    FileText,
    CalendarOff,
    Building2,
    TrendingUp,
    Sliders,
    BookOpen,
    Save,
    Check,
    Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getEmployees } from '@/lib/payroll-actions'
import { getCctvCameras, getDailyMovementAudit, getPayrollShifts, EmployeeDailyAudit, CctvCamera, PayrollShift } from '@/lib/cctv-attendance-actions'
import { Employee } from '@/lib/payroll-types'

interface OrgPolicy {
    businessType: 'it_software' | 'digital_marketing' | 'retail_hospitality' | 'general'
    workModel: 'hybrid' | 'in_office' | 'remote_first'
    coreHours: string
    wfhDaysAllowed: number
    leaveNoticeDays: number
    overtimeMultiplier: string
    noticePeriodDays: number
    dressCode: string
    codeOfConduct: string
}

export default function HrDashboardPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [cameras, setCameras] = useState<CctvCamera[]>([])
    const [shifts, setShifts] = useState<PayrollShift[]>([])
    const [audits, setAudits] = useState<EmployeeDailyAudit[]>([])
    const [loading, setLoading] = useState(true)

    // Organization Rules & Guidelines State
    const [policyType, setPolicyType] = useState<'it_software' | 'digital_marketing' | 'retail_hospitality' | 'general'>('it_software')
    const [policy, setPolicy] = useState<OrgPolicy>({
        businessType: 'it_software',
        workModel: 'hybrid',
        coreHours: '10:00 AM - 7:00 PM (Flexible)',
        wfhDaysAllowed: 2,
        leaveNoticeDays: 3,
        overtimeMultiplier: '1.5x Base Rate',
        noticePeriodDays: 30,
        dressCode: 'Smart Casual (Business Formal for Client Pitches)',
        codeOfConduct: 'Confidentiality of client codebase, NDA compliance, respectful peer collaboration, and mandatory sprint retrospectives.'
    })
    const [policySaved, setPolicySaved] = useState(false)

    const todayStr = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })

    useEffect(() => {
        async function loadHrData() {
            setLoading(true)
            try {
                const [empData, camData, shiftData, auditData] = await Promise.all([
                    getEmployees(),
                    getCctvCameras(),
                    getPayrollShifts(),
                    getDailyMovementAudit()
                ])
                setEmployees(empData.filter(e => e.status === 'active'))
                setCameras(camData)
                setShifts(shiftData)
                setAudits(auditData)
            } catch (err) {
                console.error('Error loading HR dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        loadHrData()
    }, [])

    const handleApplyIndustryPreset = (preset: typeof policyType) => {
        setPolicyType(preset)
        if (preset === 'it_software') {
            setPolicy({
                businessType: 'it_software',
                workModel: 'hybrid',
                coreHours: '10:00 AM - 7:00 PM (Flexible)',
                wfhDaysAllowed: 2,
                leaveNoticeDays: 3,
                overtimeMultiplier: 'Compensatory Off (Comp-off)',
                noticePeriodDays: 30,
                dressCode: 'Smart Casual / Tech Casual',
                codeOfConduct: 'Strict IP assignment, zero local storage of proprietary source code, sprint reviews, and safe git workflow.'
            })
        } else if (preset === 'digital_marketing') {
            setPolicy({
                businessType: 'digital_marketing',
                workModel: 'hybrid',
                coreHours: '09:30 AM - 6:30 PM',
                wfhDaysAllowed: 1,
                leaveNoticeDays: 2,
                overtimeMultiplier: 'Performance Deal Bonus',
                noticePeriodDays: 30,
                dressCode: 'Creative Casual / Agency Chic',
                codeOfConduct: 'Confidentiality of client ad accounts, brand asset guidelines, and social media policy conformance.'
            })
        } else if (preset === 'retail_hospitality') {
            setPolicy({
                businessType: 'retail_hospitality',
                workModel: 'in_office',
                coreHours: 'Rotational 9-hr Shifts (Morning / Evening)',
                wfhDaysAllowed: 0,
                leaveNoticeDays: 7,
                overtimeMultiplier: '1.5x Hourly Wage',
                noticePeriodDays: 15,
                dressCode: 'Prescribed Store Uniform & Staff Badge',
                codeOfConduct: 'Customer hospitality excellence, 15-minute biometric check-in grace period, and cash drawer accountability.'
            })
        } else {
            setPolicy({
                businessType: 'general',
                workModel: 'in_office',
                coreHours: '09:00 AM - 6:00 PM',
                wfhDaysAllowed: 0,
                leaveNoticeDays: 3,
                overtimeMultiplier: 'Standard 1.0x',
                noticePeriodDays: 30,
                dressCode: 'Business Professional',
                codeOfConduct: 'Professional workplace decorum, data integrity, and compliance with statutory leave regulations.'
            })
        }
    }

    const handleSavePolicy = () => {
        setPolicySaved(true)
        setTimeout(() => setPolicySaved(false), 3000)
    }

    const activeEmployeesCount = employees.length
    const onPremiseCount = audits.filter(a => a.status === 'incomplete' || (a.first_in && !a.last_out)).length
    const fullDayPresentCount = audits.filter(a => a.status === 'present').length
    const lateArrivalsCount = audits.filter(a => a.is_late).length

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200">
                                HR & Operations Command Center
                            </span>
                            <span className="text-xs text-indigo-300">• {todayStr}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Workforce Governance & Policy Engine
                        </h1>
                        <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
                            Real-time attendance audits, payroll pipelines, organizational guidelines, and multi-vertical compliance.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/payroll/employees">
                            <Button className="bg-white text-indigo-950 hover:bg-indigo-50 font-semibold text-xs h-9">
                                <Users className="w-3.5 h-3.5 mr-1.5" /> Staff Directory ({activeEmployeesCount})
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Live Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Staff</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{activeEmployeesCount}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Enrolled profiles</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Premise Now</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{onPremiseCount}</p>
                            <p className="text-xs text-emerald-700 mt-0.5">Active inside premises</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{lateArrivalsCount}</p>
                            <p className="text-xs text-amber-700 mt-0.5">Beyond grace window</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Day Completed</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{fullDayPresentCount}</p>
                            <p className="text-xs text-slate-500 mt-0.5">&ge; 8.0 effective hours</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ORGANIZATION RULES, GUIDELINES & POLICY CENTER */}
            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                <span>Organization Rules, Guidelines & Policy Center</span>
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Configure workplace policies, WFH flexibility, leave notice rules, and decorum tailored by business type
                            </CardDescription>
                        </div>

                        {/* Industry Preset Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                            <button
                                type="button"
                                onClick={() => handleApplyIndustryPreset('it_software')}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                                    policyType === 'it_software' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                IT & Software
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApplyIndustryPreset('digital_marketing')}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                                    policyType === 'digital_marketing' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Digital Marketing
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApplyIndustryPreset('retail_hospitality')}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                                    policyType === 'retail_hospitality' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Retail & Hospitality
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Policy Form (2 cols) */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Working Model</label>
                                    <select
                                        value={policy.workModel}
                                        onChange={(e) => setPolicy({ ...policy, workModel: e.target.value as any })}
                                        className="w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-xs"
                                    >
                                        <option value="hybrid">Hybrid (Office + WFH)</option>
                                        <option value="in_office">100% In-Office Physical Presence</option>
                                        <option value="remote_first">Remote-First / Flexible</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Standard / Core Timings</label>
                                    <Input
                                        value={policy.coreHours}
                                        onChange={(e) => setPolicy({ ...policy, coreHours: e.target.value })}
                                        className="text-xs h-9"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">WFH Allowance (Days/Wk)</label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={5}
                                        value={policy.wfhDaysAllowed}
                                        onChange={(e) => setPolicy({ ...policy, wfhDaysAllowed: parseInt(e.target.value) || 0 })}
                                        className="text-xs h-9"
                                    />
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Leave Advance Notice (Days)</label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={30}
                                        value={policy.leaveNoticeDays}
                                        onChange={(e) => setPolicy({ ...policy, leaveNoticeDays: parseInt(e.target.value) || 0 })}
                                        className="text-xs h-9"
                                    />
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Notice Period on Exit (Days)</label>
                                    <Input
                                        type="number"
                                        value={policy.noticePeriodDays}
                                        onChange={(e) => setPolicy({ ...policy, noticePeriodDays: parseInt(e.target.value) || 0 })}
                                        className="text-xs h-9"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Overtime & Weekend Compensation</label>
                                <Input
                                    value={policy.overtimeMultiplier}
                                    onChange={(e) => setPolicy({ ...policy, overtimeMultiplier: e.target.value })}
                                    className="text-xs h-9"
                                    placeholder="e.g. 1.5x hourly rate or Comp-off"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Dress Code & Professional Decorum</label>
                                <Input
                                    value={policy.dressCode}
                                    onChange={(e) => setPolicy({ ...policy, dressCode: e.target.value })}
                                    className="text-xs h-9"
                                    placeholder="e.g. Smart casual, client meeting attire"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Code of Conduct & Confidentiality</label>
                                <textarea
                                    rows={2}
                                    value={policy.codeOfConduct}
                                    onChange={(e) => setPolicy({ ...policy, codeOfConduct: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Live Employee Handbook Preview (1 col) */}
                        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                                        Employee Handbook Sync
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        Live in Portal
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-white">Active Organizational Guidelines</h4>
                                <p className="text-[11px] text-slate-300 mt-1">
                                    Visible to all active employees on their dashboard self-service tab.
                                </p>
                            </div>

                            <div className="space-y-2.5 border-t border-slate-800 pt-3 text-xs">
                                <div className="flex justify-between text-slate-300">
                                    <span>Model:</span>
                                    <span className="font-semibold capitalize text-indigo-300">{policy.workModel.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Core Hours:</span>
                                    <span className="font-semibold text-white">{policy.coreHours}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>WFH Allowance:</span>
                                    <span className="font-semibold text-emerald-400">{policy.wfhDaysAllowed} days / week</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Leave Notice:</span>
                                    <span className="font-semibold text-white">{policy.leaveNoticeDays} days prior</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Overtime Policy:</span>
                                    <span className="font-semibold text-white">{policy.overtimeMultiplier}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    onClick={handleSavePolicy}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9"
                                >
                                    {policySaved ? (
                                        <span className="flex items-center gap-1.5">
                                            <Check className="w-4 h-4 text-emerald-300" /> Published to Employee Portal!
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            <Save className="w-4 h-4" /> Publish Guidelines to Portal
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick HR Navigation Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Touchless Biometrics Card */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                            <Camera className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Vision AI Camera Hub
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Manage office IP / CCTV cameras and live transit audit logs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/payroll/attendance/cctv" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-semibold text-slate-800">CCTV Stream Connector</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/attendance/movements" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-slate-800">Movements & Break Audit</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/settings/shifts" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs font-semibold text-slate-800">Shift Timings & Grace Rules</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Employee Lifecycle Card */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                            <Users className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Employee & Team Lifecycle
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Directory, face enrollment, salary structures, and role assignments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/payroll/employees" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-slate-800">Employee Directory & Faces</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/leaves" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarOff className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-semibold text-slate-800">Leave Approvals & Balances</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/team" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-slate-800">Team Roles & Member Invites</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Payroll & Compensation Card */}
                <Card className="border-slate-200 shadow-xs bg-white flex flex-col justify-between">
                    <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                            Payroll & Compensation
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Automated LOP deduction, statutory PF/ESI, and payslip generation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Link href="/payroll/run" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-slate-800">Run Monthly Payroll</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/payslips" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-slate-800">Payslip PDF Archive</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                        <Link href="/payroll/attendance" className="block p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-semibold text-slate-800">Monthly Attendance Grid</span>
                                </div>
                                <span className="text-xs text-slate-400">→</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
