

-- ==========================================
-- FILE: supabase-schema.sql
-- ==========================================

-- BillBook Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  gstin VARCHAR(15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  gst_percentage DECIMAL(5, 2) DEFAULT 0,
  gst_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Number Sequence Table
CREATE TABLE IF NOT EXISTS invoice_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_number INTEGER NOT NULL DEFAULT 0,
  prefix VARCHAR(10) DEFAULT 'INV',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;

-- Customers Policies
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
CREATE POLICY "Users can insert their own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);

-- Invoices Policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
CREATE POLICY "Users can insert their own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
CREATE POLICY "Users can delete their own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Invoice Items Policies
DROP POLICY IF EXISTS "Users can view invoice items for their invoices" ON invoice_items;
CREATE POLICY "Users can view invoice items for their invoices"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert invoice items for their invoices" ON invoice_items;
CREATE POLICY "Users can insert invoice items for their invoices"
  ON invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update invoice items for their invoices" ON invoice_items;
CREATE POLICY "Users can update invoice items for their invoices"
  ON invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete invoice items for their invoices" ON invoice_items;
CREATE POLICY "Users can delete invoice items for their invoices"
  ON invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Invoice Sequences Policies
DROP POLICY IF EXISTS "Users can view their own invoice sequence" ON invoice_sequences;
CREATE POLICY "Users can view their own invoice sequence"
  ON invoice_sequences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoice sequence" ON invoice_sequences;
CREATE POLICY "Users can insert their own invoice sequence"
  ON invoice_sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoice sequence" ON invoice_sequences;
CREATE POLICY "Users can update their own invoice sequence"
  ON invoice_sequences FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_sequences_updated_at ON invoice_sequences;
CREATE TRIGGER update_invoice_sequences_updated_at
  BEFORE UPDATE ON invoice_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_sequence_record RECORD;
  v_next_number INTEGER;
  v_invoice_number VARCHAR;
BEGIN
  -- Get or create sequence record
  SELECT * INTO v_sequence_record
  FROM invoice_sequences
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO invoice_sequences (user_id, current_number, prefix)
    VALUES (p_user_id, 1, 'INV')
    RETURNING * INTO v_sequence_record;
    v_next_number := 1;
  ELSE
    v_next_number := v_sequence_record.current_number + 1;
    UPDATE invoice_sequences
    SET current_number = v_next_number
    WHERE user_id = p_user_id;
  END IF;

  -- Format invoice number as PREFIX-YYYY-NNNN
  v_invoice_number := v_sequence_record.prefix || '-' || 
                      TO_CHAR(CURRENT_DATE, 'YYYY') || '-' ||
                      LPAD(v_next_number::TEXT, 4, '0');

  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- FILE: supabase-superadmin-schema.sql
-- ==========================================

-- Super Admin Module Database Schema
-- Run this migration to add super admin features

-- ============================================
-- 1. USER ROLES & PERMISSIONS
-- ============================================

-- Add role column to auth.users metadata
-- Update existing users table or create user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    business_name VARCHAR(255),
    business_id UUID,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_id ON user_profiles(business_id);

-- ============================================
-- 2. SUBSCRIPTION PLANS
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    billing_period VARCHAR(20) DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}', -- {invoices_per_month: 50, customers: 100, etc}
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default plans
INSERT INTO subscription_plans (name, slug, description, price, billing_period, features, limits, is_popular, sort_order) VALUES
('Free', 'free', 'Perfect for getting started', 0, 'lifetime', 
 '["Unlimited invoices", "Unlimited customers", "PDF downloads", "Basic customization", "GST compliance"]'::jsonb,
 '{"invoices_per_month": 999999, "customers": 999999, "storage_gb": 1}'::jsonb,
 false, 1),
('Starter', 'starter', 'Best for small businesses', 499, 'monthly',
 '["Everything in Free", "Priority support", "Advanced customization", "Logo upload", "Custom branding"]'::jsonb,
 '{"invoices_per_month": 999999, "customers": 999999, "storage_gb": 5}'::jsonb,
 true, 2),
('Professional', 'professional', 'For growing businesses', 999, 'monthly',
 '["Everything in Starter", "Recurring invoices", "Payment reminders", "Analytics", "Multi-currency"]'::jsonb,
 '{"invoices_per_month": 999999, "customers": 999999, "storage_gb": 20}'::jsonb,
 false, 3),
('Enterprise', 'enterprise', 'For large organizations', 2999, 'monthly',
 '["Everything in Professional", "Dedicated support", "Custom integrations", "White label", "API access"]'::jsonb,
 '{"invoices_per_month": 999999, "customers": 999999, "storage_gb": 100}'::jsonb,
 false, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. USER SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    payment_method VARCHAR(50),
    amount_paid DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- ============================================
-- 4. COUPONS & OFFERS
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    applicable_plans UUID[], -- Array of plan IDs, null means all plans
    min_purchase_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- ============================================
-- 5. COUPON USAGE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);

-- ============================================
-- 6. PAYMENTS & TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50), -- razorpay, stripe, etc
    gateway_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ============================================
-- 7. REFUNDS
-- ============================================

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    gateway_refund_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- ============================================
-- 8. SUPPORT TICKETS
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('billing', 'technical', 'feature_request', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

-- ============================================
-- 9. SUPPORT TICKET MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal notes for admins
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);

-- ============================================
-- 10. AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100), -- 'user', 'plan', 'coupon', 'payment', etc
    entity_id UUID,
    changes JSONB, -- Store old and new values
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- 11. SYSTEM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = user_uuid AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User Profiles: Users can view their own, super admins can view all
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can update user profiles" ON user_profiles;
CREATE POLICY "Super admins can update user profiles" ON user_profiles
    FOR ALL USING (is_super_admin(auth.uid()));

-- Subscription Plans: Anyone can view active plans, only super admins can modify
DROP POLICY IF EXISTS "Anyone can view active plans" ON subscription_plans;
CREATE POLICY "Anyone can view active plans" ON subscription_plans
    FOR SELECT USING (is_active = true OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only super admins can modify plans" ON subscription_plans;
CREATE POLICY "Only super admins can modify plans" ON subscription_plans
    FOR ALL USING (is_super_admin(auth.uid()));

-- User Subscriptions: Users see own, super admins see all
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins manage subscriptions" ON user_subscriptions;
CREATE POLICY "Super admins manage subscriptions" ON user_subscriptions
    FOR ALL USING (is_super_admin(auth.uid()));

-- Coupons: Anyone can view active coupons, super admins manage all
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons" ON coupons
    FOR SELECT USING (is_active = true OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins manage coupons" ON coupons;
CREATE POLICY "Super admins manage coupons" ON coupons
    FOR ALL USING (is_super_admin(auth.uid()));

-- Payments: Users see own, super admins see all
DROP POLICY IF EXISTS "Users view own payments" ON payments;
CREATE POLICY "Users view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins manage payments" ON payments;
CREATE POLICY "Super admins manage payments" ON payments
    FOR ALL USING (is_super_admin(auth.uid()));

-- Refunds: Users see own, super admins manage all
DROP POLICY IF EXISTS "Users view own refunds" ON refunds;
CREATE POLICY "Users view own refunds" ON refunds
    FOR SELECT USING (auth.uid() = user_id OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins manage refunds" ON refunds;
CREATE POLICY "Super admins manage refunds" ON refunds
    FOR ALL USING (is_super_admin(auth.uid()));

-- Support Tickets: Users manage own, super admins manage all
DROP POLICY IF EXISTS "Users view own tickets" ON support_tickets;
CREATE POLICY "Users view own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users create own tickets" ON support_tickets;
CREATE POLICY "Users create own tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins manage all tickets" ON support_tickets;
CREATE POLICY "Super admins manage all tickets" ON support_tickets
    FOR ALL USING (is_super_admin(auth.uid()));

-- Support Messages: Access based on ticket access
DROP POLICY IF EXISTS "View messages for accessible tickets" ON support_ticket_messages;
CREATE POLICY "View messages for accessible tickets" ON support_ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE id = ticket_id
            AND (user_id = auth.uid() OR is_super_admin(auth.uid()))
        )
    );

DROP POLICY IF EXISTS "Create messages for accessible tickets" ON support_ticket_messages;
CREATE POLICY "Create messages for accessible tickets" ON support_ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE id = ticket_id
            AND (user_id = auth.uid() OR is_super_admin(auth.uid()))
        )
    );

-- Audit Logs: Super admins only
DROP POLICY IF EXISTS "Super admins view audit logs" ON audit_logs;
CREATE POLICY "Super admins view audit logs" ON audit_logs
    FOR SELECT USING (is_super_admin(auth.uid()));

-- System Settings: Super admins only
DROP POLICY IF EXISTS "Super admins manage settings" ON system_settings;
CREATE POLICY "Super admins manage settings" ON system_settings
    FOR ALL USING (is_super_admin(auth.uid()));
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_refunds_updated_at ON refunds;
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_support_ticket_number ON support_tickets;
-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 6) AS INTEGER)), 0) + 1
    INTO counter
    FROM support_tickets;
    
    new_number := 'TICK-' || LPAD(counter::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_support_ticket_number BEFORE INSERT ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- ============================================
-- 14. INITIAL DATA
-- ============================================

-- Create a default super admin profile trigger
-- Note: You'll need to manually set a user as super admin initially
-- UPDATE user_profiles SET role = 'super_admin' WHERE id = 'your-user-id';

COMMENT ON TABLE user_profiles IS 'User roles and business associations';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans and pricing';
COMMENT ON TABLE user_subscriptions IS 'Active and historical user subscriptions';
COMMENT ON TABLE coupons IS 'Discount coupons and promotional offers';
COMMENT ON TABLE payments IS 'Payment transactions and history';
COMMENT ON TABLE refunds IS 'Refund requests and processing';
COMMENT ON TABLE support_tickets IS 'Customer support tickets';
COMMENT ON TABLE audit_logs IS 'System activity audit trail';


-- ==========================================
-- FILE: supabase-invoice-settings-table.sql
-- ==========================================

-- Create invoice_settings table with all customization columns
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Company Information
  company_name VARCHAR(255),
  company_email VARCHAR(255),
  company_phone VARCHAR(50),
  company_address TEXT,
  company_gstin VARCHAR(15),
  company_logo_url TEXT,
  
  -- Logo Settings
  logo_size VARCHAR(10) DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large')),
  
  -- Company Name Styling
  company_font_family VARCHAR(50) DEFAULT 'Arial',
  company_font_size INTEGER DEFAULT 24 CHECK (company_font_size >= 16 AND company_font_size <= 48),
  company_name_color VARCHAR(7) DEFAULT '#000000',
  company_font_weight VARCHAR(10) DEFAULT 'bold' CHECK (company_font_weight IN ('normal', 'bold', 'bolder')),
  
  -- Company Details Styling
  company_details_font_family VARCHAR(50) DEFAULT 'Arial',
  company_details_font_size INTEGER DEFAULT 12 CHECK (company_details_font_size >= 10 AND company_details_font_size <= 16),
  company_details_color VARCHAR(7) DEFAULT '#6b7280',
  
  -- Invoice Body Text Styling
  invoice_font_family VARCHAR(50) DEFAULT 'Arial',
  invoice_font_size INTEGER DEFAULT 14 CHECK (invoice_font_size >= 10 AND invoice_font_size <= 18),
  
  -- Terms & Conditions Styling
  terms_font_family VARCHAR(50) DEFAULT 'Arial',
  terms_font_size INTEGER DEFAULT 12 CHECK (terms_font_size >= 10 AND terms_font_size <= 16),
  
  -- Invoice Branding
  invoice_prefix VARCHAR(10) DEFAULT 'INV',
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#8B5CF6',
  
  -- Invoice Content
  terms_and_conditions TEXT,
  payment_instructions TEXT,
  footer_text TEXT,
  
  -- Display Options
  show_logo BOOLEAN DEFAULT true,
  show_company_details BOOLEAN DEFAULT true,
  show_gstin BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_invoice_settings_user_id ON invoice_settings(user_id);

-- Enable Row Level Security
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own invoice settings" ON invoice_settings;
DROP POLICY IF EXISTS "Users can insert their own invoice settings" ON invoice_settings;
DROP POLICY IF EXISTS "Users can update their own invoice settings" ON invoice_settings;
DROP POLICY IF EXISTS "Users can delete their own invoice settings" ON invoice_settings;

-- RLS Policies for invoice_settings
CREATE POLICY "Users can view their own invoice settings"
  ON invoice_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice settings"
  ON invoice_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice settings"
  ON invoice_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice settings"
  ON invoice_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE invoice_settings IS 'Stores customizable invoice settings and branding for each user';
COMMENT ON COLUMN invoice_settings.logo_size IS 'Size of company logo: small (64px), medium (96px), large (128px)';
COMMENT ON COLUMN invoice_settings.company_font_family IS 'Font family for company name';
COMMENT ON COLUMN invoice_settings.company_font_size IS 'Font size for company name in pixels (16-48)';
COMMENT ON COLUMN invoice_settings.company_name_color IS 'Hex color for company name text';
COMMENT ON COLUMN invoice_settings.company_font_weight IS 'Font weight for company name';
COMMENT ON COLUMN invoice_settings.company_details_font_family IS 'Font family for company details (address, email, phone)';
COMMENT ON COLUMN invoice_settings.company_details_font_size IS 'Font size for company details in pixels (10-16)';
COMMENT ON COLUMN invoice_settings.company_details_color IS 'Hex color for company details text';
COMMENT ON COLUMN invoice_settings.invoice_font_family IS 'Font family for invoice body text';
COMMENT ON COLUMN invoice_settings.invoice_font_size IS 'Font size for invoice body text in pixels (10-18)';
COMMENT ON COLUMN invoice_settings.terms_font_family IS 'Font family for terms, conditions, and notes';
COMMENT ON COLUMN invoice_settings.terms_font_size IS 'Font size for terms, conditions, and notes in pixels (10-16)';


-- ==========================================
-- FILE: supabase-user-profiles-enhancement.sql
-- ==========================================

-- Enhanced User Profiles Migration
-- Add business information fields to user_profiles table

-- Add new columns to user_profiles table if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS gstin VARCHAR(15);

-- Create index for business_type for analytics
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_type ON user_profiles(business_type);

-- Create a view for super admin analytics
DROP VIEW IF EXISTS business_type_analytics;
CREATE OR REPLACE VIEW business_type_analytics AS
SELECT 
    business_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
    COUNT(DISTINCT CASE 
        WHEN EXISTS (
            SELECT 1 FROM user_subscriptions us 
            WHERE us.user_id = user_profiles.id 
            AND us.status = 'active'
        ) THEN user_profiles.id 
    END) as paying_users
FROM user_profiles
WHERE business_type IS NOT NULL
GROUP BY business_type
ORDER BY total_users DESC;

-- Grant access to authenticated users for their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy for inserting during signup
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create super admin user
-- Run this after setting up your authentication
-- Replace 'your-email@example.com' with your actual email

-- First, you'll need to sign up through the UI, then run:
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'your-email@example.com';
-- INSERT INTO user_profiles (id, role, business_name, status) 
-- SELECT id, 'super_admin', 'BillBooky Admin', 'active' 
-- FROM auth.users 
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- Create admin analytics table for tracking business insights
CREATE TABLE IF NOT EXISTS business_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_type VARCHAR(50),
    metric_name VARCHAR(100),
    metric_value NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_analytics_type ON business_analytics(business_type);
CREATE INDEX IF NOT EXISTS idx_business_analytics_date ON business_analytics(recorded_at);

-- Function to update business analytics
DROP FUNCTION IF EXISTS update_business_analytics();
CREATE OR REPLACE FUNCTION update_business_analytics()
RETURNS void AS $$
BEGIN
    -- Clear old analytics (keep last 30 days)
    DELETE FROM business_analytics WHERE recorded_at < NOW() - INTERVAL '30 days';
    
    -- Insert current analytics
    INSERT INTO business_analytics (business_type, metric_name, metric_value)
    SELECT 
        business_type,
        'active_users',
        COUNT(*)
    FROM user_profiles
    WHERE status = 'active' AND business_type IS NOT NULL
    GROUP BY business_type;
    
    INSERT INTO business_analytics (business_type, metric_name, metric_value)
    SELECT 
        up.business_type,
        'paying_users',
        COUNT(DISTINCT us.user_id)
    FROM user_subscriptions us
    JOIN user_profiles up ON us.user_id = up.id
    WHERE us.status = 'active' AND up.business_type IS NOT NULL
    GROUP BY up.business_type;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE user_profiles IS 'Enhanced user profiles with business information for analytics';
COMMENT ON VIEW business_type_analytics IS 'Real-time analytics of business types using the platform';
COMMENT ON FUNCTION update_business_analytics() IS 'Updates business analytics snapshot for historical tracking';


-- ==========================================
-- FILE: supabase-testimonials-schema.sql
-- ==========================================

-- Testimonials table for managing customer testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read active testimonials
CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_active = true);

-- Admin can manage all testimonials
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order 
  ON public.testimonials(is_active, display_order);

-- Insert sample testimonials
INSERT INTO public.testimonials (name, company, role, content, rating, display_order, is_active) VALUES
  ('Rajesh Kumar', 'Kumar Enterprises', 'Founder', 'BillBooky has transformed how we handle invoicing. The GST compliance feature is a lifesaver for our business!', 5, 1, true),
  ('Priya Sharma', 'Sharma Consultancy', 'CEO', 'Simple, fast, and reliable. Creating invoices now takes less than a minute. Highly recommend for Indian businesses!', 5, 2, true),
  ('Amit Patel', 'Patel Traders', 'Managing Director', 'The free plan is generous and the paid plans are very affordable. Perfect for small businesses like ours.', 5, 3, true),
  ('Sneha Reddy', 'Reddy Designs', 'Creative Director', 'Love the customization options! Our invoices now match our brand perfectly. Great tool!', 5, 4, true),
  ('Vikram Singh', 'Singh Logistics', 'Operations Manager', 'Payment tracking and automated reminders have improved our cash flow significantly. Worth every rupee!', 5, 5, true),
  ('Meena Iyer', 'Iyer & Co', 'Partner', 'Cloud-based solution means I can create invoices from anywhere. The mobile experience is excellent too!', 5, 6, true),
  ('Arjun Mehta', 'Mehta Electronics', 'Owner', 'Finally found an invoicing tool that understands Indian business needs. GST calculations are spot-on!', 5, 7, true),
  ('Kavita Gupta', 'Gupta Fashion', 'Founder & Designer', 'The recurring invoice feature saves me hours every month. Absolutely fantastic for subscription-based services!', 5, 8, true),
  ('Sanjay Desai', 'Desai Constructions', 'Project Manager', 'Professional invoices with my company logo make such a difference. Clients are impressed!', 5, 9, true),
  ('Neha Kapoor', 'Kapoor Digital Marketing', 'CEO', 'Customer support is outstanding! They helped me set up everything in minutes. Highly satisfied!', 5, 10, true),
  ('Rahul Nair', 'Nair Tech Solutions', 'Director', 'The analytics dashboard helps me track all payments effortlessly. This is exactly what my business needed!', 5, 11, true),
  ('Divya Srinivasan', 'Srinivasan Interiors', 'Interior Designer', 'Beautiful invoice templates and easy customization. My clients love the professional look!', 5, 12, true);


-- ==========================================
-- FILE: supabase-team-members-schema.sql
-- ==========================================

-- Team Members and Roles Schema
-- Allows users to invite team members based on their subscription plan

-- ============================================
-- 1. ROLES AND PERMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS team_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]', -- Array of permission strings
    is_system BOOLEAN DEFAULT false, -- System roles cannot be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default roles
INSERT INTO team_roles (name, slug, description, permissions, is_system) VALUES
('Owner', 'owner', 'Full access to all features and settings', 
 '["*"]'::jsonb, true),
('Admin', 'admin', 'Manage invoices, customers, and team members', 
 '["invoices.*", "customers.*", "team.view", "team.invite", "settings.view"]'::jsonb, true),
('Accountant', 'accountant', 'View and manage invoices and customers', 
 '["invoices.*", "customers.*", "reports.view"]'::jsonb, true),
