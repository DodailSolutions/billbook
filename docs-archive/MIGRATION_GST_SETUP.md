# Database Migration Instructions

## Quick Start

To deploy the GST compliance features, you need to run the SQL migration script in your Supabase database.

## Steps to Execute

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy the Migration Script

Copy the entire content from `supabase-gst-compliance-migration.sql` file located in your project root.

### Step 3: Paste and Execute

1. Paste the SQL into the editor
2. Click **Run** button
3. Wait for confirmation message

### Step 4: Verify the Changes

Check if the following were created successfully:

```sql
-- Verify new columns in invoice_items
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'invoice_items' 
AND column_name IN ('hsn_sac_code', 'gst_rate', 'item_cgst');

-- Verify new columns in invoices
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND column_name IN ('supply_type', 'cgst_amount', 'igst_amount');

-- Verify new table
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('hsn_sac_master', 'reverse_charge_settings');
```

## Alternative: Manual Step-by-Step

If you prefer to execute in parts:

### Part 1: Add Invoice Items Columns

```sql
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS hsn_sac_code VARCHAR(6);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS hsn_sac_type VARCHAR(3) CHECK (hsn_sac_type IN ('HSN', 'SAC'));
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5, 2) DEFAULT 18;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_cgst DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_sgst DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_igst DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_tax_amount DECIMAL(10, 2) DEFAULT 0;
```

### Part 2: Add Invoices Columns

```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS supply_type VARCHAR(20) DEFAULT 'intra-state' CHECK (supply_type IN ('intra-state', 'inter-state'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reverse_charge_applicable BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reverse_charge_notes TEXT;
```

### Part 3: Add Customers Columns

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin_validated BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin_validation_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_state_code VARCHAR(2);
```

### Part 4: Create New Tables

```sql
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

CREATE TABLE IF NOT EXISTS reverse_charge_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  enable_reverse_charge BOOLEAN DEFAULT FALSE,
  auto_detect_supplier_registration BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Part 5: Create Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_invoice_items_hsn_sac ON invoice_items(hsn_sac_code);
CREATE INDEX IF NOT EXISTS idx_invoices_supply_type ON invoices(supply_type);
CREATE INDEX IF NOT EXISTS idx_invoices_reverse_charge ON invoices(reverse_charge_applicable);
CREATE INDEX IF NOT EXISTS idx_customers_gstin_validated ON customers(gstin_validated);
CREATE INDEX IF NOT EXISTS idx_hsn_sac_master_category ON hsn_sac_master(category);
```

### Part 6: Enable RLS and Add Policies

```sql
ALTER TABLE hsn_sac_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE reverse_charge_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hsn_sac_master"
  ON hsn_sac_master FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "No one can insert hsn_sac_master directly"
  ON hsn_sac_master FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "Users can view their own reverse charge settings"
  ON reverse_charge_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reverse charge settings"
  ON reverse_charge_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reverse charge settings"
  ON reverse_charge_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

### Part 7: Add Comments

```sql
COMMENT ON COLUMN invoices.cgst_amount IS 'Central GST amount (for intra-state supplies)';
COMMENT ON COLUMN invoices.sgst_amount IS 'State GST amount (for intra-state supplies)';
COMMENT ON COLUMN invoices.igst_amount IS 'Integrated GST amount (for inter-state supplies)';
COMMENT ON COLUMN invoices.supply_type IS 'Type of supply: intra-state or inter-state (determines CGST+SGST vs IGST)';
COMMENT ON COLUMN invoices.reverse_charge_applicable IS 'Whether reverse charge mechanism applies to this invoice';
COMMENT ON COLUMN invoice_items.hsn_sac_code IS 'Harmonized System Nomenclature (HSN) for goods or Service Accounting Code (SAC) for services';
COMMENT ON COLUMN invoice_items.gst_rate IS 'GST rate applicable to this item (5%, 12%, 18%, 28%, etc.)';
```

### Part 8: Insert Reference Data

```sql
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
```

## Verification Queries

After running the migration, verify with these queries:

```sql
-- Check column count in invoice_items
SELECT COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'invoice_items';
-- Expected: Should show increased count

-- Check supply_type values
SELECT DISTINCT supply_type 
FROM invoices 
LIMIT 5;
-- Expected: Should include 'intra-state' and/or 'inter-state'

-- Check HSN/SAC master data
SELECT COUNT(*) as hsn_sac_count 
FROM hsn_sac_master 
WHERE is_active = TRUE;
-- Expected: 12 rows

-- Check for RLS policies
SELECT * 
FROM pg_policies 
WHERE tablename IN ('hsn_sac_master', 'reverse_charge_settings');
```

## Rollback Instructions

If you need to revert the changes:

```sql
-- Drop new tables
DROP TABLE IF EXISTS reverse_charge_settings CASCADE;
DROP TABLE IF EXISTS hsn_sac_master CASCADE;

-- Remove new columns (be careful with existing data!)
ALTER TABLE invoice_items DROP COLUMN IF EXISTS hsn_sac_code;
ALTER TABLE invoice_items DROP COLUMN IF EXISTS hsn_sac_type;
ALTER TABLE invoice_items DROP COLUMN IF EXISTS gst_rate;
ALTER TABLE invoice_items DROP COLUMN IF EXISTS item_cgst;
ALTER TABLE invoice_items DROP COLUMN IF EXISTS item_sgst;
ALTER TABLE invoice_items DROP COLUMN IF EXISTS item_igst;
ALTER TABLE invoice_items DROP COLUMN IF EXISTS item_tax_amount;

ALTER TABLE invoices DROP COLUMN IF EXISTS supply_type;
ALTER TABLE invoices DROP COLUMN IF EXISTS cgst_amount;
ALTER TABLE invoices DROP COLUMN IF EXISTS sgst_amount;
ALTER TABLE invoices DROP COLUMN IF EXISTS igst_amount;
ALTER TABLE invoices DROP COLUMN IF EXISTS reverse_charge_applicable;
ALTER TABLE invoices DROP COLUMN IF EXISTS reverse_charge_notes;

ALTER TABLE customers DROP COLUMN IF EXISTS gstin_validated;
ALTER TABLE customers DROP COLUMN IF EXISTS gstin_validation_date;
ALTER TABLE customers DROP COLUMN IF EXISTS customer_state_code;
```

## Troubleshooting

### Error: Column already exists
- Migration was already run
- Safe to run again (uses IF NOT EXISTS)

### Error: Function uuid_generate_v4 does not exist
- UUID extension might not be enabled
- Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Error: RLS policy already exists
- Policy already created
- Check with query below to view existing policies

### View existing RLS policies
```sql
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE tablename IN ('invoices', 'invoice_items', 'customers');
```

## Performance Considerations

- Indexes are created on commonly queried columns
- supply_type and reverse_charge_applicable have indexes for filtering
- hsn_sac_code indexed for lookups
- Monitor performance with large datasets

## Data Consistency Notes

⚠️ **Important**: 
- Existing invoices will need to be updated to set supply_type
- Default supply_type is 'intra-state' (standard in India)
- Existing GST amounts remain in gst_amount column
- New CGST/SGST/IGST columns will be 0 until invoices are regenerated

## Support

For issues or questions:
1. Check error message in Supabase SQL Editor
2. Review this troubleshooting section
3. Verify all files are correctly placed
4. Check Supabase documentation

---

**Last Updated**: January 5, 2026
**Status**: Ready to Deploy
