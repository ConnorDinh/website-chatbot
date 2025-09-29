-- Add lead analysis columns to conversations table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS lead_analysis JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create an index on analyzed_at for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_analyzed_at ON conversations(analyzed_at);

-- Create an index on lead_analysis for filtering
CREATE INDEX IF NOT EXISTS idx_conversations_lead_analysis ON conversations USING GIN (lead_analysis);

