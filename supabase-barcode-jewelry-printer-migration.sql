-- Barcode System, Jewelry Shop Profile & Printer Integration Migration
-- Backward-compatible, safe zero-downtime additions

-- 1. Organization & Business Settings Extensions in invoice_settings
ALTER TABLE IF EXISTS invoice_settings 
ADD COLUMN IF NOT EXISTS enable_barcode_system BOOLEAN DEFAULT FALSE;

ALTER TABLE IF EXISTS invoice_settings 
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'standard';

ALTER TABLE IF EXISTS invoice_settings 
ADD COLUMN IF NOT EXISTS printer_settings JSONB DEFAULT '{
  "printer_type": "browser",
  "receipt_paper_size": "80mm",
  "label_printer_type": "thermal",
  "label_format": "standard_50x25",
  "auto_print_on_save": false
}'::jsonb;

-- 2. Add Barcode & Jewelry Attributes to inventory_items
ALTER TABLE IF EXISTS inventory_items 
ADD COLUMN IF NOT EXISTS barcode VARCHAR(120);

ALTER TABLE IF EXISTS inventory_items 
ADD COLUMN IF NOT EXISTS barcode_format VARCHAR(30) DEFAULT 'CODE128';

ALTER TABLE IF EXISTS inventory_items 
ADD COLUMN IF NOT EXISTS jewelry_attributes JSONB DEFAULT NULL;

-- 3. Add Barcode & Jewelry Attributes to saved_items (Invoicing master items)
ALTER TABLE IF EXISTS saved_items 
ADD COLUMN IF NOT EXISTS barcode VARCHAR(120);

ALTER TABLE IF EXISTS saved_items 
ADD COLUMN IF NOT EXISTS barcode_format VARCHAR(30) DEFAULT 'CODE128';

ALTER TABLE IF EXISTS saved_items 
ADD COLUMN IF NOT EXISTS jewelry_attributes JSONB DEFAULT NULL;

-- 4. High-Performance Barcode Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode 
ON inventory_items(user_id, barcode) 
WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_saved_items_barcode 
ON saved_items(user_id, barcode) 
WHERE barcode IS NOT NULL;

-- 5. Hardware Printer Presets Table (Optional multi-printer support per store)
CREATE TABLE IF NOT EXISTS organization_printers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    printer_type VARCHAR(50) NOT NULL DEFAULT 'thermal_pos', -- 'thermal_pos', 'thermal_label', 'desktop_sheet'
    connection_type VARCHAR(50) NOT NULL DEFAULT 'usb', -- 'usb', 'bluetooth', 'network', 'system'
    ip_address VARCHAR(120),
    port INTEGER DEFAULT 9100,
    paper_width VARCHAR(30) DEFAULT '80mm', -- '58mm', '80mm', 'A4', 'custom'
    label_format VARCHAR(50) DEFAULT 'jewelry_dumbbell', -- 'jewelry_dumbbell', 'retail_38x25', 'retail_50x25', 'sheet_a4_24'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on organization_printers
ALTER TABLE organization_printers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own printers" 
ON organization_printers 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
