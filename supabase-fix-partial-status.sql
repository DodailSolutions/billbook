-- Quick fix to add 'partial' status to invoices table
-- Run this in Supabase SQL Editor immediately

-- Drop the old status check constraint
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Add new constraint with 'partial' included
ALTER TABLE invoices
ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'cancelled'));

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'invoices_status_check';
