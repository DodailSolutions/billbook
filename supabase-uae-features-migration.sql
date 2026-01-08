-- =====================================================
-- UAE REGIONAL FEATURES MIGRATION
-- Adds support for VAT, TRN, and regional tax settings
-- =====================================================

-- =====================================================
-- 1. ADD REGION TO USER PROFILES
-- =====================================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS region VARCHAR(10) DEFAULT 'IN' CHECK (region IN ('IN', 'AE'));

-- Add index for faster region lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(region);

COMMENT ON COLUMN user_profiles.region IS 'User business region: IN (India) or AE (UAE)';

-- =====================================================
-- 2. UPDATE USER PROFILES FOR REGIONAL TAX INFO
-- =====================================================

-- Add UAE-specific fields to user_profiles (company info stored here)
DO $$ 
BEGIN
    -- VAT/TRN for UAE (stored in user_profiles)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'tax_registration_number') THEN
        ALTER TABLE user_profiles ADD COLUMN tax_registration_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'gstin') THEN
        ALTER TABLE user_profiles ADD COLUMN gstin VARCHAR(15);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'default_tax_rate') THEN
        ALTER TABLE user_profiles ADD COLUMN default_tax_rate DECIMAL(5,2) DEFAULT 18.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'tax_type') THEN
        ALTER TABLE user_profiles ADD COLUMN tax_type VARCHAR(10) DEFAULT 'GST' CHECK (tax_type IN ('GST', 'VAT'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'arabic_business_name') THEN
        ALTER TABLE user_profiles ADD COLUMN arabic_business_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'business_address') THEN
        ALTER TABLE user_profiles ADD COLUMN business_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'arabic_address') THEN
        ALTER TABLE user_profiles ADD COLUMN arabic_address TEXT;
    END IF;
END $$;

COMMENT ON COLUMN user_profiles.tax_registration_number IS 'TRN for UAE or alternative tax ID';
COMMENT ON COLUMN user_profiles.gstin IS 'GSTIN for India users (15 characters)';
COMMENT ON COLUMN user_profiles.default_tax_rate IS 'Default tax rate: 18% GST for India, 5% VAT for UAE';
COMMENT ON COLUMN user_profiles.tax_type IS 'Tax system: GST (India) or VAT (UAE)';
COMMENT ON COLUMN user_profiles.arabic_business_name IS 'Arabic business name for UAE invoices';
COMMENT ON COLUMN user_profiles.business_address IS 'Business address';
COMMENT ON COLUMN user_profiles.arabic_address IS 'Arabic address for UAE invoices';

-- =====================================================
-- 3. UPDATE CUSTOMERS TABLE FOR UAE
-- =====================================================

DO $$ 
BEGIN
    -- Add TRN field for UAE customers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'trn') THEN
        ALTER TABLE customers ADD COLUMN trn VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'arabic_name') THEN
        ALTER TABLE customers ADD COLUMN arabic_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'arabic_address') THEN
        ALTER TABLE customers ADD COLUMN arabic_address TEXT;
    END IF;
END $$;

COMMENT ON COLUMN customers.trn IS 'Tax Registration Number for UAE customers';
COMMENT ON COLUMN customers.arabic_name IS 'Customer name in Arabic for UAE invoices';
COMMENT ON COLUMN customers.arabic_address IS 'Customer address in Arabic for UAE invoices';

-- =====================================================
-- 4. UPDATE INVOICES TABLE FOR UAE VAT
-- =====================================================

DO $$ 
BEGIN
    -- Update invoice structure for UAE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'tax_type') THEN
        ALTER TABLE invoices ADD COLUMN tax_type VARCHAR(10) DEFAULT 'GST' CHECK (tax_type IN ('GST', 'VAT'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'vat_percentage') THEN
        ALTER TABLE invoices ADD COLUMN vat_percentage DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'vat_amount') THEN
        ALTER TABLE invoices ADD COLUMN vat_amount DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'currency') THEN
        ALTER TABLE invoices ADD COLUMN currency VARCHAR(3) DEFAULT 'INR';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'show_arabic') THEN
        ALTER TABLE invoices ADD COLUMN show_arabic BOOLEAN DEFAULT false;
    END IF;
END $$;

COMMENT ON COLUMN invoices.tax_type IS 'GST (India) or VAT (UAE)';
COMMENT ON COLUMN invoices.vat_percentage IS 'VAT rate for UAE invoices (typically 5%)';
COMMENT ON COLUMN invoices.vat_amount IS 'Total VAT amount for UAE invoices';
COMMENT ON COLUMN invoices.currency IS 'Invoice currency: INR, AED, USD, etc';
COMMENT ON COLUMN invoices.show_arabic IS 'Show Arabic translations on invoice';

-- =====================================================
-- 5. UPDATE INVOICE ITEMS FOR UAE (NO HSN/SAC)
-- =====================================================

DO $$ 
BEGIN
    -- Make HSN/SAC nullable for UAE users
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'invoice_items' AND column_name = 'hsn_sac_code') THEN
        ALTER TABLE invoice_items ALTER COLUMN hsn_sac_code DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'invoice_items' AND column_name = 'hsn_sac_type') THEN
        ALTER TABLE invoice_items ALTER COLUMN hsn_sac_type DROP NOT NULL;
    END IF;
    
    -- Add VAT fields for items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_items' AND column_name = 'vat_rate') THEN
        ALTER TABLE invoice_items ADD COLUMN vat_rate DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_items' AND column_name = 'vat_amount') THEN
        ALTER TABLE invoice_items ADD COLUMN vat_amount DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_items' AND column_name = 'arabic_description') THEN
        ALTER TABLE invoice_items ADD COLUMN arabic_description TEXT;
    END IF;
