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
