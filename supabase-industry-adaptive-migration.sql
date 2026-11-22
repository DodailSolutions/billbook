-- ==============================================================================
-- BillBook Multi-Tenant Industry-Adaptive Architecture Migration
-- ==============================================================================

-- 1. Extend Organization Business Profiles & Settings
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'retail',
ADD COLUMN IF NOT EXISTS business_metadata JSONB DEFAULT '{}'::jsonb;

-- Also update user_profiles if missing
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'retail',
ADD COLUMN IF NOT EXISTS business_metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Staff, Stylist & Specialist Commission Engine
-- Supports Salons (chair splits), Healthcare (visiting doctors), Garages (mechanics), Real Estate (brokers)
CREATE TABLE IF NOT EXISTS staff_revenue_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    staff_member_id UUID NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL, -- 'salon_spa', 'dental_clinic', 'auto_workshop', 'real_estate'
    service_commission_percent NUMERIC(5,2) DEFAULT 50.00,
    retail_commission_percent NUMERIC(5,2) DEFAULT 10.00,
    chair_rent_daily NUMERIC(12,2) DEFAULT 0,
    fixed_stipend NUMERIC(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Visual PMS Units & Bookings (Resorts, Farmhouses, Camping Tents)
CREATE TABLE IF NOT EXISTS pms_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    unit_number VARCHAR(100) NOT NULL, -- e.g. 'Tent #04', 'Villa Green', 'Cottage 12'
    unit_type VARCHAR(50) NOT NULL,    -- 'room', 'cottage', 'tent', 'bed', 'farmhouse'
    capacity INT DEFAULT 2,
    base_rate_daily NUMERIC(12,2) DEFAULT 0,
    base_rate_hourly NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'open', -- 'open', 'occupied', 'cleaning', 'maintenance'
    features JSONB DEFAULT '[]'::jsonb, -- e.g. ['bonfire', 'bbq_ready', 'attached_bath', 'ac']
    current_booking_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pms_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES pms_units(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    guest_id_proof_url TEXT,
    check_in_time TIMESTAMPTZ NOT NULL,
    check_out_time TIMESTAMPTZ NOT NULL,
    pax_adults INT DEFAULT 2,
    pax_children INT DEFAULT 0,
    rate_applied NUMERIC(12,2) NOT NULL,
    pricing_model VARCHAR(30) DEFAULT 'per_night', -- 'per_night', 'per_hour', 'per_person', 'per_tent'
    add_ons JSONB DEFAULT '[]'::jsonb,             -- e.g. [{'name': 'Barbecue Kit', 'price': 800}]
    total_amount NUMERIC(12,2) NOT NULL,
    advance_paid NUMERIC(12,2) DEFAULT 0,
    security_deposit NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'confirmed',        -- 'confirmed', 'checked_in', 'checked_out', 'cancelled'
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vehicle Digital Job Cards (Automobile Workshops & Garages)
CREATE TABLE IF NOT EXISTS vehicle_job_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    make_model VARCHAR(150),
    odometer_reading INT DEFAULT 0,
    fuel_level VARCHAR(20) DEFAULT 'half',         -- 'reserve', 'quarter', 'half', 'three_quarter', 'full'
    scratches_dents JSONB DEFAULT '[]'::jsonb,     -- coordinates and notes on 2D body layout
    customer_complaints TEXT[] DEFAULT '{}',
    mechanic_id UUID,
    mechanic_name VARCHAR(255),
    mechanic_commission_percent NUMERIC(5,2) DEFAULT 30.00,
    estimated_cost NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'inwarded',         -- 'inwarded', 'in_progress', 'ready_for_delivery', 'delivered'
    next_service_due_date DATE,
    next_service_due_km INT,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Dental Clinical Charts & Case Sheets (Healthcare & Dental Clinics)
CREATE TABLE IF NOT EXISTS dental_case_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    patient_uhid VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(255),
    chief_complaint TEXT,
    medical_history TEXT[] DEFAULT '{}',           -- e.g. ['Diabetes', 'Hypertension', 'Penicillin Allergy']
    tooth_data JSONB DEFAULT '{}'::jsonb,          -- Tooth 11-48 conditions & completed procedures
    treatment_plan JSONB DEFAULT '[]'::jsonb,      -- Multi-sitting planned visits & cost estimates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Laundry & Dry Cleaning Order Tags & Rack Storage
CREATE TABLE IF NOT EXISTS laundry_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,
    total_pieces INT DEFAULT 1,
    rack_slot VARCHAR(50),                         -- e.g. 'Rack B-14'
    is_express BOOLEAN DEFAULT FALSE,
    express_surcharge_percent NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'received',         -- 'received', 'in_wash', 'ironed_ready', 'delivered'
    delivery_date DATE,
    items JSONB DEFAULT '[]'::jsonb,               -- e.g. [{'piece': 'Shirt', 'service': 'Dry Clean', 'qty': 2, 'price': 160}]
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Real Estate Listings & Deals
CREATE TABLE IF NOT EXISTS real_estate_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL,            -- 'apartment', 'villa', 'plot', 'commercial', 'farmland'
    listing_type VARCHAR(30) NOT NULL,             -- 'sale', 'rent', 'lease'
    location VARCHAR(255) NOT NULL,
    price NUMERIC(14,2) NOT NULL,
    area_sqft NUMERIC(10,2),
    bhk INT,
    rera_number VARCHAR(100),
    status VARCHAR(30) DEFAULT 'available',        -- 'available', 'under_offer', 'sold', 'leased'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Add Foreign Keys / Indexes for Ultra-Fast Lookups
CREATE INDEX IF NOT EXISTS idx_staff_splits_user ON staff_revenue_splits(user_id, business_type);
CREATE INDEX IF NOT EXISTS idx_pms_units_user ON pms_units(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pms_bookings_user ON pms_bookings(user_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_vehicle_job_cards_user ON vehicle_job_cards(user_id, status);
CREATE INDEX IF NOT EXISTS idx_dental_case_sheets_user ON dental_case_sheets(user_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_user ON laundry_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_real_estate_user ON real_estate_listings(user_id, listing_type);

-- Enable RLS
ALTER TABLE staff_revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pms_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE pms_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_case_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_listings ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Policies (Owner & Multi-Tenant Scoped)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can manage own staff splits" ON staff_revenue_splits;
    CREATE POLICY "Users can manage own staff splits" ON staff_revenue_splits
        FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can manage own pms units" ON pms_units;
    CREATE POLICY "Users can manage own pms units" ON pms_units
        FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can manage own pms bookings" ON pms_bookings;
    CREATE POLICY "Users can manage own pms bookings" ON pms_bookings
        FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can manage own job cards" ON vehicle_job_cards;
    CREATE POLICY "Users can manage own job cards" ON vehicle_job_cards
        FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can manage own dental sheets" ON dental_case_sheets;
    CREATE POLICY "Users can manage own dental sheets" ON dental_case_sheets
        FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can manage own laundry orders" ON laundry_orders;
    CREATE POLICY "Users can manage own laundry orders" ON laundry_orders
        FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can manage own real estate listings" ON real_estate_listings;
    CREATE POLICY "Users can manage own real estate listings" ON real_estate_listings
        FOR ALL USING (auth.uid() = user_id);
END $$;
