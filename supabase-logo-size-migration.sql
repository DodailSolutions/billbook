-- Add logo_size column to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS logo_size VARCHAR(10) DEFAULT 'medium' 
CHECK (logo_size IN ('small', 'medium', 'large'));

-- Update existing rows to have default value
UPDATE invoice_settings 
SET logo_size = 'medium' 
WHERE logo_size IS NULL;
