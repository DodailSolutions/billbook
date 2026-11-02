-- ==============================================================================
-- FIX: AUTO-SYNC NEW SIGNUPS, TRIAL USERS, & RLS FOR ADMIN VISIBILITY (FAULT-TOLERANT)
-- ==============================================================================

-- 1. Ensure public.user_subscriptions has proper unique constraint without failing on duplicates
DO $$
BEGIN
  -- Deduplicate user_subscriptions by user_id keeping the latest record
  DELETE FROM public.user_subscriptions a
  WHERE a.id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM public.user_subscriptions
    ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
  );

  -- Safely add unique constraint on user_id if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_user_id_key'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Notice: unique constraint check skipped: %', SQLERRM;
END $$;

-- 2. Synchronize regional plan currencies so UAE plans are marked as AED and US plans as USD
UPDATE public.subscription_plans 
SET currency = 'AED' 
WHERE (name ILIKE '%UAE%' OR slug ILIKE '%-ae%' OR slug ILIKE '%uae%') AND (currency IS NULL OR currency = 'INR');

UPDATE public.subscription_plans 
SET currency = 'USD' 
WHERE (name ILIKE '%US%' OR slug ILIKE '%-us%' OR slug ILIKE '%usd%') AND (currency IS NULL OR currency = 'INR');

-- 3. Create fault-tolerant handle_new_user() trigger function
-- IMPORTANT: Wrapped in EXCEPTION blocks so an auth signup transaction NEVER rolls back with "Database error saving new user"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_plan_id UUID;
  v_plan_slug TEXT;
  v_is_trial BOOLEAN := FALSE;
  v_raw_trial TEXT;
BEGIN
  -- Safe extraction of plan slug
  v_plan_slug := COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free');

  -- Safe boolean parsing of is_trial to prevent "invalid input syntax for type boolean"
  v_raw_trial := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'is_trial', '')));
  IF v_raw_trial = 'true' OR v_raw_trial = 't' OR v_raw_trial = '1' THEN
    v_is_trial := TRUE;
  ELSIF v_raw_trial = 'false' OR v_raw_trial = 'f' OR v_raw_trial = '0' THEN
    v_is_trial := FALSE;
  ELSE
    -- Default to trial if non-free plan selected
    v_is_trial := (v_plan_slug IS NOT NULL AND v_plan_slug != 'free');
  END IF;

  -- 3a. Insert or update user_profiles (shielded in sub-block)
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      role,
      business_name,
      business_type,
      owner_name,
      business_address,
      business_phone,
      business_email,
      gstin,
      status
    ) VALUES (
      NEW.id,
      'user',
      NEW.raw_user_meta_data->>'business_name',
      NEW.raw_user_meta_data->>'business_type',
      COALESCE(NEW.raw_user_meta_data->>'owner_name', NEW.raw_user_meta_data->>'full_name'),
      NEW.raw_user_meta_data->>'business_address',
      NEW.raw_user_meta_data->>'business_phone',
      COALESCE(NEW.raw_user_meta_data->>'business_email', NEW.email),
      NEW.raw_user_meta_data->>'gstin',
      'active'
    )
    ON CONFLICT (id) DO UPDATE SET
      business_name = COALESCE(EXCLUDED.business_name, user_profiles.business_name),
      owner_name = COALESCE(EXCLUDED.owner_name, user_profiles.owner_name),
      business_phone = COALESCE(EXCLUDED.business_phone, user_profiles.business_phone),
      business_email = COALESCE(EXCLUDED.business_email, user_profiles.business_email);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user user_profiles insertion error: %', SQLERRM;
  END;

  -- 3b. Resolve subscription plan ID
  BEGIN
    SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = v_plan_slug LIMIT 1;
    IF v_plan_id IS NULL THEN
      SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'free' LIMIT 1;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_plan_id := NULL;
  END;

  -- 3c. Insert or update user_subscriptions (uses defensive IF EXISTS so it works with or without unique constraint)
  IF v_plan_id IS NOT NULL THEN
    BEGIN
      IF EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = NEW.id) THEN
        UPDATE public.user_subscriptions
        SET plan_id = v_plan_id,
            status = CASE WHEN v_is_trial AND v_plan_slug != 'free' THEN 'trial' ELSE 'active' END,
            end_date = CASE WHEN v_is_trial AND v_plan_slug != 'free' THEN NOW() + INTERVAL '14 days' ELSE NOW() + INTERVAL '100 years' END,
            trial_ends_at = CASE WHEN v_is_trial AND v_plan_slug != 'free' THEN NOW() + INTERVAL '14 days' ELSE NULL END,
            updated_at = NOW()
        WHERE user_id = NEW.id;
      ELSE
        INSERT INTO public.user_subscriptions (
          user_id,
          plan_id,
          status,
          start_date,
          end_date,
          trial_ends_at,
          payment_method
        ) VALUES (
          NEW.id,
          v_plan_id,
          CASE WHEN v_is_trial AND v_plan_slug != 'free' THEN 'trial' ELSE 'active' END,
          NOW(),
          CASE WHEN v_is_trial AND v_plan_slug != 'free' THEN NOW() + INTERVAL '14 days' ELSE NOW() + INTERVAL '100 years' END,
          CASE WHEN v_is_trial AND v_plan_slug != 'free' THEN NOW() + INTERVAL '14 days' ELSE NULL END,
          'free_trial'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user user_subscriptions error: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Catch-all to guarantee auth.users insertion NEVER fails with "Database error saving new user"
  RAISE WARNING 'handle_new_user outer error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Super admin RLS policies
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Super admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (is_super_admin(auth.uid()) OR auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Super admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (is_super_admin(auth.uid()) OR auth.uid() = user_id);

-- 6. Backfill existing auth.users missing from user_profiles
INSERT INTO public.user_profiles (id, role, business_name, owner_name, business_email, status)
SELECT 
  u.id, 
  'user',
  u.raw_user_meta_data->>'business_name',
  COALESCE(u.raw_user_meta_data->>'owner_name', u.raw_user_meta_data->>'full_name'),
  u.email,
  'active'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = u.id)
ON CONFLICT (id) DO NOTHING;
