-- Script to delete rohit.kothapally@gmail.com and kothapallyassociates@gmail.com accounts

BEGIN;

-- Delete from auth.users (cascade will remove auth.identities, user_profiles, user_roles, etc.)
DELETE FROM auth.users 
WHERE email IN (
  'rohit.kothapally@gmail.com', 
  'kothapallyassociates@gmail.com'
);

-- Delete from user_profiles by business_email if any remain
DELETE FROM public.user_profiles 
WHERE business_email IN (
  'rohit.kothapally@gmail.com', 
  'kothapallyassociates@gmail.com'
);

-- Delete from customers table if any record contains these emails
DELETE FROM public.customers 
WHERE email IN (
  'rohit.kothapally@gmail.com', 
  'kothapallyassociates@gmail.com'
);

COMMIT;