('Viewer', 'viewer', 'Read-only access to invoices and customers', 
 '["invoices.view", "customers.view"]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. TEAM MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Linked after user accepts invite
    role_id UUID NOT NULL REFERENCES team_roles(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
    invite_token VARCHAR(255) UNIQUE,
    invite_expires_at TIMESTAMP WITH TIME ZONE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(owner_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_owner_id ON team_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON team_members(invite_token);

-- ============================================
-- 3. TEAM ACTIVITY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS team_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- invited, joined, removed, role_changed, etc.
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_activity_log_owner_id ON team_activity_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_team_member_id ON team_activity_log(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_created_at ON team_activity_log(created_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity_log ENABLE ROW LEVEL SECURITY;

-- Team Roles Policies
DROP POLICY IF EXISTS "Anyone can view team roles" ON team_roles;
CREATE POLICY "Anyone can view team roles" ON team_roles
    FOR SELECT USING (true);

-- Team Members Policies
DROP POLICY IF EXISTS "Users can view team members of their organization" ON team_members;
CREATE POLICY "Users can view team members of their organization" ON team_members
    FOR SELECT USING (
        owner_id = auth.uid() 
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Owners can manage team members" ON team_members;
CREATE POLICY "Owners can manage team members" ON team_members
    FOR ALL USING (owner_id = auth.uid());

-- Team Activity Log Policies
DROP POLICY IF EXISTS "Users can view own team activity" ON team_activity_log;
CREATE POLICY "Users can view own team activity" ON team_activity_log
    FOR SELECT USING (
        owner_id = auth.uid() 
        OR actor_id = auth.uid()
    );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to check team member limit based on subscription plan
DROP FUNCTION IF EXISTS check_team_member_limit(UUID);
CREATE OR REPLACE FUNCTION check_team_member_limit(p_owner_id UUID)
RETURNS TABLE (
    allowed INTEGER,
    current INTEGER,
    can_add BOOLEAN
) AS $$
DECLARE
    v_plan_slug TEXT;
    v_max_members INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get user's current plan
    SELECT sp.slug INTO v_plan_slug
    FROM user_subscriptions us
    JOIN subscription_plans sp ON sp.id = us.plan_id
    WHERE us.user_id = p_owner_id 
        AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- Set member limits based on plan
    v_max_members := CASE v_plan_slug
        WHEN 'free' THEN 1          -- Only owner
        WHEN 'starter' THEN 1       -- Only owner
        WHEN 'professional' THEN 2  -- Owner + 2 members = 3 total
        WHEN 'lifetime' THEN 2      -- Owner + 2 members = 3 total
        WHEN 'enterprise' THEN 10   -- Owner + 10 members = 11 total
        ELSE 1
    END;
    
    -- Count current active team members (excluding owner)
    SELECT COUNT(*) INTO v_current_count
    FROM team_members
    WHERE owner_id = p_owner_id 
        AND status IN ('active', 'pending');
    
    RETURN QUERY SELECT 
        v_max_members,
        v_current_count::INTEGER,
        (v_current_count < v_max_members) AS can_add;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_roles_updated_at ON team_roles;
CREATE TRIGGER update_team_roles_updated_at
    BEFORE UPDATE ON team_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE team_roles IS 'Defines roles and permissions for team members';
COMMENT ON TABLE team_members IS 'Team members invited by account owners. Limits enforced by subscription plan.';
COMMENT ON TABLE team_activity_log IS 'Audit log for all team member activities';


-- ==========================================
-- FILE: supabase-team-addons-schema.sql
-- ==========================================

-- Additional Team Member Purchases Schema
-- Allows Lifetime plan users to buy extra team member slots

-- ============================================
-- 1. ADDITIONAL TEAM SLOTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_member_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1, -- Number of additional slots purchased
    price_per_slot INTEGER NOT NULL, -- Price paid per slot (in paise/cents)
    billing_period VARCHAR(20) NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_member_addons_user_id ON team_member_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_addons_status ON team_member_addons(status);
CREATE INDEX IF NOT EXISTS idx_team_member_addons_end_date ON team_member_addons(end_date);

-- ============================================
-- 2. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE team_member_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own team member addons" ON team_member_addons;
CREATE POLICY "Users can view own team member addons" ON team_member_addons
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own team member addons" ON team_member_addons;
CREATE POLICY "Users can insert own team member addons" ON team_member_addons
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own team member addons" ON team_member_addons;
CREATE POLICY "Users can update own team member addons" ON team_member_addons
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- 3. UPDATED TEAM LIMIT CHECK FUNCTION
-- ============================================

-- Drop existing function
DROP FUNCTION IF EXISTS check_team_member_limit(UUID);

-- Recreated with additional slots support
CREATE OR REPLACE FUNCTION check_team_member_limit(p_owner_id UUID)
RETURNS TABLE (
    allowed INTEGER,
    current INTEGER,
    can_add BOOLEAN,
    base_limit INTEGER,
    purchased_slots INTEGER,
    plan_slug TEXT
) AS $$
DECLARE
    v_plan_slug TEXT;
    v_base_limit INTEGER;
    v_purchased_slots INTEGER := 0;
    v_total_allowed INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get user's current plan
    SELECT sp.slug INTO v_plan_slug
    FROM user_subscriptions us
    JOIN subscription_plans sp ON sp.id = us.plan_id
    WHERE us.user_id = p_owner_id 
        AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- Set base member limits based on plan
    v_base_limit := CASE v_plan_slug
        WHEN 'free' THEN 0          -- Only owner
        WHEN 'starter' THEN 0       -- Only owner
        WHEN 'professional' THEN 2  -- Owner + 2 members
        WHEN 'lifetime' THEN 2      -- Owner + 2 members (can purchase more)
        WHEN 'enterprise' THEN 10   -- Owner + 10 members
        ELSE 0
    END;
    
    -- Check for additional purchased slots (only for lifetime plan)
    IF v_plan_slug = 'lifetime' THEN
        SELECT COALESCE(SUM(quantity), 0) INTO v_purchased_slots
        FROM team_member_addons
        WHERE user_id = p_owner_id 
            AND status = 'active'
            AND end_date > NOW();
    END IF;
    
    v_total_allowed := v_base_limit + v_purchased_slots;
    
    -- Count current active team members (excluding owner)
    SELECT COUNT(*) INTO v_current_count
    FROM team_members
    WHERE owner_id = p_owner_id 
        AND status IN ('active', 'pending');
    
    RETURN QUERY SELECT 
        v_total_allowed,
        v_current_count::INTEGER,
        (v_current_count < v_total_allowed) AS can_add,
        v_base_limit,
        v_purchased_slots::INTEGER,
        v_plan_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. ADDON PRICING CONSTANTS
-- ============================================

-- Create a lookup table for addon pricing
CREATE TABLE IF NOT EXISTS team_addon_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    billing_period VARCHAR(20) NOT NULL UNIQUE CHECK (billing_period IN ('monthly', 'yearly')),
    price_per_slot INTEGER NOT NULL, -- Price in paise/cents
    duration_days INTEGER NOT NULL,
    display_price VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert pricing
INSERT INTO team_addon_pricing (billing_period, price_per_slot, duration_days, display_price) VALUES
('monthly', 19900, 30, '₹199/month'), -- ₹199 per month
('yearly', 200000, 365, '₹2000/year') -- ₹2000 per year
ON CONFLICT (billing_period) DO UPDATE SET
    price_per_slot = EXCLUDED.price_per_slot,
    duration_days = EXCLUDED.duration_days,
    display_price = EXCLUDED.display_price;

-- RLS for pricing table
ALTER TABLE team_addon_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view addon pricing" ON team_addon_pricing;
CREATE POLICY "Anyone can view addon pricing" ON team_addon_pricing
    FOR SELECT USING (is_active = true);

-- ============================================
-- 5. HELPER FUNCTION TO GET ADDON INFO
-- ============================================

CREATE OR REPLACE FUNCTION get_user_team_addons(p_user_id UUID)
RETURNS TABLE (
    total_purchased INTEGER,
    active_slots INTEGER,
    monthly_slots INTEGER,
    yearly_slots INTEGER,
    next_expiry TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(quantity), 0)::INTEGER as total_purchased,
        COALESCE(SUM(CASE WHEN status = 'active' AND end_date > NOW() THEN quantity ELSE 0 END), 0)::INTEGER as active_slots,
        COALESCE(SUM(CASE WHEN billing_period = 'monthly' AND status = 'active' AND end_date > NOW() THEN quantity ELSE 0 END), 0)::INTEGER as monthly_slots,
        COALESCE(SUM(CASE WHEN billing_period = 'yearly' AND status = 'active' AND end_date > NOW() THEN quantity ELSE 0 END), 0)::INTEGER as yearly_slots,
        MIN(CASE WHEN status = 'active' AND end_date > NOW() THEN end_date ELSE NULL END) as next_expiry
    FROM team_member_addons
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. TRIGGERS
-- ============================================

CREATE TRIGGER update_team_member_addons_updated_at
    BEFORE UPDATE ON team_member_addons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE team_member_addons IS 'Additional team member slots purchased by Lifetime plan users';
COMMENT ON TABLE team_addon_pricing IS 'Pricing structure for additional team member slots';


-- ==========================================
-- FILE: supabase-recurring-schema.sql
-- ==========================================

-- BillBook Recurring Invoices & Reminders Extension
-- Run this AFTER the main schema (supabase-schema.sql)

-- Recurring Invoices Table
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  template_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  
  -- Recurrence settings
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_invoice_date DATE NOT NULL,
  
  -- Invoice template data
  gst_percentage DECIMAL(5, 2) DEFAULT 18,
  notes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Invoice Items (template for items to include)
CREATE TABLE IF NOT EXISTS recurring_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recurring_invoice_id UUID REFERENCES recurring_invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  recurring_invoice_id UUID REFERENCES recurring_invoices(id) ON DELETE CASCADE,
  
  -- Reminder details
  reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('due_date', 'overdue', 'recurring_upcoming')),
  reminder_date DATE NOT NULL,
  days_before INTEGER DEFAULT 0,
  
  -- Status
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Message
  message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user_id ON recurring_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_customer_id ON recurring_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_active ON recurring_invoices(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_invoice_items_recurring_id ON recurring_invoice_items(recurring_invoice_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_invoice_id ON reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_is_sent ON reminders(is_sent);

-- Enable RLS
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Recurring Invoices Policies
DROP POLICY IF EXISTS "Users can view their own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can view their own recurring invoices"
  ON recurring_invoices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can insert their own recurring invoices"
  ON recurring_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can update their own recurring invoices"
  ON recurring_invoices FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can delete their own recurring invoices"
  ON recurring_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Recurring Invoice Items Policies
DROP POLICY IF EXISTS "Users can view items for their recurring invoices" ON recurring_invoice_items;
CREATE POLICY "Users can view items for their recurring invoices"
  ON recurring_invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert items for their recurring invoices" ON recurring_invoice_items;
CREATE POLICY "Users can insert items for their recurring invoices"
  ON recurring_invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update items for their recurring invoices" ON recurring_invoice_items;
CREATE POLICY "Users can update items for their recurring invoices"
  ON recurring_invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete items for their recurring invoices" ON recurring_invoice_items;
CREATE POLICY "Users can delete items for their recurring invoices"
  ON recurring_invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recurring_invoices
      WHERE recurring_invoices.id = recurring_invoice_items.recurring_invoice_id
      AND recurring_invoices.user_id = auth.uid()
    )
  );

-- Reminders Policies
DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reminders" ON reminders;
CREATE POLICY "Users can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;
CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_recurring_invoices_updated_at ON recurring_invoices;
CREATE TRIGGER update_recurring_invoices_updated_at
  BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate next invoice date
CREATE OR REPLACE FUNCTION calculate_next_invoice_date(
  p_current_date DATE,
  p_frequency VARCHAR
)
RETURNS DATE AS $$
BEGIN
  IF p_frequency = 'monthly' THEN
    RETURN p_current_date + INTERVAL '1 month';
  ELSIF p_frequency = 'yearly' THEN
    RETURN p_current_date + INTERVAL '1 year';
  ELSE
    RETURN p_current_date + INTERVAL '1 month'; -- default to monthly
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice from recurring template
CREATE OR REPLACE FUNCTION generate_recurring_invoice(p_recurring_invoice_id UUID)
RETURNS UUID AS $$
DECLARE
  v_recurring RECORD;
  v_items RECORD;
  v_new_invoice_id UUID;
  v_invoice_number VARCHAR;
  v_subtotal DECIMAL(10, 2) := 0;
  v_gst_amount DECIMAL(10, 2);
  v_total DECIMAL(10, 2);
BEGIN
  -- Get recurring invoice details
  SELECT * INTO v_recurring
  FROM recurring_invoices
  WHERE id = p_recurring_invoice_id
  AND is_active = true
  AND next_invoice_date <= CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calculate subtotal from items
  FOR v_items IN 
    SELECT * FROM recurring_invoice_items 
    WHERE recurring_invoice_id = p_recurring_invoice_id
  LOOP
    v_subtotal := v_subtotal + (v_items.quantity * v_items.unit_price);
  END LOOP;

  -- Calculate GST and total
  v_gst_amount := (v_subtotal * v_recurring.gst_percentage) / 100;
  v_total := v_subtotal + v_gst_amount;

  -- Generate invoice number
  v_invoice_number := get_next_invoice_number(v_recurring.user_id);

  -- Create the invoice
  INSERT INTO invoices (
    user_id,
    customer_id,
    invoice_number,
    invoice_date,
    due_date,
    subtotal,
    gst_percentage,
    gst_amount,
    total,
    notes,
    status
  ) VALUES (
    v_recurring.user_id,
    v_recurring.customer_id,
    v_invoice_number,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days', -- default 30 days due
    v_subtotal,
    v_recurring.gst_percentage,
    v_gst_amount,
    v_total,
    v_recurring.notes || E'\n\n[Auto-generated from recurring invoice]',
    'draft'
  )
  RETURNING id INTO v_new_invoice_id;

  -- Copy items to new invoice
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
  SELECT 
    v_new_invoice_id,
    description,
    quantity,
    unit_price,
    quantity * unit_price
  FROM recurring_invoice_items
  WHERE recurring_invoice_id = p_recurring_invoice_id;

  -- Update recurring invoice
  UPDATE recurring_invoices
  SET 
    next_invoice_date = calculate_next_invoice_date(next_invoice_date, frequency),
    last_generated_at = NOW(),
    updated_at = NOW()
  WHERE id = p_recurring_invoice_id;

  -- Create reminder for new invoice
  INSERT INTO reminders (
    user_id,
    invoice_id,
    reminder_type,
    reminder_date,
    days_before,
    message
  ) VALUES (
    v_recurring.user_id,
    v_new_invoice_id,
    'due_date',
    CURRENT_DATE + INTERVAL '25 days', -- 5 days before due
    5,
    'Reminder: Invoice ' || v_invoice_number || ' is due soon'
  );

  RETURN v_new_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create reminders for upcoming recurring invoices
CREATE OR REPLACE FUNCTION create_recurring_reminders()
RETURNS INTEGER AS $$
DECLARE
  v_recurring RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_recurring IN 
    SELECT * FROM recurring_invoices
    WHERE is_active = true
    AND next_invoice_date <= CURRENT_DATE + INTERVAL '7 days'
    AND next_invoice_date > CURRENT_DATE
  LOOP
    -- Check if reminder already exists
    IF NOT EXISTS (
      SELECT 1 FROM reminders
      WHERE recurring_invoice_id = v_recurring.id
      AND reminder_date = v_recurring.next_invoice_date - INTERVAL '3 days'
      AND is_sent = false
    ) THEN
      INSERT INTO reminders (
        user_id,
        recurring_invoice_id,
        reminder_type,
        reminder_date,
        days_before,
        message
      ) VALUES (
        v_recurring.user_id,
        v_recurring.id,
        'recurring_upcoming',
        v_recurring.next_invoice_date - INTERVAL '3 days',
        3,
        'Upcoming recurring invoice will be generated on ' || v_recurring.next_invoice_date
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- FILE: supabase-payment-schema.sql
-- ==========================================

-- Razorpay Payment Integration Schema
-- Run this after the main schema (supabase-schema.sql)
-- Note: Requires invoices table to exist

-- Check if required tables exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') THEN
        RAISE EXCEPTION 'Table "invoices" does not exist. Please run supabase-schema.sql first.';
    END IF;
END $$;

-- Drop existing tables if they exist (to ensure clean setup)
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Payments Table (for tracking all payments)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50) DEFAULT 'razorpay',
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'partial_refund')),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds Table
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    gateway_refund_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON payments(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment_id ON payments(gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Payments Policies
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
    ON payments FOR UPDATE
    USING (auth.uid() = user_id);

-- Refunds Policies
CREATE POLICY "Users can view their own refunds"
    ON refunds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create refund requests"
    ON refunds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Note: Super admin policies are commented out below
-- Uncomment these after running supabase-superadmin-schema.sql

/*
-- Super admins can view all payments
CREATE POLICY "Super admins can view all payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'super_admin'
        )
    );

-- Super admins can view and manage all refunds
CREATE POLICY "Super admins can view all refunds"
    ON refunds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update refunds"
    ON refunds FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'super_admin'
        )
    );
*/

-- Triggers for updated_at
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update invoice status when payment is completed
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if invoice_id is provided and status is completed
    IF NEW.status = 'completed' AND NEW.invoice_id IS NOT NULL THEN
        -- Check if invoice exists before updating
        IF EXISTS (SELECT 1 FROM invoices WHERE id = NEW.invoice_id) THEN
            UPDATE invoices
            SET status = 'paid'
            WHERE id = NEW.invoice_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_invoice_on_payment ON payments;

-- Create trigger
CREATE TRIGGER trigger_update_invoice_on_payment
    AFTER UPDATE OF status ON payments
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_invoice_on_payment();


-- ==========================================
-- FILE: supabase-customer-management-migration.sql
-- ==========================================

-- =====================================================
-- CUSTOMER MANAGEMENT ADVANCED FEATURES MIGRATION
-- =====================================================
-- Features:
-- 1. Customer credit limits tracking
-- 2. Customer aging & risk score calculation
-- 3. Vendor bills + payable tracking
-- 4. Customer-wise GST summary
-- 5. Customer document vault (contracts, PAN, GST)
-- =====================================================

-- =====================================================
-- 1. CUSTOMER CREDIT LIMITS
-- =====================================================

-- Add credit limit columns to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_limit_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS credit_used DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_available DECIMAL(12, 2) GENERATED ALWAYS AS (
  CASE 
    WHEN credit_limit_enabled THEN (credit_limit - credit_used)
    ELSE NULL
  END
) STORED,
ADD COLUMN IF NOT EXISTS credit_utilization_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
  CASE 
    WHEN credit_limit_enabled AND credit_limit > 0 
    THEN ROUND((credit_used / credit_limit * 100)::NUMERIC, 2)
    ELSE 0
  END
) STORED,
ADD COLUMN IF NOT EXISTS credit_limit_exceeded BOOLEAN GENERATED ALWAYS AS (
  credit_limit_enabled AND credit_used > credit_limit
) STORED,
ADD COLUMN IF NOT EXISTS credit_limit_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS credit_limit_updated_by UUID REFERENCES auth.users(id);

-- Credit limit history tracking
CREATE TABLE IF NOT EXISTS customer_credit_limit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_limit DECIMAL(12, 2),
  new_limit DECIMAL(12, 2) NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_history_customer ON customer_credit_limit_history(customer_id);
CREATE INDEX idx_credit_history_date ON customer_credit_limit_history(created_at DESC);

-- =====================================================
-- 2. CUSTOMER AGING & RISK SCORE
-- =====================================================

-- Customer payment behavior and risk tracking
CREATE TABLE IF NOT EXISTS customer_aging_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Aging buckets (in days)
  current_amount DECIMAL(12, 2) DEFAULT 0,          -- 0-30 days
  days_30_amount DECIMAL(12, 2) DEFAULT 0,          -- 31-60 days
  days_60_amount DECIMAL(12, 2) DEFAULT 0,          -- 61-90 days
  days_90_amount DECIMAL(12, 2) DEFAULT 0,          -- 91-120 days
  days_120_plus_amount DECIMAL(12, 2) DEFAULT 0,    -- 120+ days
  
  total_outstanding DECIMAL(12, 2) GENERATED ALWAYS AS (
    current_amount + days_30_amount + days_60_amount + days_90_amount + days_120_plus_amount
  ) STORED,
  
  -- Invoice counts
  total_invoices INTEGER DEFAULT 0,
  paid_on_time_count INTEGER DEFAULT 0,
  paid_late_count INTEGER DEFAULT 0,
  overdue_count INTEGER DEFAULT 0,
  
  -- Payment metrics
  average_days_to_pay DECIMAL(8, 2) DEFAULT 0,
  longest_overdue_days INTEGER DEFAULT 0,
  
  -- Risk scoring (0-100, higher = riskier)
  risk_score DECIMAL(5, 2) DEFAULT 0,
  risk_category VARCHAR(20),  -- low, medium, high, critical
  
  -- Credit worthiness
  payment_reliability_score DECIMAL(5, 2) DEFAULT 100, -- 0-100, higher = better
  
  last_payment_date TIMESTAMP WITH TIME ZONE,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id)
);

CREATE INDEX idx_aging_customer ON customer_aging_analysis(customer_id);
CREATE INDEX idx_aging_risk_score ON customer_aging_analysis(risk_score DESC);
CREATE INDEX idx_aging_category ON customer_aging_analysis(risk_category);

-- =====================================================
-- 3. VENDOR BILLS & PAYABLE TRACKING
-- =====================================================

-- Vendors table (suppliers/creditors)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Vendor details
  vendor_name VARCHAR(255) NOT NULL,
  vendor_code VARCHAR(50),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  
  -- GST & Tax
  gstin VARCHAR(15),
  pan VARCHAR(10),
  tan VARCHAR(10),
  state_code VARCHAR(2),
  
  -- Payment terms
  payment_terms VARCHAR(100),
  default_payment_days INTEGER DEFAULT 30,
  
  -- Banking
  bank_name VARCHAR(255),
  bank_account_number VARCHAR(50),
  ifsc_code VARCHAR(11),
  bank_branch VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  vendor_category VARCHAR(100),  -- raw_material, services, utilities, etc.
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_gstin ON vendors(gstin);
CREATE INDEX idx_vendors_active ON vendors(is_active);

-- Vendor bills (payables)
CREATE TABLE IF NOT EXISTS vendor_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Bill details
  bill_number VARCHAR(100) NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE,
  
  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL,
  cgst_amount DECIMAL(12, 2) DEFAULT 0,
  sgst_amount DECIMAL(12, 2) DEFAULT 0,
  igst_amount DECIMAL(12, 2) DEFAULT 0,
  tds_amount DECIMAL(12, 2) DEFAULT 0,
  other_charges DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- Payment tracking
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  balance_amount DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  
  -- Status
  payment_status VARCHAR(20) DEFAULT 'unpaid',  -- unpaid, partially_paid, paid, overdue
  
  -- GST details
  supply_type VARCHAR(20),  -- intra-state, inter-state
  reverse_charge_applicable BOOLEAN DEFAULT false,
  
  -- References
  purchase_order_number VARCHAR(100),
  grn_number VARCHAR(100),  -- Goods Receipt Note
  
  -- Attachments
  attachment_url TEXT,
  
  -- Metadata
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, bill_number)
);

CREATE INDEX idx_bills_user ON vendor_bills(user_id);
CREATE INDEX idx_bills_vendor ON vendor_bills(vendor_id);
CREATE INDEX idx_bills_status ON vendor_bills(payment_status);
CREATE INDEX idx_bills_due_date ON vendor_bills(due_date);

-- Vendor bill items
CREATE TABLE IF NOT EXISTS vendor_bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES vendor_bills(id) ON DELETE CASCADE,
  
  -- Item details
  description TEXT NOT NULL,
  hsn_sac_code VARCHAR(10),
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'unit',
  unit_price DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Tax
  gst_rate DECIMAL(5, 2) DEFAULT 0,
  gst_amount DECIMAL(12, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bill_items_bill ON vendor_bill_items(bill_id);

-- Vendor payment records
CREATE TABLE IF NOT EXISTS vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES vendor_bills(id) ON DELETE SET NULL,
  
  -- Payment details
  payment_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50),  -- cash, bank_transfer, cheque, upi, card
  
  -- Reference
  transaction_reference VARCHAR(100),
  cheque_number VARCHAR(50),
  bank_account VARCHAR(100),
  
  -- TDS
  tds_deducted DECIMAL(12, 2) DEFAULT 0,
  tds_percentage DECIMAL(5, 2) DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendor_payments_user ON vendor_payments(user_id);
CREATE INDEX idx_vendor_payments_vendor ON vendor_payments(vendor_id);
CREATE INDEX idx_vendor_payments_bill ON vendor_payments(bill_id);
CREATE INDEX idx_vendor_payments_date ON vendor_payments(payment_date DESC);

-- =====================================================
-- 4. CUSTOMER-WISE GST SUMMARY
-- =====================================================

-- Customer GST summary tracking
CREATE TABLE IF NOT EXISTS customer_gst_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  financial_year VARCHAR(10) NOT NULL,
  
  -- Transaction summary
  total_invoices INTEGER DEFAULT 0,
  total_taxable_value DECIMAL(15, 2) DEFAULT 0,
  
  -- GST breakdown
  total_cgst DECIMAL(12, 2) DEFAULT 0,
  total_sgst DECIMAL(12, 2) DEFAULT 0,
  total_igst DECIMAL(12, 2) DEFAULT 0,
  total_gst DECIMAL(12, 2) GENERATED ALWAYS AS (total_cgst + total_sgst + total_igst) STORED,
  
  -- Supply type breakdown
  intra_state_value DECIMAL(15, 2) DEFAULT 0,
  inter_state_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Reverse charge
  reverse_charge_invoices INTEGER DEFAULT 0,
  reverse_charge_value DECIMAL(15, 2) DEFAULT 0,
  
  -- HSN/SAC wise summary (JSON)
  hsn_sac_breakdown JSONB DEFAULT '[]'::jsonb,
  
  -- Tax rate wise summary
  gst_rate_breakdown JSONB DEFAULT '[]'::jsonb,
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id, financial_year)
);

CREATE INDEX idx_gst_summary_customer ON customer_gst_summary(customer_id);
CREATE INDEX idx_gst_summary_fy ON customer_gst_summary(financial_year);
CREATE INDEX idx_gst_summary_user ON customer_gst_summary(user_id);

-- =====================================================
-- 5. CUSTOMER DOCUMENT VAULT
-- =====================================================

-- Document vault for customer files
CREATE TABLE IF NOT EXISTS customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document details
  document_type VARCHAR(50) NOT NULL,  -- contract, pan, gst_certificate, agreement, msme, other
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type VARCHAR(50),  -- pdf, jpg, png, doc, etc.
  
  -- Document metadata
  document_number VARCHAR(100),  -- PAN number, GST number, contract number
  issue_date DATE,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_expired BOOLEAN DEFAULT false,
  
  -- Version control
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES customer_documents(id),
  
  -- Access control
  is_confidential BOOLEAN DEFAULT false,
  
  -- Metadata
  description TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_customer ON customer_documents(customer_id);
CREATE INDEX idx_documents_type ON customer_documents(document_type);
CREATE INDEX idx_documents_expiry ON customer_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_documents_active ON customer_documents(is_active);

-- Document access log
CREATE TABLE IF NOT EXISTS customer_document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES customer_documents(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES auth.users(id),
  access_type VARCHAR(20) NOT NULL,  -- view, download, share, delete
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_doc_access_document ON customer_document_access_log(document_id);
CREATE INDEX idx_doc_access_user ON customer_document_access_log(accessed_by);
CREATE INDEX idx_doc_access_date ON customer_document_access_log(accessed_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update credit used based on unpaid invoices
CREATE OR REPLACE FUNCTION update_customer_credit_used()
RETURNS TRIGGER AS $$
BEGIN
  -- Update credit used for the customer
  UPDATE customers
  SET credit_used = (
    SELECT COALESCE(SUM(total), 0)
    FROM invoices
    WHERE customer_id = NEW.customer_id
    AND status IN ('unpaid', 'overdue', 'partially_paid')
  )
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on invoice status changes
DROP TRIGGER IF EXISTS trigger_update_credit_used ON invoices;
CREATE TRIGGER trigger_update_credit_used
AFTER INSERT OR UPDATE OF status, total ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_customer_credit_used();

-- Function to calculate customer aging and risk score
CREATE OR REPLACE FUNCTION calculate_customer_aging_risk(
  p_customer_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
DECLARE
  v_current_amount DECIMAL(12, 2) := 0;
  v_30_amount DECIMAL(12, 2) := 0;
  v_60_amount DECIMAL(12, 2) := 0;
  v_90_amount DECIMAL(12, 2) := 0;
  v_120_amount DECIMAL(12, 2) := 0;
  v_total_invoices INTEGER;
  v_paid_on_time INTEGER;
  v_paid_late INTEGER;
  v_overdue INTEGER;
  v_avg_days DECIMAL(8, 2);
  v_longest_overdue INTEGER;
  v_risk_score DECIMAL(5, 2);
  v_risk_category VARCHAR(20);
  v_reliability DECIMAL(5, 2);
  v_last_payment TIMESTAMP;
BEGIN
  -- Calculate aging buckets
  SELECT 
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date <= 30 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 31 AND 60 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 61 AND 90 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 91 AND 120 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN CURRENT_DATE - due_date > 120 THEN total - COALESCE(paid_amount, 0) ELSE 0 END), 0)
  INTO v_current_amount, v_30_amount, v_60_amount, v_90_amount, v_120_amount
  FROM invoices
  WHERE customer_id = p_customer_id 
    AND user_id = p_user_id
    AND status IN ('unpaid', 'overdue', 'partially_paid');

  -- Calculate payment metrics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'paid' AND payment_date IS NOT NULL AND payment_date <= due_date),
    COUNT(*) FILTER (WHERE status = 'paid' AND payment_date IS NOT NULL AND payment_date > due_date),
    COUNT(*) FILTER (WHERE status = 'overdue'),
    COALESCE(AVG(CASE WHEN payment_date IS NOT NULL AND due_date IS NOT NULL 
                 THEN EXTRACT(DAY FROM payment_date - due_date) END), 0),
    COALESCE(MAX(CASE WHEN status = 'overdue' THEN CURRENT_DATE - due_date END), 0),
    MAX(payment_date)
  INTO v_total_invoices, v_paid_on_time, v_paid_late, v_overdue, v_avg_days, v_longest_overdue, v_last_payment
  FROM invoices
  WHERE customer_id = p_customer_id AND user_id = p_user_id;

  -- Calculate risk score (0-100, higher = riskier)
  v_risk_score := 0;
  
  -- Factor 1: Overdue percentage (40 points max)
  IF v_total_invoices > 0 THEN
    v_risk_score := v_risk_score + ((v_overdue::DECIMAL / v_total_invoices) * 40);
  END IF;
  
  -- Factor 2: Aging severity (30 points max)
  v_risk_score := v_risk_score + 
    (v_30_amount / NULLIF(v_current_amount + v_30_amount + v_60_amount + v_90_amount + v_120_amount, 0) * 6) +
    (v_60_amount / NULLIF(v_current_amount + v_30_amount + v_60_amount + v_90_amount + v_120_amount, 0) * 12) +
    (v_90_amount / NULLIF(v_current_amount + v_30_amount + v_60_amount + v_90_amount + v_120_amount, 0) * 18) +
    (v_120_amount / NULLIF(v_current_amount + v_30_amount + v_60_amount + v_90_amount + v_120_amount, 0) * 30);
  
  -- Factor 3: Average delay days (20 points max)
  v_risk_score := v_risk_score + LEAST(v_avg_days / 3, 20);
  
  -- Factor 4: Longest overdue (10 points max)
  v_risk_score := v_risk_score + LEAST(v_longest_overdue / 30, 10);

  -- Determine risk category
  v_risk_category := CASE
    WHEN v_risk_score >= 75 THEN 'critical'
    WHEN v_risk_score >= 50 THEN 'high'
    WHEN v_risk_score >= 25 THEN 'medium'
    ELSE 'low'
  END;

  -- Calculate payment reliability (inverse of risk)
  v_reliability := 100 - v_risk_score;

  -- Upsert aging analysis
  INSERT INTO customer_aging_analysis (
    customer_id, user_id,
    current_amount, days_30_amount, days_60_amount, days_90_amount, days_120_plus_amount,
    total_invoices, paid_on_time_count, paid_late_count, overdue_count,
    average_days_to_pay, longest_overdue_days,
    risk_score, risk_category, payment_reliability_score,
    last_payment_date, last_calculated_at, updated_at
  )
  VALUES (
    p_customer_id, p_user_id,
    v_current_amount, v_30_amount, v_60_amount, v_90_amount, v_120_amount,
    v_total_invoices, v_paid_on_time, v_paid_late, v_overdue,
    v_avg_days, v_longest_overdue,
    v_risk_score, v_risk_category, v_reliability,
    v_last_payment, NOW(), NOW()
  )
  ON CONFLICT (customer_id, user_id)
  DO UPDATE SET
    current_amount = v_current_amount,
    days_30_amount = v_30_amount,
    days_60_amount = v_60_amount,
    days_90_amount = v_90_amount,
    days_120_plus_amount = v_120_amount,
    total_invoices = v_total_invoices,
    paid_on_time_count = v_paid_on_time,
    paid_late_count = v_paid_late,
    overdue_count = v_overdue,
    average_days_to_pay = v_avg_days,
    longest_overdue_days = v_longest_overdue,
    risk_score = v_risk_score,
    risk_category = v_risk_category,
    payment_reliability_score = v_reliability,
    last_payment_date = v_last_payment,
    last_calculated_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update customer GST summary
CREATE OR REPLACE FUNCTION update_customer_gst_summary(
  p_customer_id UUID,
  p_user_id UUID,
  p_financial_year VARCHAR(10)
)
RETURNS void AS $$
DECLARE
  v_total_invoices INTEGER;
  v_total_taxable DECIMAL(15, 2);
  v_total_cgst DECIMAL(12, 2);
  v_total_sgst DECIMAL(12, 2);
  v_total_igst DECIMAL(12, 2);
  v_intra_state DECIMAL(15, 2);
  v_inter_state DECIMAL(15, 2);
  v_rc_count INTEGER;
  v_rc_value DECIMAL(15, 2);
  v_hsn_breakdown JSONB;
  v_rate_breakdown JSONB;
BEGIN
  -- Calculate summary values
  SELECT 
    COUNT(*),
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(cgst_amount), 0),
    COALESCE(SUM(sgst_amount), 0),
    COALESCE(SUM(igst_amount), 0),
    COALESCE(SUM(CASE WHEN supply_type = 'intra-state' THEN subtotal ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN supply_type = 'inter-state' THEN subtotal ELSE 0 END), 0),
    COUNT(*) FILTER (WHERE reverse_charge_applicable = true),
    COALESCE(SUM(CASE WHEN reverse_charge_applicable = true THEN subtotal ELSE 0 END), 0)
  INTO v_total_invoices, v_total_taxable, v_total_cgst, v_total_sgst, v_total_igst,
       v_intra_state, v_inter_state, v_rc_count, v_rc_value
  FROM invoices
  WHERE customer_id = p_customer_id 
    AND user_id = p_user_id
    AND financial_year = p_financial_year;

  -- HSN/SAC breakdown
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_hsn_breakdown
  FROM (
    SELECT 
      ii.hsn_sac_code,
      COUNT(*) as invoice_count,
      SUM(ii.amount) as total_value,
      SUM(ii.gst_amount) as total_gst
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.customer_id = p_customer_id 
      AND i.user_id = p_user_id
      AND i.financial_year = p_financial_year
      AND ii.hsn_sac_code IS NOT NULL
    GROUP BY ii.hsn_sac_code
  ) t;

  -- GST rate breakdown
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_rate_breakdown
  FROM (
    SELECT 
      ii.gst_rate,
      COUNT(DISTINCT i.id) as invoice_count,
      SUM(ii.amount) as taxable_value,
      SUM(ii.gst_amount) as gst_amount
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.customer_id = p_customer_id 
      AND i.user_id = p_user_id
      AND i.financial_year = p_financial_year
    GROUP BY ii.gst_rate
  ) t;

  -- Upsert summary
  INSERT INTO customer_gst_summary (
    customer_id, user_id, financial_year,
    total_invoices, total_taxable_value,
    total_cgst, total_sgst, total_igst,
    intra_state_value, inter_state_value,
    reverse_charge_invoices, reverse_charge_value,
    hsn_sac_breakdown, gst_rate_breakdown,
    last_updated
  )
  VALUES (
    p_customer_id, p_user_id, p_financial_year,
    v_total_invoices, v_total_taxable,
    v_total_cgst, v_total_sgst, v_total_igst,
    v_intra_state, v_inter_state,
    v_rc_count, v_rc_value,
    v_hsn_breakdown, v_rate_breakdown,
    NOW()
  )
  ON CONFLICT (customer_id, user_id, financial_year)
  DO UPDATE SET
    total_invoices = v_total_invoices,
    total_taxable_value = v_total_taxable,
    total_cgst = v_total_cgst,
    total_sgst = v_total_sgst,
    total_igst = v_total_igst,
    intra_state_value = v_intra_state,
    inter_state_value = v_inter_state,
    reverse_charge_invoices = v_rc_count,
    reverse_charge_value = v_rc_value,
    hsn_sac_breakdown = v_hsn_breakdown,
    gst_rate_breakdown = v_rate_breakdown,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update vendor bill payment status
CREATE OR REPLACE FUNCTION update_vendor_bill_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update paid amount
  UPDATE vendor_bills
  SET 
    paid_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM vendor_payments
      WHERE bill_id = NEW.bill_id
    ),
    payment_status = CASE
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM vendor_payments WHERE bill_id = NEW.bill_id) = 0 
        THEN 'unpaid'
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM vendor_payments WHERE bill_id = NEW.bill_id) >= total_amount 
        THEN 'paid'
      ELSE 'partially_paid'
    END,
    updated_at = NOW()
  WHERE id = NEW.bill_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on vendor payments
DROP TRIGGER IF EXISTS trigger_update_bill_status ON vendor_payments;
CREATE TRIGGER trigger_update_bill_status
AFTER INSERT OR UPDATE ON vendor_payments
FOR EACH ROW
EXECUTE FUNCTION update_vendor_bill_status();

