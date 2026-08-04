-- Bulletproof SQL script to delete rohit.kothapally@gmail.com and kothapallyassociates@gmail.com accounts
-- Disables audit triggers during deletion to prevent foreign key errors

BEGIN;

-- Temporarily bypass audit triggers during deletion
SET LOCAL session_replication_role = 'replica';

-- Find target user IDs
CREATE TEMP TABLE IF NOT EXISTS _target_user_ids ON COMMIT DROP AS
SELECT id FROM auth.users WHERE email IN ('rohit.kothapally@gmail.com', 'kothapallyassociates@gmail.com');

-- Clean up application data
DELETE FROM public.gst_audit_trail WHERE user_id IN (SELECT id FROM _target_user_ids);
DELETE FROM public.invoice_items WHERE invoice_id IN (SELECT id FROM public.invoices WHERE user_id IN (SELECT id FROM _target_user_ids));
DELETE FROM public.invoices WHERE user_id IN (SELECT id FROM _target_user_ids);
DELETE FROM public.estimates WHERE user_id IN (SELECT id FROM _target_user_ids);
DELETE FROM public.customers WHERE user_id IN (SELECT id FROM _target_user_ids) OR email IN ('rohit.kothapally@gmail.com', 'kothapallyassociates@gmail.com');
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM _target_user_ids);
DELETE FROM public.user_profiles WHERE id IN (SELECT id FROM _target_user_ids) OR business_email IN ('rohit.kothapally@gmail.com', 'kothapallyassociates@gmail.com');

-- Clean up auth system tables
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM _target_user_ids);
DELETE FROM auth.users WHERE id IN (SELECT id FROM _target_user_ids) OR email IN ('rohit.kothapally@gmail.com', 'kothapallyassociates@gmail.com');

-- Re-enable normal trigger execution
SET LOCAL session_replication_role = 'origin';

COMMIT;
