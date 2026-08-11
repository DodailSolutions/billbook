'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getEmployees, createEmployee, updateEmployee } from '@/lib/payroll-actions'
import { Employee } from '@/lib/payroll-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowLeft, UserPlus, Users, DollarSign, Building2, Search, Sparkles, User, Edit, FileText } from 'lucide-react'
import { MigrationBanner } from '@/components/MigrationBanner'

export default function EmployeeDirectoryPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'terminated'>('all')
    const [deptFilter, setDeptFilter] = useState<string>('all')

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form fields
    const [editMode, setEditMode] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [employeeCode, setEmployeeCode] = useState('')
    const [designation, setDesignation] = useState('')
    const [department, setDepartment] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().slice(0, 10))
    const [panNumber, setPanNumber] = useState('')
    const [bankName, setBankName] = useState('')
    const [bankAccountNumber, setBankAccountNumber] = useState('')
    const [ifscCode, setIfscCode] = useState('')
    const [bankBranch, setBankBranch] = useState('')
    const [status, setStatus] = useState<'active' | 'inactive' | 'terminated'>('active')

    // Login credentials
    const [allowLogin, setAllowLogin] = useState(false)
    const [password, setPassword] = useState('')

    // Salary fields
    const [basic, setBasic] = useState('')
    const [hra, setHra] = useState('')
    const [conveyance, setConveyance] = useState('')
    const [special, setSpecial] = useState('')
    const [medical, setMedical] = useState('')
    const [travel, setTravel] = useState('')
    const [pf, setPf] = useState('')
    const [esi, setEsi] = useState('')
    const [tds, setTds] = useState('')

    const fetchEmp = async () => {
        setLoading(true)
        const data = await getEmployees()
        setEmployees(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchEmp()
    }, [])

    const openAddModal = () => {
        setEditMode(null)
        setName('')
        setEmployeeCode(`EMP-${Date.now().toString().slice(-6)}`)
        setDesignation('')
        setDepartment('')
        setEmail('')
        setPhone('')
        setAddress('')
        setDateOfJoining(new Date().toISOString().slice(0, 10))
        setPanNumber('')
        setBankName('')
        setBankAccountNumber('')
        setIfscCode('')
        setBankBranch('')
        setStatus('active')
        setAllowLogin(false)
        setPassword('')
        setBasic('')
        setHra('')
        setConveyance('')
        setSpecial('')
        setMedical('')
        setTravel('')
        setPf('')
        setEsi('')
        setTds('')
        setError(null)
        setIsAddModalOpen(true)
    }

    const openEditModal = (emp: Employee) => {
        setEditMode(emp.id)
        setName(emp.name)
        setEmployeeCode(emp.employee_code)
        setDesignation(emp.designation || '')
        setDepartment(emp.department || '')
        setEmail(emp.email || '')
        setPhone(emp.phone || '')
        setAddress(emp.address || '')
        setDateOfJoining(emp.date_of_joining ? new Date(emp.date_of_joining).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
        setPanNumber(emp.pan_number || '')
        setBankName(emp.bank_name || '')
        setBankAccountNumber(emp.bank_account_number || '')
        setIfscCode(emp.ifsc_code || '')
        setBankBranch(emp.bank_branch || '')
        setStatus(emp.status as any)
        setAllowLogin(!!emp.employee_user_id)
        setPassword('')

        const sal = emp.salary_structure
        if (sal) {
            setBasic(sal.basic_salary.toString())
            setHra(sal.hra.toString())
            setConveyance(sal.conveyance.toString())
            setSpecial(sal.special_allowance.toString())
            setMedical(sal.medical_allowance ? sal.medical_allowance.toString() : '')
            setTravel(sal.travel_allowance ? sal.travel_allowance.toString() : '')
            setPf(sal.pf_deduction.toString())
            setEsi(sal.esi_deduction.toString())
            setTds(sal.tds_deduction.toString())
        } else {
            setBasic('')
            setHra('')
            setConveyance('')
            setSpecial('')
            setMedical('')
            setTravel('')
            setPf('')
            setEsi('')
            setTds('')
        }
        setError(null)
        setIsAddModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !employeeCode.trim()) {
            setError('Please enter name and employee code.')
            return
        }

        setFormLoading(true)
        setError(null)

        const salData = basic ? {
            basic_salary: Number(basic),
            hra: Number(hra) || 0,
            conveyance: Number(conveyance) || 0,
            special_allowance: Number(special) || 0,
            medical_allowance: Number(medical) || 0,
            travel_allowance: Number(travel) || 0,
            pf_deduction: Number(pf) || 0,
            esi_deduction: Number(esi) || 0,
            tds_deduction: Number(tds) || 0,
        } : undefined

        const baseData = {
            name,
            employee_code: employeeCode,
            designation: designation || undefined,
            department: department || undefined,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            date_of_joining: dateOfJoining,
            pan_number: panNumber || undefined,
            bank_name: bankName || undefined,
            bank_account_number: bankAccountNumber || undefined,
            ifsc_code: ifscCode || undefined,
            bank_branch: bankBranch || undefined,
            salary_structure: salData,
            allow_login: allowLogin,
            password: allowLogin ? password : undefined
        }

        let res;
        if (editMode) {
            res = await updateEmployee(editMode, { ...baseData, status })
        } else {
            res = await createEmployee(baseData)
        }

        setFormLoading(false)
        if (res.success) {
            setIsAddModalOpen(false)
            fetchEmp()
        } else {
            setError(res.error || 'Failed to save employee.')
        }
    }

    const filtered = employees.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.employee_code.toLowerCase().includes(search.toLowerCase()) ||
            (e.designation && e.designation.toLowerCase().includes(search.toLowerCase()))
        
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter
        const matchesDept = deptFilter === 'all' || e.department === deptFilter

        return matchesSearch && matchesStatus && matchesDept
    })

    const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[]

    const grossPreview = (Number(basic) || 0) + (Number(hra) || 0) + (Number(conveyance) || 0) + (Number(special) || 0) + (Number(medical) || 0) + (Number(travel) || 0)
    const deductionsPreview = (Number(pf) || 0) + (Number(esi) || 0) + (Number(tds) || 0)
    const netPreview = grossPreview - deductionsPreview

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <MigrationBanner />
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

                <Button onClick={openAddModal} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px]">
                    <UserPlus className="h-4 w-4" /> Add Employee
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by code, name, designation..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl min-h-[44px]"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="p-2.5 text-xs border border-gray-200 rounded-xl min-h-[44px]"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                </select>
                <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="p-2.5 text-xs border border-gray-200 rounded-xl min-h-[44px]"
                >
                    <option value="all">All Departments</option>
                    {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
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
                    <p className="text-xs text-gray-500 mt-1">Adjust filters or add a new employee profile.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(emp => {
                        const sal = emp.salary_structure
                        return (
                            <Card key={emp.id} className="border-gray-100 shadow-2xs hover:border-emerald-200 transition-all group">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                                    {emp.employee_code}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {emp.status}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-base">{emp.name}</h4>
                                            <p className="text-xs text-gray-500">{emp.designation || 'Staff'} {emp.department ? `· ${emp.department}` : ''}</p>
                                        </div>
                                    </div>

                                    {sal ? (
                                        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Gross Monthly Salary:</span>
                                                <span className="font-semibold">₹{Number(sal.gross_salary).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Deductions:</span>
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

                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                        <Link href={`/payroll/employees/${emp.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                                                <User className="h-3 w-3" /> View Profile
                                            </Button>
                                        </Link>
                                        <Button variant="outline" size="sm" onClick={() => openEditModal(emp)} className="flex-1 text-xs gap-1.5 h-8">
                                            <Edit className="h-3 w-3" /> Edit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100">
                        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                <h3 className="font-bold text-base">{editMode ? 'Edit Employee Profile' : 'Add New Employee Profile'}</h3>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {error && (
                                <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Basic Profile */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Basic Info</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Employee Code *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="EMP-001"
                                            value={employeeCode}
                                            onChange={(e) => setEmployeeCode(e.target.value)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
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
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as any)}
                                            className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="terminated">Terminated</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Designation</label>
                                        <input
                                            type="text"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Department</label>
                                        <input
                                            type="text"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full p-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Login Credentials */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <input 
                                        type="checkbox" 
                                        id="allowLogin" 
                                        checked={allowLogin} 
                                        onChange={(e) => setAllowLogin(e.target.checked)} 
                                        disabled={!!editMode && !!employees.find(e => e.id === editMode)?.employee_user_id}
                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4" 
                                    />
                                    <label htmlFor="allowLogin" className="text-xs font-bold text-gray-750 uppercase tracking-wider cursor-pointer select-none">
                                        Enable Employee Login Dashboard
                                    </label>
                                </div>
                                {allowLogin && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Email * (Username)</label>
                                            <input 
                                                type="email" 
                                                required={allowLogin}
                                                placeholder="employee@business.com" 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                                disabled={!!editMode && !!employees.find(e => e.id === editMode)?.employee_user_id}
                                                className="w-full p-2 border border-gray-200 rounded-lg" 
                                            />
                                        </div>
                                        {(!editMode || !employees.find(e => e.id === editMode)?.employee_user_id) && (
                                            <div>
                                                <label className="block font-semibold text-gray-600 mb-1">Password *</label>
                                                <input 
                                                    type="password" 
                                                    required={allowLogin && (!editMode || !employees.find(e => e.id === editMode)?.employee_user_id)}
                                                    placeholder="Minimum 6 characters" 
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)} 
                                                    className="w-full p-2 border border-gray-200 rounded-lg" 
                                                />
                                            </div>
                                        )}
                                        {editMode && employees.find(e => e.id === editMode)?.employee_user_id && (
                                            <div className="sm:col-span-2 p-2 bg-slate-50 text-slate-650 rounded-lg text-[10px]">
                                                ✓ Employee already has login credentials configured. Email cannot be edited here.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Salary Components */}
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Monthly Salary Structure</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Basic Salary (₹)</label>
                                        <input type="number" value={basic} onChange={(e) => setBasic(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">HRA (₹)</label>
                                        <input type="number" value={hra} onChange={(e) => setHra(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Conveyance (₹)</label>
                                        <input type="number" value={conveyance} onChange={(e) => setConveyance(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Special (₹)</label>
                                        <input type="number" value={special} onChange={(e) => setSpecial(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Medical (₹)</label>
                                        <input type="number" value={medical} onChange={(e) => setMedical(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">Travel (₹)</label>
                                        <input type="number" value={travel} onChange={(e) => setTravel(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">PF Deduction (₹)</label>
                                        <input type="number" value={pf} onChange={(e) => setPf(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">ESI Deduction (₹)</label>
                                        <input type="number" value={esi} onChange={(e) => setEsi(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-600 mb-1">TDS Tax (₹)</label>
                                        <input type="number" value={tds} onChange={(e) => setTds(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg" />
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