END $$;

COMMENT ON COLUMN invoice_items.vat_rate IS 'VAT rate for this item (UAE only)';
COMMENT ON COLUMN invoice_items.vat_amount IS 'VAT amount for this item (UAE only)';
COMMENT ON COLUMN invoice_items.arabic_description IS 'Item description in Arabic';

-- =====================================================
-- 6. UPDATE INVOICE SETTINGS FOR REGIONAL PREFERENCES
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_settings' AND column_name = 'show_hsn_sac') THEN
        ALTER TABLE invoice_settings ADD COLUMN show_hsn_sac BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_settings' AND column_name = 'show_gst_breakdown') THEN
        ALTER TABLE invoice_settings ADD COLUMN show_gst_breakdown BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_settings' AND column_name = 'show_arabic') THEN
        ALTER TABLE invoice_settings ADD COLUMN show_arabic BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_settings' AND column_name = 'tax_label') THEN
        ALTER TABLE invoice_settings ADD COLUMN tax_label VARCHAR(50) DEFAULT 'GST';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_settings' AND column_name = 'tax_id_label') THEN
        ALTER TABLE invoice_settings ADD COLUMN tax_id_label VARCHAR(50) DEFAULT 'GSTIN';
    END IF;
END $$;

COMMENT ON COLUMN invoice_settings.show_hsn_sac IS 'Show HSN/SAC codes (India only)';
COMMENT ON COLUMN invoice_settings.show_gst_breakdown IS 'Show GST breakdown (CGST/SGST/IGST for India)';
COMMENT ON COLUMN invoice_settings.show_arabic IS 'Show Arabic translations on invoices';
COMMENT ON COLUMN invoice_settings.tax_label IS 'Tax label: GST, VAT, Tax, etc';
COMMENT ON COLUMN invoice_settings.tax_id_label IS 'Tax ID label: GSTIN, TRN, VAT Number, etc';

-- =====================================================
-- 7. CREATE FUNCTION TO AUTO-SET REGION ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION set_user_region_from_geo()
RETURNS TRIGGER AS $$
BEGIN
    -- This can be called from your signup flow
    -- Set region based on user's location or preference
    IF NEW.region IS NULL THEN
        NEW.region := 'IN'; -- Default to India
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS trigger_set_user_region ON user_profiles;
CREATE TRIGGER trigger_set_user_region
    BEFORE INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_user_region_from_geo();

-- =====================================================
-- 8. HELPER VIEWS FOR UAE USERS
-- =====================================================

-- View for UAE invoices with VAT
CREATE OR REPLACE VIEW vw_uae_invoices AS
SELECT 
    i.id,
    i.invoice_number,
    i.invoice_date,
    i.due_date,
    i.customer_id,
    c.name as customer_name,
    c.trn as customer_trn,
    i.subtotal,
    i.vat_percentage,
    i.vat_amount,
    i.total,
    i.currency,
    i.status,
    i.show_arabic,
    up.business_name,
    up.tax_registration_number as company_trn,
    up.arabic_business_name
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id
LEFT JOIN user_profiles up ON i.user_id = up.id
WHERE i.tax_type = 'VAT';

COMMENT ON VIEW vw_uae_invoices IS 'Simplified view of UAE VAT invoices';

-- =====================================================
-- 9. UPDATE SUBSCRIPTION PLANS FOR UAE
-- =====================================================

-- Add UAE-specific plans (AED pricing)
INSERT INTO subscription_plans (name, slug, description, price, currency, billing_period, features, limits, is_popular, sort_order)
VALUES
('Starter UAE', 'starter-ae', 'Perfect for UAE freelancers', 49, 'AED', 'monthly',
 '["Unlimited invoices", "VAT compliance", "TRN validation", "Arabic invoices", "Multi-currency"]'::jsonb,
 '{"invoices_per_month": 999999, "customers": 999999, "storage_gb": 5}'::jsonb,
 false, 101),
 
('Growth UAE', 'growth-ae', 'For small UAE businesses', 99, 'AED', 'monthly',
 '["Everything in Starter", "3 users", "Recurring invoices", "Payment reminders", "VAT reports"]'::jsonb,
 '{"invoices_per_month": 999999, "customers": 999999, "users": 3, "storage_gb": 10}'::jsonb,
 true, 102),
 
('Pro UAE', 'pro-ae', 'For growing UAE companies', 199, 'AED', 'monthly',
 '["Everything in Growth", "5 users", "Advanced VAT reports", "API access", "Custom templates"]'::jsonb,
 '{"invoices_per_month": 999999, "customers": 999999, "users": 5, "storage_gb": 25}'::jsonb,
 false, 103)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Grant necessary permissions
GRANT SELECT ON vw_uae_invoices TO authenticated;

-- Add helpful comments
COMMENT ON TABLE user_profiles IS 'User profiles with region support (IN/AE)';
COMMENT ON COLUMN invoices.currency IS 'Invoice currency: INR (India), AED (UAE), USD, EUR, etc';
