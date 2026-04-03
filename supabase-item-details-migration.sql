-- Migration: Add item_details column to invoice_items
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS item_details TEXT;
