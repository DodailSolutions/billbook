-- ========================================================
-- BILLBOOK - CRM TEAM MANAGEMENT, IMPORT & ERP INTEGRATION MIGRATION
-- ========================================================

-- 1. ENHANCE CRM_LEADS TABLE
ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS assigned_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS converted_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'manual', -- manual, excel, csv, google_sheets, whatsapp
ADD COLUMN IF NOT EXISTS external_lead_id TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_member ON public.crm_leads(assigned_member_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_customer_id ON public.crm_leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_converted_invoice ON public.crm_leads(converted_invoice_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_import_source ON public.crm_leads(import_source);

-- 2. CRM GOOGLE SHEETS & EXTERNAL INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.crm_sheet_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Google Sheet Lead Stream',
    sheet_url TEXT NOT NULL,
    sheet_id TEXT NOT NULL,
    sheet_gid TEXT DEFAULT '0',
    column_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
    duplicate_strategy TEXT DEFAULT 'skip', -- skip, update, create
    default_stage TEXT DEFAULT 'lead',
    default_assigned_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    auto_sync BOOLEAN DEFAULT false,
    sync_interval_minutes INTEGER DEFAULT 60,
    last_synced_at TIMESTAMPTZ,
    last_sync_status TEXT DEFAULT 'idle', -- idle, success, error
    last_sync_error TEXT,
    imported_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_sheet_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own sheet integrations" ON public.crm_sheet_integrations;
CREATE POLICY "Users manage their own sheet integrations"
    ON public.crm_sheet_integrations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_crm_sheet_integrations_user ON public.crm_sheet_integrations(user_id);

-- 3. CRM ACTIVITIES ENHANCEMENT FOR ASSIGNMENT
ALTER TABLE public.crm_activities
ADD COLUMN IF NOT EXISTS assigned_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium'; -- low, medium, high, urgent

CREATE INDEX IF NOT EXISTS idx_crm_activities_assigned_member ON public.crm_activities(assigned_member_id);

-- 4. MULTI-TENANT TEAM RLS POLICIES FOR CRM LEADS
-- Allows workspace owners AND invited active team members to view and collaborate on CRM leads
DROP POLICY IF EXISTS "Users can view their own CRM leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Users and team members can view CRM leads" ON public.crm_leads;
CREATE POLICY "Users and team members can view CRM leads"
    ON public.crm_leads FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.uid() IN (
            SELECT tm.user_id FROM public.team_members tm 
            WHERE tm.owner_id = crm_leads.user_id AND tm.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Users can insert their own CRM leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Users and team members can insert CRM leads" ON public.crm_leads;
CREATE POLICY "Users and team members can insert CRM leads"
    ON public.crm_leads FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR auth.uid() IN (
            SELECT tm.user_id FROM public.team_members tm 
            WHERE tm.owner_id = crm_leads.user_id AND tm.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Users can update their own CRM leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Users and team members can update CRM leads" ON public.crm_leads;
CREATE POLICY "Users and team members can update CRM leads"
    ON public.crm_leads FOR UPDATE
    USING (
        auth.uid() = user_id
        OR auth.uid() IN (
            SELECT tm.user_id FROM public.team_members tm 
            WHERE tm.owner_id = crm_leads.user_id AND tm.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Users can delete their own CRM leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Users and team members can delete CRM leads" ON public.crm_leads;
CREATE POLICY "Users and team members can delete CRM leads"
    ON public.crm_leads FOR DELETE
    USING (
        auth.uid() = user_id
        OR auth.uid() IN (
            SELECT tm.user_id FROM public.team_members tm 
            WHERE tm.owner_id = crm_leads.user_id AND tm.status = 'active'
        )
    );

-- Activities RLS update for team collaboration
DROP POLICY IF EXISTS "Users can view their own CRM activities" ON public.crm_activities;
DROP POLICY IF EXISTS "Users and team members can view CRM activities" ON public.crm_activities;
CREATE POLICY "Users and team members can view CRM activities"
    ON public.crm_activities FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.uid() IN (
            SELECT tm.user_id FROM public.team_members tm 
            WHERE tm.owner_id = crm_activities.user_id AND tm.status = 'active'
        )
    );
