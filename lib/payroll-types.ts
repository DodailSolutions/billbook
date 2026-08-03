export interface Employee {
    id: string
    user_id: string
    employee_code: string
    name: string
    email?: string | null
    phone?: string | null
    designation?: string | null
    department?: string | null
    date_of_joining: string
    pan_number?: string | null
    bank_account_number?: string | null
    ifsc_code?: string | null
    status: 'active' | 'inactive' | 'terminated'
    created_at: string
    updated_at: string
    salary_structure?: SalaryStructure | null
}

export interface SalaryStructure {
    id?: string
    employee_id: string
    user_id?: string
    basic_salary: number
    hra: number
    conveyance: number
    special_allowance: number
    pf_deduction: number
    esi_deduction: number
    tds_deduction: number
    other_deduction: number
    gross_salary: number
    net_salary: number
}

export interface PayrollRun {
    id: string
    user_id: string
    month: number
    year: number
    total_employees: number
    total_gross: number
    total_deductions: number
    total_net_pay: number
    status: 'draft' | 'processed' | 'paid'
    journal_entry_id?: string | null
    processed_at: string
    created_at: string
    payslips?: Payslip[]
}

export interface Payslip {
    id: string
    payroll_run_id: string
    employee_id: string
    user_id: string
    month: number
    year: number
    basic_salary: number
    hra: number
    conveyance: number
    special_allowance: number
    gross_salary: number
    pf_deduction: number
    esi_deduction: number
    tds_deduction: number
    other_deduction: number
    total_deductions: number
    net_salary: number
    payment_status: 'pending' | 'paid'
    paid_at?: string | null
    created_at: string
    employee?: Employee
}

export interface CreateEmployeeInput {
    employee_code: string
    name: string
    email?: string
    phone?: string
    designation?: string
    department?: string
    date_of_joining: string
    pan_number?: string
    bank_account_number?: string
    ifsc_code?: string
    salary_structure?: {
        basic_salary: number
        hra: number
        conveyance: number
        special_allowance: number
        pf_deduction: number
        esi_deduction: number
        tds_deduction: number
        other_deduction: number
    }
}