-- Function to check and update document expiry status
CREATE OR REPLACE FUNCTION update_document_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_expired := (NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update document expiry on insert/update
DROP TRIGGER IF EXISTS trigger_update_document_expiry ON customer_documents;
CREATE TRIGGER trigger_update_document_expiry
BEFORE INSERT OR UPDATE ON customer_documents
FOR EACH ROW
EXECUTE FUNCTION update_document_expiry();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Comprehensive customer financial view
CREATE OR REPLACE VIEW customer_financial_overview AS
SELECT 
  c.id as customer_id,
  c.user_id,
  c.name as customer_name,
  c.email,
  c.gstin,
  c.credit_limit,
  c.credit_limit_enabled,
  c.credit_used,
  c.credit_available,
  c.credit_utilization_percentage,
  c.credit_limit_exceeded,
  
  -- Aging data
  ca.current_amount,
  ca.days_30_amount,
  ca.days_60_amount,
  ca.days_90_amount,
  ca.days_120_plus_amount,
  ca.total_outstanding,
  ca.risk_score,
  ca.risk_category,
  ca.payment_reliability_score,
  ca.average_days_to_pay,
  ca.longest_overdue_days,
  ca.last_payment_date,
  
  -- GST summary
  cgs.total_invoices as gst_invoice_count,
  cgs.total_taxable_value as gst_taxable_value,
  cgs.total_gst as gst_total_tax,
  
  -- Document counts
  (SELECT COUNT(*) FROM customer_documents WHERE customer_id = c.id AND is_active = true) as total_documents,
  (SELECT COUNT(*) FROM customer_documents WHERE customer_id = c.id AND document_type = 'contract' AND is_active = true) as contract_count,
  (SELECT COUNT(*) FROM customer_documents WHERE customer_id = c.id AND is_expired = true) as expired_documents
  
FROM customers c
LEFT JOIN customer_aging_analysis ca ON c.id = ca.customer_id AND c.user_id = ca.user_id
LEFT JOIN customer_gst_summary cgs ON c.id = cgs.customer_id AND c.user_id = cgs.user_id;

-- Vendor payables summary
CREATE OR REPLACE VIEW vendor_payables_summary AS
SELECT 
  v.id as vendor_id,
  v.user_id,
  v.vendor_name,
  v.gstin,
  v.payment_terms,
  v.is_active,
  
  COUNT(vb.id) as total_bills,
  COALESCE(SUM(vb.total_amount), 0) as total_bill_amount,
  COALESCE(SUM(vb.paid_amount), 0) as total_paid,
  COALESCE(SUM(vb.balance_amount), 0) as total_outstanding,
  
  COUNT(*) FILTER (WHERE vb.payment_status = 'unpaid') as unpaid_count,
  COUNT(*) FILTER (WHERE vb.payment_status = 'overdue') as overdue_count,
  COALESCE(SUM(CASE WHEN vb.payment_status = 'overdue' THEN vb.balance_amount ELSE 0 END), 0) as overdue_amount,
  
  MAX(vb.due_date) as next_due_date,
  MIN(CASE WHEN vb.payment_status IN ('unpaid', 'partially_paid') THEN vb.due_date END) as earliest_due_date
  
FROM vendors v
LEFT JOIN vendor_bills vb ON v.id = vb.vendor_id
GROUP BY v.id, v.user_id, v.vendor_name, v.gstin, v.payment_terms, v.is_active;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE customer_credit_limit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_aging_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_gst_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_document_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credit history" ON customer_credit_limit_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credit history" ON customer_credit_limit_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their customer aging" ON customer_aging_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their customer aging" ON customer_aging_analysis FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their vendors" ON vendors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their vendors" ON vendors FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their vendor bills" ON vendor_bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their vendor bills" ON vendor_bills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view vendor bill items" ON vendor_bill_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM vendor_bills WHERE id = vendor_bill_items.bill_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage vendor bill items" ON vendor_bill_items FOR ALL USING (
  EXISTS (SELECT 1 FROM vendor_bills WHERE id = vendor_bill_items.bill_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view their vendor payments" ON vendor_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their vendor payments" ON vendor_payments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view customer GST summary" ON customer_gst_summary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage customer GST summary" ON customer_gst_summary FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their customer documents" ON customer_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their customer documents" ON customer_documents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view document access logs" ON customer_document_access_log FOR SELECT USING (auth.uid() = accessed_by);
CREATE POLICY "Users can insert document access logs" ON customer_document_access_log FOR INSERT WITH CHECK (auth.uid() = accessed_by);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_customers_credit_exceeded ON customers(user_id, credit_limit_exceeded) WHERE credit_limit_exceeded = true;
CREATE INDEX IF NOT EXISTS idx_customers_credit_utilization ON customers(credit_utilization_percentage DESC) WHERE credit_limit_enabled = true;
CREATE INDEX IF NOT EXISTS idx_vendor_bills_overdue ON vendor_bills(user_id, due_date) WHERE payment_status IN ('unpaid', 'partially_paid');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE customer_credit_limit_history IS 'Tracks changes to customer credit limits over time';
COMMENT ON TABLE customer_aging_analysis IS 'Stores customer payment aging buckets and risk scores';
COMMENT ON TABLE vendors IS 'Master table for vendor/supplier management';
COMMENT ON TABLE vendor_bills IS 'Tracks vendor bills and payables';
COMMENT ON TABLE vendor_payments IS 'Records payments made to vendors';
COMMENT ON TABLE customer_gst_summary IS 'Customer-wise GST transaction summary by financial year';
COMMENT ON TABLE customer_documents IS 'Document vault for customer files (contracts, PAN, GST, etc.)';
COMMENT ON TABLE customer_document_access_log IS 'Audit log for document access tracking';

-- =====================================================
-- 6. AI CREDIT RISK PREDICTION
-- =====================================================

-- AI Credit Risk Predictions
CREATE TABLE IF NOT EXISTS customer_credit_risk_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI Prediction scores (0-100, higher = riskier)
  default_probability DECIMAL(5, 2) NOT NULL,  -- Probability of default
  credit_risk_score DECIMAL(5, 2) NOT NULL,    -- Overall credit risk
  
  -- Risk category from AI
  predicted_risk_level VARCHAR(20) NOT NULL,   -- very_low, low, medium, high, very_high
  
  -- Confidence level of prediction
  prediction_confidence DECIMAL(5, 2) NOT NULL,  -- 0-100
  
  -- Features used in prediction
  payment_history_score DECIMAL(5, 2),
  transaction_frequency_score DECIMAL(5, 2),
  average_ticket_size_score DECIMAL(5, 2),
  payment_timing_score DECIMAL(5, 2),
  outstanding_ratio_score DECIMAL(5, 2),
  
  -- Prediction details
  model_version VARCHAR(20) NOT NULL,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Action recommendations
  recommended_credit_limit DECIMAL(12, 2),
  recommended_payment_terms INTEGER,  -- days
  action_required BOOLEAN DEFAULT false,
  action_type VARCHAR(50),  -- review, reduce_limit, increase_monitoring, blacklist
  
  -- Model explanation
  key_risk_factors TEXT[],
  positive_indicators TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id)
);

CREATE INDEX idx_credit_predictions_customer ON customer_credit_risk_predictions(customer_id);
CREATE INDEX idx_credit_predictions_risk_level ON customer_credit_risk_predictions(predicted_risk_level);
CREATE INDEX idx_credit_predictions_action ON customer_credit_risk_predictions(action_required) WHERE action_required = true;
CREATE INDEX idx_credit_predictions_date ON customer_credit_risk_predictions(prediction_date DESC);

-- AI Prediction history (track changes over time)
CREATE TABLE IF NOT EXISTS credit_risk_prediction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  default_probability DECIMAL(5, 2) NOT NULL,
  credit_risk_score DECIMAL(5, 2) NOT NULL,
  predicted_risk_level VARCHAR(20) NOT NULL,
  prediction_confidence DECIMAL(5, 2) NOT NULL,
  
  model_version VARCHAR(20) NOT NULL,
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prediction_history_customer ON credit_risk_prediction_history(customer_id);
CREATE INDEX idx_prediction_history_date ON credit_risk_prediction_history(prediction_date DESC);

-- =====================================================
-- 7. AUTO BLACKLIST CHRONIC DEFAULTERS
-- =====================================================

-- Customer blacklist table
CREATE TABLE IF NOT EXISTS customer_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Blacklist status
  is_blacklisted BOOLEAN DEFAULT true,
  blacklist_type VARCHAR(20) NOT NULL,  -- auto, manual, temporary
  
  -- Reason details
  reason TEXT NOT NULL,
  reason_code VARCHAR(50),  -- chronic_default, fraud, legal_dispute, payment_issues
  
  -- Metrics at blacklist time
  total_overdue_amount DECIMAL(12, 2),
  overdue_invoice_count INTEGER,
  longest_overdue_days INTEGER,
  default_rate DECIMAL(5, 2),  -- percentage of defaulted invoices
  
  -- Auto-blacklist criteria met
  auto_blacklist_criteria JSONB,  -- stores which rules triggered
  
  -- Dates
  blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blacklisted_by UUID REFERENCES auth.users(id),
  
  -- Removal details
  removed_at TIMESTAMP WITH TIME ZONE,
  removed_by UUID REFERENCES auth.users(id),
  removal_reason TEXT,
  
  -- Restrictions
  block_new_invoices BOOLEAN DEFAULT true,
  block_credit_sales BOOLEAN DEFAULT true,
  require_advance_payment BOOLEAN DEFAULT false,
  
  -- Review
  review_date DATE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id)
);

CREATE INDEX idx_blacklist_customer ON customer_blacklist(customer_id);
CREATE INDEX idx_blacklist_status ON customer_blacklist(is_blacklisted) WHERE is_blacklisted = true;
CREATE INDEX idx_blacklist_type ON customer_blacklist(blacklist_type);
CREATE INDEX idx_blacklist_review_date ON customer_blacklist(review_date) WHERE review_date IS NOT NULL;

-- Blacklist rules configuration
CREATE TABLE IF NOT EXISTS blacklist_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rule identification
  rule_name VARCHAR(100) NOT NULL,
  rule_description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  
  -- Trigger conditions
  min_overdue_amount DECIMAL(12, 2),
  min_overdue_invoices INTEGER,
  min_overdue_days INTEGER,
  min_default_rate DECIMAL(5, 2),  -- percentage
  consecutive_defaults_count INTEGER,
  
  -- Risk-based triggers
  min_risk_score DECIMAL(5, 2),
  risk_level_trigger VARCHAR(20),  -- high, very_high
  
  -- Actions
  auto_blacklist BOOLEAN DEFAULT false,
  send_warning BOOLEAN DEFAULT true,
  notify_admin BOOLEAN DEFAULT true,
  reduce_credit_limit BOOLEAN DEFAULT false,
  new_credit_limit_percentage DECIMAL(5, 2),  -- percentage of current
  
  -- Review settings
  auto_review_after_days INTEGER DEFAULT 90,
  require_manual_approval BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blacklist_rules_user ON blacklist_rules(user_id);
CREATE INDEX idx_blacklist_rules_enabled ON blacklist_rules(is_enabled) WHERE is_enabled = true;

-- Blacklist action log
CREATE TABLE IF NOT EXISTS blacklist_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  action_type VARCHAR(50) NOT NULL,  -- blacklisted, removed, warning_sent, review_scheduled
  action_reason TEXT,
  
  triggered_by VARCHAR(20),  -- auto, manual, system
  rule_id UUID REFERENCES blacklist_rules(id),
  
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- State before and after
  previous_state JSONB,
  new_state JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blacklist_log_customer ON blacklist_action_log(customer_id);
CREATE INDEX idx_blacklist_log_date ON blacklist_action_log(performed_at DESC);

-- =====================================================
-- 8. CUSTOMER WHATSAPP CHAT HISTORY
-- =====================================================

-- WhatsApp conversations
CREATE TABLE IF NOT EXISTS customer_whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- WhatsApp details
  whatsapp_number VARCHAR(20) NOT NULL,
  whatsapp_name VARCHAR(255),
  
  -- Conversation metadata
  conversation_status VARCHAR(20) DEFAULT 'active',  -- active, archived, blocked
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_from VARCHAR(20),  -- customer, business
  
  -- Message counts
  total_messages INTEGER DEFAULT 0,
  unread_messages INTEGER DEFAULT 0,
  
  -- Context
  conversation_context VARCHAR(50),  -- payment_reminder, invoice_query, support, general
  related_invoice_id UUID REFERENCES invoices(id),
  
  -- Tags for organization
  tags TEXT[],
  
  -- Important flags
  is_pinned BOOLEAN DEFAULT false,
  is_important BOOLEAN DEFAULT false,
  requires_action BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, user_id, whatsapp_number)
);

CREATE INDEX idx_whatsapp_conv_customer ON customer_whatsapp_conversations(customer_id);
CREATE INDEX idx_whatsapp_conv_status ON customer_whatsapp_conversations(conversation_status);
CREATE INDEX idx_whatsapp_conv_unread ON customer_whatsapp_conversations(unread_messages) WHERE unread_messages > 0;
CREATE INDEX idx_whatsapp_conv_action ON customer_whatsapp_conversations(requires_action) WHERE requires_action = true;
CREATE INDEX idx_whatsapp_conv_last_msg ON customer_whatsapp_conversations(last_message_at DESC);

-- WhatsApp messages
CREATE TABLE IF NOT EXISTS customer_whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES customer_whatsapp_conversations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message details
  message_type VARCHAR(20) NOT NULL,  -- text, image, document, audio, video, location, template
  message_direction VARCHAR(20) NOT NULL,  -- inbound, outbound
  
  -- Content
  message_text TEXT,
  media_url TEXT,
  media_type VARCHAR(50),
  media_size_bytes BIGINT,
  
  -- WhatsApp metadata
  whatsapp_message_id VARCHAR(255),
  whatsapp_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Status (for outbound messages)
  message_status VARCHAR(20),  -- sent, delivered, read, failed
  delivery_status_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Context and linking
  related_invoice_id UUID REFERENCES invoices(id),
  related_payment_id UUID,
  context_type VARCHAR(50),  -- payment_reminder, invoice_sent, follow_up, query_response
  
  -- AI Analysis
  sentiment VARCHAR(20),  -- positive, neutral, negative, urgent
  contains_payment_intent BOOLEAN DEFAULT false,
  contains_complaint BOOLEAN DEFAULT false,
  requires_human_response BOOLEAN DEFAULT false,
  
  -- Response tracking
  is_automated_response BOOLEAN DEFAULT false,
  response_template_id UUID,
  responded_to_message_id UUID REFERENCES customer_whatsapp_messages(id),
  
  -- User interaction
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES auth.users(id),
  
  -- Notes
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_msg_conversation ON customer_whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_msg_customer ON customer_whatsapp_messages(customer_id);
CREATE INDEX idx_whatsapp_msg_direction ON customer_whatsapp_messages(message_direction);
CREATE INDEX idx_whatsapp_msg_unread ON customer_whatsapp_messages(is_read) WHERE is_read = false;
CREATE INDEX idx_whatsapp_msg_invoice ON customer_whatsapp_messages(related_invoice_id) WHERE related_invoice_id IS NOT NULL;
CREATE INDEX idx_whatsapp_msg_timestamp ON customer_whatsapp_messages(whatsapp_timestamp DESC);
CREATE INDEX idx_whatsapp_msg_payment_intent ON customer_whatsapp_messages(contains_payment_intent) WHERE contains_payment_intent = true;

-- WhatsApp message templates
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template details
  template_name VARCHAR(100) NOT NULL,
  template_category VARCHAR(50) NOT NULL,  -- payment_reminder, invoice_notification, follow_up, greeting
  
  -- Content
  template_text TEXT NOT NULL,
  template_variables TEXT[],  -- {{customer_name}}, {{invoice_number}}, {{amount}}, {{due_date}}
  
  -- WhatsApp Business API template
  whatsapp_template_id VARCHAR(255),
  template_language VARCHAR(10) DEFAULT 'en',
  
  -- Usage
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  description TEXT,
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_templates_user ON whatsapp_message_templates(user_id);
CREATE INDEX idx_whatsapp_templates_category ON whatsapp_message_templates(template_category);
CREATE INDEX idx_whatsapp_templates_active ON whatsapp_message_templates(is_active) WHERE is_active = true;

-- WhatsApp quick replies
CREATE TABLE IF NOT EXISTS whatsapp_quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  shortcut VARCHAR(50) NOT NULL,
  reply_text TEXT NOT NULL,
  
  category VARCHAR(50),
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, shortcut)
);

CREATE INDEX idx_quick_replies_user ON whatsapp_quick_replies(user_id);

-- =====================================================
-- ADDITIONAL FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to calculate AI credit risk score (simplified version - real AI would be external)
CREATE OR REPLACE FUNCTION calculate_ai_credit_risk(
  p_customer_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  default_probability DECIMAL(5, 2),
  credit_risk_score DECIMAL(5, 2),
  predicted_risk_level VARCHAR(20),
  prediction_confidence DECIMAL(5, 2),
  recommended_credit_limit DECIMAL(12, 2)
) AS $$
DECLARE
  v_aging_score DECIMAL(5, 2);
  v_payment_history_score DECIMAL(5, 2);
  v_default_prob DECIMAL(5, 2);
  v_risk_score DECIMAL(5, 2);
  v_risk_level VARCHAR(20);
  v_confidence DECIMAL(5, 2);
  v_rec_limit DECIMAL(12, 2);
  v_current_limit DECIMAL(12, 2);
BEGIN
  -- Get aging data
  SELECT 
    COALESCE(ca.risk_score, 0),
    COALESCE(ca.payment_reliability_score, 100)
  INTO v_aging_score, v_payment_history_score
  FROM customer_aging_analysis ca
  WHERE ca.customer_id = p_customer_id AND ca.user_id = p_user_id;
  
  -- If no aging data, use defaults
  v_aging_score := COALESCE(v_aging_score, 0);
  v_payment_history_score := COALESCE(v_payment_history_score, 100);
  
  -- Calculate default probability (0-100)
  -- Higher aging score = higher default probability
  -- Lower payment reliability = higher default probability
  v_default_prob := (v_aging_score * 0.6) + ((100 - v_payment_history_score) * 0.4);
  v_default_prob := LEAST(100, GREATEST(0, v_default_prob));
  
  -- Credit risk score (same as default probability for now)
  v_risk_score := v_default_prob;
  
  -- Determine risk level
  v_risk_level := CASE
    WHEN v_risk_score < 20 THEN 'very_low'
    WHEN v_risk_score < 40 THEN 'low'
    WHEN v_risk_score < 60 THEN 'medium'
    WHEN v_risk_score < 80 THEN 'high'
    ELSE 'very_high'
  END;
  
  -- Confidence level (higher with more data)
  SELECT 
    CASE 
      WHEN COALESCE(ca.total_invoices, 0) >= 20 THEN 95
      WHEN COALESCE(ca.total_invoices, 0) >= 10 THEN 85
      WHEN COALESCE(ca.total_invoices, 0) >= 5 THEN 70
      WHEN COALESCE(ca.total_invoices, 0) >= 2 THEN 55
      ELSE 40
    END
  INTO v_confidence
  FROM customer_aging_analysis ca
  WHERE ca.customer_id = p_customer_id AND ca.user_id = p_user_id;
  
  v_confidence := COALESCE(v_confidence, 40);
  
  -- Get current credit limit
  SELECT credit_limit INTO v_current_limit
  FROM customers
  WHERE id = p_customer_id AND user_id = p_user_id;
  
  v_current_limit := COALESCE(v_current_limit, 0);
  
  -- Recommend credit limit based on risk
  v_rec_limit := CASE
    WHEN v_risk_level = 'very_low' THEN v_current_limit * 1.5
    WHEN v_risk_level = 'low' THEN v_current_limit * 1.2
    WHEN v_risk_level = 'medium' THEN v_current_limit
    WHEN v_risk_level = 'high' THEN v_current_limit * 0.5
    ELSE v_current_limit * 0.25
  END;
  
  RETURN QUERY SELECT v_default_prob, v_risk_score, v_risk_level, v_confidence, v_rec_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to check and auto-blacklist customers
CREATE OR REPLACE FUNCTION check_auto_blacklist(
  p_customer_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_should_blacklist BOOLEAN := false;
  v_rule RECORD;
  v_aging RECORD;
  v_risk RECORD;
  v_criteria JSONB := '[]'::jsonb;
BEGIN
  -- Get customer aging data
  SELECT * INTO v_aging
  FROM customer_aging_analysis
  WHERE customer_id = p_customer_id AND user_id = p_user_id;
  
  -- Get customer risk prediction
  SELECT * INTO v_risk
  FROM customer_credit_risk_predictions
  WHERE customer_id = p_customer_id AND user_id = p_user_id;
  
  -- Check each enabled rule
  FOR v_rule IN 
    SELECT * FROM blacklist_rules 
    WHERE user_id = p_user_id AND is_enabled = true AND auto_blacklist = true
  LOOP
    -- Check overdue amount
    IF v_rule.min_overdue_amount IS NOT NULL AND 
       COALESCE(v_aging.total_outstanding, 0) >= v_rule.min_overdue_amount THEN
      v_should_blacklist := true;
      v_criteria := v_criteria || jsonb_build_object('rule', v_rule.rule_name, 'condition', 'overdue_amount');
    END IF;
    
    -- Check overdue invoices count
    IF v_rule.min_overdue_invoices IS NOT NULL AND 
       COALESCE(v_aging.overdue_count, 0) >= v_rule.min_overdue_invoices THEN
      v_should_blacklist := true;
      v_criteria := v_criteria || jsonb_build_object('rule', v_rule.rule_name, 'condition', 'overdue_count');
    END IF;
    
    -- Check overdue days
    IF v_rule.min_overdue_days IS NOT NULL AND 
       COALESCE(v_aging.longest_overdue_days, 0) >= v_rule.min_overdue_days THEN
      v_should_blacklist := true;
      v_criteria := v_criteria || jsonb_build_object('rule', v_rule.rule_name, 'condition', 'overdue_days');
    END IF;
    
    -- Check risk score
    IF v_rule.min_risk_score IS NOT NULL AND 
       COALESCE(v_risk.credit_risk_score, 0) >= v_rule.min_risk_score THEN
      v_should_blacklist := true;
      v_criteria := v_criteria || jsonb_build_object('rule', v_rule.rule_name, 'condition', 'risk_score');
    END IF;
    
    -- If any rule triggered, blacklist the customer
    IF v_should_blacklist THEN
      -- Insert or update blacklist
      INSERT INTO customer_blacklist (
        customer_id, user_id, blacklist_type, reason, reason_code,
        total_overdue_amount, overdue_invoice_count, longest_overdue_days,
        auto_blacklist_criteria, block_new_invoices, block_credit_sales,
        blacklisted_by
      )
      VALUES (
        p_customer_id, p_user_id, 'auto', 
        'Automatically blacklisted due to: ' || v_criteria::text,
        'chronic_default',
        COALESCE(v_aging.total_outstanding, 0),
        COALESCE(v_aging.overdue_count, 0),
        COALESCE(v_aging.longest_overdue_days, 0),
        v_criteria,
        true, true,
        p_user_id
      )
      ON CONFLICT (customer_id, user_id) 
      DO UPDATE SET
        is_blacklisted = true,
        auto_blacklist_criteria = v_criteria,
        updated_at = NOW();
      
      -- Log the action
      INSERT INTO blacklist_action_log (
        customer_id, user_id, action_type, action_reason,
        triggered_by, rule_id, performed_by
      )
      VALUES (
        p_customer_id, p_user_id, 'blacklisted',
        'Auto-blacklisted: ' || v_criteria::text,
        'auto', v_rule.id, p_user_id
      );
      
      EXIT; -- Exit loop after first match
    END IF;
  END LOOP;
  
  RETURN v_should_blacklist;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
CREATE OR REPLACE FUNCTION update_whatsapp_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_whatsapp_conversations
  SET 
    last_message_at = NEW.whatsapp_timestamp,
    last_message_from = CASE 
      WHEN NEW.message_direction = 'inbound' THEN 'customer'
      ELSE 'business'
    END,
    total_messages = total_messages + 1,
    unread_messages = CASE 
      WHEN NEW.message_direction = 'inbound' AND NOT NEW.is_read 
      THEN unread_messages + 1
      ELSE unread_messages
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation ON customer_whatsapp_messages;
CREATE TRIGGER trigger_update_conversation
AFTER INSERT ON customer_whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION update_whatsapp_conversation_on_message();

-- Trigger to mark conversation messages as read
CREATE OR REPLACE FUNCTION mark_conversation_messages_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unread_messages = 0 AND OLD.unread_messages > 0 THEN
    UPDATE customer_whatsapp_messages
    SET is_read = true, read_at = NOW()
    WHERE conversation_id = NEW.id AND is_read = false AND message_direction = 'inbound';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mark_messages_read ON customer_whatsapp_conversations;
CREATE TRIGGER trigger_mark_messages_read
AFTER UPDATE ON customer_whatsapp_conversations
FOR EACH ROW
WHEN (NEW.unread_messages = 0 AND OLD.unread_messages > 0)
EXECUTE FUNCTION mark_conversation_messages_read();

-- =====================================================
-- ADDITIONAL VIEWS
-- =====================================================

-- High-risk customers view
CREATE OR REPLACE VIEW high_risk_customers AS
SELECT 
  c.id as customer_id,
  c.user_id,
  c.name as customer_name,
  c.email,
  c.phone,
  
  -- Credit info
  c.credit_limit,
  c.credit_used,
  c.credit_limit_exceeded,
  
  -- Risk scores
  ca.risk_score as aging_risk_score,
  ca.risk_category as aging_risk_category,
  crp.credit_risk_score as ai_risk_score,
  crp.predicted_risk_level as ai_risk_level,
  crp.default_probability,
  
  -- Blacklist status
  cb.is_blacklisted,
  cb.blacklist_type,
  cb.blacklisted_at,
  
  -- Outstanding
  ca.total_outstanding,
  ca.overdue_count,
  ca.longest_overdue_days
  
FROM customers c
LEFT JOIN customer_aging_analysis ca ON c.id = ca.customer_id AND c.user_id = ca.user_id
LEFT JOIN customer_credit_risk_predictions crp ON c.id = crp.customer_id AND c.user_id = crp.user_id
LEFT JOIN customer_blacklist cb ON c.id = cb.customer_id AND c.user_id = cb.user_id
WHERE 
  ca.risk_category IN ('high', 'critical') 
  OR crp.predicted_risk_level IN ('high', 'very_high')
  OR cb.is_blacklisted = true;

-- WhatsApp conversation summary view
CREATE OR REPLACE VIEW whatsapp_conversation_summary AS
SELECT 
  cwc.id as conversation_id,
  cwc.customer_id,
  cwc.user_id,
  c.name as customer_name,
  cwc.whatsapp_number,
  cwc.conversation_status,
  cwc.last_message_at,
  cwc.total_messages,
  cwc.unread_messages,
  cwc.requires_action,
  cwc.is_important,
  
  -- Latest message preview
  (
    SELECT message_text
    FROM customer_whatsapp_messages
    WHERE conversation_id = cwc.id
    ORDER BY whatsapp_timestamp DESC
    LIMIT 1
  ) as last_message_preview,
  
  -- Related invoice
  i.invoice_number as related_invoice_number,
  i.total as related_invoice_amount
  
FROM customer_whatsapp_conversations cwc
JOIN customers c ON cwc.customer_id = c.id
LEFT JOIN invoices i ON cwc.related_invoice_id = i.id;

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Credit Risk Predictions
ALTER TABLE customer_credit_risk_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their credit predictions" ON customer_credit_risk_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their credit predictions" ON customer_credit_risk_predictions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE credit_risk_prediction_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view prediction history" ON credit_risk_prediction_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert prediction history" ON credit_risk_prediction_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Blacklist
ALTER TABLE customer_blacklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their blacklist" ON customer_blacklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their blacklist" ON customer_blacklist FOR ALL USING (auth.uid() = user_id);

ALTER TABLE blacklist_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their blacklist rules" ON blacklist_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their blacklist rules" ON blacklist_rules FOR ALL USING (auth.uid() = user_id);

ALTER TABLE blacklist_action_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view blacklist logs" ON blacklist_action_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert blacklist logs" ON blacklist_action_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WhatsApp
ALTER TABLE customer_whatsapp_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their conversations" ON customer_whatsapp_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their conversations" ON customer_whatsapp_conversations FOR ALL USING (auth.uid() = user_id);

ALTER TABLE customer_whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their messages" ON customer_whatsapp_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their messages" ON customer_whatsapp_messages FOR ALL USING (auth.uid() = user_id);

ALTER TABLE whatsapp_message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their templates" ON whatsapp_message_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their templates" ON whatsapp_message_templates FOR ALL USING (auth.uid() = user_id);

ALTER TABLE whatsapp_quick_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their quick replies" ON whatsapp_quick_replies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their quick replies" ON whatsapp_quick_replies FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- ADDITIONAL COMMENTS
-- =====================================================

COMMENT ON TABLE customer_credit_risk_predictions IS 'AI-powered credit risk predictions for customers';
COMMENT ON TABLE credit_risk_prediction_history IS 'Historical tracking of risk prediction changes';
COMMENT ON TABLE customer_blacklist IS 'Blacklisted customers with chronic payment issues';
COMMENT ON TABLE blacklist_rules IS 'Configurable rules for auto-blacklisting customers';
COMMENT ON TABLE blacklist_action_log IS 'Audit log of blacklist actions';
COMMENT ON TABLE customer_whatsapp_conversations IS 'WhatsApp conversation threads with customers';
COMMENT ON TABLE customer_whatsapp_messages IS 'Individual WhatsApp messages';
COMMENT ON TABLE whatsapp_message_templates IS 'Reusable WhatsApp message templates';
COMMENT ON TABLE whatsapp_quick_replies IS 'Quick reply shortcuts for common responses';

-- =====================================================
-- END OF MIGRATION
-- =====================================================


-- ==========================================
-- FILE: supabase-advanced-payments-migration.sql
-- ==========================================

-- Advanced Payment Features Migration
-- Native UPI, WhatsApp Pay, Installments, Auto-reconciliation, Analytics

-- ============================================
-- UPI PAYMENT DETAILS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS upi_payment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  upi_id VARCHAR(100) NOT NULL, -- user@bank
  qr_code_url TEXT, -- Generated QR code stored in storage
  qr_code_data TEXT, -- UPI intent string
  business_name VARCHAR(200),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upi_payment_user ON upi_payment_details(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_payment_primary ON upi_payment_details(user_id, is_primary) WHERE is_primary = true;

-- ============================================
-- PAYMENT INSTALLMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  installment_number INTEGER NOT NULL,
  total_installments INTEGER NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'waived')),
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50), -- 'upi', 'card', 'netbanking', 'cash', 'cheque', 'whatsapp_pay'
  payment_reference VARCHAR(200),
  late_fee DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(invoice_id, installment_number)
);

CREATE INDEX IF NOT EXISTS idx_installments_invoice ON payment_installments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON payment_installments(status, due_date);
CREATE INDEX IF NOT EXISTS idx_installments_overdue ON payment_installments(due_date) WHERE status = 'pending';

-- ============================================
-- BANK TRANSACTIONS TABLE (For Reconciliation)
-- ============================================

CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id VARCHAR(200) UNIQUE, -- Bank's transaction ID
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('credit', 'debit')),
  description TEXT,
  reference_number VARCHAR(200),
  upi_id VARCHAR(100), -- For UPI transactions
  bank_account VARCHAR(100),
  reconciled BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES invoices(id),
  payment_id UUID REFERENCES payments(id),
  auto_matched BOOLEAN DEFAULT false,
  match_confidence DECIMAL(5, 4), -- 0.0000 to 1.0000
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_trans_user ON bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_trans_reconciled ON bank_transactions(user_id, reconciled);
CREATE INDEX IF NOT EXISTS idx_bank_trans_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_trans_invoice ON bank_transactions(invoice_id);

-- ============================================
-- FAILED PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS failed_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(50),
  failure_reason TEXT,
  failure_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  auto_retry_enabled BOOLEAN DEFAULT true,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMP WITH TIME ZONE,
  recovered_payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_payments_invoice ON failed_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_customer ON failed_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_retry ON failed_payments(next_retry_at) WHERE recovered = false AND auto_retry_enabled = true;

