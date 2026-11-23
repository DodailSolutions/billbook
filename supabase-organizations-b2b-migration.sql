-- ========================================================
-- BILLBOOK - B2B ORGANIZATIONS & MULTI-CONTACT CRM MIGRATION
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    gstin VARCHAR(20),
    pan VARCHAR(20),
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    industry VARCHAR(100),
    billing_address TEXT,
    shipping_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(20),
    currency VARCHAR(10) DEFAULT 'INR',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON public.organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_gstin ON public.organizations(gstin);

-- 2. Link Customers (Contact Persons) to Organizations
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_primary_contact BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_customers_org_id ON public.customers(organization_id);

-- 3. Link Invoices to Organizations
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON public.invoices(organization_id);

-- 4. Advance CRM Leads with Organization, Contact & Win/Loss Data
ALTER TABLE public.crm_leads
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS loss_reason VARCHAR(100),
ADD COLUMN IF NOT EXISTS why_failed TEXT,
ADD COLUMN IF NOT EXISTS competitor_won VARCHAR(255),
ADD COLUMN IF NOT EXISTS won_notes TEXT,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_crm_leads_org_id ON public.crm_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_contact_id ON public.crm_leads(contact_id);

-- 5. Advance Subscription Plans with Excluded Features for Crossed Marks
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS excluded_features JSONB DEFAULT '[]'::jsonb;

-- 6. Row Level Security for Organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own organizations" ON public.organizations;
CREATE POLICY "Users can view own organizations" ON public.organizations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own organizations" ON public.organizations;
CREATE POLICY "Users can insert own organizations" ON public.organizations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own organizations" ON public.organizations;
CREATE POLICY "Users can update own organizations" ON public.organizations
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own organizations" ON public.organizations;
CREATE POLICY "Users can delete own organizations" ON public.organizations
    FOR DELETE USING (auth.uid() = user_id);
