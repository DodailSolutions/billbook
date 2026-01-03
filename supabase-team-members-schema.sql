-- Team Members and Roles Schema
-- Allows users to invite team members based on their subscription plan

-- ============================================
-- 1. ROLES AND PERMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS team_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]', -- Array of permission strings
    is_system BOOLEAN DEFAULT false, -- System roles cannot be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default roles
INSERT INTO team_roles (name, slug, description, permissions, is_system) VALUES
('Owner', 'owner', 'Full access to all features and settings', 
 '["*"]'::jsonb, true),
('Admin', 'admin', 'Manage invoices, customers, and team members', 
 '["invoices.*", "customers.*", "team.view", "team.invite", "settings.view"]'::jsonb, true),
('Accountant', 'accountant', 'View and manage invoices and customers', 
 '["invoices.*", "customers.*", "reports.view"]'::jsonb, true),
('Viewer', 'viewer', 'Read-only access to invoices and customers', 
 '["invoices.view", "customers.view"]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. TEAM MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Linked after user accepts invite
    role_id UUID NOT NULL REFERENCES team_roles(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
    invite_token VARCHAR(255) UNIQUE,
    invite_expires_at TIMESTAMP WITH TIME ZONE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(owner_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_owner_id ON team_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON team_members(invite_token);

-- ============================================
-- 3. TEAM ACTIVITY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS team_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- invited, joined, removed, role_changed, etc.
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_activity_log_owner_id ON team_activity_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_team_member_id ON team_activity_log(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_created_at ON team_activity_log(created_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity_log ENABLE ROW LEVEL SECURITY;

-- Team Roles Policies
DROP POLICY IF EXISTS "Anyone can view team roles" ON team_roles;
CREATE POLICY "Anyone can view team roles" ON team_roles
    FOR SELECT USING (true);

-- Team Members Policies
DROP POLICY IF EXISTS "Users can view team members of their organization" ON team_members;
CREATE POLICY "Users can view team members of their organization" ON team_members
    FOR SELECT USING (
        owner_id = auth.uid() 
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Owners can manage team members" ON team_members;
CREATE POLICY "Owners can manage team members" ON team_members
    FOR ALL USING (owner_id = auth.uid());

-- Team Activity Log Policies
DROP POLICY IF EXISTS "Users can view own team activity" ON team_activity_log;
CREATE POLICY "Users can view own team activity" ON team_activity_log
    FOR SELECT USING (
        owner_id = auth.uid() 
        OR actor_id = auth.uid()
    );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to check team member limit based on subscription plan
CREATE OR REPLACE FUNCTION check_team_member_limit(p_owner_id UUID)
RETURNS TABLE (
    allowed INTEGER,
    current INTEGER,
    can_add BOOLEAN
) AS $$
DECLARE
    v_plan_slug TEXT;
    v_max_members INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get user's current plan
    SELECT sp.slug INTO v_plan_slug
    FROM user_subscriptions us
    JOIN subscription_plans sp ON sp.id = us.plan_id
    WHERE us.user_id = p_owner_id 
        AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- Set member limits based on plan
    v_max_members := CASE v_plan_slug
        WHEN 'free' THEN 1          -- Only owner
        WHEN 'starter' THEN 1       -- Only owner
        WHEN 'professional' THEN 2  -- Owner + 2 members = 3 total
        WHEN 'lifetime' THEN 2      -- Owner + 2 members = 3 total
        WHEN 'enterprise' THEN 10   -- Owner + 10 members = 11 total
        ELSE 1
    END;
    
    -- Count current active team members (excluding owner)
    SELECT COUNT(*) INTO v_current_count
    FROM team_members
    WHERE owner_id = p_owner_id 
        AND status IN ('active', 'pending');
    
    RETURN QUERY SELECT 
        v_max_members,
        v_current_count::INTEGER,
        (v_current_count < v_max_members) AS can_add;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_roles_updated_at
    BEFORE UPDATE ON team_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE team_roles IS 'Defines roles and permissions for team members';
COMMENT ON TABLE team_members IS 'Team members invited by account owners. Limits enforced by subscription plan.';
COMMENT ON TABLE team_activity_log IS 'Audit log for all team member activities';
