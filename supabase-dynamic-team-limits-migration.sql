-- ==============================================================================
-- BillBook Migration: Dynamic Team Member Limit & Super Admin Package Sync
-- ==============================================================================

DROP FUNCTION IF EXISTS check_team_member_limit(UUID);

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
    v_base_limit INTEGER := 0;
    v_purchased_slots INTEGER := 0;
    v_total_allowed INTEGER := 0;
    v_current_count INTEGER := 0;
    v_plan_limits JSONB;
BEGIN
    -- Get user's current plan slug and limits JSONB
    SELECT sp.slug, sp.limits INTO v_plan_slug, v_plan_limits
    FROM user_subscriptions us
    JOIN subscription_plans sp ON sp.id = us.plan_id
    WHERE us.user_id = p_owner_id 
        AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- 1. Read dynamic team_members limit directly from plan package limits if set
    IF v_plan_limits IS NOT NULL AND (v_plan_limits->>'team_members') IS NOT NULL THEN
        v_base_limit := COALESCE((v_plan_limits->>'team_members')::INTEGER, 0);
    ELSE
        -- 2. Fallback to tiered pattern-matching heuristics
        IF v_plan_slug LIKE '%enterprise%' THEN
            v_base_limit := 10;
        ELSIF v_plan_slug LIKE '%pro%' OR v_plan_slug LIKE '%professional%' OR v_plan_slug LIKE '%lifetime%' THEN
            v_base_limit := 2;
        ELSE
            v_base_limit := 0;
        END IF;
    END IF;
    
    -- 3. Check for active additional purchased add-on slots
    SELECT COALESCE(SUM(quantity), 0) INTO v_purchased_slots
    FROM team_member_addons
    WHERE user_id = p_owner_id 
        AND status = 'active'
        AND end_date > NOW();
        
    v_total_allowed := v_base_limit + v_purchased_slots;
    
    -- 4. Count current active/pending team members for this workspace owner
    SELECT COUNT(*)::INTEGER INTO v_current_count
    FROM team_members
    WHERE owner_id = p_owner_id 
        AND status IN ('active', 'pending');
        
    RETURN QUERY
    SELECT 
        v_total_allowed,
        v_current_count,
        (v_current_count < v_total_allowed),
        v_base_limit,
        v_purchased_slots,
        COALESCE(v_plan_slug, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
