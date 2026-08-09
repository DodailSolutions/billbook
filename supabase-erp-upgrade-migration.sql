-- ============================================================
-- BillBook ERP Upgrade Migration
-- Purchase Order Enhancements + Payroll & HR Module Extensions
-- ============================================================

-- ==============================================
-- PHASE 1: PURCHASE ORDER ENHANCEMENTS
-- ==============================================

-- Add approval and amendment columns to purchase_orders
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS amendment_number INTEGER DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS amended_from UUID REFERENCES purchase_orders(id) ON DELETE SET NULL;

-- Purchase Order Amendment History
CREATE TABLE IF NOT EXISTS purchase_order_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    amended_po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    amendment_number INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_amendments_original ON purchase_order_amendments(original_po_id);
CREATE INDEX IF NOT EXISTS idx_po_amendments_user ON purchase_order_amendments(user_id);

ALTER TABLE purchase_order_amendments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own po_amendments" ON purchase_order_amendments;
CREATE POLICY "Users manage own po_amendments" ON purchase_order_amendments
    FOR ALL USING (auth.uid() = user_id);


-- ==============================================
-- PHASE 2: PAYROLL & HR MODULE EXTENSIONS
-- ==============================================

-- ---- Salary Structure Extensions ----
ALTER TABLE salary_structures ADD COLUMN IF NOT EXISTS medical_allowance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE salary_structures ADD COLUMN IF NOT EXISTS travel_allowance DECIMAL(12,2) DEFAULT 0.00;

-- ---- Payslip Extensions ----
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS working_days INTEGER DEFAULT 0;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS days_present DECIMAL(5,1) DEFAULT 0;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS lop_days DECIMAL(5,1) DEFAULT 0;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS professional_tax DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS medical_allowance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS travel_allowance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS overtime_pay DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS bonus DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS loan_deduction DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE payslips ADD COLUMN IF NOT EXISTS advance_deduction DECIMAL(12,2) DEFAULT 0.00;

-- ---- Attendance Records ----
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'present',  -- present, absent, half_day, leave, holiday
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_attendance_per_day UNIQUE(user_id, employee_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own attendance" ON attendance_records;
CREATE POLICY "Users manage own attendance" ON attendance_records
    FOR ALL USING (auth.uid() = user_id);


-- ---- Leave Types ----
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,           -- Casual Leave, Sick Leave, Earned Leave, LOP
    code VARCHAR(10) NOT NULL,            -- CL, SL, EL, LOP
    annual_quota INTEGER DEFAULT 0,       -- Annual entitlement (0 for LOP = unlimited)
    is_paid BOOLEAN DEFAULT true,         -- false for LOP
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_leave_type_per_user UNIQUE(user_id, code)
);

ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own leave_types" ON leave_types;
CREATE POLICY "Users manage own leave_types" ON leave_types
    FOR ALL USING (auth.uid() = user_id);


-- ---- Leave Requests ----
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_days DECIMAL(5,1) NOT NULL DEFAULT 1,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
    rejection_reason TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(from_date, to_date);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own leave_requests" ON leave_requests;
CREATE POLICY "Users manage own leave_requests" ON leave_requests
    FOR ALL USING (auth.uid() = user_id);


-- ---- Employee Leave Balances ----
CREATE TABLE IF NOT EXISTS employee_leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_quota INTEGER NOT NULL DEFAULT 0,
    used DECIMAL(5,1) NOT NULL DEFAULT 0,
    remaining DECIMAL(5,1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_leave_balance UNIQUE(user_id, employee_id, leave_type_id, year)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_user ON employee_leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON employee_leave_balances(employee_id);

ALTER TABLE employee_leave_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own leave_balances" ON employee_leave_balances;
CREATE POLICY "Users manage own leave_balances" ON employee_leave_balances
    FOR ALL USING (auth.uid() = user_id);


-- ---- Salary Revisions History ----
CREATE TABLE IF NOT EXISTS salary_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    effective_date DATE NOT NULL,
    reason VARCHAR(255),                  -- Annual Increment, Promotion, Correction, etc.

    -- Previous salary snapshot
    old_basic_salary DECIMAL(12,2) DEFAULT 0.00,
    old_hra DECIMAL(12,2) DEFAULT 0.00,
    old_conveyance DECIMAL(12,2) DEFAULT 0.00,
    old_special_allowance DECIMAL(12,2) DEFAULT 0.00,
    old_medical_allowance DECIMAL(12,2) DEFAULT 0.00,
    old_travel_allowance DECIMAL(12,2) DEFAULT 0.00,
    old_gross_salary DECIMAL(12,2) DEFAULT 0.00,
    old_net_salary DECIMAL(12,2) DEFAULT 0.00,

    -- New salary values
    new_basic_salary DECIMAL(12,2) DEFAULT 0.00,
    new_hra DECIMAL(12,2) DEFAULT 0.00,
    new_conveyance DECIMAL(12,2) DEFAULT 0.00,
    new_special_allowance DECIMAL(12,2) DEFAULT 0.00,
    new_medical_allowance DECIMAL(12,2) DEFAULT 0.00,
    new_travel_allowance DECIMAL(12,2) DEFAULT 0.00,
    new_gross_salary DECIMAL(12,2) DEFAULT 0.00,
    new_net_salary DECIMAL(12,2) DEFAULT 0.00,

    revised_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salary_revisions_user ON salary_revisions(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_revisions_employee ON salary_revisions(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_revisions_date ON salary_revisions(effective_date);

ALTER TABLE salary_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own salary_revisions" ON salary_revisions;
CREATE POLICY "Users manage own salary_revisions" ON salary_revisions
    FOR ALL USING (auth.uid() = user_id);


-- ---- Default Leave Types Seed Function ----
-- Call this function to initialize default leave types for a user
CREATE OR REPLACE FUNCTION initialize_default_leave_types(p_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO leave_types (user_id, name, code, annual_quota, is_paid) VALUES
        (p_user_id, 'Casual Leave', 'CL', 12, true),
        (p_user_id, 'Sick Leave', 'SL', 12, true),
        (p_user_id, 'Earned Leave', 'EL', 15, true),
        (p_user_id, 'Loss of Pay', 'LOP', 0, false)
    ON CONFLICT (user_id, code) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---- Comments ----
COMMENT ON TABLE purchase_order_amendments IS 'Tracks PO amendment/revision history for audit trail';
COMMENT ON TABLE attendance_records IS 'Daily attendance register for payroll employees';
COMMENT ON TABLE leave_types IS 'Configurable leave type definitions per user/company';
COMMENT ON TABLE leave_requests IS 'Employee leave applications with approval workflow';
COMMENT ON TABLE employee_leave_balances IS 'Per-employee per-year leave balance tracker';
COMMENT ON TABLE salary_revisions IS 'Historical log of salary structure changes for audit';
