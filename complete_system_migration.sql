-- ====================================================================
-- TRACKIQ AI — COMPLETE SYSTEM MIGRATION
-- Fixes all missing columns and missing tables for end-to-end workflow.
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ====================================================================

-- ================================================================
-- 1. ADD MISSING COLUMNS to optimized_blocks
-- ================================================================
ALTER TABLE optimized_blocks
  ADD COLUMN IF NOT EXISTS department    TEXT,
  ADD COLUMN IF NOT EXISTS request_id    TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by   TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Ensure duration_minutes is INTEGER (it existed but was empty)
-- It already exists per schema — just update any null values from start/end
UPDATE optimized_blocks
  SET duration_minutes = (
    EXTRACT(HOUR FROM (end_time::time - start_time::time)) * 60 +
    EXTRACT(MINUTE FROM (end_time::time - start_time::time))
  )::INTEGER
  WHERE duration_minutes IS NULL
    AND start_time IS NOT NULL
    AND end_time IS NOT NULL
    AND start_time <> ''
    AND end_time <> '';

-- ================================================================
-- 2. CREATE approval_requests TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS approval_requests (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  approval_id         TEXT        UNIQUE,
  block_id            TEXT        NOT NULL,
  request_id          TEXT,
  requester_name      TEXT,
  requester_department TEXT,
  approver_name       TEXT,
  approver_role       TEXT,
  approver_email      TEXT,
  status              TEXT        NOT NULL,   -- 'Approved' | 'Rejected' | 'Pending'
  rejection_reason    TEXT,
  officer_notes       TEXT,
  ai_confidence       DOUBLE PRECISION,
  submitted_at        TIMESTAMPTZ DEFAULT now(),
  approval_timestamp  TIMESTAMPTZ,
  station             TEXT,
  department          TEXT,
  planning_date       DATE,
  start_time          TEXT,
  end_time            TEXT,
  duration_minutes    INTEGER
);

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select approval_requests" ON approval_requests;
DROP POLICY IF EXISTS "Allow public insert approval_requests" ON approval_requests;
DROP POLICY IF EXISTS "Allow public update approval_requests" ON approval_requests;
DROP POLICY IF EXISTS "Allow public delete approval_requests" ON approval_requests;
CREATE POLICY "Allow public select approval_requests" ON approval_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert approval_requests" ON approval_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update approval_requests" ON approval_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete approval_requests" ON approval_requests FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS approval_requests_block_idx  ON approval_requests (block_id);
CREATE INDEX IF NOT EXISTS approval_requests_status_idx ON approval_requests (status);

-- ================================================================
-- 3. CREATE email_automations TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS email_automations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  automation_id    TEXT        UNIQUE,
  block_id         TEXT,
  request_id       TEXT,
  department       TEXT,
  recipient_email  TEXT,
  recipient_name   TEXT,
  email_subject    TEXT,
  email_type       TEXT,        -- 'Approval Request' | 'Approved' | 'Rejected' | 'Scheduled'
  email_status     TEXT        DEFAULT 'Queued',  -- 'Sent' | 'Queued' | 'Failed' | 'Test Mode'
  sent_timestamp   TIMESTAMPTZ,
  ai_generated_message TEXT,
  email_payload    JSONB        -- stores full email content for audit
);

ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select email_automations" ON email_automations;
DROP POLICY IF EXISTS "Allow public insert email_automations" ON email_automations;
DROP POLICY IF EXISTS "Allow public update email_automations" ON email_automations;
DROP POLICY IF EXISTS "Allow public delete email_automations" ON email_automations;
CREATE POLICY "Allow public select email_automations" ON email_automations FOR SELECT USING (true);
CREATE POLICY "Allow public insert email_automations" ON email_automations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update email_automations" ON email_automations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete email_automations" ON email_automations FOR DELETE USING (true);

-- ================================================================
-- 4. CREATE execution_monitor TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS execution_monitor (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               TIMESTAMPTZ DEFAULT now(),
  execution_id             TEXT        UNIQUE,
  block_id                 TEXT,
  request_id               TEXT,
  department               TEXT,
  station_name             TEXT,
  station_code             TEXT,
  scheduled_start          TEXT,
  scheduled_end            TEXT,
  start_timestamp          TIMESTAMPTZ,
  estimated_end_timestamp  TIMESTAMPTZ,
  actual_end_timestamp     TIMESTAMPTZ,
  progress_percentage      INTEGER     DEFAULT 0,
  execution_status         TEXT        DEFAULT 'Active',
  safety_clearance_given   BOOLEAN     DEFAULT FALSE,
  work_crew_assigned       INTEGER     DEFAULT 0,
  actual_duration_mins     INTEGER,
  delay_mins               INTEGER
);

ALTER TABLE execution_monitor ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public execution_monitor" ON execution_monitor;
CREATE POLICY "Allow public execution_monitor" ON execution_monitor FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- 5. CREATE ml_predictions TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS ml_predictions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  prediction_id    TEXT        UNIQUE,
  model_type       TEXT,
  model_version    TEXT,
  station          TEXT,
  department       TEXT,
  input_reference  JSONB,
  predicted_value  TEXT,
  predicted_numeric DOUBLE PRECISION,
  risk_category    TEXT,
  actual_outcome   TEXT
);

ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public ml_predictions" ON ml_predictions;
CREATE POLICY "Allow public ml_predictions" ON ml_predictions FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- 6. ENSURE optimized_blocks RLS covers all operations
-- ================================================================
ALTER TABLE optimized_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select optimized_blocks"  ON optimized_blocks;
DROP POLICY IF EXISTS "Allow public insert optimized_blocks"  ON optimized_blocks;
DROP POLICY IF EXISTS "Allow public update optimized_blocks"  ON optimized_blocks;
DROP POLICY IF EXISTS "Allow public delete optimized_blocks"  ON optimized_blocks;
DROP POLICY IF EXISTS "Allow public optimized_blocks"         ON optimized_blocks;
CREATE POLICY "Allow public select optimized_blocks" ON optimized_blocks FOR SELECT USING (true);
CREATE POLICY "Allow public insert optimized_blocks" ON optimized_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update optimized_blocks" ON optimized_blocks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete optimized_blocks" ON optimized_blocks FOR DELETE USING (true);

-- ================================================================
-- 7. ENSURE ai_planner_requests RLS is permissive
-- ================================================================
ALTER TABLE ai_planner_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select ai_planner_requests" ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow public insert ai_planner_requests" ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow public update ai_planner_requests" ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow public delete ai_planner_requests" ON ai_planner_requests;
CREATE POLICY "Allow public select ai_planner_requests" ON ai_planner_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert ai_planner_requests" ON ai_planner_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ai_planner_requests" ON ai_planner_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete ai_planner_requests" ON ai_planner_requests FOR DELETE USING (true);

-- ================================================================
-- 8. ENSURE st_requests / trd_requests RLS
-- ================================================================
ALTER TABLE st_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public st_requests" ON st_requests;
CREATE POLICY "Allow public st_requests" ON st_requests FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE trd_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public trd_requests" ON trd_requests;
CREATE POLICY "Allow public trd_requests" ON trd_requests FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- 9. VERIFY — list all policies
-- ================================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN (
  'optimized_blocks', 'approval_requests', 'email_automations',
  'execution_monitor', 'ml_predictions', 'ai_planner_requests',
  'st_requests', 'trd_requests'
)
ORDER BY tablename, cmd;
