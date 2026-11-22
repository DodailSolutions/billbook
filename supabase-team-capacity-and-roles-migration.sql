-- ========================================================
-- BILLBOOK - UNIVERSAL TEAM MANAGEMENT & CAPACITY RADAR MIGRATION
-- ========================================================

-- Non-breaking enhancement to team_members table
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS allocated_hours NUMERIC DEFAULT 40,
ADD COLUMN IF NOT EXISTS hourly_cost_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS hourly_billing_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS vertical_specialty TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for quick lookup on owner and active status
CREATE INDEX IF NOT EXISTS idx_team_members_owner_allocated ON public.team_members(owner_id, allocated_hours);
