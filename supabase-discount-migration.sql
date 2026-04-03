-- Migration: Add discount fields to invoices table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS discount_type   VARCHAR(20)     DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_value  DECIMAL(10, 2)  DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2)  DEFAULT NULL;
