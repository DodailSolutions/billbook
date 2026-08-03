-- ========================================================
-- BILLBOOK - CRM & BOOKKEEPING FEATURE SUITE MIGRATION
-- ========================================================

-- 1. CRM LEADS TABLE
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    company_name TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    value NUMERIC(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    stage TEXT NOT NULL DEFAULT 'lead', -- lead, contacted, proposal_sent, negotiation, won, lost
    probability INTEGER DEFAULT 20,
    expected_close_date DATE,
    source TEXT DEFAULT 'web', -- web, referral, whatsapp, campaign, phone, other
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for crm_leads
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own CRM leads" ON public.crm_leads;
CREATE POLICY "Users can view their own CRM leads"
    ON public.crm_leads FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own CRM leads" ON public.crm_leads;
CREATE POLICY "Users can insert their own CRM leads"
    ON public.crm_leads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own CRM leads" ON public.crm_leads;
CREATE POLICY "Users can update their own CRM leads"
    ON public.crm_leads FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own CRM leads" ON public.crm_leads;
CREATE POLICY "Users can delete their own CRM leads"
    ON public.crm_leads FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id ON public.crm_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON public.crm_leads(stage);

-- 2. CRM ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- call, email, meeting, note, task
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for crm_activities
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own CRM activities" ON public.crm_activities;
CREATE POLICY "Users can view their own CRM activities"
    ON public.crm_activities FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own CRM activities" ON public.crm_activities;
CREATE POLICY "Users can insert their own CRM activities"
    ON public.crm_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own CRM activities" ON public.crm_activities;
CREATE POLICY "Users can update their own CRM activities"
    ON public.crm_activities FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own CRM activities" ON public.crm_activities;
CREATE POLICY "Users can delete their own CRM activities"
    ON public.crm_activities FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_crm_activities_user_id ON public.crm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_id ON public.crm_activities(lead_id);

-- 3. CHART OF ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
    category TEXT NOT NULL, -- Current Asset, Fixed Asset, Current Liability, Operating Expense, Sales Revenue, etc.
    description TEXT,
    current_balance NUMERIC(15, 2) DEFAULT 0,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for chart_of_accounts
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chart of accounts" ON public.chart_of_accounts;
CREATE POLICY "Users can view their own chart of accounts"
    ON public.chart_of_accounts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chart of accounts" ON public.chart_of_accounts;
CREATE POLICY "Users can insert their own chart of accounts"
    ON public.chart_of_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chart of accounts" ON public.chart_of_accounts;
CREATE POLICY "Users can update their own chart of accounts"
    ON public.chart_of_accounts FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chart of accounts" ON public.chart_of_accounts;
CREATE POLICY "Users can delete their own chart of accounts"
    ON public.chart_of_accounts FOR DELETE
    USING (auth.uid() = user_id AND is_system = FALSE);

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_user_id ON public.chart_of_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON public.chart_of_accounts(account_type);

-- 4. JOURNAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_number TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    reference TEXT,
    status TEXT DEFAULT 'posted', -- draft, posted, void
    source TEXT DEFAULT 'manual', -- manual, invoice, expense, payment
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view their own journal entries"
    ON public.journal_entries FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can insert their own journal entries"
    ON public.journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can update their own journal entries"
    ON public.journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can delete their own journal entries"
    ON public.journal_entries FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(entry_date);

-- 5. JOURNAL ENTRY LINES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE CASCADE,
    debit_amount NUMERIC(15, 2) DEFAULT 0,
    credit_amount NUMERIC(15, 2) DEFAULT 0,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for journal_entry_lines via journal_entries parent check
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage lines of their journal entries" ON public.journal_entry_lines;
CREATE POLICY "Users can manage lines of their journal entries"
    ON public.journal_entry_lines FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.journal_entries
            WHERE journal_entries.id = journal_entry_lines.journal_entry_id
            AND journal_entries.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry_id ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON public.journal_entry_lines(account_id);

-- 6. BANK ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT,
    account_type TEXT DEFAULT 'current', -- current, savings, credit
    current_balance NUMERIC(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can view their own bank accounts"
    ON public.bank_accounts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can insert their own bank accounts"
    ON public.bank_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can update their own bank accounts"
    ON public.bank_accounts FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can delete their own bank accounts"
    ON public.bank_accounts FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);

-- 7. BANK RECONCILIATIONS TABLE
CREATE TABLE IF NOT EXISTS public.bank_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    statement_date DATE NOT NULL,
    statement_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    ledger_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    difference NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'reconciled', -- draft, reconciled
    notes TEXT,
    reconciled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for bank_reconciliations
ALTER TABLE public.bank_reconciliations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bank reconciliations" ON public.bank_reconciliations;
CREATE POLICY "Users can view their own bank reconciliations"
    ON public.bank_reconciliations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bank reconciliations" ON public.bank_reconciliations;
CREATE POLICY "Users can insert their own bank reconciliations"
    ON public.bank_reconciliations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bank reconciliations" ON public.bank_reconciliations;
CREATE POLICY "Users can update their own bank reconciliations"
    ON public.bank_reconciliations FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bank reconciliations" ON public.bank_reconciliations;
CREATE POLICY "Users can delete their own bank reconciliations"
    ON public.bank_reconciliations FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bank_reconciliations_user_id ON public.bank_reconciliations(user_id);
