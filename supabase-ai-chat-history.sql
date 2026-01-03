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
