-- ==============================================================================
-- PHASE 5: AI PROPOSAL WRITING & RFP / RFQ EVALUATION ENGINE MIGRATION
-- Non-breaking schema addition for interactive proposals, milestone tranches,
-- and automated ERP contract triggers.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    client_phone TEXT,
    project_title TEXT NOT NULL,
    industry_vertical TEXT DEFAULT 'services',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'sent', 'viewed', 'signed', 'declined', 'converted')),
    currency TEXT NOT NULL DEFAULT 'INR',
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    advance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 40,
    advance_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ,
    executive_summary TEXT,
    scope_deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
    milestone_tranches JSONB NOT NULL DEFAULT '[]'::jsonb,
    compliance_matrix JSONB DEFAULT '[]'::jsonb,
    feasibility_score JSONB DEFAULT '{}'::jsonb,
    terms_and_conditions JSONB DEFAULT '[]'::jsonb,
    signature JSONB,
    converted_invoice_id UUID,
    converted_project_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast queries by tenant and deal
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_deal_id ON proposals(deal_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- Enable Row Level Security (RLS)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Workspace owners and assigned team members can view & edit proposals
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Users can manage their own proposals'
    ) THEN
        CREATE POLICY "Users can manage their own proposals"
        ON proposals
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Public can read & sign proposal by ID (for client e-signature view)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Public can view proposals for e-signing'
    ) THEN
        CREATE POLICY "Public can view proposals for e-signing"
        ON proposals
        FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Public can sign proposal'
    ) THEN
        CREATE POLICY "Public can sign proposal"
        ON proposals
        FOR UPDATE
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;
