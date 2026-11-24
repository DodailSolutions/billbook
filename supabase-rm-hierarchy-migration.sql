-- ========================================================
-- BILLBOOK - B2B CLIENT RELATIONSHIP MANAGER (RM) HIERARCHY
-- ========================================================

-- 1. Add Assigned RM columns to Customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS assigned_rm_id UUID,
ADD COLUMN IF NOT EXISTS assigned_rm_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_customers_assigned_rm ON public.customers(assigned_rm_id);

-- 2. Add Assigned RM columns to Organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS assigned_rm_id UUID,
ADD COLUMN IF NOT EXISTS assigned_rm_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_organizations_assigned_rm ON public.organizations(assigned_rm_id);

-- 3. Pre-seed B2B Relationship Roles in team_roles
INSERT INTO public.team_roles (name, slug, description, permissions)
VALUES 
    (
        'Client Relationship Manager',
        'client_relationship_manager',
        'Senior RM supervising B2B client portfolios, assigning accounts to agents, and managing customer proposals.',
        ARRAY['customers.*', 'organizations.*', 'invoices.*', 'proposals.*', 'team.agents.view']
    ),
    (
        'Relationship Agent',
        'relationship_agent',
        'Junior RM managing day-to-day assigned accounts, follow-ups, and portfolio communication.',
        ARRAY['customers.assigned', 'organizations.assigned', 'invoices.create', 'invoices.view_assigned']
    )
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;
