-- ====================================================================
-- FIX: Permissive RLS policies for ALL tables used by TRACKIQ AI
-- 
-- ROOT CAUSE: All tables had INSERT/UPDATE/DELETE blocked for the
-- anon/publishable key. Only SELECT was permitted.
--
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- Safe to run multiple times (DROP POLICY IF EXISTS is idempotent).
-- ====================================================================

-- ── Helper: create 4 permissive policies for a table ──────────────
-- We use explicit DO blocks per table for compatibility.

-- ================================================================
-- 1. ai_planner_requests  (PRIMARY FIX — blocked batch inserts)
-- ================================================================
ALTER TABLE ai_planner_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select ai_planner_requests"  ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow public insert ai_planner_requests"  ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow public update ai_planner_requests"  ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow public delete ai_planner_requests"  ON ai_planner_requests;
-- Legacy names from old migration
DROP POLICY IF EXISTS "Allow select ai_planner_requests"         ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow insert ai_planner_requests"         ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow update ai_planner_requests"         ON ai_planner_requests;
DROP POLICY IF EXISTS "Allow delete ai_planner_requests"         ON ai_planner_requests;

CREATE POLICY "Allow public select ai_planner_requests"
  ON ai_planner_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert ai_planner_requests"
  ON ai_planner_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ai_planner_requests"
  ON ai_planner_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete ai_planner_requests"
  ON ai_planner_requests FOR DELETE USING (true);

-- Ensure batch columns exist (idempotent)
ALTER TABLE ai_planner_requests
  ADD COLUMN IF NOT EXISTS batch_id      TEXT,
  ADD COLUMN IF NOT EXISTS batch_sent_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS ai_planner_requests_batch_idx
  ON ai_planner_requests (batch_id, batch_sent_at DESC);

-- ================================================================
-- 2. track_requests
-- ================================================================
ALTER TABLE track_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select track_requests"             ON track_requests;
DROP POLICY IF EXISTS "Allow insert track_requests"             ON track_requests;
DROP POLICY IF EXISTS "Allow update track_requests"             ON track_requests;
DROP POLICY IF EXISTS "Allow delete track_requests"             ON track_requests;
DROP POLICY IF EXISTS "Allow public select track_requests"      ON track_requests;
DROP POLICY IF EXISTS "Allow public insert track_requests"      ON track_requests;
DROP POLICY IF EXISTS "Allow public update track_requests"      ON track_requests;
DROP POLICY IF EXISTS "Allow public delete track_requests"      ON track_requests;

CREATE POLICY "Allow public select track_requests"
  ON track_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert track_requests"
  ON track_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update track_requests"
  ON track_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete track_requests"
  ON track_requests FOR DELETE USING (true);

-- ================================================================
-- 3. st_requests
-- ================================================================
ALTER TABLE st_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select st_requests"                ON st_requests;
DROP POLICY IF EXISTS "Allow insert st_requests"                ON st_requests;
DROP POLICY IF EXISTS "Allow update st_requests"                ON st_requests;
DROP POLICY IF EXISTS "Allow delete st_requests"                ON st_requests;
DROP POLICY IF EXISTS "Allow public select st_requests"         ON st_requests;
DROP POLICY IF EXISTS "Allow public insert st_requests"         ON st_requests;
DROP POLICY IF EXISTS "Allow public update st_requests"         ON st_requests;
DROP POLICY IF EXISTS "Allow public delete st_requests"         ON st_requests;

CREATE POLICY "Allow public select st_requests"
  ON st_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert st_requests"
  ON st_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update st_requests"
  ON st_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete st_requests"
  ON st_requests FOR DELETE USING (true);

-- ================================================================
-- 4. trd_requests
-- ================================================================
ALTER TABLE trd_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select trd_requests"               ON trd_requests;
DROP POLICY IF EXISTS "Allow insert trd_requests"               ON trd_requests;
DROP POLICY IF EXISTS "Allow update trd_requests"               ON trd_requests;
DROP POLICY IF EXISTS "Allow delete trd_requests"               ON trd_requests;
DROP POLICY IF EXISTS "Allow public select trd_requests"        ON trd_requests;
DROP POLICY IF EXISTS "Allow public insert trd_requests"        ON trd_requests;
DROP POLICY IF EXISTS "Allow public update trd_requests"        ON trd_requests;
DROP POLICY IF EXISTS "Allow public delete trd_requests"        ON trd_requests;

CREATE POLICY "Allow public select trd_requests"
  ON trd_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert trd_requests"
  ON trd_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update trd_requests"
  ON trd_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete trd_requests"
  ON trd_requests FOR DELETE USING (true);

-- ================================================================
-- 5. ai_planner_alerts
-- ================================================================
ALTER TABLE ai_planner_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public alerts"                     ON ai_planner_alerts;
DROP POLICY IF EXISTS "Allow public select ai_planner_alerts"   ON ai_planner_alerts;
DROP POLICY IF EXISTS "Allow public insert ai_planner_alerts"   ON ai_planner_alerts;
DROP POLICY IF EXISTS "Allow public update ai_planner_alerts"   ON ai_planner_alerts;
DROP POLICY IF EXISTS "Allow public delete ai_planner_alerts"   ON ai_planner_alerts;

CREATE POLICY "Allow public select ai_planner_alerts"
  ON ai_planner_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert ai_planner_alerts"
  ON ai_planner_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ai_planner_alerts"
  ON ai_planner_alerts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete ai_planner_alerts"
  ON ai_planner_alerts FOR DELETE USING (true);

