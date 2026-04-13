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

CREATE POLICY "Users can view their own saved items"
    ON saved_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved items"
    ON saved_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved items"
    ON saved_items FOR UPDATE
    USING (auth.uid() = user_id);

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

CREATE TRIGGER saved_items_updated_at
    BEFORE UPDATE ON saved_items
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_items_updated_at();
