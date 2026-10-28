-- ========================================================
-- Fix 494 REQUEST_HEADER_TOO_LARGE & Enable User Profile Photos
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bnyiovrvbfrgsoisfbku/sql
-- ========================================================

-- 1. Remove base64 avatar_url from Supabase Auth user metadata
-- This immediately shrinks the user's session JWT token back to normal size (~1KB)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'avatar_url'
WHERE raw_user_meta_data ? 'avatar_url';

-- 2. Add avatar_url column to user_profiles table (in PostgreSQL database, NOT in cookies)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Verify user metadata is clean
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'ravitejm@dodail.com';