-- ============================================
-- LATE FEE CONFIG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS late_fee_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grace_period_days INTEGER DEFAULT 0,
  fee_type VARCHAR(20) DEFAULT 'percentage' CHECK (fee_type IN ('percentage', 'fixed', 'tiered')),
  fee_value DECIMAL(10, 2) NOT NULL, -- Percentage or fixed amount
  max_late_fee DECIMAL(15, 2), -- Cap on late fee
  compound_daily BOOLEAN DEFAULT false, -- Compound daily or one-time
  tiered_config JSONB, -- For tiered late fees: [{days: 7, fee: 50}, {days: 15, fee: 100}]
  auto_apply BOOLEAN DEFAULT true,
  notify_customer BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_late_fee_config_user ON late_fee_config(user_id);

-- ============================================
-- BNPL APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bnpl_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  provider VARCHAR(50) NOT NULL, -- 'flexmoney', 'zestmoney', 'lazypay', 'simpl', 'custom'
  application_id VARCHAR(200), -- Provider's application ID
  requested_amount DECIMAL(15, 2) NOT NULL,
  approved_amount DECIMAL(15, 2),
  tenure_months INTEGER, -- Repayment period
  interest_rate DECIMAL(5, 2),
  status VARCHAR(30) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  provider_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bnpl_invoice ON bnpl_applications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_customer ON bnpl_applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_status ON bnpl_applications(status);

-- ============================================
-- PAYMENT FOLLOW-UPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  followup_type VARCHAR(20) NOT NULL CHECK (followup_type IN ('whatsapp', 'sms', 'email', 'call')),
  status VARCHAR(30) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'replied')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  message_content TEXT,
  message_id VARCHAR(200), -- Provider message ID
  error_message TEXT,
  auto_generated BOOLEAN DEFAULT true,
  reminder_number INTEGER DEFAULT 1, -- 1st, 2nd, 3rd reminder
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_followups_invoice ON payment_followups(invoice_id);
CREATE INDEX IF NOT EXISTS idx_followups_customer ON payment_followups(customer_id);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled ON payment_followups(scheduled_at, status) WHERE status = 'pending';

-- ============================================
-- PAYMENT BEHAVIOR ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_invoices INTEGER DEFAULT 0,
  total_paid_invoices INTEGER DEFAULT 0,
  total_overdue_invoices INTEGER DEFAULT 0,
  avg_payment_delay_days DECIMAL(10, 2), -- Average days past due date
  payment_reliability_score DECIMAL(5, 2), -- 0 to 100
  preferred_payment_method VARCHAR(50),
  total_amount_paid DECIMAL(15, 2) DEFAULT 0,
  total_late_fees_paid DECIMAL(15, 2) DEFAULT 0,
  failed_payment_count INTEGER DEFAULT 0,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  payment_pattern VARCHAR(30), -- 'early_payer', 'on_time', 'occasional_late', 'chronic_late', 'defaulter'
  risk_category VARCHAR(20), -- 'low', 'medium', 'high'
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_behavior_customer ON payment_behavior_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_behavior_score ON payment_behavior_analytics(payment_reliability_score);
CREATE INDEX IF NOT EXISTS idx_payment_behavior_risk ON payment_behavior_analytics(risk_category);

-- ============================================
-- WHATSAPP PAYMENT LINKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS whatsapp_payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  payment_link TEXT NOT NULL,
  short_link VARCHAR(100), -- Shortened URL
  qr_code_url TEXT, -- QR code for the payment link
  whatsapp_number VARCHAR(20),
  sent_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_expired BOOLEAN DEFAULT false,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_links_invoice ON whatsapp_payment_links(invoice_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_links_customer ON whatsapp_payment_links(customer_id);

-- ============================================
-- ADD PAYMENT FIELDS TO EXISTING TABLES
-- ============================================

-- Add fields to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS installment_plan BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_installments INTEGER;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS installment_frequency VARCHAR(20); -- 'weekly', 'monthly', 'quarterly'
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS late_fee_applied DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS late_fee_last_calculated TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bnpl_enabled BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS auto_followup_enabled BOOLEAN DEFAULT true;

-- Add fields to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_transaction_id VARCHAR(200);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS whatsapp_payment BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS installment_id UUID REFERENCES payment_installments(id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- UPI Payment Details
ALTER TABLE upi_payment_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own UPI details" ON upi_payment_details;
CREATE POLICY "Users manage own UPI details" ON upi_payment_details FOR ALL USING (auth.uid() = user_id);

-- Payment Installments
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage installments" ON payment_installments;
CREATE POLICY "Users manage installments" ON payment_installments FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_installments.invoice_id AND invoices.user_id = auth.uid()));

-- Bank Transactions
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own bank transactions" ON bank_transactions;
CREATE POLICY "Users manage own bank transactions" ON bank_transactions FOR ALL USING (auth.uid() = user_id);

-- Failed Payments
ALTER TABLE failed_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own failed payments" ON failed_payments;
CREATE POLICY "Users view own failed payments" ON failed_payments FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = failed_payments.invoice_id AND invoices.user_id = auth.uid()));

-- Late Fee Config
ALTER TABLE late_fee_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own late fee config" ON late_fee_config;
CREATE POLICY "Users manage own late fee config" ON late_fee_config FOR ALL USING (auth.uid() = user_id);

-- BNPL Applications
ALTER TABLE bnpl_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own BNPL applications" ON bnpl_applications;
CREATE POLICY "Users view own BNPL applications" ON bnpl_applications FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = bnpl_applications.invoice_id AND invoices.user_id = auth.uid()));

-- Payment Follow-ups
ALTER TABLE payment_followups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own followups" ON payment_followups;
CREATE POLICY "Users manage own followups" ON payment_followups FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_followups.invoice_id AND invoices.user_id = auth.uid()));

-- Payment Behavior Analytics
ALTER TABLE payment_behavior_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own customer analytics" ON payment_behavior_analytics;
CREATE POLICY "Users view own customer analytics" ON payment_behavior_analytics FOR ALL USING (auth.uid() = user_id);

-- WhatsApp Payment Links
ALTER TABLE whatsapp_payment_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own WhatsApp links" ON whatsapp_payment_links;
CREATE POLICY "Users manage own WhatsApp links" ON whatsapp_payment_links FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = whatsapp_payment_links.invoice_id AND invoices.user_id = auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate late fee
CREATE OR REPLACE FUNCTION calculate_late_fee(
  p_invoice_id UUID,
  p_due_date DATE,
  p_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_config RECORD;
  v_days_overdue INTEGER;
  v_late_fee DECIMAL := 0;
  v_user_id UUID;
BEGIN
  -- Get invoice user
  SELECT user_id INTO v_user_id FROM invoices WHERE id = p_invoice_id;
  
  -- Get late fee config
  SELECT * INTO v_config FROM late_fee_config 
  WHERE user_id = v_user_id AND is_active = true
  ORDER BY created_at DESC LIMIT 1;
  
  IF v_config IS NULL OR NOT v_config.auto_apply THEN
    RETURN 0;
  END IF;
  
  -- Calculate days overdue
  v_days_overdue := CURRENT_DATE - p_due_date - v_config.grace_period_days;
  
  IF v_days_overdue <= 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate fee based on type
  IF v_config.fee_type = 'percentage' THEN
    v_late_fee := p_amount * (v_config.fee_value / 100);
    IF v_config.compound_daily THEN
      v_late_fee := v_late_fee * v_days_overdue;
    END IF;
  ELSIF v_config.fee_type = 'fixed' THEN
    v_late_fee := v_config.fee_value;
    IF v_config.compound_daily THEN
      v_late_fee := v_late_fee * v_days_overdue;
    END IF;
  END IF;
  
  -- Apply cap if exists
  IF v_config.max_late_fee IS NOT NULL AND v_late_fee > v_config.max_late_fee THEN
    v_late_fee := v_config.max_late_fee;
  END IF;
  
  RETURN v_late_fee;
END;
$$ LANGUAGE plpgsql;

-- Function to update payment behavior analytics
CREATE OR REPLACE FUNCTION update_payment_behavior(p_customer_id UUID) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_total_invoices INTEGER;
  v_paid_invoices INTEGER;
  v_overdue_invoices INTEGER;
  v_avg_delay DECIMAL;
  v_score DECIMAL;
  v_pattern VARCHAR(30);
  v_risk VARCHAR(20);
BEGIN
  -- Get user_id
  SELECT user_id INTO v_user_id FROM customers WHERE id = p_customer_id;
  
  -- Calculate metrics
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'paid' THEN 1 END),
    COUNT(CASE WHEN status = 'overdue' THEN 1 END)
  INTO v_total_invoices, v_paid_invoices, v_overdue_invoices
  FROM invoices WHERE customer_id = p_customer_id;
  
  -- Calculate average delay
  SELECT AVG(EXTRACT(DAY FROM paid_at - due_date::TIMESTAMPTZ))
  INTO v_avg_delay
  FROM invoices WHERE customer_id = p_customer_id AND status = 'paid' AND paid_at > due_date::TIMESTAMPTZ;
  
  -- Calculate reliability score (0-100)
  IF v_total_invoices > 0 THEN
    v_score := (v_paid_invoices::DECIMAL / v_total_invoices) * 100;
    v_score := GREATEST(0, v_score - (COALESCE(v_avg_delay, 0) * 2)); -- Penalize delays
  ELSE
    v_score := 50; -- Neutral for new customers
  END IF;
  
  -- Determine payment pattern
  IF v_avg_delay IS NULL OR v_avg_delay <= 0 THEN
    v_pattern := 'early_payer';
  ELSIF v_avg_delay <= 3 THEN
    v_pattern := 'on_time';
  ELSIF v_avg_delay <= 10 THEN
    v_pattern := 'occasional_late';
  ELSIF v_avg_delay <= 30 THEN
    v_pattern := 'chronic_late';
  ELSE
    v_pattern := 'defaulter';
  END IF;
  
  -- Determine risk category
  IF v_score >= 80 THEN
    v_risk := 'low';
  ELSIF v_score >= 50 THEN
    v_risk := 'medium';
  ELSE
    v_risk := 'high';
  END IF;
  
  -- Upsert analytics
  INSERT INTO payment_behavior_analytics (
    customer_id, user_id, total_invoices, total_paid_invoices, 
    total_overdue_invoices, avg_payment_delay_days, payment_reliability_score,
    payment_pattern, risk_category, last_updated
  ) VALUES (
    p_customer_id, v_user_id, v_total_invoices, v_paid_invoices,
    v_overdue_invoices, COALESCE(v_avg_delay, 0), v_score,
    v_pattern, v_risk, NOW()
  )
  ON CONFLICT (customer_id, user_id) 
  DO UPDATE SET
    total_invoices = EXCLUDED.total_invoices,
    total_paid_invoices = EXCLUDED.total_paid_invoices,
    total_overdue_invoices = EXCLUDED.total_overdue_invoices,
    avg_payment_delay_days = EXCLUDED.avg_payment_delay_days,
    payment_reliability_score = EXCLUDED.payment_reliability_score,
    payment_pattern = EXCLUDED.payment_pattern,
    risk_category = EXCLUDED.risk_category,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to auto-match bank transactions with invoices
CREATE OR REPLACE FUNCTION auto_match_bank_transaction(p_transaction_id UUID) RETURNS VOID AS $$
DECLARE
  v_trans RECORD;
  v_invoice_id UUID;
  v_confidence DECIMAL;
BEGIN
  SELECT * INTO v_trans FROM bank_transactions WHERE id = p_transaction_id;
  
  IF v_trans.transaction_type = 'credit' AND NOT v_trans.reconciled THEN
    -- Try to match with pending invoices
    -- Match by amount and customer reference
    SELECT i.id, 0.9 INTO v_invoice_id, v_confidence
    FROM invoices i
    INNER JOIN customers c ON i.customer_id = c.id
    WHERE i.user_id = v_trans.user_id
      AND i.status IN ('sent', 'overdue')
      AND ABS(i.total - v_trans.amount) < 1 -- Within 1 rupee
    ORDER BY i.due_date DESC
    LIMIT 1;
    
    IF v_invoice_id IS NOT NULL THEN
      UPDATE bank_transactions 
      SET invoice_id = v_invoice_id,
          auto_matched = true,
          match_confidence = v_confidence,
          updated_at = NOW()
      WHERE id = p_transaction_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp triggers
DROP TRIGGER IF EXISTS update_upi_payment_updated_at ON upi_payment_details;
CREATE TRIGGER update_upi_payment_updated_at BEFORE UPDATE ON upi_payment_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_installments_updated_at ON payment_installments;
CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON payment_installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_trans_updated_at ON bank_transactions;
CREATE TRIGGER update_bank_trans_updated_at BEFORE UPDATE ON bank_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_failed_payments_updated_at ON failed_payments;
CREATE TRIGGER update_failed_payments_updated_at BEFORE UPDATE ON failed_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_late_fee_config_updated_at ON late_fee_config;
CREATE TRIGGER update_late_fee_config_updated_at BEFORE UPDATE ON late_fee_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bnpl_updated_at ON bnpl_applications;
CREATE TRIGGER update_bnpl_updated_at BEFORE UPDATE ON bnpl_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_followups_updated_at ON payment_followups;
CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON payment_followups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update payment behavior on invoice status change
CREATE OR REPLACE FUNCTION trigger_update_payment_behavior() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('paid', 'overdue') THEN
    PERFORM update_payment_behavior(NEW.customer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoice_status_update_behavior ON invoices;
CREATE TRIGGER invoice_status_update_behavior
AFTER UPDATE OF status ON invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_update_payment_behavior();

-- ============================================
-- VIEWS
-- ============================================

-- Overdue invoices with late fees
DROP VIEW IF EXISTS invoices_with_late_fees;
CREATE OR REPLACE VIEW invoices_with_late_fees AS
SELECT 
  i.*,
  calculate_late_fee(i.id, i.due_date, i.total) as calculated_late_fee,
  CASE 
    WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled') 
    THEN CURRENT_DATE - i.due_date 
    ELSE 0 
  END as days_overdue
FROM invoices i
WHERE i.status NOT IN ('paid', 'cancelled');

-- Payment analytics summary
DROP VIEW IF EXISTS payment_analytics_summary;
CREATE OR REPLACE VIEW payment_analytics_summary AS
SELECT 
  user_id,
  COUNT(*) as total_customers,
  AVG(payment_reliability_score) as avg_reliability_score,
  COUNT(CASE WHEN risk_category = 'high' THEN 1 END) as high_risk_customers,
  COUNT(CASE WHEN payment_pattern = 'defaulter' THEN 1 END) as defaulter_count,
  SUM(total_amount_paid) as total_collected
FROM payment_behavior_analytics
GROUP BY user_id;

COMMENT ON TABLE upi_payment_details IS 'UPI payment configuration for businesses';
COMMENT ON TABLE payment_installments IS 'Installment payment plans for invoices';
COMMENT ON TABLE bank_transactions IS 'Bank transactions for auto-reconciliation';
COMMENT ON TABLE failed_payments IS 'Failed payment attempts and recovery tracking';
COMMENT ON TABLE late_fee_config IS 'Late fee calculation configuration';
COMMENT ON TABLE bnpl_applications IS 'Buy Now Pay Later applications for MSMEs';
COMMENT ON TABLE payment_followups IS 'Automated payment reminder follow-ups';
COMMENT ON TABLE payment_behavior_analytics IS 'Customer payment behavior analysis';
COMMENT ON TABLE whatsapp_payment_links IS 'WhatsApp payment links and tracking';


-- ==========================================
-- FILE: supabase-advanced-features-migration.sql
-- ==========================================

-- Advanced Invoice Features Migration
-- Multi-series, Proforma, Credit Notes, Milestones, Approval Workflow, etc.

-- ============================================
-- 1. MULTI-SERIES INVOICE NUMBERING
-- ============================================

-- Invoice Series Management (Branch-wise, FY-wise, Custom)
CREATE TABLE IF NOT EXISTS invoice_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  series_name VARCHAR(100) NOT NULL, -- e.g., "Main Office", "Branch-Mumbai", "Export"
  series_code VARCHAR(20) NOT NULL, -- e.g., "MO", "BM", "EXP"
  prefix VARCHAR(20) DEFAULT 'INV',
  suffix VARCHAR(20),
  financial_year_based BOOLEAN DEFAULT true,
  branch_id VARCHAR(50), -- Optional branch identifier
  current_number INTEGER NOT NULL DEFAULT 0,
  reset_annually BOOLEAN DEFAULT true, -- Reset counter every FY
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  number_format VARCHAR(50) DEFAULT '{PREFIX}-{FY}-{NUM}', -- e.g., INV-2425-0001, BM-INV-0001
  padding_length INTEGER DEFAULT 4, -- Number of digits to pad (e.g., 0001)
  last_reset_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, series_code)
);

CREATE INDEX idx_invoice_series_user_id ON invoice_series(user_id);
CREATE INDEX idx_invoice_series_active ON invoice_series(user_id, is_active);

