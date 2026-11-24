-- ==============================================================================
-- Migration: Unrestricted Super Admin RLS & Team Members Fix
-- Description:
-- 1. Updates Row-Level Security on team_members so that Super Admins and Workspace Owners
--    can invite, view, update, and manage team members without any policy violations.
-- 2. Sets the business vertical for the super admin organization to 'software_it'.
-- ==============================================================================

-- 1. Drop old restrictive policies on team_members
DROP POLICY IF EXISTS "Owners can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their organization" ON team_members;
DROP POLICY IF EXISTS "Super admins can manage all team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON team_members;

-- 2. Comprehensive SELECT Policy for team_members
CREATE POLICY "Users and Admins can view team members" ON team_members
    FOR SELECT USING (
        owner_id = auth.uid() 
        OR user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('superadmin', 'super_admin')
        )
    );

-- 3. Comprehensive ALL / Management Policy for team_members
CREATE POLICY "Owners and Admins can manage team members" ON team_members
    FOR ALL 
    USING (
        owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('superadmin', 'super_admin')
        )
    )
    WITH CHECK (
        owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('superadmin', 'super_admin')
        )
    );

-- 4. Lock Super Admin Business Profile to Software Development & IT ('software_it')
UPDATE user_profiles
SET business_type = 'software_it', updated_at = NOW()
WHERE role IN ('superadmin', 'super_admin');

UPDATE invoice_settings
SET business_type = 'software_it',
    business_metadata = COALESCE(business_metadata, '{}'::jsonb) || '{"industry": "software_it", "vertical": "software_it"}'::jsonb,
    updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM user_profiles WHERE role IN ('superadmin', 'super_admin')
);
