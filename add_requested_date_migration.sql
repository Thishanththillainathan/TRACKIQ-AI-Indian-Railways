-- ====================================================================
-- MIGRATION: ADD REQUESTED_DATE COLUMN TO MAINTENANCE REQUEST TABLES
-- ====================================================================
-- Run this script in Supabase Dashboard -> SQL Editor to add the
-- requested_date column for permanent date + time sorting.

ALTER TABLE track_requests ADD COLUMN IF NOT EXISTS requested_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS requested_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS requested_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE ai_planner_requests ADD COLUMN IF NOT EXISTS requested_date DATE DEFAULT CURRENT_DATE;
