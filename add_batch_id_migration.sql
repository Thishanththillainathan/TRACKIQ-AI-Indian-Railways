-- ====================================================================
-- MIGRATION: Add batch_id and batch_sent_at to ai_planner_requests
-- Run this in Supabase Dashboard → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ====================================================================

-- Add batch tracking columns to ai_planner_requests
ALTER TABLE ai_planner_requests
  ADD COLUMN IF NOT EXISTS batch_id      TEXT,
  ADD COLUMN IF NOT EXISTS batch_sent_at TIMESTAMPTZ DEFAULT now();

-- Index for fast latest-batch lookup
CREATE INDEX IF NOT EXISTS ai_planner_requests_batch_idx
  ON ai_planner_requests (batch_id, batch_sent_at DESC);

-- Index for ordering by received_at
CREATE INDEX IF NOT EXISTS ai_planner_requests_received_idx
  ON ai_planner_requests (received_at DESC);
