'use server'

import { createClient } from "@/lib/supabase/server"
import { Employee, SalaryStructure, PayrollRun, Payslip, CreateEmployeeInput, UpdateEmployeeInput, AttendanceRecord, LeaveType, LeaveRequest, EmployeeLeaveBalance, SalaryRevision } from "./payroll-types"
import { postPayrollJournalEntry } from "./bookkeeping-actions"
import { revalidatePath } from "next/cache"
import fs from 'fs'
import path from 'path'

function calculateStatutoryDeductions(basicSalary: number, grossSalary: number) {
    const pfBase = Math.min(basicSalary, 15000)
    const pf = Math.round(pfBase * 0.12)
    const esi = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0
    let professionalTax = 0
    if (grossSalary > 20000) professionalTax = 200
    else if (grossSalary > 15000) professionalTax = 150
    return { pf, esi, professionalTax }
}

function calculateWorkingDays(month: number, year: number): number {
    const daysInMonth = new Date(year, month, 0).getDate()
    let workingDays = 0
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d)
        if (date.getDay() !== 0 && date.getDay() !== 6) {
            workingDays++
        }
    }
    return workingDays
}

export async function getEmployees(): Promise<Employee[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: employees, error } = await supabase
        .from('employees')
        .select(`
            *,
            salary_structure:salary_structures(*)
        `)
        .eq('user_id', user.id)
        .order('employee_code', { ascending: true })

    if (error) {
        console.error('Error fetching employees:', error)
        return []
    }

    return (employees || []).map(emp => ({
        ...emp,
        salary_structure: Array.isArray(emp.salary_structure) ? emp.salary_structure[0] : emp.salary_structure
    }))
}

