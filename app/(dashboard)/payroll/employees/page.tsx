'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getEmployees, createEmployee } from '@/lib/payroll-actions'
import { Employee } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, UserPlus, Users, DollarSign, Building2, Search, Sparkles } from 'lucide-react'

export default function EmployeeDirectoryPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Form state
    const [empCode, setEmpCode] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [designation, setDesignation] = useState('')
    const [department, setDepartment] = useState('')
    const [doj, setDoj] = useState(new Date().toISOString().slice(0, 10))
    const [pan, setPan] = useState('')
    const [bankAcc, setBankAcc] = useState('')
    const [ifsc, setIfsc] = useState('')

    // Salary Structure
    const [basic, setBasic] = useState<number>(30000)
    const [hra, setHra] = useState<number>(12000)
    const [conveyance, setConveyance] = useState<number>(2000)
    const [special, setSpecial] = useState<number>(6000)
    const [pf, setPf] = useState<number>(1800)
    const [esi, setEsi] = useState<number>(0)
    const [tds, setTds] = useState<number>(1000)

    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEmp = async () => {
        setLoading(true)
        const data = await getEmployees()
        setEmployees(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchEmp()
    }, [])

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !empCode.trim()) {
            setError('Employee Name and Employee Code are required.')
            return
        }

        setFormLoading(true)
        setError(null)

        const res = await createEmployee({
            employee_code: empCode,
            name,
            email: email || undefined,
            phone: phone || undefined,
            designation: designation || undefined,
            department: department || undefined,
            date_of_joining: doj,
            pan_number: pan || undefined,
            bank_account_number: bankAcc || undefined,
            ifsc_code: ifsc || undefined,
            salary_structure: {
                basic_salary: Number(basic || 0),
                hra: Number(hra || 0),
                conveyance: Number(conveyance || 0),
                special_allowance: Number(special || 0),
                pf_deduction: Number(pf || 0),
                esi_deduction: Number(esi || 0),
                tds_deduction: Number(tds || 0),
                other_deduction: 0
            }
        })

        setFormLoading(false)
        if (res.success) {
            setIsAddModalOpen(false)
            fetchEmp()
        } else {
            setError(res.error || 'Failed to add employee.')
        }
    }

    const filtered = employees.filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.employee_code.toLowerCase().includes(search.toLowerCase()) ||
        (e.designation && e.designation.toLowerCase().includes(search.toLowerCase()))
    )

    const grossPreview = (Number(basic) || 0) + (Number(hra) || 0) + (Number(conveyance) || 0) + (Number(special) || 0)
    const deductionsPreview = (Number(pf) || 0) + (Number(esi) || 0) + (Number(tds) || 0)
    const netPreview = grossPreview - deductionsPreview

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/payroll">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Employee Directory
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Manage employee profiles and monthly salary structures.
                        </p>
                    </div>
                </div>

                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px]">
                    <UserPlus className="h-4 w-4" /> Add Employee
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by code, name, designation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl min-h-[44px]"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900 text-sm">No Employees Found</h3>
                    <p className="text-xs text-gray-500 mt-1">Add employee profiles to enable monthly salary calculation.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(emp => {
                        const sal = emp.salary_structure
                        return (
                            <Card key={emp.id} className="border-gray-100 shadow-2xs hover:border-emerald-200 transition-all">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                                {emp.employee_code}
                                            </span>
                                            <h4 className="font-bold text-gray-900 text-base mt-1">{emp.name}</h4>
                                            <p className="text-xs text-gray-500">{emp.designation || 'Staff'} {emp.department ? `· ${emp.department}` : ''}</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                                            {emp.status}
                                        </span>
                                    </div>

                                    {sal ? (
                                        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Gross Monthly Salary:</span>
                                                <span className="font-semibold">₹{Number(sal.gross_salary).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Deductions (PF/TDS):</span>
                                                <span className="font-semibold text-rose-600">-₹{Number(sal.gross_salary - sal.net_salary).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-700 font-bold border-t border-gray-200 pt-1">
                                                <span>Net Monthly Pay:</span>
                                                <span>₹{Number(sal.net_salary).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-amber-600 font-medium">No salary structure configured.</p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Add Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
                        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                <h3 className="font-bold text-base">Add New Employee Profile</h3>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {error && (
                                <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Basic Profile */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Basic Info</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Employee Code *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="EMP-001"
                                            value={empCode}
                                            onChange={(e) => setEmpCode(e.target.value)}
                                            className="w-full p-2.5 border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full p-2.5 border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Designation</label>
                                        <input
                                            type="text"
                                            placeholder="Software Engineer"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            className="w-full p-2.5 border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Department</label>
                                        <input
                                            type="text"
                                            placeholder="Engineering"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full p-2.5 border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Salary Components */}
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Monthly Salary Structure</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Basic Salary (₹)</label>
                                        <input
                                            type="number"
                                            value={basic}
                                            onChange={(e) => setBasic(parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">HRA (₹)</label>
                                        <input
                                            type="number"
                                            value={hra}
                                            onChange={(e) => setHra(parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Conveyance (₹)</label>
                                        <input
                                            type="number"
                                            value={conveyance}
                                            onChange={(e) => setConveyance(parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Special (₹)</label>
                                        <input
                                            type="number"
                                            value={special}
                                            onChange={(e) => setSpecial(parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">PF Deduction (₹)</label>
                                        <input
                                            type="number"
                                            value={pf}
                                            onChange={(e) => setPf(parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">ESI Deduction (₹)</label>
                                        <input
                                            type="number"
                                            value={esi}
                                            onChange={(e) => setEsi(parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">TDS Tax (₹)</label>
                                        <input
                                            type="number"
                                            value={tds}
                                            onChange={(e) => setTds(parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div className="mt-3 p-3 bg-emerald-50 rounded-xl text-xs space-y-1 font-semibold">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Gross Monthly Pay:</span>
                                        <span>₹{grossPreview.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-rose-600">
                                        <span>Total Deductions:</span>
                                        <span>-₹{deductionsPreview.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-800 text-sm font-bold border-t border-emerald-200 pt-1">
                                        <span>Net Payout:</span>
                                        <span>₹{netPreview.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={formLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {formLoading ? 'Saving...' : 'Save Employee Profile'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
