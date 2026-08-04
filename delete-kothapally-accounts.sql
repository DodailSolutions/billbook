-- Safe PL/pgSQL script to delete rohit.kothapally@gmail.com and kothapallyassociates@gmail.com
-- Automatically checks table existence (e.g. estimates, gst_audit_trail) and bypasses triggers.

DO $$
DECLARE
    v_user_ids uuid[];
BEGIN
    -- Find user IDs to delete
    SELECT array_agg(id) INTO v_user_ids
    FROM auth.users
    WHERE email IN ('rohit.kothapally@gmail.com', 'kothapallyassociates@gmail.com');

    IF v_user_ids IS NOT NULL AND array_length(v_user_ids, 1) > 0 THEN
        -- Temporarily bypass triggers during cleanup
        SET LOCAL session_replication_role = 'replica';

        -- Delete from optional/conditional public tables if they exist
        IF to_regclass('public.gst_audit_trail') IS NOT NULL THEN
            EXECUTE 'DELETE FROM public.gst_audit_trail WHERE user_id = ANY($1)' USING v_user_ids;
        END IF;

        IF to_regclass('public.invoice_items') IS NOT NULL AND to_regclass('public.invoices') IS NOT NULL THEN
            EXECUTE 'DELETE FROM public.invoice_items WHERE invoice_id IN (SELECT id FROM public.invoices WHERE user_id = ANY($1))' USING v_user_ids;
        END IF;

        IF to_regclass('public.invoices') IS NOT NULL THEN
            EXECUTE 'DELETE FROM public.invoices WHERE user_id = ANY($1)' USING v_user_ids;
        END IF;

        IF to_regclass('public.estimates') IS NOT NULL THEN
            EXECUTE 'DELETE FROM public.estimates WHERE user_id = ANY($1)' USING v_user_ids;
        END IF;

        IF to_regclass('public.customers') IS NOT NULL THEN
            EXECUTE 'DELETE FROM public.customers WHERE user_id = ANY($1) OR email IN (''rohit.kothapally@gmail.com'', ''kothapallyassociates@gmail.com'')' USING v_user_ids;
        END IF;

        IF to_regclass('public.user_roles') IS NOT NULL THEN
            EXECUTE 'DELETE FROM public.user_roles WHERE user_id = ANY($1)' USING v_user_ids;
        END IF;

        IF to_regclass('public.user_profiles') IS NOT NULL THEN
            EXECUTE 'DELETE FROM public.user_profiles WHERE id = ANY($1) OR business_email IN (''rohit.kothapally@gmail.com'', ''kothapallyassociates@gmail.com'')' USING v_user_ids;
        END IF;

        -- Delete from auth schema
        DELETE FROM auth.identities WHERE user_id = ANY(v_user_ids);
        DELETE FROM auth.users WHERE id = ANY(v_user_ids);

        -- Restore session replication role
        SET LOCAL session_replication_role = 'origin';

        RAISE NOTICE 'Target accounts deleted successfully.';
    ELSE
        RAISE NOTICE 'No matching accounts found for deletion.';
    END IF;
END $$;
