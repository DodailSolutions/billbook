-- SQL Migration for Purchase Orders, Payroll System, and Advanced Inventory

-- 1. PURCHASE ORDERS & ITEMS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    po_number VARCHAR(50) NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_email VARCHAR(255),
    po_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, issued, partially_received, received, cancelled
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT po_status_check CHECK (status IN ('draft', 'issued', 'partially_received', 'received', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(12, 2) NOT NULL DEFAULT 1.00,
    received_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add batch_number and expiry_date to inventory_transactions if not exists
ALTER TABLE public.inventory_transactions 
ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS po_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL;


-- 2. PAYROLL SYSTEM TABLES
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    designation VARCHAR(100),
    department VARCHAR(100),
    date_of_joining DATE NOT NULL DEFAULT CURRENT_DATE,
    pan_number VARCHAR(20),
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, terminated
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_emp_code_per_user UNIQUE(user_id, employee_code)
);

CREATE TABLE IF NOT EXISTS public.salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    hra DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    conveyance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    special_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    pf_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    esi_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tds_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    other_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    gross_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    total_employees INTEGER NOT NULL DEFAULT 0,
    total_gross DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_net_pay DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'processed', -- draft, processed, paid
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_payroll_run_per_month UNIQUE(user_id, month, year)
);

CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    hra DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    conveyance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    special_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    gross_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    pf_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    esi_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tds_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    other_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid
    paid_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- Purchase Orders RLS
DROP POLICY IF EXISTS "Users manage own purchase_orders" ON public.purchase_orders;
CREATE POLICY "Users manage own purchase_orders" ON public.purchase_orders FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own purchase_order_items" ON public.purchase_order_items;
CREATE POLICY "Users manage own purchase_order_items" ON public.purchase_order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.purchase_orders WHERE id = purchase_order_items.po_id AND user_id = auth.uid())
);

-- Employees & Payroll RLS
DROP POLICY IF EXISTS "Users manage own employees" ON public.employees;
CREATE POLICY "Users manage own employees" ON public.employees FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own salary_structures" ON public.salary_structures;
CREATE POLICY "Users manage own salary_structures" ON public.salary_structures FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own payroll_runs" ON public.payroll_runs;
CREATE POLICY "Users manage own payroll_runs" ON public.payroll_runs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own payslips" ON public.payslips;
CREATE POLICY "Users manage own payslips" ON public.payslips FOR ALL USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_po_user_id ON public.purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_po_vendor_id ON public.purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_items_po_id ON public.purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_user_id ON public.payroll_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_payslips_run_id ON public.payslips(payroll_run_id);
