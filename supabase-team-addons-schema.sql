-- Additional Team Member Purchases Schema
-- Allows Lifetime plan users to buy extra team member slots

-- ============================================
-- 1. ADDITIONAL TEAM SLOTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_member_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1, -- Number of additional slots purchased
    price_per_slot INTEGER NOT NULL, -- Price paid per slot (in paise/cents)
    billing_period VARCHAR(20) NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_member_addons_user_id ON team_member_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_addons_status ON team_member_addons(status);
CREATE INDEX IF NOT EXISTS idx_team_member_addons_end_date ON team_member_addons(end_date);

-- ============================================
-- 2. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE team_member_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own team member addons" ON team_member_addons;
CREATE POLICY "Users can view own team member addons" ON team_member_addons
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own team member addons" ON team_member_addons;
CREATE POLICY "Users can insert own team member addons" ON team_member_addons
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own team member addons" ON team_member_addons;
CREATE POLICY "Users can update own team member addons" ON team_member_addons
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- 3. UPDATED TEAM LIMIT CHECK FUNCTION
-- ============================================

-- Drop existing function
DROP FUNCTION IF EXISTS check_team_member_limit(UUID);

-- Recreated with additional slots support
CREATE OR REPLACE FUNCTION check_team_member_limit(p_owner_id UUID)
RETURNS TABLE (
    allowed INTEGER,
    current INTEGER,
    can_add BOOLEAN,
    base_limit INTEGER,
    purchased_slots INTEGER,
    plan_slug TEXT
) AS $$
DECLARE
    v_plan_slug TEXT;
    v_base_limit INTEGER;
    v_purchased_slots INTEGER := 0;
    v_total_allowed INTEGER;
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
    
    -- Set base member limits based on plan
    v_base_limit := CASE v_plan_slug
        WHEN 'free' THEN 0          -- Only owner
        WHEN 'starter' THEN 0       -- Only owner
        WHEN 'professional' THEN 2  -- Owner + 2 members
        WHEN 'lifetime' THEN 2      -- Owner + 2 members (can purchase more)
        WHEN 'enterprise' THEN 10   -- Owner + 10 members
        ELSE 0
    END;
    
    -- Check for additional purchased slots (only for lifetime plan)
    IF v_plan_slug = 'lifetime' THEN
        SELECT COALESCE(SUM(quantity), 0) INTO v_purchased_slots
        FROM team_member_addons
        WHERE user_id = p_owner_id 
            AND status = 'active'
            AND end_date > NOW();
    END IF;
    
    v_total_allowed := v_base_limit + v_purchased_slots;
    
    -- Count current active team members (excluding owner)
    SELECT COUNT(*) INTO v_current_count
    FROM team_members
    WHERE owner_id = p_owner_id 
        AND status IN ('active', 'pending');
    
    RETURN QUERY SELECT 
        v_total_allowed,
        v_current_count::INTEGER,
        (v_current_count < v_total_allowed) AS can_add,
        v_base_limit,
        v_purchased_slots::INTEGER,
        v_plan_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. ADDON PRICING CONSTANTS
-- ============================================

-- Create a lookup table for addon pricing
CREATE TABLE IF NOT EXISTS team_addon_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_period VARCHAR(20) NOT NULL UNIQUE CHECK (billing_period IN ('monthly', 'yearly')),
    price_per_slot INTEGER NOT NULL, -- Price in paise/cents
    duration_days INTEGER NOT NULL,
    display_price VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert pricing
INSERT INTO team_addon_pricing (billing_period, price_per_slot, duration_days, display_price) VALUES
('monthly', 19900, 30, '₹199/month'), -- ₹199 per month
('yearly', 200000, 365, '₹2000/year') -- ₹2000 per year
ON CONFLICT (billing_period) DO UPDATE SET
    price_per_slot = EXCLUDED.price_per_slot,
    duration_days = EXCLUDED.duration_days,
    display_price = EXCLUDED.display_price;

-- RLS for pricing table
ALTER TABLE team_addon_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view addon pricing" ON team_addon_pricing;
CREATE POLICY "Anyone can view addon pricing" ON team_addon_pricing
    FOR SELECT USING (is_active = true);

-- ============================================
-- 5. HELPER FUNCTION TO GET ADDON INFO
-- ============================================

CREATE OR REPLACE FUNCTION get_user_team_addons(p_user_id UUID)
RETURNS TABLE (
    total_purchased INTEGER,
    active_slots INTEGER,
    monthly_slots INTEGER,
    yearly_slots INTEGER,
    next_expiry TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(quantity), 0)::INTEGER as total_purchased,
        COALESCE(SUM(CASE WHEN status = 'active' AND end_date > NOW() THEN quantity ELSE 0 END), 0)::INTEGER as active_slots,
        COALESCE(SUM(CASE WHEN billing_period = 'monthly' AND status = 'active' AND end_date > NOW() THEN quantity ELSE 0 END), 0)::INTEGER as monthly_slots,
        COALESCE(SUM(CASE WHEN billing_period = 'yearly' AND status = 'active' AND end_date > NOW() THEN quantity ELSE 0 END), 0)::INTEGER as yearly_slots,
        MIN(CASE WHEN status = 'active' AND end_date > NOW() THEN end_date ELSE NULL END) as next_expiry
    FROM team_member_addons
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. TRIGGERS
-- ============================================

CREATE TRIGGER update_team_member_addons_updated_at
    BEFORE UPDATE ON team_member_addons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE team_member_addons IS 'Additional team member slots purchased by Lifetime plan users';
COMMENT ON TABLE team_addon_pricing IS 'Pricing structure for additional team member slots';
