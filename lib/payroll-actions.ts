'use server'

import { createClient } from "@/lib/supabase/server"
import { Employee, SalaryStructure, PayrollRun, Payslip, CreateEmployeeInput } from "./payroll-types"
import { postPayrollJournalEntry } from "./bookkeeping-actions"
import { revalidatePath } from "next/cache"

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
        const gross = (sal.basic_salary || 0) + (sal.hra || 0) + (sal.conveyance || 0) + (sal.special_allowance || 0)
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

export async function processPayrollRun(month: number, year: number): Promise<{ success: boolean; runId?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check if payroll run already exists for this month/year
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

    let totalGross = 0
    let totalDeductions = 0
    let totalNetPay = 0

    const payslipEntries = activeEmployees.map(emp => {
        const sal = emp.salary_structure!
        const basic = Number(sal.basic_salary || 0)
        const hra = Number(sal.hra || 0)
        const conveyance = Number(sal.conveyance || 0)
        const special = Number(sal.special_allowance || 0)
        const pf = Number(sal.pf_deduction || 0)
        const esi = Number(sal.esi_deduction || 0)
        const tds = Number(sal.tds_deduction || 0)
        const other = Number(sal.other_deduction || 0)

        const gross = basic + hra + conveyance + special
        const deductions = pf + esi + tds + other
        const net = gross - deductions

        totalGross += gross
        totalDeductions += deductions
        totalNetPay += net

        return {
            employee_id: emp.id,
            user_id: user.id,
            month,
            year,
            basic_salary: basic,
            hra,
            conveyance,
            special_allowance: special,
            gross_salary: gross,
            pf_deduction: pf,
            esi_deduction: esi,
            tds_deduction: tds,
            other_deduction: other,
            total_deductions: deductions,
            net_salary: net,
            payment_status: 'paid',
            paid_at: new Date().toISOString().slice(0, 10)
        }
    })

    // Post automatic multi-line journal entry in Bookkeeping ledger
    const journalRes = await postPayrollJournalEntry('', month, year, totalGross, totalDeductions, totalNetPay)

    // Insert Payroll Run
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
        console.error('Payroll Run Insert Error:', runError)
        return { success: false, error: runError?.message || 'Failed to process payroll run' }
    }

    // Insert Payslips
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
