-- ============================================================
-- CCTV Attendance & Vision Bridge Database Migration
-- Ensures cctv_cameras has all columns (including updated_at and last_ping_at)
-- ============================================================

CREATE TABLE IF NOT EXISTS cctv_cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    camera_name VARCHAR(255) NOT NULL,
    stream_url TEXT NOT NULL,
    location VARCHAR(255) DEFAULT 'Main Entrance',
    direction_mode VARCHAR(50) DEFAULT 'bidirectional',
    is_active BOOLEAN DEFAULT TRUE,
    last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure missing columns are added if table was previously created with minimal schema
ALTER TABLE cctv_cameras ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE cctv_cameras ADD COLUMN IF NOT EXISTS last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE cctv_cameras ADD COLUMN IF NOT EXISTS direction_mode VARCHAR(50) DEFAULT 'bidirectional';
ALTER TABLE cctv_cameras ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT 'Main Entrance';
ALTER TABLE cctv_cameras ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Enable RLS
ALTER TABLE cctv_cameras ENABLE ROW LEVEL SECURITY;

-- User Policies
DROP POLICY IF EXISTS "Users can manage their own cameras" ON cctv_cameras;
CREATE POLICY "Users can manage their own cameras" ON cctv_cameras
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Employee Face Embeddings
CREATE TABLE IF NOT EXISTS employee_face_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    embedding JSONB NOT NULL,
    reference_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE employee_face_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage employee embeddings" ON employee_face_embeddings;
CREATE POLICY "Users can manage employee embeddings" ON employee_face_embeddings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Attendance Movements Log
CREATE TABLE IF NOT EXISTS attendance_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(10) NOT NULL,
    camera_id UUID REFERENCES cctv_cameras(id),
    confidence_score NUMERIC(4,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE attendance_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view attendance movements" ON attendance_movements;
CREATE POLICY "Users can view attendance movements" ON attendance_movements
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
