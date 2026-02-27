-- Make ravitejm@dodail.com a super admin
-- Run this in your Supabase SQL Editor

UPDATE user_profiles 
SET role = 'super_admin',
    status = 'active',
    updated_at = NOW()
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'ravitejm@dodail.com'
);

-- Verify the update
SELECT 
    u.email, 
    up.role, 
    up.status,
    up.business_name
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'ravitejm@dodail.com';
