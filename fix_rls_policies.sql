-- ====================================================================
-- RLS POLICIES MIGRATION FOR MAINTENANCE REQUEST QUEUES
-- ====================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor to enable
-- Row Level Security policies for railway officers on request tables.

-- 1. Enable RLS on all request tables
ALTER TABLE track_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE st_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_planner_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if present
DROP POLICY IF EXISTS "Allow select track_requests" ON track_requests;
DROP POLICY IF EXISTS "Allow insert track_requests" ON track_requests;
DROP POLICY IF EXISTS "Allow update track_requests" ON track_requests;
DROP POLICY IF EXISTS "Allow delete track_requests" ON track_requests;

DROP POLICY IF EXISTS "Allow select st_requests" ON st_requests;
DROP POLICY IF EXISTS "Allow insert st_requests" ON st_requests;
DROP POLICY IF EXISTS "Allow update st_requests" ON st_requests;
DROP POLICY IF EXISTS "Allow delete st_requests" ON st_requests;

DROP POLICY IF EXISTS "Allow select trd_requests" ON trd_requests;
DROP POLICY IF EXISTS "Allow insert trd_requests" ON trd_requests;
DROP POLICY IF EXISTS "Allow update trd_requests" ON trd_requests;
DROP POLICY IF EXISTS "Allow delete trd_requests" ON trd_requests;

DROP POLICY IF EXISTS "Allow select ai_planner_requests" ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow insert ai_planner_requests" ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow update ai_planner_requests" ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow delete ai_planner_requests" ON ai_planner_requests;

-- 3. Create permissive policies for authenticated and anon users
CREATE POLICY "Allow select track_requests" ON track_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert track_requests" ON track_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update track_requests" ON track_requests FOR UPDATE USING (true);
CREATE POLICY "Allow delete track_requests" ON track_requests FOR DELETE USING (true);

CREATE POLICY "Allow select st_requests" ON st_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert st_requests" ON st_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update st_requests" ON st_requests FOR UPDATE USING (true);
CREATE POLICY "Allow delete st_requests" ON st_requests FOR DELETE USING (true);

CREATE POLICY "Allow select trd_requests" ON trd_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert trd_requests" ON trd_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update trd_requests" ON trd_requests FOR UPDATE USING (true);
CREATE POLICY "Allow delete trd_requests" ON trd_requests FOR DELETE USING (true);

CREATE POLICY "Allow select ai_planner_requests" ON ai_planner_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert ai_planner_requests" ON ai_planner_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update ai_planner_requests" ON ai_planner_requests FOR UPDATE USING (true);
CREATE POLICY "Allow delete ai_planner_requests" ON ai_planner_requests FOR DELETE USING (true);