export async function getEmployee(id: string): Promise<Employee | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('employees')
        .select(`
            *,
            salary_structure:salary_structures(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !data) return null
    return {
        ...data,
        salary_structure: Array.isArray(data.salary_structure) ? data.salary_structure[0] : data.salary_structure
    } as Employee
}

export async function createEmployee(input: CreateEmployeeInput): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: emp, error: empError } = await supabase
        .from('employees')
        .insert({
            user_id: user.id,
            employee_code: input.employee_code,
            name: input.name,
            email: input.email || null,
            phone: input.phone || null,
            designation: input.designation || null,
            department: input.department || null,
            date_of_joining: input.date_of_joining,
            pan_number: input.pan_number || null,
            bank_account_number: input.bank_account_number || null,
            ifsc_code: input.ifsc_code || null,
            status: 'active'
        })
        .select()
        .single()

    if (empError || !emp) {
        console.error('Employee insert error:', empError)
        return { success: false, error: empError?.message || 'Failed to create employee' }
    }

    if (input.salary_structure) {
        const sal = input.salary_structure
        const gross = (sal.basic_salary || 0) + (sal.hra || 0) + (sal.conveyance || 0) + (sal.special_allowance || 0) + (sal.medical_allowance || 0) + (sal.travel_allowance || 0)
        const deductions = (sal.pf_deduction || 0) + (sal.esi_deduction || 0) + (sal.tds_deduction || 0) + (sal.other_deduction || 0)
        const net = gross - deductions

        await supabase
            .from('salary_structures')
            .insert({
                employee_id: emp.id,
                user_id: user.id,
                basic_salary: sal.basic_salary || 0,
                hra: sal.hra || 0,
                conveyance: sal.conveyance || 0,
                special_allowance: sal.special_allowance || 0,
                medical_allowance: sal.medical_allowance || 0,
                travel_allowance: sal.travel_allowance || 0,
                pf_deduction: sal.pf_deduction || 0,
                esi_deduction: sal.esi_deduction || 0,
                tds_deduction: sal.tds_deduction || 0,
                other_deduction: sal.other_deduction || 0,
                gross_salary: gross,
                net_salary: net
            })
    }

    revalidatePath('/payroll')
    return { success: true, id: emp.id }
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const updateData: any = {
        employee_code: input.employee_code,
        name: input.name,
    }
    if (input.email !== undefined) updateData.email = input.email || null
    if (input.phone !== undefined) updateData.phone = input.phone || null
    if (input.designation !== undefined) updateData.designation = input.designation || null
    if (input.department !== undefined) updateData.department = input.department || null
    if (input.date_of_joining !== undefined) updateData.date_of_joining = input.date_of_joining
    if (input.pan_number !== undefined) updateData.pan_number = input.pan_number || null
    if (input.bank_account_number !== undefined) updateData.bank_account_number = input.bank_account_number || null
    if (input.ifsc_code !== undefined) updateData.ifsc_code = input.ifsc_code || null
    if (input.status !== undefined) updateData.status = input.status

    const { error: empError } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

    if (empError) {
        return { success: false, error: empError.message }
    }

    if (input.salary_structure) {
        const sal = input.salary_structure
        const gross = (sal.basic_salary || 0) + (sal.hra || 0) + (sal.conveyance || 0) + (sal.special_allowance || 0) + (sal.medical_allowance || 0) + (sal.travel_allowance || 0)
        const deductions = (sal.pf_deduction || 0) + (sal.esi_deduction || 0) + (sal.tds_deduction || 0) + (sal.other_deduction || 0)
        const net = gross - deductions

        const { data: existingSal } = await supabase
            .from('salary_structures')
            .select('id')
            .eq('employee_id', id)
            .single()

        const salData = {
            basic_salary: sal.basic_salary || 0,
            hra: sal.hra || 0,
            conveyance: sal.conveyance || 0,
            special_allowance: sal.special_allowance || 0,
            medical_allowance: sal.medical_allowance || 0,
            travel_allowance: sal.travel_allowance || 0,
            pf_deduction: sal.pf_deduction || 0,
            esi_deduction: sal.esi_deduction || 0,
            tds_deduction: sal.tds_deduction || 0,
            other_deduction: sal.other_deduction || 0,
            gross_salary: gross,
            net_salary: net
        }

        if (existingSal) {
            await supabase.from('salary_structures').update(salData).eq('id', existingSal.id)
        } else {
            await supabase.from('salary_structures').insert({ employee_id: id, user_id: user.id, ...salData })
        }
    }

    revalidatePath('/payroll')
    revalidatePath(`/payroll/employees/${id}`)
    return { success: true }
}

export async function updateEmployeeStatus(id: string, status: 'active' | 'inactive' | 'terminated'): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase.from('employees').update({ status }).eq('id', id).eq('user_id', user.id)
    if (error) return { success: false, error: error.message }
    
    revalidatePath('/payroll')
    return { success: true }
}

export async function markAttendance(records: Partial<AttendanceRecord>[]): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const toUpsert = records.map(r => ({
        ...r,
        user_id: user.id
    }))

    const { error } = await supabase
        .from('attendance_records')
        .upsert(toUpsert, { onConflict: 'employee_id,attendance_date,user_id' })

    if (error) return { success: false, error: error.message }
    revalidatePath('/payroll/attendance')
    return { success: true }
}

export async function getMonthlyAttendance(month: number, year: number): Promise<AttendanceRecord[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`

    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate)

    if (error) return []
    return data as AttendanceRecord[]
}

export async function getLeaveTypes(): Promise<LeaveType[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    let { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('user_id', user.id)

    if (!data || data.length === 0) {
        // Auto-init defaults
        const defaults = [
            { user_id: user.id, name: 'Casual Leave', code: 'CL', annual_quota: 12, is_paid: true, is_active: true },
            { user_id: user.id, name: 'Sick Leave', code: 'SL', annual_quota: 12, is_paid: true, is_active: true },
            { user_id: user.id, name: 'Privilege Leave', code: 'PL', annual_quota: 15, is_paid: true, is_active: true }
        ]
        const { data: inserted } = await supabase.from('leave_types').insert(defaults).select()
        if (inserted) return inserted as LeaveType[]
    }

    return (data || []) as LeaveType[]
}

export async function applyLeave(data: Partial<LeaveRequest>): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase.from('leave_requests').insert({ ...data, user_id: user.id, status: 'pending' })
    if (error) return { success: false, error: error.message }
    revalidatePath('/payroll/leaves')
    return { success: true }
}

