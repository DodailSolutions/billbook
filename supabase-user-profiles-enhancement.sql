-- Enhanced User Profiles Migration
-- Add business information fields to user_profiles table

-- Add new columns to user_profiles table if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS gstin VARCHAR(15);

-- Create index for business_type for analytics
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_type ON user_profiles(business_type);

-- Create a view for super admin analytics
CREATE OR REPLACE VIEW business_type_analytics AS
SELECT 
    business_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
    COUNT(DISTINCT CASE 
        WHEN EXISTS (
            SELECT 1 FROM user_subscriptions us 
            WHERE us.user_id = user_profiles.id 
            AND us.status = 'active'
        ) THEN user_profiles.id 
    END) as paying_users
FROM user_profiles
WHERE business_type IS NOT NULL
GROUP BY business_type
ORDER BY total_users DESC;

-- Grant access to authenticated users for their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy for inserting during signup
CREATE POLICY IF NOT EXISTS "Users can insert own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create super admin user
-- Run this after setting up your authentication
-- Replace 'your-email@example.com' with your actual email

-- First, you'll need to sign up through the UI, then run:
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'your-email@example.com';
-- INSERT INTO user_profiles (id, role, business_name, status) 
-- SELECT id, 'super_admin', 'BillBooky Admin', 'active' 
-- FROM auth.users 
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- Create admin analytics table for tracking business insights
CREATE TABLE IF NOT EXISTS business_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_type VARCHAR(50),
    metric_name VARCHAR(100),
    metric_value NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_analytics_type ON business_analytics(business_type);
CREATE INDEX IF NOT EXISTS idx_business_analytics_date ON business_analytics(recorded_at);

-- Function to update business analytics
CREATE OR REPLACE FUNCTION update_business_analytics()
RETURNS void AS $$
BEGIN
    -- Clear old analytics (keep last 30 days)
    DELETE FROM business_analytics WHERE recorded_at < NOW() - INTERVAL '30 days';
    
    -- Insert current analytics
    INSERT INTO business_analytics (business_type, metric_name, metric_value)
    SELECT 
        business_type,
        'active_users',
        COUNT(*)
    FROM user_profiles
    WHERE status = 'active' AND business_type IS NOT NULL
    GROUP BY business_type;
    
    INSERT INTO business_analytics (business_type, metric_name, metric_value)
    SELECT 
        up.business_type,
        'paying_users',
        COUNT(DISTINCT us.user_id)
    FROM user_subscriptions us
    JOIN user_profiles up ON us.user_id = up.id
    WHERE us.status = 'active' AND up.business_type IS NOT NULL
    GROUP BY up.business_type;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE user_profiles IS 'Enhanced user profiles with business information for analytics';
COMMENT ON VIEW business_type_analytics IS 'Real-time analytics of business types using the platform';
COMMENT ON FUNCTION update_business_analytics() IS 'Updates business analytics snapshot for historical tracking';
