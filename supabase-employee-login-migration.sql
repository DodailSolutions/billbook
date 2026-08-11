-- ============================================================
-- BillBook Employee Login & Portal Migration
-- Adds login credentials support and Row-Level Security for Employee Portal
-- ============================================================

-- 1. Add employee_user_id column to employees table to link employee to auth user
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employee_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_employee_user ON public.employees(employee_user_id);

-- 2. Modify user_profiles constraint to allow 'employee' role
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('user', 'admin', 'super_admin', 'employee'));

-- 3. Enable RLS and setup policies for employees

-- employees policies
DROP POLICY IF EXISTS "Employees can view own profile" ON public.employees;
CREATE POLICY "Employees can view own profile" ON public.employees
    FOR SELECT USING (auth.uid() = employee_user_id);

-- attendance_records policies
DROP POLICY IF EXISTS "Employees can view own attendance" ON public.attendance_records;
CREATE POLICY "Employees can view own attendance" ON public.attendance_records
    FOR SELECT USING (
        auth.uid() IN (
            SELECT employee_user_id FROM public.employees WHERE id = employee_id
        )
    );

-- leave_requests policies
DROP POLICY IF EXISTS "Employees can view own leaves" ON public.leave_requests;
CREATE POLICY "Employees can view own leaves" ON public.leave_requests
    FOR SELECT USING (
        auth.uid() IN (
            SELECT employee_user_id FROM public.employees WHERE id = employee_id
        )
    );

DROP POLICY IF EXISTS "Employees can apply for leaves" ON public.leave_requests;
CREATE POLICY "Employees can apply for leaves" ON public.leave_requests
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT employee_user_id FROM public.employees WHERE id = employee_id
        )
    );

-- employee_leave_balances policies
DROP POLICY IF EXISTS "Employees can view own leave balances" ON public.employee_leave_balances;
CREATE POLICY "Employees can view own leave balances" ON public.employee_leave_balances
    FOR SELECT USING (
        auth.uid() IN (
            SELECT employee_user_id FROM public.employees WHERE id = employee_id
        )
    );

-- payslips policies
DROP POLICY IF EXISTS "Employees can view own payslips" ON public.payslips;
CREATE POLICY "Employees can view own payslips" ON public.payslips
    FOR SELECT USING (
        auth.uid() IN (
            SELECT employee_user_id FROM public.employees WHERE id = employee_id
        )
    );