export async function approveLeave(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: leave, error: getErr } = await supabase.from('leave_requests').select('*').eq('id', id).single()
    if (getErr || !leave) return { success: false, error: 'Leave not found' }

    const { error: updErr } = await supabase.from('leave_requests').update({
        status: 'approved',
        approved_at: new Date().toISOString()
    }).eq('id', id).eq('user_id', user.id)

    if (updErr) return { success: false, error: updErr.message }

    // Optional: Deduct balance, mark attendance...
    
    revalidatePath('/payroll/leaves')
    return { success: true }
}

export async function rejectLeave(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase.from('leave_requests').update({
        status: 'rejected',
        rejection_reason: reason
    }).eq('id', id).eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/payroll/leaves')
    return { success: true }
}

export async function getLeaveRequests(status?: string): Promise<LeaveRequest[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    let q = supabase.from('leave_requests').select(`*, employee:employees(*), leave_type:leave_types(*)`).eq('user_id', user.id).order('created_at', { ascending: false })
    if (status) q = q.eq('status', status)
    
    const { data } = await q
    return (data || []) as LeaveRequest[]
}

export async function getLeaveBalances(employeeId: string, year: number): Promise<EmployeeLeaveBalance[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    let { data } = await supabase.from('employee_leave_balances').select('*, leave_type:leave_types(*)').eq('employee_id', employeeId).eq('year', year).eq('user_id', user.id)
    if (!data || data.length === 0) {
        // Auto-init
        const types = await getLeaveTypes()
        const balances = types.map(t => ({
            user_id: user.id,
            employee_id: employeeId,
            leave_type_id: t.id,
            year: year,
            total_quota: t.annual_quota,
            used: 0,
            remaining: t.annual_quota
        }))
        const { data: ins } = await supabase.from('employee_leave_balances').insert(balances).select('*, leave_type:leave_types(*)')
        return (ins || []) as EmployeeLeaveBalance[]
    }
    return data as EmployeeLeaveBalance[]
}

export async function getAllLeaveBalances(year: number): Promise<EmployeeLeaveBalance[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase.from('employee_leave_balances').select('*, leave_type:leave_types(*)').eq('year', year).eq('user_id', user.id)
    return (data || []) as EmployeeLeaveBalance[]
}

export async function recordSalaryRevision(employeeId: string, newStructure: any, reason: string, effectiveDate: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: existingSal } = await supabase.from('salary_structures').select('*').eq('employee_id', employeeId).single()
    if (!existingSal) return { success: false, error: 'No existing structure' }

    const revision = {
        user_id: user.id,
        employee_id: employeeId,
        effective_date: effectiveDate,
        reason: reason,
        old_basic_salary: existingSal.basic_salary,
        new_basic_salary: newStructure.basic_salary || 0,
        old_hra: existingSal.hra,
        new_hra: newStructure.hra || 0,
        old_conveyance: existingSal.conveyance,
        new_conveyance: newStructure.conveyance || 0,
        old_special_allowance: existingSal.special_allowance,
        new_special_allowance: newStructure.special_allowance || 0,
        old_medical_allowance: existingSal.medical_allowance,
        new_medical_allowance: newStructure.medical_allowance || 0,
        old_travel_allowance: existingSal.travel_allowance,
        new_travel_allowance: newStructure.travel_allowance || 0,
        old_gross_salary: existingSal.gross_salary,
        new_gross_salary: newStructure.gross_salary,
        old_net_salary: existingSal.net_salary,
        new_net_salary: newStructure.net_salary,
        revised_by: user.id
    }

    await supabase.from('salary_revisions').insert(revision)
    await supabase.from('salary_structures').update(newStructure).eq('id', existingSal.id)

    return { success: true }
}

export async function getSalaryRevisions(employeeId: string): Promise<SalaryRevision[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase.from('salary_revisions').select('*').eq('employee_id', employeeId).eq('user_id', user.id).order('created_at', { ascending: false })
    return (data || []) as SalaryRevision[]
}

