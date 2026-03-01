-- ============================================
-- Activate Lifetime Deal for ravitejm@dodail.com
-- ============================================
-- This script grants lifetime professional access to the specified user
-- Run this in Supabase SQL Editor

-- Step 1: Verify user exists and get user_id
DO $$
DECLARE
    v_user_id UUID;
    v_plan_id UUID;
    v_email TEXT := 'ravitejm@dodail.com';
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', v_email;
    END IF;

    RAISE NOTICE 'Found user: % (ID: %)', v_email, v_user_id;

    -- Step 2: Ensure Lifetime Professional plan exists
    INSERT INTO subscription_plans (
        name, 
        slug, 
        description, 
        price, 
        currency,
        billing_period, 
        features, 
        limits, 
        is_popular, 
        sort_order
    ) VALUES (
        'Lifetime Professional',
        'lifetime-professional',
        'Pay once, use forever - All professional features',
        9999,
        'INR',
        'lifetime',
        '["Unlimited invoices forever", "All Professional features", "Recurring invoices & reminders", "Custom branding & templates", "Priority lifetime support", "Free future updates", "Single business entity"]'::jsonb,
        '{"invoices_per_month": 999999, "customers": 999999, "storage_gb": 50}'::jsonb,
        true,
        10
    )
    ON CONFLICT (slug) DO UPDATE SET
        is_active = true,
        updated_at = NOW()
    RETURNING id INTO v_plan_id;

    RAISE NOTICE 'Lifetime Professional plan ID: %', v_plan_id;

    -- Step 3: Deactivate any existing subscriptions for this user
    UPDATE user_subscriptions
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE user_id = v_user_id
      AND status = 'active';

    RAISE NOTICE 'Cancelled existing subscriptions';

    -- Step 4: Create new lifetime subscription
    INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        start_date,
        end_date,
        auto_renew,
        payment_method,
        amount_paid,
        currency
    ) VALUES (
        v_user_id,
        v_plan_id,
        'active',
        NOW(),
        NOW() + INTERVAL '100 years',  -- Lifetime = 100 years
        false,  -- No auto-renew for lifetime
        'manual_activation',
        0,  -- Complimentary
        'INR'
    );

    RAISE NOTICE 'Created lifetime subscription';

    -- Step 5: Update user profile if exists
    INSERT INTO user_profiles (id, role, status)
    VALUES (v_user_id, 'user', 'active')
    ON CONFLICT (id) DO UPDATE SET
        status = 'active',
        updated_at = NOW();

    RAISE NOTICE 'Updated user profile';

    -- Step 6: Verify the subscription
    RAISE NOTICE '✅ SUCCESS: Lifetime deal activated for %', v_email;
    RAISE NOTICE 'Subscription valid until: %', NOW() + INTERVAL '100 years';

END $$;

-- Verify the activation
SELECT 
    u.email,
    up.role,
    up.status as profile_status,
    sp.name as plan_name,
    sp.slug as plan_slug,
    us.status as subscription_status,
    us.start_date,
    us.end_date,
    us.amount_paid,
    us.currency
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE u.email = 'ravitejm@dodail.com';