-- Update invoices table to reference series
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_series_id UUID REFERENCES invoice_series(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS financial_year VARCHAR(10); -- e.g., "2024-25"

-- ============================================
-- 2. INVOICE LIFECYCLE & TYPES
-- ============================================

-- Add invoice type and lifecycle tracking
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(30) DEFAULT 'standard' 
  CHECK (invoice_type IN ('standard', 'proforma', 'credit_note', 'debit_note', 'advance', 'milestone'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parent_invoice_id UUID REFERENCES invoices(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lifecycle_stage VARCHAR(30) DEFAULT 'draft'
  CHECK (lifecycle_stage IN ('draft', 'proforma', 'approved', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'converted'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS converted_to_invoice_id UUID REFERENCES invoices(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS credit_note_reason TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS proforma_valid_until DATE;

-- ============================================
-- 3. MILESTONE & PARTIAL BILLING
-- ============================================

CREATE TABLE IF NOT EXISTS invoice_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  milestone_invoice_id UUID REFERENCES invoices(id),
  milestone_number INTEGER NOT NULL,
  milestone_name VARCHAR(200) NOT NULL,
  description TEXT,
  percentage DECIMAL(5, 2), -- Percentage of total project
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'cancelled')),
  completion_criteria TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_milestones_parent ON invoice_milestones(parent_invoice_id);
CREATE INDEX idx_invoice_milestones_status ON invoice_milestones(parent_invoice_id, status);

-- Add milestone tracking to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_milestone_based BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES invoice_milestones(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_name VARCHAR(200);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_total_value DECIMAL(12, 2);

-- ============================================
-- 4. ADVANCE PAYMENT INVOICES
-- ============================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_advance_payment BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS advance_percentage DECIMAL(5, 2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS advance_adjusted_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS advance_invoice_ids JSONB; -- Array of advance invoice IDs

-- Advance payment adjustments table
CREATE TABLE IF NOT EXISTS advance_payment_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advance_invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  final_invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  adjusted_amount DECIMAL(12, 2) NOT NULL,
  adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_advance_adjustments_advance ON advance_payment_adjustments(advance_invoice_id);
CREATE INDEX idx_advance_adjustments_final ON advance_payment_adjustments(final_invoice_id);

-- ============================================
-- 5. INVOICE APPROVAL WORKFLOW (Maker-Checker)
-- ============================================

CREATE TABLE IF NOT EXISTS invoice_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  current_approver UUID REFERENCES auth.users(id),
  approval_level INTEGER DEFAULT 1,
  required_approvals INTEGER DEFAULT 1,
  approval_status VARCHAR(30) DEFAULT 'pending' 
    CHECK (approval_status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_id UUID REFERENCES invoice_approvals(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES auth.users(id) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'commented')),
  comments TEXT,
  action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_approvals_invoice ON invoice_approvals(invoice_id);
CREATE INDEX idx_invoice_approvals_approver ON invoice_approvals(current_approver, approval_status);
CREATE INDEX idx_approval_history_approval ON approval_history(approval_id);

-- Add approval fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30);

-- ============================================
-- 6. ENHANCED GST FEATURES
-- ============================================

-- Store company/user GST details for auto-classification
CREATE TABLE IF NOT EXISTS company_gst_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_gstin VARCHAR(15) NOT NULL,
  company_state_code VARCHAR(2) NOT NULL,
  company_state_name VARCHAR(100),
  default_place_of_supply VARCHAR(2),
  is_composition_scheme BOOLEAN DEFAULT false,
  composition_rate DECIMAL(5, 2),
  reverse_charge_applicable_categories JSONB, -- Array of service categories
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_company_gst_user ON company_gst_settings(user_id);

-- Enhanced customer state tracking (if not already present)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_code VARCHAR(2);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_name VARCHAR(100);

-- Add more GST fields to invoices if not present
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_sez_supply BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_export BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS export_type VARCHAR(30);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_bill_no VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_bill_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS port_code VARCHAR(10);

-- ============================================
-- 7. HSN/SAC MASTER DATABASE
-- ============================================

CREATE TABLE IF NOT EXISTS hsn_sac_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('HSN', 'SAC')),
  gst_rate DECIMAL(5, 2) NOT NULL,
  chapter_no VARCHAR(4),
  chapter_name VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  search_keywords TEXT[], -- For intelligent search
  usage_count INTEGER DEFAULT 0, -- Track popularity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all required columns exist (in case table was created elsewhere)
DO $$ 
BEGIN
  -- Add gst_rate if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'gst_rate'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00;
  END IF;
  
  -- Add chapter_no if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'chapter_no'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN chapter_no VARCHAR(4);
  END IF;
  
  -- Add chapter_name if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'chapter_name'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN chapter_name VARCHAR(200);
  END IF;
  
  -- Add search_keywords if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'search_keywords'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN search_keywords TEXT[];
  END IF;
  
  -- Add usage_count if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hsn_sac_master' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE hsn_sac_master ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hsn_sac_code ON hsn_sac_master(code);
CREATE INDEX IF NOT EXISTS idx_hsn_sac_category ON hsn_sac_master(category);
CREATE INDEX IF NOT EXISTS idx_hsn_sac_description ON hsn_sac_master USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_hsn_sac_keywords ON hsn_sac_master USING gin(search_keywords);

-- User's frequently used HSN/SAC codes
CREATE TABLE IF NOT EXISTS user_hsn_sac_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hsn_sac_code VARCHAR(10) NOT NULL,
  custom_description TEXT,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hsn_sac_code)
);

CREATE INDEX idx_user_hsn_preferences ON user_hsn_sac_preferences(user_id, usage_count DESC);

-- ============================================
-- 8. COMPLIANCE & ROUND-OFF
-- ============================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS round_off_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_before_round_off DECIMAL(12, 2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS compliance_checked BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS compliance_warnings JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS auto_calculated BOOLEAN DEFAULT true;

-- Compliance audit log
CREATE TABLE IF NOT EXISTS invoice_compliance_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  check_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pass', 'warning', 'error')),
  message TEXT,
  details JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_compliance_log_invoice ON invoice_compliance_log(invoice_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Invoice Series
ALTER TABLE invoice_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invoice series" ON invoice_series FOR ALL USING (auth.uid() = user_id);

-- Invoice Milestones
ALTER TABLE invoice_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own milestones" ON invoice_milestones FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_milestones.parent_invoice_id AND invoices.user_id = auth.uid()));

-- Advance Payment Adjustments
ALTER TABLE advance_payment_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own adjustments" ON advance_payment_adjustments FOR ALL 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = advance_payment_adjustments.advance_invoice_id AND invoices.user_id = auth.uid()));

-- Invoice Approvals
ALTER TABLE invoice_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own approvals" ON invoice_approvals FOR ALL 
  USING (auth.uid() = submitted_by OR auth.uid() = current_approver);

ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view approval history" ON approval_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM invoice_approvals WHERE invoice_approvals.id = approval_history.approval_id 
    AND (invoice_approvals.submitted_by = auth.uid() OR invoice_approvals.current_approver = auth.uid())));

-- Company GST Settings
ALTER TABLE company_gst_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own GST settings" ON company_gst_settings FOR ALL USING (auth.uid() = user_id);

-- HSN/SAC Master (public read, admin write)
ALTER TABLE hsn_sac_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read HSN/SAC" ON hsn_sac_master FOR SELECT USING (true);

-- User HSN/SAC Preferences
ALTER TABLE user_hsn_sac_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own HSN preferences" ON user_hsn_sac_preferences FOR ALL USING (auth.uid() = user_id);

-- Invoice Compliance Log
ALTER TABLE invoice_compliance_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own compliance logs" ON invoice_compliance_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_compliance_log.invoice_id AND invoices.user_id = auth.uid()));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current Financial Year
CREATE OR REPLACE FUNCTION get_current_financial_year()
RETURNS VARCHAR AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
  fy_start_year INTEGER;
  fy_end_year INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  IF current_month >= 4 THEN
    fy_start_year := current_year;
    fy_end_year := current_year + 1;
  ELSE
    fy_start_year := current_year - 1;
    fy_end_year := current_year;
  END IF;
  
  RETURN fy_start_year::VARCHAR || '-' || SUBSTRING(fy_end_year::VARCHAR, 3, 2);
END;
$$ LANGUAGE plpgsql;

-- Enhanced invoice number generation with series support
CREATE OR REPLACE FUNCTION get_next_invoice_number_with_series(
  p_user_id UUID,
  p_series_id UUID DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
  v_series RECORD;
  v_next_number INTEGER;
  v_invoice_number VARCHAR;
  v_fy VARCHAR;
  v_num_str VARCHAR;
BEGIN
  -- Get financial year
  v_fy := get_current_financial_year();
  
  -- Get series (use default if not specified)
  IF p_series_id IS NULL THEN
    SELECT * INTO v_series FROM invoice_series 
    WHERE user_id = p_user_id AND (is_default = true OR is_active = true)
    ORDER BY is_default DESC, created_at ASC
    LIMIT 1 FOR UPDATE;
    
    IF NOT FOUND THEN
      -- Create default series
      INSERT INTO invoice_series (user_id, series_name, series_code, prefix, is_default, is_active)
      VALUES (p_user_id, 'Default Series', 'DEF', 'INV', true, true)
      RETURNING * INTO v_series;
    END IF;
  ELSE
    SELECT * INTO v_series FROM invoice_series 
    WHERE id = p_series_id AND user_id = p_user_id
    FOR UPDATE;
  END IF;
  
  -- Check if reset is needed
  IF v_series.reset_annually AND v_series.financial_year_based THEN
    IF v_series.last_reset_date IS NULL OR 
       EXTRACT(YEAR FROM v_series.last_reset_date) < EXTRACT(YEAR FROM CURRENT_DATE) THEN
      v_next_number := 1;
      UPDATE invoice_series 
      SET current_number = 1, last_reset_date = CURRENT_DATE
      WHERE id = v_series.id;
    ELSE
      v_next_number := v_series.current_number + 1;
      UPDATE invoice_series SET current_number = v_next_number WHERE id = v_series.id;
    END IF;
  ELSE
    v_next_number := v_series.current_number + 1;
    UPDATE invoice_series SET current_number = v_next_number WHERE id = v_series.id;
  END IF;
  
  -- Format number with padding
  v_num_str := LPAD(v_next_number::TEXT, v_series.padding_length, '0');
  
  -- Build invoice number based on format
  v_invoice_number := v_series.number_format;
  v_invoice_number := REPLACE(v_invoice_number, '{PREFIX}', v_series.prefix);
  v_invoice_number := REPLACE(v_invoice_number, '{FY}', v_fy);
  v_invoice_number := REPLACE(v_invoice_number, '{NUM}', v_num_str);
  v_invoice_number := REPLACE(v_invoice_number, '{SERIES}', v_series.series_code);
  
  IF v_series.suffix IS NOT NULL THEN
    v_invoice_number := v_invoice_number || '-' || v_series.suffix;
  END IF;
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-determine GST type based on state codes
CREATE OR REPLACE FUNCTION auto_determine_gst_type(
  p_company_state_code VARCHAR(2),
  p_customer_state_code VARCHAR(2)
)
RETURNS VARCHAR AS $$
BEGIN
  IF p_customer_state_code IS NULL OR p_customer_state_code = '' THEN
    RETURN 'intra-state'; -- Default to intra-state
  END IF;
  
  IF p_company_state_code = p_customer_state_code THEN
    RETURN 'intra-state'; -- CGST + SGST
  ELSE
    RETURN 'inter-state'; -- IGST
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate round-off
CREATE OR REPLACE FUNCTION calculate_round_off(p_amount DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  v_rounded DECIMAL;
  v_round_off DECIMAL;
BEGIN
  v_rounded := ROUND(p_amount);
  v_round_off := v_rounded - p_amount;
  RETURN v_round_off;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_series_updated_at BEFORE UPDATE ON invoice_series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_milestones_updated_at BEFORE UPDATE ON invoice_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_approvals_updated_at BEFORE UPDATE ON invoice_approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_gst_updated_at BEFORE UPDATE ON company_gst_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Common HSN/SAC Codes
-- ============================================

INSERT INTO hsn_sac_master (code, description, category, gst_rate, chapter_no, chapter_name, search_keywords) VALUES
-- Services (SAC)
('9954', 'Consultancy Services', 'SAC', 18.00, '99', 'Professional Services', ARRAY['consulting', 'advisory', 'professional', 'business']),
('9965', 'Other Professional, Technical and Business Services', 'SAC', 18.00, '99', 'Professional Services', ARRAY['professional', 'technical', 'business']),
('9967', 'Financial and Related Services', 'SAC', 18.00, '99', 'Financial Services', ARRAY['finance', 'banking', 'accounting']),
('9973', 'Software Implementation Services', 'SAC', 18.00, '99', 'IT Services', ARRAY['software', 'implementation', 'it', 'technology']),
('9982', 'Computer and Information Services', 'SAC', 18.00, '99', 'IT Services', ARRAY['computer', 'information', 'it', 'software']),
('9983', 'News Agency Services', 'SAC', 18.00, '99', 'Media Services', ARRAY['news', 'media', 'journalism']),
('9985', 'Education and Training Services', 'SAC', 18.00, '99', 'Education', ARRAY['education', 'training', 'teaching', 'learning']),
('9986', 'Health Services', 'SAC', 12.00, '99', 'Healthcare', ARRAY['health', 'medical', 'healthcare', 'hospital']),
('9988', 'Other Professional, Technical and Business Services n.e.c.', 'SAC', 18.00, '99', 'Professional Services', ARRAY['professional', 'business', 'services']),
('9989', 'Maintenance, repair and installation (except construction) services', 'SAC', 18.00, '99', 'Maintenance Services', ARRAY['maintenance', 'repair', 'installation']),
-- Goods (HSN)
('8517', 'Electrical apparatus for line telephony or line telegraphy', 'HSN', 18.00, '85', 'Electrical Machinery', ARRAY['phone', 'telephone', 'communication', 'mobile']),
('8471', 'Automatic data processing machines and units thereof', 'HSN', 18.00, '84', 'Computers', ARRAY['computer', 'laptop', 'desktop', 'hardware']),
('6204', 'Women or girls suits, ensembles, jackets, blazers', 'HSN', 12.00, '62', 'Apparel', ARRAY['clothing', 'garments', 'women', 'apparel']),
('7326', 'Other articles of iron or steel', 'HSN', 18.00, '73', 'Iron and Steel', ARRAY['steel', 'iron', 'metal']),
('3004', 'Medicaments', 'HSN', 12.00, '30', 'Pharmaceuticals', ARRAY['medicine', 'drugs', 'pharmaceutical', 'medicament']),
('4901', 'Printed books, brochures, leaflets', 'HSN', 12.00, '49', 'Publications', ARRAY['books', 'publications', 'printed']),
('8544', 'Insulated wire, cable', 'HSN', 18.00, '85', 'Electrical Machinery', ARRAY['wire', 'cable', 'electrical']),
('9403', 'Other furniture and parts thereof', 'HSN', 18.00, '94', 'Furniture', ARRAY['furniture', 'table', 'chair', 'desk'])
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Invoice Summary View with all details
CREATE OR REPLACE VIEW invoice_summary_view AS
SELECT 
  i.*,
  c.name as customer_name,
  c.gstin as customer_gstin,
  c.state_code as customer_state_code,
  s.series_name,
  s.series_code,
  ia.approval_status as current_approval_status,
  COALESCE(m.milestone_count, 0) as milestone_count,
  COALESCE(m.paid_milestones, 0) as paid_milestones
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id
LEFT JOIN invoice_series s ON i.invoice_series_id = s.id
LEFT JOIN invoice_approvals ia ON i.id = ia.invoice_id AND ia.approval_status = 'pending'
LEFT JOIN (
  SELECT parent_invoice_id, 
         COUNT(*) as milestone_count,
         COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_milestones
  FROM invoice_milestones 
  GROUP BY parent_invoice_id
) m ON i.id = m.parent_invoice_id;

COMMENT ON TABLE invoice_series IS 'Manages multiple invoice numbering series for branches, financial years, or custom requirements';
COMMENT ON TABLE invoice_milestones IS 'Tracks milestone-based billing for project invoices';
COMMENT ON TABLE invoice_approvals IS 'Implements maker-checker approval workflow for invoices';
COMMENT ON TABLE hsn_sac_master IS 'Master database of HSN and SAC codes with GST rates';
COMMENT ON TABLE company_gst_settings IS 'Stores company GST configuration for auto-classification';


-- ==========================================
-- FILE: supabase-voice-invoice-migration.sql
-- ==========================================

-- Voice-to-Invoice Feature Migration
-- Enables voice-based invoice creation with AI processing

-- ============================================
-- VOICE RECORDINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recording_url TEXT, -- Stored in Supabase Storage
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  mime_type VARCHAR(50) DEFAULT 'audio/webm',
  status VARCHAR(30) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'transcribed', 'parsed', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_recordings_user_id ON voice_recordings(user_id);
CREATE INDEX idx_voice_recordings_status ON voice_recordings(user_id, status);

-- ============================================
-- VOICE TRANSCRIPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voice_recording_id UUID REFERENCES voice_recordings(id) ON DELETE CASCADE NOT NULL,
  raw_transcript TEXT NOT NULL,
  confidence_score DECIMAL(5, 4), -- 0.0000 to 1.0000
  language VARCHAR(10) DEFAULT 'en-IN',
  transcription_service VARCHAR(50), -- 'web-speech-api', 'google', 'openai-whisper', etc.
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_transcriptions_recording ON voice_transcriptions(voice_recording_id);

-- ============================================
-- VOICE INVOICE PARSING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_invoice_parsing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voice_recording_id UUID REFERENCES voice_recordings(id) ON DELETE CASCADE NOT NULL,
  transcription_id UUID REFERENCES voice_transcriptions(id) NOT NULL,
  parsed_data JSONB NOT NULL, -- Structured invoice data extracted from voice
  confidence_score DECIMAL(5, 4),
  parsing_service VARCHAR(50), -- 'openai-gpt', 'custom-nlp', etc.
  validation_status VARCHAR(30) DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'valid', 'needs_review', 'invalid')),
  validation_errors JSONB, -- Array of validation issues
  invoice_id UUID REFERENCES invoices(id), -- Created invoice (if completed)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_invoice_parsing_recording ON voice_invoice_parsing(voice_recording_id);
CREATE INDEX idx_voice_invoice_parsing_invoice ON voice_invoice_parsing(invoice_id);

-- ============================================
-- VOICE COMMANDS LOG
-- ============================================

CREATE TABLE IF NOT EXISTS voice_commands_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voice_recording_id UUID REFERENCES voice_recordings(id),
  command_type VARCHAR(50) NOT NULL DEFAULT 'unknown',
  command_text TEXT NOT NULL DEFAULT '',
  extracted_entities JSONB,
  executed BOOLEAN DEFAULT false,
  execution_result JSONB,
  
  -- Voice Input
  transcript TEXT,
  language VARCHAR(10) DEFAULT 'en-IN',  -- en-IN, hi-IN, te-IN, ta-IN
  confidence_score DECIMAL(5, 4),  -- 0.0000 to 1.0000
  
  -- Recognition
  recognized_intent VARCHAR(100),  -- create_invoice, view_customers, check_payment, etc.
  recognized_entities JSONB,  -- Extracted entities (customer name, amount, etc.)
  
  -- Processing
  processing_status VARCHAR(50) DEFAULT 'processed',  -- processing, processed, failed
  processing_time_ms INTEGER,
  
  -- Action Taken
  action_executed VARCHAR(100),
  action_result VARCHAR(50),  -- success, failed, cancelled
  action_data JSONB,
  
  -- Error Handling
  error_message TEXT,
  fallback_used BOOLEAN DEFAULT false,
  
  -- User Feedback
  user_confirmed BOOLEAN,
  user_corrected BOOLEAN DEFAULT false,
  corrected_transcript TEXT,
  
  -- Context
  previous_command_id UUID REFERENCES voice_commands_log(id),
  session_id VARCHAR(255),
  
  -- Device
  device_type VARCHAR(50),
  browser VARCHAR(100),
  
  -- Training Data
  used_for_training BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_commands_user ON voice_commands_log(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_type ON voice_commands_log(command_type);

-- ============================================
-- ADD VOICE FIELDS TO INVOICES
-- ============================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_via_voice BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voice_recording_id UUID REFERENCES voice_recordings(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voice_confidence_score DECIMAL(5, 4);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Voice Recordings
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own voice recordings" ON voice_recordings FOR ALL USING (auth.uid() = user_id);

-- Voice Transcriptions
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transcriptions" ON voice_transcriptions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM voice_recordings WHERE voice_recordings.id = voice_transcriptions.voice_recording_id AND voice_recordings.user_id = auth.uid()));

-- Voice Invoice Parsing
ALTER TABLE voice_invoice_parsing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own parsing" ON voice_invoice_parsing FOR SELECT 
  USING (EXISTS (SELECT 1 FROM voice_recordings WHERE voice_recordings.id = voice_invoice_parsing.voice_recording_id AND voice_recordings.user_id = auth.uid()));

-- Voice Commands Log
ALTER TABLE voice_commands_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own commands" ON voice_commands_log FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to extract invoice data from voice transcript
CREATE OR REPLACE FUNCTION extract_invoice_entities(p_transcript TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_customer TEXT;
  v_amount NUMERIC;
  v_items JSONB;
BEGIN
  -- This is a basic implementation - in production, use AI/NLP service
  v_result := '{}'::JSONB;
  
  -- Extract customer name (simple pattern matching)
  v_customer := substring(p_transcript FROM 'customer[:\s]+([A-Za-z\s]+)');
  IF v_customer IS NOT NULL THEN
    v_result := jsonb_set(v_result, '{customer_name}', to_jsonb(trim(v_customer)));
  END IF;
  
  -- Extract amount
  v_amount := substring(p_transcript FROM '[\$₹]\s*([0-9,\.]+)')::NUMERIC;
  IF v_amount IS NOT NULL THEN
    v_result := jsonb_set(v_result, '{total}', to_jsonb(v_amount));
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate parsed invoice data
CREATE OR REPLACE FUNCTION validate_voice_invoice_data(p_data JSONB)
RETURNS JSONB AS $$
DECLARE
  v_errors JSONB := '[]'::JSONB;
  v_is_valid BOOLEAN := true;
BEGIN
  -- Check required fields
  IF NOT (p_data ? 'customer_name' OR p_data ? 'customer_id') THEN
    v_errors := v_errors || jsonb_build_object('field', 'customer', 'message', 'Customer name or ID is required');
    v_is_valid := false;
  END IF;
  
  IF NOT (p_data ? 'items') OR jsonb_array_length(p_data->'items') = 0 THEN
    v_errors := v_errors || jsonb_build_object('field', 'items', 'message', 'At least one item is required');
    v_is_valid := false;
  END IF;
  
  IF NOT (p_data ? 'total' OR p_data ? 'subtotal') THEN
    v_errors := v_errors || jsonb_build_object('field', 'total', 'message', 'Invoice total is required');
    v_is_valid := false;
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', v_is_valid,
    'errors', v_errors
  );
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE TRIGGER update_voice_recordings_updated_at BEFORE UPDATE ON voice_recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_invoice_parsing_updated_at BEFORE UPDATE ON voice_invoice_parsing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VOICE TEMPLATES (Common Phrases)
-- ============================================

CREATE TABLE IF NOT EXISTS voice_invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  template_phrase TEXT NOT NULL, -- e.g., "Create invoice for [customer] for [amount]"
  expected_entities JSONB NOT NULL, -- List of entities to extract
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_templates_user ON voice_invoice_templates(user_id);

ALTER TABLE voice_invoice_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own templates" ON voice_invoice_templates FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

CREATE OR REPLACE VIEW voice_invoice_summary AS
SELECT 
  vr.id as recording_id,
  vr.user_id,
  vr.status as recording_status,
  vr.duration_seconds,
  vt.raw_transcript,
  vt.confidence_score as transcription_confidence,
  vip.parsed_data,
  vip.validation_status,
  vip.invoice_id,
  i.invoice_number,
  i.total as invoice_total,
  vr.created_at
FROM voice_recordings vr
LEFT JOIN voice_transcriptions vt ON vr.id = vt.voice_recording_id
LEFT JOIN voice_invoice_parsing vip ON vr.id = vip.voice_recording_id
LEFT JOIN invoices i ON vip.invoice_id = i.id
ORDER BY vr.created_at DESC;

COMMENT ON TABLE voice_recordings IS 'Stores audio recordings for voice-to-invoice feature';
COMMENT ON TABLE voice_transcriptions IS 'Stores transcribed text from voice recordings';
COMMENT ON TABLE voice_invoice_parsing IS 'Stores parsed and structured invoice data from voice input';
COMMENT ON TABLE voice_commands_log IS 'Logs all voice commands executed by users';
COMMENT ON TABLE voice_invoice_templates IS 'Pre-defined voice command templates for faster invoice creation';


-- ==========================================
-- FILE: supabase-regional-features-migration.sql
-- ==========================================

-- =====================================================
-- REGIONAL & MOBILE FEATURES MIGRATION
-- Language support, offline sync, voice commands
-- =====================================================

-- =====================================================
-- 1. USER LANGUAGE PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS user_language_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Language Settings
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',  -- en, hi, te, ta
  invoice_language VARCHAR(10) NOT NULL DEFAULT 'en',
  ui_language VARCHAR(10) NOT NULL DEFAULT 'en',
  
  -- Regional Settings
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  number_format VARCHAR(20) DEFAULT 'indian',  -- indian, international
  currency_format VARCHAR(20) DEFAULT 'INR',
  
  -- Voice Settings
  voice_enabled BOOLEAN DEFAULT false,
  voice_language VARCHAR(10) DEFAULT 'en-IN',
  voice_speed DECIMAL(3, 1) DEFAULT 1.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- 2. INDIAN INVOICE TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template Info
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL,  -- standard, professional, modern, traditional, retail, service
  template_language VARCHAR(10) DEFAULT 'en',
  
  -- Design
  template_design JSONB NOT NULL,  -- Full template configuration
  color_scheme VARCHAR(50),  -- blue, green, red, orange, purple, traditional
  font_family VARCHAR(100),  -- devanagari, tamil, telugu, english
  
  -- Features
  show_company_logo BOOLEAN DEFAULT true,
  show_gst_details BOOLEAN DEFAULT true,
  show_bank_details BOOLEAN DEFAULT true,
  show_terms BOOLEAN DEFAULT true,
  show_signature BOOLEAN DEFAULT true,
  show_qr_code BOOLEAN DEFAULT false,
  
  -- Language-specific fields
  header_text JSONB,  -- { en: "Invoice", hi: "बीजक", te: "ఇన్వాయిస్", ta: "விலைப்பட்டியல்" }
  footer_text JSONB,
  terms_text JSONB,
  
  -- Indian business specific
  show_pan BOOLEAN DEFAULT false,
  show_msme_number BOOLEAN DEFAULT false,
  show_udyam_number BOOLEAN DEFAULT false,
  show_iec_code BOOLEAN DEFAULT false,
  
  -- Usage
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,  -- Public templates anyone can use
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. OFFLINE SYNC QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action Details
  entity_type VARCHAR(100) NOT NULL,  -- invoice, customer, payment, etc.
  entity_id UUID,
  action_type VARCHAR(50) NOT NULL,  -- create, update, delete
  
  -- Data
  action_data JSONB NOT NULL,
  previous_data JSONB,  -- For conflict resolution
  
  -- Sync Status
  sync_status VARCHAR(50) DEFAULT 'pending',  -- pending, syncing, synced, failed, conflict
  sync_attempts INTEGER DEFAULT 0,
  last_sync_attempt TIMESTAMPTZ,
  
  -- Conflict Resolution
  has_conflict BOOLEAN DEFAULT false,
  conflict_details JSONB,
  resolved BOOLEAN DEFAULT false,
  resolution_strategy VARCHAR(50),  -- server_wins, client_wins, merge, manual
  
  -- Device Info
  device_id VARCHAR(255),
  device_type VARCHAR(50),  -- mobile, tablet, desktop
  app_version VARCHAR(50),
  
  -- Network
  created_offline BOOLEAN DEFAULT false,
  sync_priority INTEGER DEFAULT 5,  -- 1-10, higher = more important
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_offline_sync_user_status ON offline_sync_queue(user_id, sync_status);
CREATE INDEX IF NOT EXISTS idx_offline_sync_entity ON offline_sync_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_priority ON offline_sync_queue(sync_priority DESC, created_at ASC) WHERE sync_status = 'pending';

-- =====================================================
-- 4. OFFLINE CACHE METADATA
-- =====================================================

CREATE TABLE IF NOT EXISTS offline_cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cache Info
  cache_key VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  
  -- Data
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  data_version INTEGER DEFAULT 1,
  data_checksum VARCHAR(64),  -- For integrity check
  
  -- Size
  data_size_bytes BIGINT,
  compressed BOOLEAN DEFAULT false,
  
  -- Access
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  
  -- Device
  device_id VARCHAR(255),
  
  UNIQUE(user_id, cache_key, device_id)
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON offline_cache_metadata(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cache_last_accessed ON offline_cache_metadata(last_accessed);

-- =====================================================
-- 5. VOICE COMMANDS LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS voice_commands_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_recording_id UUID REFERENCES voice_recordings(id),
  command_type VARCHAR(50) NOT NULL DEFAULT 'unknown',
  command_text TEXT NOT NULL DEFAULT '',
  extracted_entities JSONB,
  executed BOOLEAN DEFAULT false,
  execution_result JSONB,
  
  -- Voice Input
  transcript TEXT,
  language VARCHAR(10) DEFAULT 'en-IN',  -- en-IN, hi-IN, te-IN, ta-IN
  confidence_score DECIMAL(5, 4),  -- 0.0000 to 1.0000
  
  -- Recognition
  recognized_intent VARCHAR(100),  -- create_invoice, view_customers, check_payment, etc.
  recognized_entities JSONB,  -- Extracted entities (customer name, amount, etc.)
  
  -- Processing
  processing_status VARCHAR(50) DEFAULT 'processed',  -- processing, processed, failed
  processing_time_ms INTEGER,
  
  -- Action Taken
  action_executed VARCHAR(100),
  action_result VARCHAR(50),  -- success, failed, cancelled
  action_data JSONB,
  
  -- Error Handling
  error_message TEXT,
  fallback_used BOOLEAN DEFAULT false,
  
  -- User Feedback
  user_confirmed BOOLEAN,
  user_corrected BOOLEAN DEFAULT false,
  corrected_transcript TEXT,
  
  -- Context
  previous_command_id UUID REFERENCES voice_commands_log(id),
  session_id VARCHAR(255),
  
  -- Device
  device_type VARCHAR(50),
  browser VARCHAR(100),
  
  -- Training Data
  used_for_training BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing voice_commands_log table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_commands_log' AND column_name = 'recognized_intent') THEN
    ALTER TABLE voice_commands_log ADD COLUMN recognized_intent VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_commands_log' AND column_name = 'recognized_entities') THEN
    ALTER TABLE voice_commands_log ADD COLUMN recognized_entities JSONB;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_voice_commands_user ON voice_commands_log(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_intent ON voice_commands_log(recognized_intent);
CREATE INDEX IF NOT EXISTS idx_voice_commands_date ON voice_commands_log(created_at DESC);

-- =====================================================
-- 6. WHATSAPP QUICK ACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action Details
  action_name VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,  -- send_invoice, payment_reminder, thank_you, follow_up
  
  -- Trigger
  trigger_type VARCHAR(50),  -- manual, automatic, scheduled
  trigger_condition JSONB,  -- Conditions for auto-trigger
  
  -- Message Template
  message_template TEXT NOT NULL,
  variables JSONB,  -- Template variables
  
  -- Media
  include_pdf BOOLEAN DEFAULT false,
  include_payment_link BOOLEAN DEFAULT false,
  include_qr_code BOOLEAN DEFAULT false,
  
  -- Language
  message_language VARCHAR(10) DEFAULT 'en',  -- en, hi, te, ta
  auto_translate BOOLEAN DEFAULT false,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Sorting
  display_order INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_actions_user ON whatsapp_quick_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_actions_type ON whatsapp_quick_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_actions_order ON whatsapp_quick_actions(display_order);

-- =====================================================
-- 7. MOBILE APP SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Offline Mode
  offline_mode_enabled BOOLEAN DEFAULT true,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_on_wifi_only BOOLEAN DEFAULT false,
  sync_interval_minutes INTEGER DEFAULT 30,
  
  -- Cache
  max_cache_size_mb INTEGER DEFAULT 100,
  cache_invoices BOOLEAN DEFAULT true,
  cache_customers BOOLEAN DEFAULT true,
  cache_products BOOLEAN DEFAULT true,
  cache_days INTEGER DEFAULT 30,
  
  -- Notifications
  push_notifications_enabled BOOLEAN DEFAULT true,
  payment_received_notification BOOLEAN DEFAULT true,
  payment_overdue_notification BOOLEAN DEFAULT true,
  daily_summary_notification BOOLEAN DEFAULT false,
  
  -- Quick Actions
  quick_create_invoice BOOLEAN DEFAULT true,
  quick_record_payment BOOLEAN DEFAULT true,
  quick_send_reminder BOOLEAN DEFAULT true,
  
  -- Theme
  theme VARCHAR(20) DEFAULT 'light',  -- light, dark, auto
  compact_view BOOLEAN DEFAULT false,
  
  -- Security
  biometric_login_enabled BOOLEAN DEFAULT false,
  auto_lock_minutes INTEGER DEFAULT 15,
  require_pin BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_cache_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_commands_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_language_preferences_policy ON user_language_preferences;
CREATE POLICY user_language_preferences_policy ON user_language_preferences FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS invoice_templates_policy ON invoice_templates;
CREATE POLICY invoice_templates_policy ON invoice_templates FOR ALL USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS offline_sync_queue_policy ON offline_sync_queue;
CREATE POLICY offline_sync_queue_policy ON offline_sync_queue FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS offline_cache_metadata_policy ON offline_cache_metadata;
CREATE POLICY offline_cache_metadata_policy ON offline_cache_metadata FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS voice_commands_log_policy ON voice_commands_log;
CREATE POLICY voice_commands_log_policy ON voice_commands_log FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS whatsapp_quick_actions_policy ON whatsapp_quick_actions;
CREATE POLICY whatsapp_quick_actions_policy ON whatsapp_quick_actions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS mobile_app_settings_policy ON mobile_app_settings;
CREATE POLICY mobile_app_settings_policy ON mobile_app_settings FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-cleanup old offline sync records
CREATE OR REPLACE FUNCTION cleanup_synced_records() RETURNS void AS $$
BEGIN
  DELETE FROM offline_sync_queue 
  WHERE sync_status = 'synced' 
  AND synced_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM offline_cache_metadata
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Get pending sync count
CREATE OR REPLACE FUNCTION get_pending_sync_count(p_user_id UUID) 
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM offline_sync_queue
  WHERE user_id = p_user_id
  AND sync_status IN ('pending', 'failed');
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED PUBLIC TEMPLATES
-- =====================================================

-- Insert default Indian invoice templates
INSERT INTO invoice_templates (
  template_name,
  template_type,
  template_design,
  color_scheme,
  is_public
) VALUES
(
  'Professional GST Invoice',
  'professional',
  '{"layout": "modern", "sections": ["header", "items", "tax", "footer"]}'::jsonb,
  'blue',
  true
),
(
  'Traditional Business Invoice',
  'traditional',
  '{"layout": "classic", "sections": ["header", "items", "tax", "bank_details", "footer"]}'::jsonb,
  'traditional',
  true
),
(
  'Modern Retail Invoice',
  'modern',
  '{"layout": "minimal", "sections": ["header", "items", "tax", "qr_code"]}'::jsonb,
  'green',
  true
),
(
  'Service Invoice',
  'service',
  '{"layout": "clean", "sections": ["header", "services", "tax", "terms", "footer"]}'::jsonb,
  'purple',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE user_language_preferences IS 'User language and regional preferences for UI and invoices';
COMMENT ON TABLE invoice_templates IS 'Indian business invoice templates with multi-language support';
COMMENT ON TABLE offline_sync_queue IS 'Queue for offline-first mobile app data synchronization';
COMMENT ON TABLE offline_cache_metadata IS 'Metadata for offline cached data';
COMMENT ON TABLE voice_commands_log IS 'Voice command recognition log with Indian accent support';
COMMENT ON TABLE whatsapp_quick_actions IS 'Quick action buttons for WhatsApp-first UX';
COMMENT ON TABLE mobile_app_settings IS 'Mobile app specific settings and preferences';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


-- ==========================================
-- FILE: supabase-uae-features-migration.sql
-- ==========================================

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


-- ==========================================
-- FILE: supabase-whatsapp-connect-migration.sql
-- ==========================================

-- WHATSAPP WEB CONNECT MIGRATION
-- Enables WhatsApp Web integration for sending invoices directly from the app

-- 1. DROP EXISTING TABLES IF NEEDED (for clean migration)
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_connections CASCADE;

-- 2. CREATE WHATSAPP CONNECTIONS TABLE
CREATE TABLE whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, connected, disconnected, error
    qr_code TEXT, -- Base64 QR code for initial connection
    connected_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_user_id ON whatsapp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_session_id ON whatsapp_connections(session_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_status ON whatsapp_connections(status);

-- Add RLS policies
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WhatsApp connections"
    ON whatsapp_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WhatsApp connections"
    ON whatsapp_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WhatsApp connections"
    ON whatsapp_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WhatsApp connections"
    ON whatsapp_connections FOR DELETE
    USING (auth.uid() = user_id);

-- 3. CREATE WHATSAPP MESSAGES TABLE
CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    recipient_name TEXT,
    message TEXT NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- text, document, image
    attachment_url TEXT,
    media_url TEXT,
    media_type TEXT,
    sent_by_me BOOLEAN DEFAULT true,
    read BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, delivered, read, failed
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_connection_id ON whatsapp_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact_id ON whatsapp_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_invoice_id ON whatsapp_messages(invoice_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);

-- Add RLS policies
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WhatsApp messages"
    ON whatsapp_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WhatsApp messages"
    ON whatsapp_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WhatsApp messages"
    ON whatsapp_messages FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. ADD WHATSAPP PHONE TO CUSTOMERS TABLE
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'whatsapp_phone'
    ) THEN
        ALTER TABLE customers ADD COLUMN whatsapp_phone TEXT;
    END IF;
END $$;

-- 5. CREATE FUNCTION TO AUTO-UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_whatsapp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS update_whatsapp_connections_updated_at ON whatsapp_connections;
CREATE TRIGGER update_whatsapp_connections_updated_at
    BEFORE UPDATE ON whatsapp_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_updated_at();

DROP TRIGGER IF EXISTS update_whatsapp_messages_updated_at ON whatsapp_messages;
CREATE TRIGGER update_whatsapp_messages_updated_at
    BEFORE UPDATE ON whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_updated_at();

-- Add comments
COMMENT ON TABLE whatsapp_connections IS 'Stores WhatsApp Web connections for users';
COMMENT ON TABLE whatsapp_messages IS 'Stores WhatsApp messages sent from the application';
COMMENT ON COLUMN customers.whatsapp_phone IS 'Customer WhatsApp phone number (can be different from regular phone)';


-- ==========================================
-- FILE: supabase-smtp-settings-migration.sql
-- ==========================================

-- SMTP Settings Table for Admin Email Configuration
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- SMTP Configuration
  smtp_host VARCHAR(255) NOT NULL DEFAULT 'smtp-mail.outlook.com',
  smtp_port INTEGER NOT NULL DEFAULT 587 CHECK (smtp_port > 0 AND smtp_port < 65536),
  smtp_user VARCHAR(255) NOT NULL,
  smtp_password TEXT NOT NULL, -- Will be encrypted
  smtp_from_email VARCHAR(255) NOT NULL,
  smtp_from_name VARCHAR(255) DEFAULT 'BillBooky Support',
  
  -- Security & Status
  is_active BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP,
  last_test_status VARCHAR(50), -- 'success', 'failed', 'pending'
  last_test_error TEXT,
  
  -- Audit
  test_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_smtp_settings_updated_by ON smtp_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_smtp_settings_is_active ON smtp_settings(is_active);

-- Enable RLS
ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can view and modify SMTP settings
CREATE POLICY "Super admins can manage SMTP settings"
  ON smtp_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Create audit trigger
CREATE OR REPLACE FUNCTION update_smtp_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS smtp_settings_timestamp_trigger ON smtp_settings;
CREATE TRIGGER smtp_settings_timestamp_trigger
BEFORE UPDATE ON smtp_settings
FOR EACH ROW
EXECUTE FUNCTION update_smtp_settings_timestamp();


-- ==========================================
-- FILE: supabase-hire-ca-migration.sql
-- ==========================================

-- Hire CA Feature - Complete Database Schema

-- ============================================
-- CA PROFESSIONALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  profile_image_url TEXT,
  
  -- Professional Details
  icai_membership_number VARCHAR(50) UNIQUE NOT NULL,
  firm_name VARCHAR(255),
  years_of_experience INTEGER NOT NULL,
  specializations TEXT[] NOT NULL, -- ['GST', 'Income Tax', 'Audit', 'Company Law', 'Financial Planning']
  
  -- Address
  office_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  
  -- Professional Info
  bio TEXT,
  education TEXT[],
  certifications TEXT[],
  languages_spoken TEXT[],
  
  -- Availability
  available_for_hire BOOLEAN DEFAULT true,
  consultation_fee DECIMAL(10, 2),
  monthly_retainer_fee DECIMAL(10, 2),
  
  -- Ratings & Reviews
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  
  -- Status
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verification_documents JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ca_professionals_user ON ca_professionals(user_id);
CREATE INDEX idx_ca_professionals_city ON ca_professionals(city);
CREATE INDEX idx_ca_professionals_state ON ca_professionals(state);
CREATE INDEX idx_ca_professionals_verification ON ca_professionals(verification_status);
CREATE INDEX idx_ca_professionals_available ON ca_professionals(available_for_hire);

-- ============================================
-- CA HIRE REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_hire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ca_professional_id UUID REFERENCES ca_professionals(id) ON DELETE SET NULL,
  
  -- Request Details
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('consultation', 'monthly_retainer', 'project_based', 'gst_filing', 'tax_filing', 'audit', 'general')),
  service_needed TEXT[] NOT NULL, -- ['GST Filing', 'Tax Returns', 'Bookkeeping', 'Audit', 'Financial Planning']
  
  -- Business Details
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  annual_turnover DECIMAL(15, 2),
  number_of_invoices INTEGER,
  
  -- Requirements
  description TEXT NOT NULL,
  preferred_start_date DATE,
  duration_months INTEGER,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  
  -- Location Preferences
  preferred_city VARCHAR(100),
  preferred_state VARCHAR(100),
  remote_ok BOOLEAN DEFAULT true,
  
  -- Status
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'matched', 'in_discussion', 'hired', 'completed', 'cancelled')),
  
  -- Matching
  matched_ca_ids UUID[], -- Array of CA IDs who showed interest
  proposals_received INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_ca_hire_requests_user ON ca_hire_requests(user_id);
CREATE INDEX idx_ca_hire_requests_ca ON ca_hire_requests(ca_professional_id);
CREATE INDEX idx_ca_hire_requests_status ON ca_hire_requests(status);
CREATE INDEX idx_ca_hire_requests_city ON ca_hire_requests(preferred_city);
CREATE INDEX idx_ca_hire_requests_created ON ca_hire_requests(created_at DESC);

-- ============================================
-- CA PROPOSALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hire_request_id UUID REFERENCES ca_hire_requests(id) ON DELETE CASCADE NOT NULL,
  ca_professional_id UUID REFERENCES ca_professionals(id) ON DELETE CASCADE NOT NULL,
  
  -- Proposal Details
  cover_letter TEXT NOT NULL,
  proposed_fee DECIMAL(10, 2) NOT NULL,
  fee_structure VARCHAR(50) NOT NULL CHECK (fee_structure IN ('one_time', 'monthly', 'hourly', 'project_based')),
  estimated_duration VARCHAR(100),
  
  -- Additional Info
  relevant_experience TEXT,
  similar_projects_completed INTEGER,
  availability_start_date DATE,
  
  -- Attachments
  attachment_urls TEXT[],
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- Response
  client_response TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ca_proposals_request ON ca_proposals(hire_request_id);
CREATE INDEX idx_ca_proposals_ca ON ca_proposals(ca_professional_id);
CREATE INDEX idx_ca_proposals_status ON ca_proposals(status);
CREATE INDEX idx_ca_proposals_created ON ca_proposals(created_at DESC);

-- ============================================
-- CA ENGAGEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hire_request_id UUID REFERENCES ca_hire_requests(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ca_professional_id UUID REFERENCES ca_professionals(id) ON DELETE CASCADE NOT NULL,
  
  -- Engagement Details
  engagement_type VARCHAR(50) NOT NULL CHECK (engagement_type IN ('consultation', 'monthly_retainer', 'project_based', 'gst_filing', 'ongoing')),
  services_included TEXT[] NOT NULL,
  
  -- Terms
  agreed_fee DECIMAL(10, 2) NOT NULL,
  fee_frequency VARCHAR(50) NOT NULL CHECK (fee_frequency IN ('one_time', 'monthly', 'quarterly', 'annually')),
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Contract
  contract_terms TEXT,
  contract_document_url TEXT,
  
  -- Payment Tracking
  total_amount_paid DECIMAL(15, 2) DEFAULT 0,
  last_payment_date DATE,
  next_payment_due DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'terminated')),
  
  -- Satisfaction
  client_rating DECIMAL(3, 2),
  client_review TEXT,
  review_date TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ca_engagements_user ON ca_engagements(user_id);
CREATE INDEX idx_ca_engagements_ca ON ca_engagements(ca_professional_id);
CREATE INDEX idx_ca_engagements_status ON ca_engagements(status);
CREATE INDEX idx_ca_engagements_dates ON ca_engagements(start_date, end_date);

-- ============================================
-- CA REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ca_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_professional_id UUID REFERENCES ca_professionals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  engagement_id UUID REFERENCES ca_engagements(id) ON DELETE SET NULL,
  
  -- Review Details
  rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(255),
  review_text TEXT NOT NULL,
  
  -- Specific Ratings
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  
  -- Response
  ca_response TEXT,
  ca_responded_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ca_reviews_ca ON ca_reviews(ca_professional_id);
CREATE INDEX idx_ca_reviews_user ON ca_reviews(user_id);
CREATE INDEX idx_ca_reviews_rating ON ca_reviews(rating);
CREATE INDEX idx_ca_reviews_created ON ca_reviews(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- CA Professionals
ALTER TABLE ca_professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CA professionals are viewable by everyone" ON ca_professionals FOR SELECT USING (true);
CREATE POLICY "Users can create their CA profile" ON ca_professionals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "CAs can update own profile" ON ca_professionals FOR UPDATE USING (auth.uid() = user_id);

-- CA Hire Requests
ALTER TABLE ca_hire_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own hire requests" ON ca_hire_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "CAs view open requests" ON ca_hire_requests FOR SELECT USING (status = 'open' OR ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid()));
CREATE POLICY "Users create own hire requests" ON ca_hire_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own hire requests" ON ca_hire_requests FOR UPDATE USING (auth.uid() = user_id);

-- CA Proposals
ALTER TABLE ca_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view proposals for their requests" ON ca_proposals FOR SELECT USING (
  hire_request_id IN (SELECT id FROM ca_hire_requests WHERE user_id = auth.uid())
);
CREATE POLICY "CAs view own proposals" ON ca_proposals FOR SELECT USING (
  ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);
CREATE POLICY "CAs create proposals" ON ca_proposals FOR INSERT WITH CHECK (
  ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);
CREATE POLICY "CAs update own proposals" ON ca_proposals FOR UPDATE USING (
  ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);

-- CA Engagements
ALTER TABLE ca_engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own engagements" ON ca_engagements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "CAs view their engagements" ON ca_engagements FOR SELECT USING (
  ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);
CREATE POLICY "Users create engagements" ON ca_engagements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Engagement parties can update" ON ca_engagements FOR UPDATE USING (
  auth.uid() = user_id OR ca_professional_id IN (SELECT id FROM ca_professionals WHERE user_id = auth.uid())
);

-- CA Reviews
ALTER TABLE ca_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON ca_reviews FOR SELECT USING (true);
CREATE POLICY "Users create own reviews" ON ca_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON ca_reviews FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update CA average rating
CREATE OR REPLACE FUNCTION update_ca_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ca_professionals
  SET 
    average_rating = (
      SELECT AVG(rating)
      FROM ca_reviews
      WHERE ca_professional_id = NEW.ca_professional_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM ca_reviews
      WHERE ca_professional_id = NEW.ca_professional_id
    ),
    updated_at = NOW()
  WHERE id = NEW.ca_professional_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ca_rating
AFTER INSERT OR UPDATE OF rating ON ca_reviews
FOR EACH ROW
EXECUTE FUNCTION update_ca_average_rating();

-- Function to update proposal count
CREATE OR REPLACE FUNCTION update_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ca_hire_requests
  SET 
    proposals_received = (
      SELECT COUNT(*)
      FROM ca_proposals
      WHERE hire_request_id = NEW.hire_request_id
    ),
    updated_at = NOW()
  WHERE id = NEW.hire_request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_proposal_count
AFTER INSERT ON ca_proposals
FOR EACH ROW
EXECUTE FUNCTION update_proposal_count();

COMMENT ON TABLE ca_professionals IS 'Chartered Accountant professionals offering services';
COMMENT ON TABLE ca_hire_requests IS 'Client requests to hire CA services';
COMMENT ON TABLE ca_proposals IS 'CA proposals for hire requests';
COMMENT ON TABLE ca_engagements IS 'Active/completed CA-client engagements';
COMMENT ON TABLE ca_reviews IS 'Client reviews and ratings for CAs';


-- ==========================================
-- FILE: supabase-gst-compliance-migration.sql
-- ==========================================

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


-- ==========================================
-- FILE: supabase-gst-advanced-features-migration.sql
-- ==========================================

-- =====================================================
-- GST ADVANCED FEATURES & CA COLLABORATION MIGRATION
-- =====================================================
-- Features:
-- 1. GSTR-1 auto-prep
-- 2. GSTR-3B summary dashboard
-- 3. E-Invoice auto-generation (IRN)
-- 4. E-Way bill creation
-- 5. GST mismatch alerts
-- 6. CA collaboration mode
-- 7. CA dashboard for multiple clients
-- 8. Audit trail with timestamp & IP
-- 9. GST health score
-- =====================================================

-- =====================================================
-- 1. GSTR-1 AUTO-PREP DATA
-- =====================================================

-- GSTR-1 outward supply records
CREATE TABLE IF NOT EXISTS gstr1_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  tax_period VARCHAR(7) NOT NULL,  -- MMYYYY format (e.g., 012026)
  financial_year VARCHAR(10) NOT NULL,
  
  -- B2B (Business to Business) - Table 4A, 4B, 4C, 6B, 6C
  b2b_invoices JSONB DEFAULT '[]'::jsonb,
  b2b_invoice_count INTEGER DEFAULT 0,
  b2b_taxable_value DECIMAL(15, 2) DEFAULT 0,
  b2b_total_tax DECIMAL(15, 2) DEFAULT 0,
  
  -- B2CL (B2C Large - Invoices > 2.5 lakhs) - Table 5A, 5B
  b2cl_invoices JSONB DEFAULT '[]'::jsonb,
  b2cl_invoice_count INTEGER DEFAULT 0,
  b2cl_taxable_value DECIMAL(15, 2) DEFAULT 0,
  b2cl_total_tax DECIMAL(15, 2) DEFAULT 0,
  
  -- B2CS (B2C Small - Consolidated) - Table 7
  b2cs_summary JSONB DEFAULT '[]'::jsonb,
  b2cs_taxable_value DECIMAL(15, 2) DEFAULT 0,
  b2cs_total_tax DECIMAL(15, 2) DEFAULT 0,
  
  -- Exports - Table 6A
  export_invoices JSONB DEFAULT '[]'::jsonb,
  export_count INTEGER DEFAULT 0,
  export_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Credit/Debit Notes - Table 9A, 9B, 9C
  credit_debit_notes JSONB DEFAULT '[]'::jsonb,
  cdn_count INTEGER DEFAULT 0,
  cdn_value DECIMAL(15, 2) DEFAULT 0,
  
  -- HSN Summary - Table 12
  hsn_summary JSONB DEFAULT '[]'::jsonb,
  
  -- Document issued - Table 13
  documents_issued JSONB DEFAULT '[]'::jsonb,
  
  -- Amendments
  amendments JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  preparation_status VARCHAR(20) DEFAULT 'draft',  -- draft, ready, filed, accepted
  auto_generated BOOLEAN DEFAULT true,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Filing details
  filed_at TIMESTAMP WITH TIME ZONE,
  filing_reference_number VARCHAR(50),
  arn VARCHAR(50),  -- Application Reference Number
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tax_period)
);

