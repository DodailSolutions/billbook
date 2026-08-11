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
    bank_name?: string | null
    bank_branch?: string | null
    address?: string | null
    status: 'active' | 'inactive' | 'terminated'
    employee_user_id?: string | null
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
    medical_allowance?: number
    travel_allowance?: number
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
    working_days?: number
    days_present?: number
    lop_days?: number
    basic_salary: number
    hra: number
    conveyance: number
    special_allowance: number
    medical_allowance?: number
    travel_allowance?: number
    overtime_pay?: number
    bonus?: number
    gross_salary: number
    pf_deduction: number
    esi_deduction: number
    tds_deduction: number
    professional_tax?: number
    loan_deduction?: number
    advance_deduction?: number
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
    bank_name?: string
    bank_branch?: string
    address?: string
    status?: 'active' | 'inactive' | 'terminated'
    allow_login?: boolean
    password?: string
    salary_structure?: {
        basic_salary: number
        hra: number
        conveyance: number
        special_allowance: number
        medical_allowance?: number
        travel_allowance?: number
        pf_deduction: number
        esi_deduction: number
        tds_deduction: number
        other_deduction?: number
    }
}

export interface UpdateEmployeeInput {
    employee_code?: string
    name?: string
    email?: string
    phone?: string
    designation?: string
    department?: string
    date_of_joining?: string
    pan_number?: string
    bank_account_number?: string
    ifsc_code?: string
    bank_name?: string
    bank_branch?: string
    address?: string
    status?: 'active' | 'inactive' | 'terminated'
    allow_login?: boolean
    password?: string
    salary_structure?: {
        basic_salary: number
        hra: number
        conveyance: number
        special_allowance: number
        medical_allowance?: number
        travel_allowance?: number
        pf_deduction: number
        esi_deduction: number
        tds_deduction: number
        other_deduction?: number
    }
}

export interface AttendanceRecord {
    id: string
    user_id: string
    employee_id: string
    attendance_date: string
    status: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday'
    remarks?: string | null
    created_at: string
}

export interface LeaveType {
    id: string
    user_id: string
    name: string
    code: string
    annual_quota: number
    is_paid: boolean
    is_active: boolean
}

export interface LeaveRequest {
    id: string
    user_id: string
    employee_id: string
    leave_type_id: string
    from_date: string
    to_date: string
    total_days: number
    reason?: string | null
    status: 'pending' | 'approved' | 'rejected'
    rejection_reason?: string | null
    approved_at?: string | null
    created_at: string
    employee?: Employee
    leave_type?: LeaveType
}

export interface EmployeeLeaveBalance {
    id: string
    user_id: string
    employee_id: string
    leave_type_id: string
    year: number
    total_quota: number
    used: number
    remaining: number
    leave_type?: LeaveType
}

export interface SalaryRevision {
    id: string
    user_id: string
    employee_id: string
    effective_date: string
    reason?: string | null
    old_basic_salary: number
    new_basic_salary: number
    old_hra: number
    new_hra: number
    old_conveyance: number
    new_conveyance: number
    old_special_allowance: number
    new_special_allowance: number
    old_medical_allowance?: number
    new_medical_allowance?: number
    old_travel_allowance?: number
    new_travel_allowance?: number
    old_gross_salary: number
    new_gross_salary: number
    old_net_salary: number
    new_net_salary: number
    revised_by?: string | null
    created_at: string
}
