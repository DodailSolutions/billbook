-- ==============================================================================
-- FIX: AUTO-SYNC NEW SIGNUPS, TRIAL USERS, & RLS FOR ADMIN VISIBILITY
-- ==============================================================================

-- 1. Create or replace the function to handle new auth user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_plan_id UUID;
  v_plan_slug TEXT;
  v_is_trial BOOLEAN;
BEGIN
  v_plan_slug := COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free');
  v_is_trial := COALESCE((NEW.raw_user_meta_data->>'is_trial')::boolean, (v_plan_slug != 'free'));

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

  SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = v_plan_slug LIMIT 1;
  IF v_plan_id IS NULL THEN
    SELECT id INTO v_plan_id FROM public.subscription_plans WHERE slug = 'free' LIMIT 1;
  END IF;

  IF v_plan_id IS NOT NULL THEN
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
    )
    ON CONFLICT (user_id) DO UPDATE SET
      plan_id = EXCLUDED.plan_id,
      status = EXCLUDED.status,
      end_date = EXCLUDED.end_date,
      trial_ends_at = EXCLUDED.trial_ends_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Super admin RLS policies
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
CREATE POLICY "Super admins can view all profiles" ON user_profiles
  FOR SELECT USING (is_super_admin(auth.uid()) OR auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all subscriptions" ON user_subscriptions;
CREATE POLICY "Super admins can view all subscriptions" ON user_subscriptions
  FOR SELECT USING (is_super_admin(auth.uid()) OR auth.uid() = user_id);

-- 4. Backfill existing auth.users missing from user_profiles
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