CREATE INDEX idx_gstr1_user ON gstr1_records(user_id);
CREATE INDEX idx_gstr1_period ON gstr1_records(tax_period);
CREATE INDEX idx_gstr1_status ON gstr1_records(preparation_status);

-- =====================================================
-- 2. GSTR-3B SUMMARY
-- =====================================================

-- GSTR-3B monthly return data
CREATE TABLE IF NOT EXISTS gstr3b_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  tax_period VARCHAR(7) NOT NULL,  -- MMYYYY
  financial_year VARCHAR(10) NOT NULL,
  return_period_from DATE NOT NULL,
  return_period_to DATE NOT NULL,
  
  -- 3.1 - Outward supplies and inward supplies liable to reverse charge
  outward_taxable_supplies DECIMAL(15, 2) DEFAULT 0,
  outward_tax_amount DECIMAL(15, 2) DEFAULT 0,
  inward_reverse_charge_supplies DECIMAL(15, 2) DEFAULT 0,
  inward_reverse_charge_tax DECIMAL(15, 2) DEFAULT 0,
  
  -- 3.2 - Inter-state supplies
  inter_state_supplies JSONB DEFAULT '[]'::jsonb,
  inter_state_total DECIMAL(15, 2) DEFAULT 0,
  
  -- 4 - Eligible ITC (Input Tax Credit)
  itc_available JSONB DEFAULT '{}'::jsonb,
  itc_igst DECIMAL(15, 2) DEFAULT 0,
  itc_cgst DECIMAL(15, 2) DEFAULT 0,
  itc_sgst DECIMAL(15, 2) DEFAULT 0,
  itc_cess DECIMAL(15, 2) DEFAULT 0,
  
  -- 5 - Exempt, Nil rated and Non-GST supplies
  exempt_supplies DECIMAL(15, 2) DEFAULT 0,
  nil_rated_supplies DECIMAL(15, 2) DEFAULT 0,
  non_gst_supplies DECIMAL(15, 2) DEFAULT 0,
  
  -- 6.1 - Payment of tax
  tax_payable_igst DECIMAL(15, 2) DEFAULT 0,
  tax_payable_cgst DECIMAL(15, 2) DEFAULT 0,
  tax_payable_sgst DECIMAL(15, 2) DEFAULT 0,
  tax_payable_cess DECIMAL(15, 2) DEFAULT 0,
  
  total_tax_liability DECIMAL(15, 2) GENERATED ALWAYS AS (
    tax_payable_igst + tax_payable_cgst + tax_payable_sgst + tax_payable_cess
  ) STORED,
  
  -- Interest and Late Fees
  interest_igst DECIMAL(15, 2) DEFAULT 0,
  interest_cgst DECIMAL(15, 2) DEFAULT 0,
  interest_sgst DECIMAL(15, 2) DEFAULT 0,
  late_fee DECIMAL(15, 2) DEFAULT 0,
  
  -- Status
  preparation_status VARCHAR(20) DEFAULT 'draft',
  auto_generated BOOLEAN DEFAULT true,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Filing
  filed_at TIMESTAMP WITH TIME ZONE,
  filing_reference_number VARCHAR(50),
  arn VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, tax_period)
);

CREATE INDEX idx_gstr3b_user ON gstr3b_records(user_id);
CREATE INDEX idx_gstr3b_period ON gstr3b_records(tax_period);
CREATE INDEX idx_gstr3b_status ON gstr3b_records(preparation_status);

-- =====================================================
-- 3. E-INVOICE (IRN) GENERATION
-- =====================================================

-- E-Invoice records
CREATE TABLE IF NOT EXISTS einvoice_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- IRN Details
  irn VARCHAR(64) UNIQUE NOT NULL,  -- Invoice Reference Number (64 chars)
  acknowledgement_number VARCHAR(20),
  acknowledgement_date TIMESTAMP WITH TIME ZONE,
  
  -- Signed Invoice
  signed_invoice TEXT,  -- Base64 encoded signed invoice
  signed_qr_code TEXT,  -- QR Code for signed invoice
  
  -- IRP (Invoice Registration Portal) details
  irp_response JSONB,
  irp_status VARCHAR(20) DEFAULT 'pending',  -- pending, generated, cancelled, failed
  
  -- E-Way Bill integration
  eway_bill_number VARCHAR(12),
  eway_bill_date TIMESTAMP WITH TIME ZONE,
  eway_bill_valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Generation details
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id),
  
  -- Cancellation
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason VARCHAR(255),
  cancellation_remarks TEXT,
  
  -- Errors
  error_code VARCHAR(20),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_einvoice_user ON einvoice_records(user_id);
CREATE INDEX idx_einvoice_invoice ON einvoice_records(invoice_id);
CREATE INDEX idx_einvoice_irn ON einvoice_records(irn);
CREATE INDEX idx_einvoice_status ON einvoice_records(irp_status);
CREATE INDEX idx_einvoice_eway ON einvoice_records(eway_bill_number) WHERE eway_bill_number IS NOT NULL;

-- =====================================================
-- 4. E-WAY BILL
-- =====================================================

-- E-Way Bill records
CREATE TABLE IF NOT EXISTS eway_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  einvoice_id UUID REFERENCES einvoice_records(id) ON DELETE SET NULL,
  
  -- E-Way Bill Number
  eway_bill_number VARCHAR(12) UNIQUE NOT NULL,
  eway_bill_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  approximate_distance_km INTEGER,
  
  -- Document Details
  document_type VARCHAR(20) NOT NULL,  -- inv, chl, bil, etc.
  document_number VARCHAR(50) NOT NULL,
  document_date DATE NOT NULL,
  
  -- Parties
  supplier_gstin VARCHAR(15) NOT NULL,
  recipient_gstin VARCHAR(15),
  recipient_name VARCHAR(255),
  recipient_address TEXT,
  recipient_state_code VARCHAR(2),
  recipient_pincode VARCHAR(6),
  
  -- Transaction Details
  transaction_type VARCHAR(20) NOT NULL,  -- regular, bill_to_ship_to, export, job_work
  supply_type VARCHAR(20) NOT NULL,  -- outward, inward
  sub_supply_type VARCHAR(30),  -- supply, export, job_work, etc.
  
  -- Goods Details
  goods_value DECIMAL(15, 2) NOT NULL,
  hsn_code VARCHAR(8),
  goods_description TEXT,
  quantity DECIMAL(10, 2),
  unit VARCHAR(10),
  cgst_amount DECIMAL(12, 2) DEFAULT 0,
  sgst_amount DECIMAL(12, 2) DEFAULT 0,
  igst_amount DECIMAL(12, 2) DEFAULT 0,
  cess_amount DECIMAL(12, 2) DEFAULT 0,
  total_invoice_value DECIMAL(15, 2) NOT NULL,
  
  -- Transportation
  transporter_id VARCHAR(15),
  transporter_name VARCHAR(255),
  transport_mode VARCHAR(20),  -- road, rail, air, ship
  transport_document_number VARCHAR(50),
  transport_document_date DATE,
  vehicle_number VARCHAR(20),
  vehicle_type VARCHAR(20),  -- regular, over_dimensional
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- active, cancelled, expired, extended
  
  -- Cancellation
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason VARCHAR(255),
  cancellation_remarks TEXT,
  
  -- Extension
  extended_at TIMESTAMP WITH TIME ZONE,
  extension_reason TEXT,
  
  -- Part-B Update (by transporter)
  part_b_updated BOOLEAN DEFAULT false,
  part_b_updated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_eway_user ON eway_bills(user_id);
CREATE INDEX idx_eway_invoice ON eway_bills(invoice_id);
CREATE INDEX idx_eway_number ON eway_bills(eway_bill_number);
CREATE INDEX idx_eway_status ON eway_bills(status);
CREATE INDEX idx_eway_validity ON eway_bills(valid_until);

-- =====================================================
-- 5. GST MISMATCH ALERTS
-- =====================================================

-- GST Mismatch alerts and reconciliation
CREATE TABLE IF NOT EXISTS gst_mismatch_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type VARCHAR(50) NOT NULL,  -- tax_calculation, gstr1_mismatch, gstr3b_mismatch, itc_mismatch, hsn_mismatch
  severity VARCHAR(20) NOT NULL,  -- low, medium, high, critical
  
  -- Affected entity
  entity_type VARCHAR(20),  -- invoice, credit_note, gstr1, gstr3b
  entity_id UUID,
  reference_number VARCHAR(100),
  
  -- Mismatch details
  expected_value DECIMAL(15, 2),
  actual_value DECIMAL(15, 2),
  difference DECIMAL(15, 2),
  
  field_name VARCHAR(100),
  description TEXT NOT NULL,
  
  -- Tax period
  tax_period VARCHAR(7),
  
  -- Resolution
  status VARCHAR(20) DEFAULT 'open',  -- open, investigating, resolved, ignored
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Auto-detection
  detected_by VARCHAR(20) DEFAULT 'system',  -- system, manual, ca
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Action required
  action_required BOOLEAN DEFAULT true,
  recommended_action TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gst_alerts_user ON gst_mismatch_alerts(user_id);
CREATE INDEX idx_gst_alerts_status ON gst_mismatch_alerts(status) WHERE status = 'open';
CREATE INDEX idx_gst_alerts_severity ON gst_mismatch_alerts(severity);
CREATE INDEX idx_gst_alerts_type ON gst_mismatch_alerts(alert_type);
CREATE INDEX idx_gst_alerts_period ON gst_mismatch_alerts(tax_period);

-- =====================================================
-- 6 & 7. CA COLLABORATION MODE
-- =====================================================

-- CA (Chartered Accountant) profiles
CREATE TABLE IF NOT EXISTS ca_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- CA Details
  ca_name VARCHAR(255) NOT NULL,
  ca_firm_name VARCHAR(255),
  membership_number VARCHAR(20),  -- ICAI membership number
  
  -- Contact
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_document_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Specialization
  specializations TEXT[],  -- gst, income_tax, audit, compliance
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_ca_profiles_user ON ca_profiles(user_id);
CREATE INDEX idx_ca_profiles_email ON ca_profiles(email);
CREATE INDEX idx_ca_profiles_verified ON ca_profiles(is_verified);

-- Client-CA relationship
CREATE TABLE IF NOT EXISTS client_ca_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ca_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Access permissions
  access_level VARCHAR(20) NOT NULL,  -- view_only, edit, full
  can_view_invoices BOOLEAN DEFAULT true,
  can_edit_invoices BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT true,
  can_file_returns BOOLEAN DEFAULT false,
  can_view_payments BOOLEAN DEFAULT true,
  can_manage_customers BOOLEAN DEFAULT false,
  
  -- Specific access
  allowed_modules TEXT[],  -- invoices, customers, reports, gst_filing, payments
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- pending, active, revoked, expired
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_token VARCHAR(255),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Validity
  valid_from DATE NOT NULL,
  valid_until DATE,
  
  -- Revocation
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),
  revocation_reason TEXT,
  
  -- Notes
  client_notes TEXT,
  ca_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_user_id, ca_user_id)
);

CREATE INDEX idx_client_ca_client ON client_ca_access(client_user_id);
CREATE INDEX idx_client_ca_ca ON client_ca_access(ca_user_id);
CREATE INDEX idx_client_ca_status ON client_ca_access(status) WHERE status = 'active';

-- CA activity log for clients
CREATE TABLE IF NOT EXISTS ca_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type VARCHAR(50) NOT NULL,  -- viewed_invoice, edited_invoice, filed_return, generated_report, added_note
  entity_type VARCHAR(20),  -- invoice, customer, report, gstr1, gstr3b
  entity_id UUID,
  
  -- Details
  activity_description TEXT NOT NULL,
  changes_made JSONB,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ca_activity_ca ON ca_activity_log(ca_user_id);
CREATE INDEX idx_ca_activity_client ON ca_activity_log(client_user_id);
CREATE INDEX idx_ca_activity_date ON ca_activity_log(performed_at DESC);
CREATE INDEX idx_ca_activity_type ON ca_activity_log(activity_type);

-- =====================================================
-- 8. AUDIT TRAIL WITH TIMESTAMP & IP
-- =====================================================

-- Comprehensive audit trail for all GST-related activities
CREATE TABLE IF NOT EXISTS gst_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Actor (who performed the action)
  performed_by UUID REFERENCES auth.users(id),
  performed_by_type VARCHAR(20),  -- owner, ca, system, admin
  
  -- Action details
  action_type VARCHAR(50) NOT NULL,  -- create, update, delete, file, cancel, view
  entity_type VARCHAR(30) NOT NULL,  -- invoice, gstr1, gstr3b, einvoice, eway_bill
  entity_id UUID,
  
  -- Before/After state
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  -- Detailed description
  action_description TEXT NOT NULL,
  action_category VARCHAR(30),  -- compliance, filing, invoice, reconciliation
  
  -- Security metadata
  ip_address INET NOT NULL,
  user_agent TEXT,
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  
  -- Location
  geolocation JSONB,  -- {country, region, city}
  
  -- Timestamp
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Compliance flags
  is_critical_action BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  approval_status VARCHAR(20),  -- pending, approved, rejected
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Retention
  retention_period_days INTEGER DEFAULT 2555,  -- 7 years (GST requirement)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON gst_audit_trail(user_id);
CREATE INDEX idx_audit_performed_by ON gst_audit_trail(performed_by);
CREATE INDEX idx_audit_entity ON gst_audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_action ON gst_audit_trail(action_type);
CREATE INDEX idx_audit_date ON gst_audit_trail(performed_at DESC);
CREATE INDEX idx_audit_ip ON gst_audit_trail(ip_address);
CREATE INDEX idx_audit_critical ON gst_audit_trail(is_critical_action) WHERE is_critical_action = true;

-- =====================================================
-- 9. GST HEALTH SCORE
-- =====================================================

-- GST Compliance Health Score
CREATE TABLE IF NOT EXISTS gst_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Overall health score (0-100)
  overall_score DECIMAL(5, 2) NOT NULL,
  health_grade VARCHAR(2),  -- A+, A, B, C, D, F
  
  -- Component scores
  filing_compliance_score DECIMAL(5, 2) DEFAULT 0,  -- Timely filing
  tax_calculation_accuracy_score DECIMAL(5, 2) DEFAULT 0,  -- Calculation errors
  reconciliation_score DECIMAL(5, 2) DEFAULT 0,  -- Books vs returns match
  documentation_score DECIMAL(5, 2) DEFAULT 0,  -- Proper invoicing
  itc_claim_score DECIMAL(5, 2) DEFAULT 0,  -- Input tax credit claims
  
  -- Metrics used for calculation
  total_returns_due INTEGER DEFAULT 0,
  returns_filed_on_time INTEGER DEFAULT 0,
  returns_filed_late INTEGER DEFAULT 0,
  returns_pending INTEGER DEFAULT 0,
  
  average_filing_delay_days DECIMAL(8, 2) DEFAULT 0,
  
  tax_calculation_errors INTEGER DEFAULT 0,
  gst_mismatches_found INTEGER DEFAULT 0,
  gst_mismatches_resolved INTEGER DEFAULT 0,
  
  invoices_with_errors INTEGER DEFAULT 0,
  total_invoices_issued INTEGER DEFAULT 0,
  
  -- Penalties and Interest
  total_interest_paid DECIMAL(15, 2) DEFAULT 0,
  total_late_fees_paid DECIMAL(15, 2) DEFAULT 0,
  total_penalties DECIMAL(15, 2) DEFAULT 0,
  
  -- Risk factors
  risk_level VARCHAR(20),  -- low, medium, high, critical
  risk_factors TEXT[],
  improvement_suggestions TEXT[],
  
  -- Comparison
  industry_average_score DECIMAL(5, 2),
  percentile DECIMAL(5, 2),  -- How user compares to others
  
  -- Calculation period
  calculation_period_from DATE NOT NULL,
  calculation_period_to DATE NOT NULL,
  
  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  previous_score DECIMAL(5, 2),
  score_change DECIMAL(5, 2),
  trend VARCHAR(20),  -- improving, declining, stable
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_user ON gst_health_scores(user_id);
CREATE INDEX idx_health_score ON gst_health_scores(overall_score DESC);
CREATE INDEX idx_health_risk ON gst_health_scores(risk_level);
CREATE INDEX idx_health_date ON gst_health_scores(calculated_at DESC);

-- Health score history for trend tracking
CREATE TABLE IF NOT EXISTS gst_health_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  overall_score DECIMAL(5, 2) NOT NULL,
  health_grade VARCHAR(2),
  calculation_period_from DATE NOT NULL,
  calculation_period_to DATE NOT NULL,
  
  score_snapshot JSONB,  -- Complete snapshot of all metrics
  
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_history_user ON gst_health_score_history(user_id);
CREATE INDEX idx_health_history_date ON gst_health_score_history(calculated_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to auto-generate GSTR-1 data
CREATE OR REPLACE FUNCTION generate_gstr1_data(
  p_user_id UUID,
  p_tax_period VARCHAR(7)
)
RETURNS UUID AS $$
DECLARE
  v_gstr1_id UUID;
  v_fy VARCHAR(10);
  v_period_start DATE;
  v_period_end DATE;
  v_b2b_data JSONB;
  v_b2cl_data JSONB;
  v_b2cs_data JSONB;
  v_hsn_data JSONB;
BEGIN
  -- Calculate period dates
  v_period_start := TO_DATE(p_tax_period, 'MMYYYY');
  v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Get financial year
  v_fy := CASE 
    WHEN EXTRACT(MONTH FROM v_period_start) >= 4 
    THEN EXTRACT(YEAR FROM v_period_start)::TEXT || '-' || (EXTRACT(YEAR FROM v_period_start) + 1)::TEXT
    ELSE (EXTRACT(YEAR FROM v_period_start) - 1)::TEXT || '-' || EXTRACT(YEAR FROM v_period_start)::TEXT
  END;
  
  -- Generate B2B data (invoices with GSTIN > 2.5L)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'invoice_number', i.invoice_number,
    'invoice_date', i.invoice_date,
    'customer_gstin', c.gstin,
    'customer_name', c.name,
    'taxable_value', i.subtotal,
    'cgst', i.cgst_amount,
    'sgst', i.sgst_amount,
    'igst', i.igst_amount,
    'total_tax', i.gst_amount,
    'supply_type', i.supply_type,
    'reverse_charge', i.reverse_charge_applicable
  )), '[]'::jsonb)
  INTO v_b2b_data
  FROM invoices i
  JOIN customers c ON i.customer_id = c.id
  WHERE i.user_id = p_user_id
    AND i.invoice_date BETWEEN v_period_start AND v_period_end
    AND c.gstin IS NOT NULL
    AND i.total >= 250000;  -- B2B threshold
  
  -- Generate HSN summary
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'hsn_code', ii.hsn_sac_code,
    'description', ii.description,
    'uqc', ii.unit,
    'total_quantity', SUM(ii.quantity),
    'total_value', SUM(ii.amount),
    'taxable_value', SUM(ii.amount),
    'igst', SUM(CASE WHEN i.supply_type = 'inter-state' THEN ii.gst_amount ELSE 0 END),
    'cgst', SUM(CASE WHEN i.supply_type = 'intra-state' THEN ii.gst_amount / 2 ELSE 0 END),
    'sgst', SUM(CASE WHEN i.supply_type = 'intra-state' THEN ii.gst_amount / 2 ELSE 0 END)
  )), '[]'::jsonb)
  INTO v_hsn_data
  FROM invoice_items ii
  JOIN invoices i ON ii.invoice_id = i.id
  WHERE i.user_id = p_user_id
    AND i.invoice_date BETWEEN v_period_start AND v_period_end
    AND ii.hsn_sac_code IS NOT NULL
  GROUP BY ii.hsn_sac_code, ii.description, ii.unit;
  
  -- Insert or update GSTR-1 record
  INSERT INTO gstr1_records (
    user_id, tax_period, financial_year,
    b2b_invoices, b2b_invoice_count, b2b_taxable_value, b2b_total_tax,
    hsn_summary,
    preparation_status, auto_generated, last_calculated_at
  )
  VALUES (
    p_user_id, p_tax_period, v_fy,
    v_b2b_data,
    jsonb_array_length(v_b2b_data),
    (SELECT COALESCE(SUM((value->>'taxable_value')::DECIMAL), 0) FROM jsonb_array_elements(v_b2b_data)),
    (SELECT COALESCE(SUM((value->>'total_tax')::DECIMAL), 0) FROM jsonb_array_elements(v_b2b_data)),
    v_hsn_data,
    'ready', true, NOW()
  )
  ON CONFLICT (user_id, tax_period)
  DO UPDATE SET
    b2b_invoices = v_b2b_data,
    b2b_invoice_count = jsonb_array_length(v_b2b_data),
    b2b_taxable_value = (SELECT COALESCE(SUM((value->>'taxable_value')::DECIMAL), 0) FROM jsonb_array_elements(v_b2b_data)),
    b2b_total_tax = (SELECT COALESCE(SUM((value->>'total_tax')::DECIMAL), 0) FROM jsonb_array_elements(v_b2b_data)),
    hsn_summary = v_hsn_data,
    last_calculated_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_gstr1_id;
  
  RETURN v_gstr1_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate GST health score