export async function processPayrollRun(month: number, year: number): Promise<{ success: boolean; runId?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: existing } = await supabase
        .from('payroll_runs')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (existing) {
        return { success: false, error: `Payroll for month ${month}/${year} has already been processed.` }
    }

    const employees = await getEmployees()
    const activeEmployees = employees.filter(e => e.status === 'active' && e.salary_structure)

    if (activeEmployees.length === 0) {
        return { success: false, error: 'No active employees with configured salary structures found.' }
    }

    const workingDays = calculateWorkingDays(month, year)
    const attendance = await getMonthlyAttendance(month, year)

    let totalGross = 0
    let totalDeductions = 0
    let totalNetPay = 0

    const payslipEntries = activeEmployees.map(emp => {
        const sal = emp.salary_structure!
        
        const empAttendance = attendance.filter(a => a.employee_id === emp.id)
        let daysPresent = 0
        empAttendance.forEach(a => {
            if (a.status === 'present' || a.status === 'holiday' || a.status === 'leave') daysPresent += 1
            if (a.status === 'half_day') daysPresent += 0.5
        })

        const lopDays = Math.max(0, workingDays - daysPresent)
        const prorationFactor = workingDays > 0 ? Math.max(0, (workingDays - lopDays) / workingDays) : 1

        const basic = Number(sal.basic_salary || 0) * prorationFactor
        const hra = Number(sal.hra || 0) * prorationFactor
        const conveyance = Number(sal.conveyance || 0) * prorationFactor
        const special = Number(sal.special_allowance || 0) * prorationFactor
        const medical = Number(sal.medical_allowance || 0) * prorationFactor
        const travel = Number(sal.travel_allowance || 0) * prorationFactor
        
        const gross = basic + hra + conveyance + special + medical + travel
        
        const statutory = calculateStatutoryDeductions(basic, gross)
        const pf = statutory.pf
        const esi = statutory.esi
        const pt = statutory.professionalTax
        
        const tds = Number(sal.tds_deduction || 0)
        const other = Number(sal.other_deduction || 0)

        const deductions = pf + esi + pt + tds + other
        const net = gross - deductions

        totalGross += gross
        totalDeductions += deductions
        totalNetPay += net

        return {
            employee_id: emp.id,
            user_id: user.id,
            month,
            year,
            working_days: workingDays,
            days_present: daysPresent,
            lop_days: lopDays,
            basic_salary: basic,
            hra,
            conveyance,
            special_allowance: special,
            medical_allowance: medical,
            travel_allowance: travel,
            gross_salary: gross,
            pf_deduction: pf,
            esi_deduction: esi,
            professional_tax: pt,
            tds_deduction: tds,
            other_deduction: other,
            total_deductions: deductions,
            net_salary: net,
            payment_status: 'paid',
            paid_at: new Date().toISOString().slice(0, 10)
        }
    })

    const journalRes = await postPayrollJournalEntry('', month, year, totalGross, totalDeductions, totalNetPay)

    const { data: run, error: runError } = await supabase
        .from('payroll_runs')
        .insert({
            user_id: user.id,
            month,
            year,
            total_employees: activeEmployees.length,
            total_gross: totalGross,
            total_deductions: totalDeductions,
            total_net_pay: totalNetPay,
            status: 'processed',
            journal_entry_id: journalRes.entryId || null
        })
        .select()
        .single()

    if (runError || !run) {
        return { success: false, error: runError?.message || 'Failed to process payroll run' }
    }

    const payslipsToInsert = payslipEntries.map(p => ({
        payroll_run_id: run.id,
        ...p
    }))

    await supabase.from('payslips').insert(payslipsToInsert)

    revalidatePath('/payroll')
    revalidatePath('/bookkeeping')
    return { success: true, runId: run.id }
}

export async function getPayrollRuns(): Promise<PayrollRun[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('payroll_runs')
        .select(`
            *,
            payslips:payslips(*, employee:employees(*))
        `)
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

    if (error) {
        console.error('Error fetching payroll runs:', error)
        return []
    }

    return (data || []) as PayrollRun[]
}

export async function getPayslip(id: string): Promise<Payslip | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('payslips')
        .select(`
            *,
            employee:employees(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !data) return null
    return data as Payslip
}

export async function checkMigrationStatus(): Promise<{ migrationRequired: boolean; sql: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { migrationRequired: false, sql: '' }

    try {
        const { error } = await supabase.from('attendance_records').select('id').limit(1)
        if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
            const sqlPath = path.join(process.cwd(), 'supabase-erp-upgrade-migration.sql')
            const sql = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf8') : ''
            return { migrationRequired: true, sql }
        }
        return { migrationRequired: false, sql: '' }
    } catch (e) {
        return { migrationRequired: false, sql: '' }
    }
}