-- ================================================================
-- 6. optimized_blocks
-- ================================================================
ALTER TABLE optimized_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public optimized_blocks"           ON optimized_blocks;
DROP POLICY IF EXISTS "Allow public select optimized_blocks"    ON optimized_blocks;
DROP POLICY IF EXISTS "Allow public insert optimized_blocks"    ON optimized_blocks;
DROP POLICY IF EXISTS "Allow public update optimized_blocks"    ON optimized_blocks;
DROP POLICY IF EXISTS "Allow public delete optimized_blocks"    ON optimized_blocks;

CREATE POLICY "Allow public select optimized_blocks"
  ON optimized_blocks FOR SELECT USING (true);
CREATE POLICY "Allow public insert optimized_blocks"
  ON optimized_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update optimized_blocks"
  ON optimized_blocks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete optimized_blocks"
  ON optimized_blocks FOR DELETE USING (true);

-- ================================================================
-- 7. approval_requests
-- ================================================================
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select approval_requests"   ON approval_requests;
DROP POLICY IF EXISTS "Allow public insert approval_requests"   ON approval_requests;
DROP POLICY IF EXISTS "Allow public update approval_requests"   ON approval_requests;
DROP POLICY IF EXISTS "Allow public delete approval_requests"   ON approval_requests;

CREATE POLICY "Allow public select approval_requests"
  ON approval_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert approval_requests"
  ON approval_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update approval_requests"
  ON approval_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete approval_requests"
  ON approval_requests FOR DELETE USING (true);

-- ================================================================
-- 8. email_automations
-- ================================================================
ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select email_automations"   ON email_automations;
DROP POLICY IF EXISTS "Allow public insert email_automations"   ON email_automations;
DROP POLICY IF EXISTS "Allow public update email_automations"   ON email_automations;
DROP POLICY IF EXISTS "Allow public delete email_automations"   ON email_automations;

CREATE POLICY "Allow public select email_automations"
  ON email_automations FOR SELECT USING (true);
CREATE POLICY "Allow public insert email_automations"
  ON email_automations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update email_automations"
  ON email_automations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete email_automations"
  ON email_automations FOR DELETE USING (true);

-- ================================================================
-- 9. execution_monitor
-- ================================================================
ALTER TABLE execution_monitor ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public execution_monitor"          ON execution_monitor;
DROP POLICY IF EXISTS "Allow public select execution_monitor"   ON execution_monitor;
DROP POLICY IF EXISTS "Allow public insert execution_monitor"   ON execution_monitor;
DROP POLICY IF EXISTS "Allow public update execution_monitor"   ON execution_monitor;
DROP POLICY IF EXISTS "Allow public delete execution_monitor"   ON execution_monitor;

CREATE POLICY "Allow public select execution_monitor"
  ON execution_monitor FOR SELECT USING (true);
CREATE POLICY "Allow public insert execution_monitor"
  ON execution_monitor FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update execution_monitor"
  ON execution_monitor FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete execution_monitor"
  ON execution_monitor FOR DELETE USING (true);

-- ================================================================
-- 10. ml_predictions
-- ================================================================
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public ml_predictions"             ON ml_predictions;
DROP POLICY IF EXISTS "Allow public select ml_predictions"      ON ml_predictions;
DROP POLICY IF EXISTS "Allow public insert ml_predictions"      ON ml_predictions;
DROP POLICY IF EXISTS "Allow public update ml_predictions"      ON ml_predictions;
DROP POLICY IF EXISTS "Allow public delete ml_predictions"      ON ml_predictions;

CREATE POLICY "Allow public select ml_predictions"
  ON ml_predictions FOR SELECT USING (true);
CREATE POLICY "Allow public insert ml_predictions"
  ON ml_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ml_predictions"
  ON ml_predictions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete ml_predictions"
  ON ml_predictions FOR DELETE USING (true);

-- ================================================================
-- 11. historical_outcomes
-- ================================================================
ALTER TABLE historical_outcomes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public historical_outcomes"        ON historical_outcomes;
DROP POLICY IF EXISTS "Allow public select historical_outcomes" ON historical_outcomes;
DROP POLICY IF EXISTS "Allow public insert historical_outcomes" ON historical_outcomes;
DROP POLICY IF EXISTS "Allow public update historical_outcomes" ON historical_outcomes;
DROP POLICY IF EXISTS "Allow public delete historical_outcomes" ON historical_outcomes;

CREATE POLICY "Allow public select historical_outcomes"
  ON historical_outcomes FOR SELECT USING (true);
CREATE POLICY "Allow public insert historical_outcomes"
  ON historical_outcomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update historical_outcomes"
  ON historical_outcomes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete historical_outcomes"
  ON historical_outcomes FOR DELETE USING (true);

-- ================================================================
-- 12. assets
-- ================================================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public assets"                     ON assets;
DROP POLICY IF EXISTS "Allow public select assets"              ON assets;
DROP POLICY IF EXISTS "Allow public insert assets"              ON assets;
DROP POLICY IF EXISTS "Allow public update assets"              ON assets;
DROP POLICY IF EXISTS "Allow public delete assets"              ON assets;

CREATE POLICY "Allow public select assets"
  ON assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert assets"
  ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update assets"
  ON assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete assets"
  ON assets FOR DELETE USING (true);

-- ================================================================
-- VERIFY — confirm all 4 policies exist for ai_planner_requests
-- ================================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN (
  'ai_planner_requests',
  'track_requests',
  'st_requests',
  'trd_requests',
  'ai_planner_alerts',
  'optimized_blocks',
  'approval_requests',
  'email_automations',
  'execution_monitor',
  'ml_predictions',
  'historical_outcomes',
  'assets'
)
ORDER BY tablename, cmd;