CREATE OR REPLACE FUNCTION calculate_gst_health_score(
  p_user_id UUID,
  p_period_from DATE,
  p_period_to DATE
)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  v_filing_score DECIMAL(5, 2) := 0;
  v_accuracy_score DECIMAL(5, 2) := 0;
  v_documentation_score DECIMAL(5, 2) := 0;
  v_overall_score DECIMAL(5, 2);
  v_health_grade VARCHAR(2);
  v_total_returns INTEGER;
  v_on_time INTEGER;
  v_total_invoices INTEGER;
  v_error_invoices INTEGER;
BEGIN
  -- Calculate filing compliance (40% weight)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE filed_at <= DATE_TRUNC('month', TO_DATE(tax_period, 'MMYYYY')) + INTERVAL '20 days')
  INTO v_total_returns, v_on_time
  FROM gstr3b_records
  WHERE user_id = p_user_id
    AND TO_DATE(tax_period, 'MMYYYY') BETWEEN p_period_from AND p_period_to;
  
  IF v_total_returns > 0 THEN
    v_filing_score := (v_on_time::DECIMAL / v_total_returns) * 100;
  ELSE
    v_filing_score := 50;  -- Default for new users
  END IF;
  
  -- Calculate documentation accuracy (30% weight)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE compliance_warnings IS NOT NULL AND jsonb_array_length(compliance_warnings) > 0)
  INTO v_total_invoices, v_error_invoices
  FROM invoices
  WHERE user_id = p_user_id
    AND invoice_date BETWEEN p_period_from AND p_period_to;
  
  IF v_total_invoices > 0 THEN
    v_documentation_score := ((v_total_invoices - v_error_invoices)::DECIMAL / v_total_invoices) * 100;
  ELSE
    v_documentation_score := 100;
  END IF;
  
  -- Calculate accuracy score (30% weight) - based on mismatch alerts
  SELECT 100 - LEAST(COUNT(*) * 2, 100) INTO v_accuracy_score
  FROM gst_mismatch_alerts
  WHERE user_id = p_user_id
    AND detected_at BETWEEN p_period_from AND p_period_to
    AND status = 'open';
  
  -- Calculate overall score (weighted average)
  v_overall_score := (v_filing_score * 0.4) + (v_documentation_score * 0.3) + (v_accuracy_score * 0.3);
  
  -- Determine grade
  v_health_grade := CASE
    WHEN v_overall_score >= 95 THEN 'A+'
    WHEN v_overall_score >= 85 THEN 'A'
    WHEN v_overall_score >= 75 THEN 'B'
    WHEN v_overall_score >= 65 THEN 'C'
    WHEN v_overall_score >= 50 THEN 'D'
    ELSE 'F'
  END;
  
  -- Insert health score
  INSERT INTO gst_health_scores (
    user_id, overall_score, health_grade,
    filing_compliance_score, tax_calculation_accuracy_score, documentation_score,
    calculation_period_from, calculation_period_to,
    calculated_at
  )
  VALUES (
    p_user_id, v_overall_score, v_health_grade,
    v_filing_score, v_accuracy_score, v_documentation_score,
    p_period_from, p_period_to,
    NOW()
  );
  
  -- Insert history
  INSERT INTO gst_health_score_history (
    user_id, overall_score, health_grade,
    calculation_period_from, calculation_period_to,
    calculated_at
  )
  VALUES (
    p_user_id, v_overall_score, v_health_grade,
    p_period_from, p_period_to,
    NOW()
  );
  
  RETURN v_overall_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create audit trail on invoice changes
CREATE OR REPLACE FUNCTION audit_invoice_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_fields TEXT[];
  v_action_type VARCHAR(50);
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action_type := 'create';
    v_changed_fields := ARRAY['*'];
  ELSIF TG_OP = 'UPDATE' THEN
    v_action_type := 'update';
    v_changed_fields := ARRAY[]::TEXT[];
    
    IF OLD.subtotal != NEW.subtotal THEN v_changed_fields := array_append(v_changed_fields, 'subtotal'); END IF;
    IF OLD.gst_amount != NEW.gst_amount THEN v_changed_fields := array_append(v_changed_fields, 'gst_amount'); END IF;
    IF OLD.total != NEW.total THEN v_changed_fields := array_append(v_changed_fields, 'total'); END IF;
    IF OLD.status != NEW.status THEN v_changed_fields := array_append(v_changed_fields, 'status'); END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action_type := 'delete';
    v_changed_fields := ARRAY['*'];
  END IF;
  
  -- Insert audit record
  INSERT INTO gst_audit_trail (
    user_id, performed_by, performed_by_type,
    action_type, entity_type, entity_id,
    old_values, new_values, changed_fields,
    action_description, action_category,
    ip_address, is_critical_action
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.user_id, OLD.user_id),
    'owner',
    v_action_type,
    'invoice',
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW),
    v_changed_fields,
    v_action_type || ' invoice ' || COALESCE(NEW.invoice_number, OLD.invoice_number),
    'invoice',
    '0.0.0.0',  -- Will be updated by application
    (v_action_type = 'delete' OR array_length(v_changed_fields, 1) > 3)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_invoices ON invoices;
CREATE TRIGGER trigger_audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW
EXECUTE FUNCTION audit_invoice_changes();

-- =====================================================
-- VIEWS
-- =====================================================

-- CA Dashboard view for multiple clients
CREATE OR REPLACE VIEW ca_clients_dashboard AS
SELECT 
  cca.ca_user_id,
  cca.client_user_id,
  u.email as client_email,
  
  -- Client GST health
  ghs.overall_score as health_score,
  ghs.health_grade,
  ghs.risk_level,
  
  -- Pending returns
  (SELECT COUNT(*) FROM gstr1_records 
   WHERE user_id = cca.client_user_id 
   AND preparation_status = 'draft') as pending_gstr1,
  (SELECT COUNT(*) FROM gstr3b_records 
   WHERE user_id = cca.client_user_id 
   AND preparation_status = 'draft') as pending_gstr3b,
  
  -- Open alerts
  (SELECT COUNT(*) FROM gst_mismatch_alerts 
   WHERE user_id = cca.client_user_id 
   AND status = 'open') as open_alerts,
  
  -- Access details
  cca.access_level,
  cca.status as access_status,
  cca.valid_until
  
FROM client_ca_access cca
JOIN auth.users u ON cca.client_user_id = u.id
LEFT JOIN gst_health_scores ghs ON cca.client_user_id = ghs.user_id
WHERE cca.status = 'active';

-- GST Compliance summary view
CREATE OR REPLACE VIEW gst_compliance_summary AS
SELECT 
  i.user_id,
  i.financial_year,
  
  -- Invoice counts
  COUNT(*) as total_invoices,
  COUNT(*) FILTER (WHERE i.supply_type = 'intra-state') as intra_state_count,
  COUNT(*) FILTER (WHERE i.supply_type = 'inter-state') as inter_state_count,
  
  -- Tax totals
  SUM(i.subtotal) as total_taxable_value,
  SUM(i.cgst_amount) as total_cgst,
  SUM(i.sgst_amount) as total_sgst,
  SUM(i.igst_amount) as total_igst,
  SUM(i.gst_amount) as total_gst,
  
  -- E-Invoice stats
  COUNT(e.id) FILTER (WHERE e.irp_status = 'generated') as einvoices_generated,
  COUNT(e.id) FILTER (WHERE e.irp_status = 'failed') as einvoices_failed,
  
  -- E-Way Bill stats
  COUNT(ew.id) FILTER (WHERE ew.status = 'active') as active_eway_bills,
  
  -- Health
  AVG(ghs.overall_score) as avg_health_score
  
FROM invoices i
LEFT JOIN einvoice_records e ON i.id = e.invoice_id
LEFT JOIN eway_bills ew ON i.id = ew.invoice_id
LEFT JOIN gst_health_scores ghs ON i.user_id = ghs.user_id
GROUP BY i.user_id, i.financial_year;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE gstr1_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gstr3b_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE einvoice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE eway_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_mismatch_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_ca_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_health_score_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their GSTR-1 data" ON gstr1_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their GSTR-1 data" ON gstr1_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their GSTR-3B data" ON gstr3b_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their GSTR-3B data" ON gstr3b_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their E-Invoices" ON einvoice_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their E-Invoices" ON einvoice_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their E-Way Bills" ON eway_bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their E-Way Bills" ON eway_bills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their GST alerts" ON gst_mismatch_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their GST alerts" ON gst_mismatch_alerts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their CA profile" ON ca_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their CA profile" ON ca_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view CA access to their data" ON client_ca_access FOR SELECT USING (auth.uid() = client_user_id OR auth.uid() = ca_user_id);
CREATE POLICY "Clients can manage CA access" ON client_ca_access FOR ALL USING (auth.uid() = client_user_id);

CREATE POLICY "CAs can view activity logs" ON ca_activity_log FOR SELECT USING (auth.uid() = ca_user_id OR auth.uid() = client_user_id);
CREATE POLICY "System can insert activity logs" ON ca_activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their audit trail" ON gst_audit_trail FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit logs" ON gst_audit_trail FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their health scores" ON gst_health_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage health scores" ON gst_health_scores FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view health score history" ON gst_health_score_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert health history" ON gst_health_score_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE gstr1_records IS 'GSTR-1 monthly/quarterly return data auto-generated from invoices';
COMMENT ON TABLE gstr3b_records IS 'GSTR-3B monthly return summary with tax liability and ITC';
COMMENT ON TABLE einvoice_records IS 'E-Invoice (IRN) generation records with IRP integration';
COMMENT ON TABLE eway_bills IS 'E-Way Bill records for goods transportation';
COMMENT ON TABLE gst_mismatch_alerts IS 'Automated GST mismatch detection and reconciliation alerts';
COMMENT ON TABLE ca_profiles IS 'Chartered Accountant profiles for collaboration';
COMMENT ON TABLE client_ca_access IS 'Client-CA access permissions and relationships';
COMMENT ON TABLE ca_activity_log IS 'Activity log for CA actions on client data';
COMMENT ON TABLE gst_audit_trail IS 'Comprehensive audit trail for all GST activities with IP tracking';
COMMENT ON TABLE gst_health_scores IS 'GST compliance health scores with component metrics';

-- =====================================================
-- END OF MIGRATION
-- =====================================================


-- ==========================================
-- FILE: supabase-inventory-management-migration.sql
-- ==========================================

-- Inventory and Stock Management Module
-- Run after supabase-schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Inventory items master table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(120),
    description TEXT,
    unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
    current_stock DECIMAL(14, 2) NOT NULL DEFAULT 0,
    reorder_level DECIMAL(14, 2) NOT NULL DEFAULT 0,
    purchase_price DECIMAL(14, 2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(14, 2) NOT NULL DEFAULT 0,
    location VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT inventory_items_stock_non_negative CHECK (current_stock >= 0),
    CONSTRAINT inventory_items_reorder_non_negative CHECK (reorder_level >= 0),
    CONSTRAINT inventory_items_price_non_negative CHECK (purchase_price >= 0 AND selling_price >= 0)
);

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS sku VARCHAR(120);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS unit VARCHAR(30) NOT NULL DEFAULT 'pcs';
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS current_stock DECIMAL(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reorder_level DECIMAL(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS selling_price DECIMAL(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE inventory_items
SET
    unit = COALESCE(unit, 'pcs'),
    current_stock = COALESCE(current_stock, 0),
    reorder_level = COALESCE(reorder_level, 0),
    purchase_price = COALESCE(purchase_price, 0),
    selling_price = COALESCE(selling_price, 0),
    is_active = COALESCE(is_active, TRUE),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE
    unit IS NULL
    OR current_stock IS NULL
    OR reorder_level IS NULL
    OR purchase_price IS NULL
    OR selling_price IS NULL
    OR is_active IS NULL
    OR created_at IS NULL
    OR updated_at IS NULL;

-- Stock movement transactions ledger
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out')),
    quantity DECIMAL(14, 2) NOT NULL CHECK (quantity > 0),
    previous_stock DECIMAL(14, 2) NOT NULL,
    new_stock DECIMAL(14, 2) NOT NULL,
    unit_cost DECIMAL(14, 2),
    notes TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(14, 2);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE inventory_transactions
SET
    created_at = COALESCE(created_at, NOW())
WHERE created_at IS NULL;

ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(user_id, sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock ON inventory_items(user_id, current_stock, reorder_level);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_user_id_created_at ON inventory_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_items_inventory_item_id ON invoice_items(inventory_item_id);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Inventory items policies
DROP POLICY IF EXISTS "Users can view their inventory items" ON inventory_items;
CREATE POLICY "Users can view their inventory items"
    ON inventory_items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their inventory items" ON inventory_items;
CREATE POLICY "Users can create their inventory items"
    ON inventory_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their inventory items" ON inventory_items;
CREATE POLICY "Users can update their inventory items"
    ON inventory_items FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their inventory items" ON inventory_items;
CREATE POLICY "Users can delete their inventory items"
    ON inventory_items FOR DELETE
    USING (auth.uid() = user_id);

-- Inventory transactions policies
DROP POLICY IF EXISTS "Users can view their inventory transactions" ON inventory_transactions;
CREATE POLICY "Users can view their inventory transactions"
    ON inventory_transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their inventory transactions" ON inventory_transactions;
CREATE POLICY "Users can create their inventory transactions"
    ON inventory_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- FILE: supabase-enterprise-features-migration.sql
-- ==========================================

-- =====================================================
-- ENTERPRISE FEATURES MIGRATION
-- Comprehensive business management features
-- =====================================================

-- =====================================================
-- INVENTORY+ MODULE
-- =====================================================

-- Inventory Items (Enhanced with batch & expiry tracking)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  item_code VARCHAR(100) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('product', 'service', 'raw_material')),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  
  -- Product Details
  unit_of_measurement VARCHAR(50) NOT NULL, -- pcs, kg, liters, hours, etc.
  hsn_sac_code VARCHAR(50),
  description TEXT,
  
  -- Service Inventory Fields
  service_type VARCHAR(50), -- hours, retainers, subscriptions
  billing_cycle VARCHAR(50), -- hourly, monthly, quarterly, annual
  default_rate DECIMAL(15, 2),
  
  -- Pricing
  purchase_price DECIMAL(15, 2),
  selling_price DECIMAL(15, 2),
  minimum_selling_price DECIMAL(15, 2),
  
  -- Stock Management
  current_stock DECIMAL(15, 3) DEFAULT 0,
  reorder_level DECIMAL(15, 3),
  reorder_quantity DECIMAL(15, 3),
  minimum_stock_level DECIMAL(15, 3),
  maximum_stock_level DECIMAL(15, 3),
  
  -- Warehouse Location
  warehouse_location VARCHAR(255),
  bin_location VARCHAR(100),
  
  -- Tracking Settings
  enable_batch_tracking BOOLEAN DEFAULT false,
  enable_expiry_tracking BOOLEAN DEFAULT false,
  enable_serial_tracking BOOLEAN DEFAULT false,
  
  -- AI Alert Settings
  enable_low_stock_alerts BOOLEAN DEFAULT true,
  alert_threshold_percentage INTEGER DEFAULT 20, -- Alert when stock < 20% of max
  alert_recipients JSONB, -- Array of email/phone numbers
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, item_code)
);

-- Inventory Batches
CREATE TABLE IF NOT EXISTS inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Batch Info
  batch_number VARCHAR(100) NOT NULL,
  manufacturing_date DATE,
  expiry_date DATE,
  
  -- Stock
  opening_stock DECIMAL(15, 3) NOT NULL,
  current_stock DECIMAL(15, 3) NOT NULL,
  reserved_stock DECIMAL(15, 3) DEFAULT 0,
  available_stock DECIMAL(15, 3) GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  
  -- Costing
  purchase_price_per_unit DECIMAL(15, 2),
  total_purchase_value DECIMAL(15, 2),
  
  -- Location
  warehouse_location VARCHAR(255),
  
  -- Status
  batch_status VARCHAR(50) DEFAULT 'active' CHECK (batch_status IN ('active', 'expired', 'recalled', 'depleted')),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, inventory_item_id, batch_number)
);

-- Job-Based Inventory Allocation
CREATE TABLE IF NOT EXISTS job_inventory_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Job Info
  job_code VARCHAR(100) NOT NULL,
  job_name VARCHAR(255) NOT NULL,
  job_type VARCHAR(100), -- project, order, work_order
  customer_id UUID REFERENCES customers(id),
  
  -- Allocation
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  batch_id UUID REFERENCES inventory_batches(id),
  
  allocated_quantity DECIMAL(15, 3) NOT NULL,
  consumed_quantity DECIMAL(15, 3) DEFAULT 0,
  returned_quantity DECIMAL(15, 3) DEFAULT 0,
  
  -- Dates
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_consumption_date DATE,
  actual_consumption_date DATE,
  
  -- Costing
  unit_cost DECIMAL(15, 2),
  total_cost DECIMAL(15, 2) GENERATED ALWAYS AS (consumed_quantity * unit_cost) STORED,
  
  -- Status
  allocation_status VARCHAR(50) DEFAULT 'allocated' CHECK (allocation_status IN ('allocated', 'partially_consumed', 'fully_consumed', 'returned', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  -- Audit
  allocated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Low Stock Alerts
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Alert Info
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_stock', 'expiry_warning', 'expired', 'reorder_point', 'overstock', 'negative_stock')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Details
  current_stock DECIMAL(15, 3),
  threshold_stock DECIMAL(15, 3),
  batch_id UUID REFERENCES inventory_batches(id),
  expiry_date DATE,
  days_to_expiry INTEGER,
  
  -- AI Insights
  ai_recommendation TEXT,
  recommended_reorder_quantity DECIMAL(15, 3),
  predicted_stockout_date DATE,
  
  -- Status
  alert_status VARCHAR(50) DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  
  -- Actions Taken
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXPENSE MANAGEMENT MODULE
-- =====================================================

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  category_name VARCHAR(100) NOT NULL,
  parent_category_id UUID REFERENCES expense_categories(id),
  category_type VARCHAR(50) CHECK (category_type IN ('operational', 'capital', 'staff', 'travel', 'other')),
  
  -- Accounting
  expense_account_code VARCHAR(50),
  is_tax_deductible BOOLEAN DEFAULT true,
  
  -- Approval Settings
  requires_approval BOOLEAN DEFAULT false,
  approval_limit DECIMAL(15, 2),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, category_name)
);

-- Assets (for depreciation tracking) - Created before expenses table since expenses references it
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Asset Info
  asset_code VARCHAR(100) NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_category VARCHAR(100) NOT NULL, -- machinery, vehicle, computer, furniture, etc.
  
  -- Purchase Details
  purchase_date DATE NOT NULL,
  purchase_value DECIMAL(15, 2) NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  invoice_number VARCHAR(100),
  
  -- Depreciation
  depreciation_method VARCHAR(50) NOT NULL CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'units_of_production')),
  useful_life_years INTEGER NOT NULL,
  useful_life_months INTEGER GENERATED ALWAYS AS (useful_life_years * 12) STORED,
  salvage_value DECIMAL(15, 2) DEFAULT 0,
  
  depreciation_rate DECIMAL(5, 2), -- For declining balance
  annual_depreciation DECIMAL(15, 2),
  accumulated_depreciation DECIMAL(15, 2) DEFAULT 0,
  current_book_value DECIMAL(15, 2),
  
  -- Location
  location VARCHAR(255),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Status
  asset_status VARCHAR(50) DEFAULT 'active' CHECK (asset_status IN ('active', 'under_maintenance', 'disposed', 'sold', 'written_off')),
  
  -- Disposal
  disposal_date DATE,
  disposal_value DECIMAL(15, 2),
  disposal_method VARCHAR(50),
  
  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, asset_code)
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  expense_number VARCHAR(100) NOT NULL,
  expense_date DATE NOT NULL,
  
  -- Category & Type
  expense_category_id UUID NOT NULL REFERENCES expense_categories(id),
  expense_type VARCHAR(50) NOT NULL CHECK (expense_type IN ('cash', 'card', 'bank_transfer', 'cheque', 'mileage', 'asset_purchase')),
  
  -- Vendor/Payee
  vendor_id UUID REFERENCES vendors(id),
  payee_name VARCHAR(255),
  
  -- Amount
  amount DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  
  -- Payment Details
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  payment_date DATE,
  
  -- OCR Scanned Data
  scanned_from_image BOOLEAN DEFAULT false,
  ocr_confidence_score DECIMAL(5, 2), -- 0-100
  original_image_url TEXT,
  extracted_data JSONB,
  
  -- Mileage (if expense_type = 'mileage')
  mileage_km DECIMAL(10, 2),
  mileage_rate_per_km DECIMAL(10, 2),
  start_location VARCHAR(255),
  end_location VARCHAR(255),
  vehicle_number VARCHAR(50),
  
  -- Asset (if expense_type = 'asset_purchase')
  asset_id UUID REFERENCES assets(id),
  is_capitalizable BOOLEAN DEFAULT false,
  depreciation_period_months INTEGER,
  
  -- Allocation
  allocated_to_job_id UUID,
  allocated_to_project VARCHAR(100),
  cost_center VARCHAR(100),
  
  -- Approval Workflow
  requires_approval BOOLEAN DEFAULT false,
  approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Reimbursement
  is_reimbursable BOOLEAN DEFAULT false,
  reimbursement_status VARCHAR(50) CHECK (reimbursement_status IN ('pending', 'approved', 'paid', 'rejected')),
  reimbursed_amount DECIMAL(15, 2),
  reimbursed_on DATE,
  
  -- Attachments
  receipt_urls JSONB, -- Array of receipt images/PDFs
  
  -- Notes
  description TEXT,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, expense_number)
);

-- Asset Depreciation Log
CREATE TABLE IF NOT EXISTS asset_depreciation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  depreciation_period VARCHAR(20) NOT NULL, -- YYYY-MM format
  financial_year VARCHAR(20) NOT NULL,
  
  -- Values
  opening_book_value DECIMAL(15, 2) NOT NULL,
  depreciation_amount DECIMAL(15, 2) NOT NULL,
  accumulated_depreciation DECIMAL(15, 2) NOT NULL,
  closing_book_value DECIMAL(15, 2) NOT NULL,
  
  -- Calculation
  calculation_method VARCHAR(50),
  calculation_details JSONB,
  
  -- Status
  is_posted BOOLEAN DEFAULT false,
  posted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADVANCED DASHBOARDS & REPORTING MODULE
-- =====================================================

-- MIS Reports Configuration
CREATE TABLE IF NOT EXISTS mis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Report Info
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('cash_flow', 'profitability', 'gst_analysis', 'collection_efficiency', 'expense_analysis', 'inventory_analysis', 'custom')),
  
  -- Configuration
  report_config JSONB NOT NULL, -- Columns, filters, groupings
  
  -- Filters
  default_date_range VARCHAR(50), -- this_month, this_quarter, this_year, custom
  default_grouping VARCHAR(50), -- daily, weekly, monthly, quarterly, yearly
  
  -- Dimensions
  group_by_dimensions JSONB, -- city, state, gst_type, customer, product, etc.
  
  -- Scheduling
  is_scheduled BOOLEAN DEFAULT false,
  schedule_frequency VARCHAR(50), -- daily, weekly, monthly
  schedule_time TIME,
  schedule_recipients JSONB, -- Array of emails
  
  -- Export Format
  default_export_format VARCHAR(20) DEFAULT 'excel' CHECK (default_export_format IN ('excel', 'pdf', 'csv')),
  
  -- AI Insights
  enable_ai_insights BOOLEAN DEFAULT true,
  
  -- Access
  is_public BOOLEAN DEFAULT false,
  shared_with JSONB, -- Array of user IDs
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Metrics (Real-time tracking)
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  metric_date DATE NOT NULL,
  metric_period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
  
  -- Cash Flow Metrics
  opening_cash_balance DECIMAL(15, 2),
  cash_inflow DECIMAL(15, 2),
  cash_outflow DECIMAL(15, 2),
  closing_cash_balance DECIMAL(15, 2),
  
  -- Receivables
  total_outstanding_receivables DECIMAL(15, 2),
  overdue_receivables DECIMAL(15, 2),
  current_receivables DECIMAL(15, 2),
  average_collection_days INTEGER,
  
  -- GST Metrics
  total_gst_collected DECIMAL(15, 2),
  total_gst_paid DECIMAL(15, 2),
  gst_liability DECIMAL(15, 2),
  itc_available DECIMAL(15, 2),
  net_gst_payable DECIMAL(15, 2),
  
  -- Collection Efficiency
  invoices_raised_value DECIMAL(15, 2),
  payments_received_value DECIMAL(15, 2),
  collection_efficiency_percentage DECIMAL(5, 2), -- (received/raised) * 100
  
  -- Profitability
  total_revenue DECIMAL(15, 2),
  total_expenses DECIMAL(15, 2),
  gross_profit DECIMAL(15, 2),
  gross_profit_margin DECIMAL(5, 2),
  net_profit DECIMAL(15, 2),
  net_profit_margin DECIMAL(5, 2),
  
  -- Business Health Index (0-100)
  business_health_score DECIMAL(5, 2),
  liquidity_score DECIMAL(5, 2),
  profitability_score DECIMAL(5, 2),
  efficiency_score DECIMAL(5, 2),
  growth_score DECIMAL(5, 2),
  
  -- AI Insights
  ai_insights JSONB,
  risk_factors JSONB,
  opportunities JSONB,
  recommendations JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, metric_date, metric_period)
);

-- =====================================================
-- ACCESS CONTROL & SECURITY MODULE
-- =====================================================

-- Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role_name VARCHAR(100) NOT NULL,
  role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('super_admin', 'admin', 'accounts', 'sales', 'inventory', 'viewer', 'custom')),
  
  -- Permissions
  permissions JSONB NOT NULL, -- Detailed permissions object
  
  -- Modules Access
  can_access_invoices BOOLEAN DEFAULT false,
  can_access_expenses BOOLEAN DEFAULT false,
  can_access_inventory BOOLEAN DEFAULT false,
  can_access_reports BOOLEAN DEFAULT false,
  can_access_settings BOOLEAN DEFAULT false,
  can_access_users BOOLEAN DEFAULT false,
  
  -- Action Permissions
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  
  -- Branch Access
  branch_ids JSONB, -- Array of branch IDs
  all_branches BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  branch_code VARCHAR(50) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  
  -- GST
  gstin VARCHAR(15),
  
  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Manager
  branch_manager_id UUID REFERENCES auth.users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, branch_code)
);

-- IP Access Restrictions
CREATE TABLE IF NOT EXISTS ip_access_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('allow', 'deny')),
  
  -- IP Configuration
  ip_address VARCHAR(45), -- Single IP
  ip_range_start VARCHAR(45), -- IP range start
  ip_range_end VARCHAR(45), -- IP range end
  cidr_notation VARCHAR(50), -- CIDR notation
  
  -- Scope
  applies_to VARCHAR(50) DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_users', 'specific_roles')),
  user_ids JSONB, -- Array of user IDs
  role_ids JSONB, -- Array of role IDs
  
  -- Time-based
  active_from TIME,
  active_to TIME,
  active_days JSONB, -- Array of day numbers (0-6)
  
  priority INTEGER DEFAULT 100, -- Lower number = higher priority
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs (Enhanced)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Info
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name VARCHAR(255),
  performed_by_email VARCHAR(255),
  performed_by_role VARCHAR(100),
  
  -- Action
  action_type VARCHAR(100) NOT NULL, -- create, update, delete, view, export, approve, reject
  entity_type VARCHAR(100) NOT NULL, -- invoice, expense, customer, etc.
  entity_id UUID,
  entity_name VARCHAR(255),
  
  -- Details
  action_description TEXT,
  old_values JSONB,
  new_values JSONB,
  changes_summary TEXT,
  
  -- Context
  module_name VARCHAR(100),
  feature_name VARCHAR(100),
  
  -- Request Info
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_method VARCHAR(10),
  request_url TEXT,
  
  -- Location
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Status
  action_status VARCHAR(50) DEFAULT 'success' CHECK (action_status IN ('success', 'failed', 'partial')),
  error_message TEXT,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_performed_by ON activity_logs(user_id, performed_by);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Maker-Checker Approvals
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  workflow_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL, -- invoice, expense, payment, etc.
  
  -- Trigger Conditions
  trigger_conditions JSONB NOT NULL, -- Amount threshold, specific actions, etc.
  
  -- Approval Levels
  approval_levels JSONB NOT NULL, -- Array of approval levels with approvers
  require_all_approvers BOOLEAN DEFAULT false,
  require_sequential_approval BOOLEAN DEFAULT true,
  
  -- Escalation
  enable_escalation BOOLEAN DEFAULT false,
  escalation_hours INTEGER DEFAULT 24,
  escalate_to JSONB, -- Array of user IDs
  
  -- Notifications
  notify_maker BOOLEAN DEFAULT true,
  notify_checker BOOLEAN DEFAULT true,
  notification_emails JSONB,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Requests
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id),
  
  -- Request Info
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  entity_data JSONB,
  
  -- Maker
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  request_reason TEXT,
  
  -- Current Status
  approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled', 'escalated')),
  current_level INTEGER DEFAULT 1,
  
  -- Checker Actions
  approval_history JSONB, -- Array of approvals/rejections
  
  -- Final Action
  final_approver UUID REFERENCES auth.users(id),
  final_action_at TIMESTAMPTZ,
  final_comments TEXT,
  
  -- Escalation
  is_escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMPTZ,
  escalated_to UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CLIENT PORTAL MODULE
-- =====================================================

