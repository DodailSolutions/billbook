-- GST Compliance Features Migration
-- Adds support for CGST/SGST/IGST, HSN/SAC codes, reverse charge, and full Indian tax compliance

-- Add new columns to invoice_items table for HSN/SAC codes and individual tax rates
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS hsn_sac_code VARCHAR(6);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS hsn_sac_type VARCHAR(3) CHECK (hsn_sac_type IN ('HSN', 'SAC'));
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5, 2) DEFAULT 18;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_cgst DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_sgst DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_igst DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_tax_amount DECIMAL(10, 2) DEFAULT 0;

-- Add new columns to invoices table for detailed GST breakdown
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS supply_type VARCHAR(20) DEFAULT 'intra-state' CHECK (supply_type IN ('intra-state', 'inter-state'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reverse_charge_applicable BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reverse_charge_notes TEXT;

-- Update customers table to store validation status of GSTIN
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin_validated BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin_validation_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_state_code VARCHAR(2);

-- Create a table to track HSN/SAC master data
CREATE TABLE IF NOT EXISTS hsn_sac_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('HSN', 'SAC')),
  default_gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18,
  product_category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for reverse charge settings
CREATE TABLE IF NOT EXISTS reverse_charge_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  enable_reverse_charge BOOLEAN DEFAULT FALSE,
  auto_detect_supplier_registration BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_hsn_sac ON invoice_items(hsn_sac_code);
CREATE INDEX IF NOT EXISTS idx_invoices_supply_type ON invoices(supply_type);
CREATE INDEX IF NOT EXISTS idx_invoices_reverse_charge ON invoices(reverse_charge_applicable);
CREATE INDEX IF NOT EXISTS idx_customers_gstin_validated ON customers(gstin_validated);
CREATE INDEX IF NOT EXISTS idx_hsn_sac_master_category ON hsn_sac_master(category);

-- Add RLS policies for new tables
ALTER TABLE hsn_sac_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE reverse_charge_settings ENABLE ROW LEVEL SECURITY;

-- HSN/SAC Master - Allow public read (it's reference data), only admins can insert/update
DROP POLICY IF EXISTS "Anyone can view hsn_sac_master" ON hsn_sac_master;
CREATE POLICY "Anyone can view hsn_sac_master"
  ON hsn_sac_master FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "No one can insert hsn_sac_master directly" ON hsn_sac_master;
CREATE POLICY "No one can insert hsn_sac_master directly"
  ON hsn_sac_master FOR INSERT
  WITH CHECK (FALSE);

-- Reverse Charge Settings
DROP POLICY IF EXISTS "Users can view their own reverse charge settings" ON reverse_charge_settings;
CREATE POLICY "Users can view their own reverse charge settings"
  ON reverse_charge_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reverse charge settings" ON reverse_charge_settings;
CREATE POLICY "Users can insert their own reverse charge settings"
  ON reverse_charge_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reverse charge settings" ON reverse_charge_settings;
CREATE POLICY "Users can update their own reverse charge settings"
  ON reverse_charge_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Update existing invoices schema - add comment explaining new GST fields
COMMENT ON COLUMN invoices.cgst_amount IS 'Central GST amount (for intra-state supplies)';
COMMENT ON COLUMN invoices.sgst_amount IS 'State GST amount (for intra-state supplies)';
COMMENT ON COLUMN invoices.igst_amount IS 'Integrated GST amount (for inter-state supplies)';
COMMENT ON COLUMN invoices.supply_type IS 'Type of supply: intra-state or inter-state (determines CGST+SGST vs IGST)';
COMMENT ON COLUMN invoices.reverse_charge_applicable IS 'Whether reverse charge mechanism applies to this invoice';

COMMENT ON COLUMN invoice_items.hsn_sac_code IS 'Harmonized System Nomenclature (HSN) for goods or Service Accounting Code (SAC) for services';
COMMENT ON COLUMN invoice_items.gst_rate IS 'GST rate applicable to this item (5%, 12%, 18%, 28%, etc.)';

-- Insert some common HSN/SAC codes for reference
INSERT INTO hsn_sac_master (code, description, category, default_gst_rate, product_category) VALUES
  ('9965', 'Professional Services', 'SAC', 18, 'Services'),
  ('9967', 'Business Support Services', 'SAC', 18, 'Services'),
  ('9988', 'IT Services', 'SAC', 18, 'Services'),
  ('9989', 'Temporary Staff Services', 'SAC', 18, 'Services'),
  ('0101', 'Cereals', 'HSN', 5, 'Food'),
  ('0201', 'Meat', 'HSN', 5, 'Food'),
  ('0401', 'Dairy Products', 'HSN', 5, 'Food'),
  ('2201', 'Beverages', 'HSN', 28, 'Beverages'),
  ('6204', 'Women Clothing', 'HSN', 5, 'Textiles'),
  ('8517', 'Electrical Machinery', 'HSN', 18, 'Electronics'),
  ('3004', 'Pharmaceutical Products', 'HSN', 0, 'Pharmaceuticals'),
  ('7326', 'Iron or Steel Articles', 'HSN', 18, 'Metals')
ON CONFLICT (code) DO NOTHING;