-- Client Portal Users
CREATE TABLE IF NOT EXISTS client_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Business owner
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Login Credentials
  client_email VARCHAR(255) NOT NULL UNIQUE,
  client_phone VARCHAR(50),
  password_hash TEXT, -- If using separate auth
  
  -- Access
  portal_access_enabled BOOLEAN DEFAULT true,
  first_login_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  -- Permissions
  can_view_invoices BOOLEAN DEFAULT true,
  can_approve_invoices BOOLEAN DEFAULT false,
  can_raise_disputes BOOLEAN DEFAULT true,
  can_make_payments BOOLEAN DEFAULT true,
  can_download_statements BOOLEAN DEFAULT true,
  can_view_payment_history BOOLEAN DEFAULT true,
  can_chat_support BOOLEAN DEFAULT true,
  
  -- Settings
  receive_email_notifications BOOLEAN DEFAULT true,
  receive_sms_notifications BOOLEAN DEFAULT false,
  receive_whatsapp_notifications BOOLEAN DEFAULT true,
  
  -- Status
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'suspended')),
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Approvals (Client Side)
CREATE TABLE IF NOT EXISTS client_invoice_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  client_portal_user_id UUID NOT NULL REFERENCES client_portal_users(id),
  
  -- Approval
  approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'disputed')),
  
  approved_by_name VARCHAR(255),
  approved_at TIMESTAMPTZ,
  approval_comments TEXT,
  
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Dispute
  is_disputed BOOLEAN DEFAULT false,
  disputed_at TIMESTAMPTZ,
  dispute_details TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(invoice_id, client_portal_user_id)
);

-- Disputes
CREATE TABLE IF NOT EXISTS invoice_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  client_portal_user_id UUID NOT NULL REFERENCES client_portal_users(id),
  
  -- Dispute Info
  dispute_type VARCHAR(100) NOT NULL CHECK (dispute_type IN ('amount_mismatch', 'quality_issue', 'delivery_issue', 'pricing_error', 'duplicate_invoice', 'service_not_rendered', 'other')),
  dispute_description TEXT NOT NULL,
  
  disputed_amount DECIMAL(15, 2),
  
  -- Attachments
  supporting_documents JSONB, -- Array of URLs
  
  -- Status
  dispute_status VARCHAR(50) DEFAULT 'open' CHECK (dispute_status IN ('open', 'under_review', 'resolved', 'closed', 'escalated')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Resolution
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_type VARCHAR(50), -- full_credit, partial_credit, no_action, revised_invoice
  
  credit_note_issued BOOLEAN DEFAULT false,
  credit_note_id UUID,
  credit_amount DECIMAL(15, 2),
  
  -- Communication
  internal_notes TEXT,
  client_communication JSONB, -- Thread of messages
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Support Chat
CREATE TABLE IF NOT EXISTS client_support_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_portal_user_id UUID NOT NULL REFERENCES client_portal_users(id),
  
  -- Chat Info
  ticket_number VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- billing, technical, general, complaint
  
  -- Status
  chat_status VARCHAR(50) DEFAULT 'open' CHECK (chat_status IN ('open', 'in_progress', 'waiting_on_client', 'waiting_on_business', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Messages
  messages JSONB, -- Array of chat messages
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_summary TEXT,
  client_satisfaction_rating INTEGER, -- 1-5
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, ticket_number)
);

-- =====================================================
-- WHATSAPP AUTOMATION MODULE
-- =====================================================

-- WhatsApp Templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template Info
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL CHECK (template_type IN ('payment_reminder', 'payment_received', 'invoice_sent', 'order_confirmation', 'delivery_update', 'custom')),
  
  -- Content
  template_message TEXT NOT NULL,
  variables JSONB, -- Array of variables like {{customer_name}}, {{amount}}, etc.
  
  -- Media
  include_media BOOLEAN DEFAULT false,
  media_type VARCHAR(50) CHECK (media_type IN ('image', 'pdf', 'video')),
  media_url TEXT,
  
  -- Branding
  include_business_logo BOOLEAN DEFAULT true,
  include_business_name BOOLEAN DEFAULT true,
  include_contact_details BOOLEAN DEFAULT true,
  
  -- Trigger Settings
  trigger_type VARCHAR(50), -- manual, automatic, scheduled
  trigger_conditions JSONB,
  
  -- WhatsApp Business API
  wa_template_id VARCHAR(255), -- WhatsApp approved template ID
  wa_template_status VARCHAR(50), -- approved, pending, rejected
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Messages Log
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recipient
  customer_id UUID REFERENCES customers(id),
  recipient_phone VARCHAR(50) NOT NULL,
  recipient_name VARCHAR(255),
  
  -- Message
  template_id UUID REFERENCES whatsapp_templates(id),
  message_type VARCHAR(100) NOT NULL,
  message_content TEXT NOT NULL,
  
  -- Media
  media_urls JSONB,
  
  -- Related Entity
  entity_type VARCHAR(100), -- invoice, payment, order
  entity_id UUID,
  
  -- Delivery Status
  message_status VARCHAR(50) DEFAULT 'pending' CHECK (message_status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- WhatsApp API
  wa_message_id VARCHAR(255),
  wa_conversation_id VARCHAR(255),
  
  -- Cost
  message_cost DECIMAL(10, 4),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Nudges Configuration
CREATE TABLE IF NOT EXISTS payment_nudge_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Nudge Settings
  enable_payment_nudges BOOLEAN DEFAULT true,
  
  -- Before Due Date Nudges
  nudge_before_days JSONB DEFAULT '[7, 3, 1]'::jsonb, -- Days before due date
  
  -- After Due Date Nudges
  nudge_after_days JSONB DEFAULT '[1, 3, 7, 15, 30]'::jsonb, -- Days after due date
  
  -- Escalation
  enable_escalation BOOLEAN DEFAULT false,
  escalation_after_days INTEGER DEFAULT 30,
  escalation_message_template TEXT,
  
  -- Timing
  nudge_time TIME DEFAULT '10:00:00', -- Send at 10 AM
  
  -- Frequency Limits
  max_nudges_per_invoice INTEGER DEFAULT 10,
  min_hours_between_nudges INTEGER DEFAULT 48,
  
  -- WhatsApp Settings
  send_via_whatsapp BOOLEAN DEFAULT true,
  send_via_sms BOOLEAN DEFAULT false,
  send_via_email BOOLEAN DEFAULT true,
  
  -- Personalization
  include_payment_link BOOLEAN DEFAULT true,
  include_invoice_pdf BOOLEAN DEFAULT false,
  use_friendly_tone BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Calculate Business Health Score
CREATE OR REPLACE FUNCTION calculate_business_health_score(
  p_user_id UUID,
  p_metric_date DATE
) RETURNS DECIMAL(5, 2) AS $$
DECLARE
  v_liquidity_score DECIMAL(5, 2) := 0;
  v_profitability_score DECIMAL(5, 2) := 0;
  v_efficiency_score DECIMAL(5, 2) := 0;
  v_growth_score DECIMAL(5, 2) := 0;
  v_overall_score DECIMAL(5, 2) := 0;
BEGIN
  -- Liquidity Score (30%) - Cash position, working capital
  -- Simplified calculation
  v_liquidity_score := 75.0; -- Placeholder
  
  -- Profitability Score (30%) - Margins, ROI
  v_profitability_score := 70.0; -- Placeholder
  
  -- Efficiency Score (25%) - Collection days, inventory turnover
  v_efficiency_score := 80.0; -- Placeholder
  
  -- Growth Score (15%) - Revenue growth, customer acquisition
  v_growth_score := 65.0; -- Placeholder
  
  -- Weighted Average
  v_overall_score := (v_liquidity_score * 0.30) + 
                     (v_profitability_score * 0.30) + 
                     (v_efficiency_score * 0.25) + 
                     (v_growth_score * 0.15);
  
  RETURN v_overall_score;
END;
$$ LANGUAGE plpgsql;

-- Generate Daily Business Metrics
CREATE OR REPLACE FUNCTION generate_daily_business_metrics(
  p_user_id UUID,
  p_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO business_metrics (
    user_id,
    metric_date,
    metric_period,
    business_health_score
  ) VALUES (
    p_user_id,
    p_date,
    'daily',
    calculate_business_health_score(p_user_id, p_date)
  )
  ON CONFLICT (user_id, metric_date, metric_period) 
  DO UPDATE SET
    business_health_score = EXCLUDED.business_health_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Auto-generate Low Stock Alerts
CREATE OR REPLACE FUNCTION check_and_create_inventory_alerts() RETURNS TRIGGER AS $$
BEGIN
  -- Low Stock Alert
  IF NEW.current_stock <= NEW.reorder_level AND NEW.enable_low_stock_alerts THEN
    INSERT INTO inventory_alerts (
      user_id,
      inventory_item_id,
      alert_type,
      severity,
      current_stock,
      threshold_stock,
      alert_status
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'low_stock',
      CASE 
        WHEN NEW.current_stock <= (NEW.reorder_level * 0.5) THEN 'critical'
        WHEN NEW.current_stock <= (NEW.reorder_level * 0.75) THEN 'high'
        ELSE 'medium'
      END,
      NEW.current_stock,
      NEW.reorder_level,
      'active'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_alerts
AFTER UPDATE OF current_stock ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION check_and_create_inventory_alerts();

-- =====================================================
-- VIEWS
-- =====================================================

-- Real-time Cash Flow View
CREATE OR REPLACE VIEW cash_flow_realtime AS
SELECT 
  i.user_id,
  CURRENT_DATE as report_date,
  SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_revenue,
  SUM(CASE WHEN i.status IN ('draft', 'sent') THEN i.total ELSE 0 END) as pending_revenue,
  SUM(CASE WHEN i.due_date < CURRENT_DATE AND i.status != 'paid' THEN i.total ELSE 0 END) as overdue_revenue,
  (SELECT SUM(total_amount) FROM expenses e WHERE e.user_id = i.user_id AND e.payment_date = CURRENT_DATE) as today_expenses,
  (SELECT SUM(total_amount) FROM expenses e WHERE e.user_id = i.user_id AND e.expense_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_expenses
FROM invoices i
GROUP BY i.user_id;

-- Collection Efficiency View
CREATE OR REPLACE VIEW collection_efficiency_view AS
SELECT 
  i.user_id,
  COUNT(*) as total_invoices,
  SUM(i.total) as total_invoiced,
  SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_collected,
  ROUND((SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) / NULLIF(SUM(i.total), 0)) * 100, 2) as collection_efficiency_percentage,
  AVG(CASE WHEN i.status = 'paid' THEN EXTRACT(DAYS FROM (i.updated_at - i.created_at)) ELSE NULL END) as avg_collection_days
FROM invoices i
WHERE i.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY i.user_id;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_inventory_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_depreciation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invoice_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_nudge_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (User can only access their own data)
CREATE POLICY inventory_items_policy ON inventory_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY inventory_batches_policy ON inventory_batches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY job_inventory_allocations_policy ON job_inventory_allocations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY inventory_alerts_policy ON inventory_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY expense_categories_policy ON expense_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY expenses_policy ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY assets_policy ON assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY asset_depreciation_log_policy ON asset_depreciation_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY mis_reports_policy ON mis_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY business_metrics_policy ON business_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_roles_policy ON user_roles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY branches_policy ON branches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY ip_access_rules_policy ON ip_access_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY activity_logs_policy ON activity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY approval_workflows_policy ON approval_workflows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY approval_requests_policy ON approval_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY client_portal_users_policy ON client_portal_users FOR ALL USING (auth.uid() = user_id);
CREATE POLICY client_invoice_approvals_policy ON client_invoice_approvals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY invoice_disputes_policy ON invoice_disputes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY client_support_chats_policy ON client_support_chats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY whatsapp_templates_policy ON whatsapp_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY whatsapp_messages_policy ON whatsapp_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY payment_nudge_settings_policy ON payment_nudge_settings FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_item_type ON inventory_items(item_type);
CREATE INDEX idx_inventory_batches_expiry_date ON inventory_batches(expiry_date) WHERE batch_status = 'active';
CREATE INDEX idx_inventory_alerts_status ON inventory_alerts(alert_status, alert_type);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_approval_status ON expenses(approval_status) WHERE requires_approval = true;
CREATE INDEX idx_assets_status ON assets(asset_status);
CREATE INDEX idx_business_metrics_date ON business_metrics(metric_date DESC);
CREATE INDEX idx_approval_requests_status ON approval_requests(approval_status);
CREATE INDEX idx_client_portal_users_customer_id ON client_portal_users(customer_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(message_status);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE inventory_items IS 'Enhanced inventory management with batch tracking, service inventory, and AI alerts';
COMMENT ON TABLE inventory_batches IS 'Batch-wise inventory tracking with expiry management';
COMMENT ON TABLE job_inventory_allocations IS 'Job/project-based inventory allocation and consumption tracking';
COMMENT ON TABLE inventory_alerts IS 'AI-powered low stock and expiry alerts';
COMMENT ON TABLE expenses IS 'Comprehensive expense management with OCR, mileage, and asset tracking';
COMMENT ON TABLE assets IS 'Fixed asset management with depreciation calculations';
COMMENT ON TABLE business_metrics IS 'Real-time business performance metrics and health scores';
COMMENT ON TABLE mis_reports IS 'Custom MIS report configurations';
COMMENT ON TABLE user_roles IS 'Role-based access control with granular permissions';
COMMENT ON TABLE branches IS 'Multi-branch business management';
COMMENT ON TABLE approval_workflows IS 'Maker-checker approval workflows';
COMMENT ON TABLE client_portal_users IS 'Client portal login and access management';
COMMENT ON TABLE invoice_disputes IS 'Client-initiated invoice dispute management';
COMMENT ON TABLE whatsapp_templates IS 'WhatsApp message templates for automation';
COMMENT ON TABLE payment_nudge_settings IS 'Automated payment reminder configurations';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================


-- ==========================================
-- FILE: supabase-combined-migration.sql
-- ==========================================

-- Combined migration for all invoice customization features
-- Run this in your Supabase SQL Editor

-- 1. Add logo size column
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS logo_size VARCHAR(10) DEFAULT 'medium'
CHECK (logo_size IN ('small', 'medium', 'large'));

-- 2. Add company font customization columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_size INTEGER DEFAULT 24 
CHECK (company_font_size >= 16 AND company_font_size <= 48);

-- 3. Add company name styling columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_name_color VARCHAR(7) DEFAULT '#000000';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_weight VARCHAR(10) DEFAULT 'bold'
CHECK (company_font_weight IN ('normal', 'bold', 'bolder'));

-- 4. Add invoice body text font columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS invoice_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS invoice_font_size INTEGER DEFAULT 14 
CHECK (invoice_font_size >= 10 AND invoice_font_size <= 18);

-- 5. Add company details font columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_font_size INTEGER DEFAULT 12 
CHECK (company_details_font_size >= 10 AND company_details_font_size <= 16);

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_color VARCHAR(7) DEFAULT '#6b7280';

-- 6. Add terms and conditions font columns
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS terms_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS terms_font_size INTEGER DEFAULT 12 
CHECK (terms_font_size >= 10 AND terms_font_size <= 16);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET 
    logo_size = COALESCE(logo_size, 'medium'),
    company_font_family = COALESCE(company_font_family, 'Arial'),
    company_font_size = COALESCE(company_font_size, 24),
    company_name_color = COALESCE(company_name_color, '#000000'),
    company_font_weight = COALESCE(company_font_weight, 'bold'),
    invoice_font_family = COALESCE(invoice_font_family, 'Arial'),
    invoice_font_size = COALESCE(invoice_font_size, 14),
    company_details_font_family = COALESCE(company_details_font_family, 'Arial'),
    company_details_font_size = COALESCE(company_details_font_size, 12),
    company_details_color = COALESCE(company_details_color, '#6b7280'),
    terms_font_family = COALESCE(terms_font_family, 'Arial'),
    terms_font_size = COALESCE(terms_font_size, 12);

-- Add comments for documentation
COMMENT ON COLUMN invoice_settings.logo_size IS 'Size of the company logo (small: 64px, medium: 96px, large: 128px)';
COMMENT ON COLUMN invoice_settings.company_font_family IS 'Font family for company name';
COMMENT ON COLUMN invoice_settings.company_font_size IS 'Font size for company name in pixels (16-48)';
COMMENT ON COLUMN invoice_settings.company_name_color IS 'Color for company name text (hex format)';
COMMENT ON COLUMN invoice_settings.company_font_weight IS 'Font weight for company name (normal, bold, bolder)';
COMMENT ON COLUMN invoice_settings.invoice_font_family IS 'Font family for invoice body text';
COMMENT ON COLUMN invoice_settings.invoice_font_size IS 'Font size for invoice body text in pixels (10-18)';
COMMENT ON COLUMN invoice_settings.company_details_font_family IS 'Font family for company details (address, email, phone)';
COMMENT ON COLUMN invoice_settings.company_details_font_size IS 'Font size for company details in pixels (10-16)';
COMMENT ON COLUMN invoice_settings.company_details_color IS 'Color for company details text (hex format)';
COMMENT ON COLUMN invoice_settings.terms_font_family IS 'Font family for terms, conditions, and notes text';
COMMENT ON COLUMN invoice_settings.terms_font_size IS 'Font size for terms, conditions, and notes text in pixels (10-16)';


-- ==========================================
-- FILE: supabase-discount-migration.sql
-- ==========================================

-- Migration: Add discount fields to invoices table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS discount_type   VARCHAR(20)     DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_value  DECIMAL(10, 2)  DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2)  DEFAULT NULL;


-- ==========================================
-- FILE: supabase-font-customization-migration.sql
-- ==========================================

-- Add company font customization columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_size INTEGER DEFAULT 24 
CHECK (company_font_size >= 16 AND company_font_size <= 48);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET company_font_family = 'Arial' 
WHERE company_font_family IS NULL;

UPDATE invoice_settings 
SET company_font_size = 24 
WHERE company_font_size IS NULL;

COMMENT ON COLUMN invoice_settings.company_font_family IS 'Font family for company name (Arial, Helvetica, etc.)';
COMMENT ON COLUMN invoice_settings.company_font_size IS 'Font size for company name in pixels (16-48)';


-- ==========================================
-- FILE: supabase-invoice-font-migration.sql
-- ==========================================

-- Add invoice body text font customization columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS invoice_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS invoice_font_size INTEGER DEFAULT 12 
CHECK (invoice_font_size >= 10 AND invoice_font_size <= 18);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET invoice_font_family = 'Arial' 
WHERE invoice_font_family IS NULL;

UPDATE invoice_settings 
SET invoice_font_size = 12 
WHERE invoice_font_size IS NULL;

COMMENT ON COLUMN invoice_settings.invoice_font_family IS 'Font family for invoice body text';
COMMENT ON COLUMN invoice_settings.invoice_font_size IS 'Font size for invoice body text in pixels (10-18)';


-- ==========================================
-- FILE: supabase-logo-size-migration.sql
-- ==========================================

-- Add logo_size column to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS logo_size VARCHAR(10) DEFAULT 'medium' 
CHECK (logo_size IN ('small', 'medium', 'large'));

-- Update existing rows to have default value
UPDATE invoice_settings 
SET logo_size = 'medium' 
WHERE logo_size IS NULL;


-- ==========================================
-- FILE: supabase-terms-font-migration.sql
-- ==========================================

-- Add company details color and terms font customization columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_color VARCHAR(7) DEFAULT '#6b7280';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS terms_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS terms_font_size INTEGER DEFAULT 12 
CHECK (terms_font_size >= 10 AND terms_font_size <= 16);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET company_details_color = '#6b7280' 
WHERE company_details_color IS NULL;

UPDATE invoice_settings 
SET terms_font_family = 'Arial' 
WHERE terms_font_family IS NULL;

UPDATE invoice_settings 
SET terms_font_size = 12 
WHERE terms_font_size IS NULL;

COMMENT ON COLUMN invoice_settings.company_details_color IS 'Color for company details text (hex format)';
COMMENT ON COLUMN invoice_settings.terms_font_family IS 'Font family for terms, conditions, and notes text';
COMMENT ON COLUMN invoice_settings.terms_font_size IS 'Font size for terms, conditions, and notes text in pixels (10-16)';


-- ==========================================
-- FILE: supabase-company-name-style-migration.sql
-- ==========================================

-- Add company name color and font weight columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_name_color VARCHAR(7);

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_font_weight VARCHAR(10) DEFAULT 'bold'
CHECK (company_font_weight IN ('normal', 'bold', 'bolder'));

-- Update existing rows to use primary_color for company_name_color if not set
UPDATE invoice_settings 
SET company_name_color = COALESCE(company_name_color, primary_color, '#3B82F6');

UPDATE invoice_settings 
SET company_font_weight = 'bold' 
WHERE company_font_weight IS NULL;

COMMENT ON COLUMN invoice_settings.company_name_color IS 'Color for company name text (hex format)';
COMMENT ON COLUMN invoice_settings.company_font_weight IS 'Font weight for company name (normal, bold, bolder)';


-- ==========================================
-- FILE: supabase-company-details-font-migration.sql
-- ==========================================

-- Add company details font customization columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_font_family VARCHAR(50) DEFAULT 'Arial';

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS company_details_font_size INTEGER DEFAULT 12 
CHECK (company_details_font_size >= 10 AND company_details_font_size <= 16);

-- Update existing rows to have default values
UPDATE invoice_settings 
SET company_details_font_family = 'Arial' 
WHERE company_details_font_family IS NULL;

UPDATE invoice_settings 
SET company_details_font_size = 12 
WHERE company_details_font_size IS NULL;

COMMENT ON COLUMN invoice_settings.company_details_font_family IS 'Font family for company details (address, email, phone, GSTIN)';
COMMENT ON COLUMN invoice_settings.company_details_font_size IS 'Font size for company details in pixels (10-16)';


-- ==========================================
-- FILE: supabase-invoice-payment-method-migration.sql
-- ==========================================

-- Add payment_method field to invoices table
-- This allows tracking how invoices were paid (cash, QR code, etc.)

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_notes TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_payment_method ON invoices(payment_method);

COMMENT ON COLUMN invoices.payment_method IS 'Payment method used: cash, gpay, phonepe, paytm, bank_transfer, etc.';
COMMENT ON COLUMN invoices.payment_notes IS 'Additional notes about the payment';
COMMENT ON COLUMN invoices.paid_at IS 'Timestamp when invoice was marked as paid';


-- ==========================================
-- FILE: supabase-invoice-template-schema.sql
-- ==========================================

-- Invoice Template Settings Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Company Information
  company_name VARCHAR(255),
  company_email VARCHAR(255),
  company_phone VARCHAR(20),
  company_address TEXT,
  company_gstin VARCHAR(15),
  company_logo_url TEXT,
  
  -- Invoice Customization
  invoice_prefix VARCHAR(10) DEFAULT 'INV',
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#8B5CF6',
  
  -- Terms and Conditions
  terms_and_conditions TEXT,
  payment_instructions TEXT,
  footer_text TEXT,
  
  -- Display Options
  show_logo BOOLEAN DEFAULT true,
  show_company_details BOOLEAN DEFAULT true,
  show_gstin BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own invoice settings" ON invoice_settings;
CREATE POLICY "Users can view their own invoice settings"
  ON invoice_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoice settings" ON invoice_settings;
CREATE POLICY "Users can insert their own invoice settings"
  ON invoice_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoice settings" ON invoice_settings;
CREATE POLICY "Users can update their own invoice settings"
  ON invoice_settings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invoice settings" ON invoice_settings;
CREATE POLICY "Users can delete their own invoice settings"
  ON invoice_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_invoice_settings_user_id ON invoice_settings(user_id);


-- ==========================================
-- FILE: supabase-item-details-migration.sql
-- ==========================================

-- Migration: Add item_details column to invoice_items
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS item_details TEXT;


-- ==========================================
-- FILE: supabase-saved-items-migration.sql
-- ==========================================

-- Saved Items (Product/Service Catalog) Migration
-- Allows users to save reusable invoice line items for quick insertion

CREATE TABLE IF NOT EXISTS saved_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    item_details TEXT,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    default_quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    hsn_sac_code VARCHAR(8),
    hsn_sac_type VARCHAR(3) CHECK (hsn_sac_type IN ('HSN', 'SAC')),
    gst_rate DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row-level security
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved items" ON saved_items;
CREATE POLICY "Users can view their own saved items"
    ON saved_items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own saved items" ON saved_items;
CREATE POLICY "Users can create their own saved items"
    ON saved_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved items" ON saved_items;
CREATE POLICY "Users can update their own saved items"
    ON saved_items FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved items" ON saved_items;
CREATE POLICY "Users can delete their own saved items"
    ON saved_items FOR DELETE
    USING (auth.uid() = user_id);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saved_items_updated_at ON saved_items;
CREATE TRIGGER saved_items_updated_at
    BEFORE UPDATE ON saved_items
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_items_updated_at();


-- ==========================================
-- FILE: supabase-signature-stamp-migration.sql
-- ==========================================

-- Add digital signature and company stamp columns to invoice_settings table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoice_settings
ADD COLUMN IF NOT EXISTS digital_signature_url TEXT,
ADD COLUMN IF NOT EXISTS show_signature BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS company_stamp_url TEXT,
ADD COLUMN IF NOT EXISTS show_stamp BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN invoice_settings.digital_signature_url IS 'Base64 or URL of owner digital signature image';
COMMENT ON COLUMN invoice_settings.show_signature IS 'Whether to display digital signature on invoices';
COMMENT ON COLUMN invoice_settings.company_stamp_url IS 'Base64 or URL of company stamp/seal image';
COMMENT ON COLUMN invoice_settings.show_stamp IS 'Whether to display company stamp on invoices';


-- ==========================================
-- FILE: supabase-qr-code-migration.sql
-- ==========================================

-- Add payment QR code field to invoice_settings table
-- This allows users to upload QR codes for GPay, PhonePe, Paytm, etc.

ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS payment_qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS show_qr_code BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN invoice_settings.payment_qr_code_url IS 'URL to payment QR code image (GPay, PhonePe, Paytm, etc.)';
COMMENT ON COLUMN invoice_settings.show_qr_code IS 'Whether to display QR code on invoices';

-- Create storage bucket for QR codes (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-qr-codes', 'invoice-qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for QR codes
CREATE POLICY "Users can upload their own QR codes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoice-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own QR codes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'invoice-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own QR codes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'invoice-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "QR codes are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoice-qr-codes');


-- ==========================================
-- FILE: supabase-partial-payment-migration.sql
-- ==========================================

-- Migration to add partial payment support to invoices
-- Run this in your Supabase SQL Editor

-- First, drop the old status check constraint if it exists
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Update the status check constraint to include 'partial'
ALTER TABLE invoices
ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'cancelled'));

-- Add columns for partial payment tracking
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_remaining DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS is_partial_payment BOOLEAN DEFAULT FALSE;

-- Update amount_remaining for existing invoices
UPDATE invoices 
SET amount_remaining = total - COALESCE(amount_paid, 0)
WHERE amount_remaining IS NULL;

-- Make amount_remaining NOT NULL after updating
ALTER TABLE invoices 
ALTER COLUMN amount_remaining SET DEFAULT 0,
ALTER COLUMN amount_remaining SET NOT NULL;

-- Add check constraint to ensure amounts are valid (drop first if exists)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS check_payment_amounts;
ALTER TABLE invoices
ADD CONSTRAINT check_payment_amounts 
CHECK (amount_paid >= 0 AND amount_paid <= total AND amount_remaining >= 0);

-- Create index for queries on partial payments
CREATE INDEX IF NOT EXISTS idx_invoices_partial_payment ON invoices(user_id, is_partial_payment) 
WHERE is_partial_payment = true;

-- Create a payments history table for tracking multiple partial payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_notes TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for payment history
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_user_id ON invoice_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_date ON invoice_payments(payment_date);

-- Enable RLS on invoice_payments
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_payments (drop first if they exist)
DROP POLICY IF EXISTS "Users can view their own invoice payments" ON invoice_payments;
CREATE POLICY "Users can view their own invoice payments"
  ON invoice_payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoice payments" ON invoice_payments;
CREATE POLICY "Users can insert their own invoice payments"
  ON invoice_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoice payments" ON invoice_payments;
CREATE POLICY "Users can update their own invoice payments"
  ON invoice_payments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invoice payments" ON invoice_payments;
CREATE POLICY "Users can delete their own invoice payments"
  ON invoice_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update invoice status and amounts on payment
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the invoice amounts and status
  UPDATE invoices
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM invoice_payments
      WHERE invoice_id = NEW.invoice_id
    ),
    amount_remaining = total - (
      SELECT COALESCE(SUM(amount), 0)
      FROM invoice_payments
      WHERE invoice_id = NEW.invoice_id
    ),
    is_partial_payment = (
      SELECT COALESCE(SUM(amount), 0) < total AND COALESCE(SUM(amount), 0) > 0
      FROM invoice_payments
      WHERE invoice_id = NEW.invoice_id
    ),
    status = CASE
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM invoice_payments
        WHERE invoice_id = NEW.invoice_id
      ) >= total THEN 'paid'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invoice payments
DROP TRIGGER IF EXISTS trigger_update_invoice_on_payment ON invoice_payments;
CREATE TRIGGER trigger_update_invoice_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_on_payment();

-- Add comment for documentation
COMMENT ON TABLE invoice_payments IS 'Tracks individual payment transactions for invoices, enabling partial payment support';
COMMENT ON COLUMN invoices.amount_paid IS 'Total amount paid towards this invoice';
COMMENT ON COLUMN invoices.amount_remaining IS 'Remaining amount to be paid';
COMMENT ON COLUMN invoices.is_partial_payment IS 'Whether this invoice has received partial payment';


-- ==========================================
-- FILE: supabase-fix-partial-status.sql
-- ==========================================

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


-- ==========================================
-- FILE: supabase-ai-chat-history.sql
-- ==========================================

-- Create AI chat history table for storing AI Accountant conversations
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster user-specific queries
CREATE INDEX IF NOT EXISTS ai_chat_history_user_id_idx ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS ai_chat_history_created_at_idx ON ai_chat_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop first to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Users can view own chat history" ON ai_chat_history;
CREATE POLICY "Users can view own chat history"
    ON ai_chat_history
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat history" ON ai_chat_history;
CREATE POLICY "Users can insert own chat history"
    ON ai_chat_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat history" ON ai_chat_history;
CREATE POLICY "Users can delete own chat history"
    ON ai_chat_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE ai_chat_history IS 'Stores AI Accountant chat conversations for each user. Isolated per user with RLS.';
