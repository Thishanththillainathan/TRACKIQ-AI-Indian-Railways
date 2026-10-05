-- ====================================================================
-- TRACKIQ AI — COMPLETE SUPABASE TABLE AUDIT & MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- Safe to run multiple times — uses IF NOT EXISTS / ON CONFLICT
-- ====================================================================

-- ====================================================
-- TABLE 1: stations (real station register)
-- ====================================================
CREATE TABLE IF NOT EXISTS stations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  station_code    TEXT        UNIQUE NOT NULL,
  station_name    TEXT        NOT NULL,
  zone_code       TEXT,
  zone_name       TEXT,
  state           TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  station_type    TEXT,
  division        TEXT,
  google_maps_url TEXT
);

ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public stations" ON stations;
CREATE POLICY "Allow public stations" ON stations FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS stations_code_idx  ON stations (station_code);
CREATE INDEX IF NOT EXISTS stations_zone_idx  ON stations (zone_code);
CREATE INDEX IF NOT EXISTS stations_state_idx ON stations (state);

-- ====================================================
-- TABLE 2: optimized_blocks
-- ====================================================
CREATE TABLE IF NOT EXISTS optimized_blocks (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  block_id            TEXT        UNIQUE,
  station             TEXT,
  station_code        TEXT,
  planning_date       DATE,
  start_time          TEXT,
  end_time            TEXT,
  duration_minutes    INTEGER,
  department          TEXT,
  status              TEXT        DEFAULT 'Scheduled',
  conflicts_resolved  INTEGER     DEFAULT 0,
  merged_jobs         JSONB,
  ai_confidence_score DOUBLE PRECISION,
  ai_explanation      TEXT
);

ALTER TABLE optimized_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public optimized_blocks" ON optimized_blocks;
CREATE POLICY "Allow public optimized_blocks" ON optimized_blocks FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS blocks_station_idx ON optimized_blocks (station_code);
CREATE INDEX IF NOT EXISTS blocks_date_idx    ON optimized_blocks (planning_date);
CREATE INDEX IF NOT EXISTS blocks_status_idx  ON optimized_blocks (status);

-- ====================================================
-- TABLE 3: approval_requests (audit log)
-- ====================================================
CREATE TABLE IF NOT EXISTS approval_requests (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  block_id        TEXT,
  department      TEXT,
  station_name    TEXT,
  station_code    TEXT,
  officer_name    TEXT,
  officer_email   TEXT,
  action          TEXT,        -- 'Approved' | 'Rejected'
  comments        TEXT,
  planning_date   DATE,
  start_time      TEXT,
  end_time        TEXT
);

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public approval_requests" ON approval_requests;
CREATE POLICY "Allow public approval_requests" ON approval_requests FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS approvals_block_idx ON approval_requests (block_id);

-- ====================================================
-- TABLE 4: email_automations (audit log)
-- ====================================================
CREATE TABLE IF NOT EXISTS email_automations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  automation_id    TEXT        UNIQUE,
  block_id         TEXT,
  department       TEXT,
  recipient_email  TEXT,
  recipient_name   TEXT,
  email_subject    TEXT,
  email_type       TEXT,
  email_status     TEXT        DEFAULT 'Sent'
);

ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public email_automations" ON email_automations;
CREATE POLICY "Allow public email_automations" ON email_automations FOR ALL USING (true) WITH CHECK (true);

-- ====================================================
-- TABLE 5: execution_monitor
-- ====================================================
CREATE TABLE IF NOT EXISTS execution_monitor (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                TIMESTAMPTZ DEFAULT now(),
  execution_id              TEXT        UNIQUE,
  block_id                  TEXT,
  department                TEXT,
  station_name              TEXT,
  station_code              TEXT,
  scheduled_start           TEXT,
  scheduled_end             TEXT,
  start_timestamp           TIMESTAMPTZ,
  estimated_end_timestamp   TIMESTAMPTZ,
  actual_end_timestamp      TIMESTAMPTZ,
  progress_percentage       INTEGER     DEFAULT 0,
  execution_status          TEXT        DEFAULT 'Active',
  safety_clearance_given    BOOLEAN     DEFAULT FALSE,
  work_crew_assigned        INTEGER     DEFAULT 0,
  actual_duration_mins      INTEGER,
  delay_mins                INTEGER,
  live_logs                 JSONB
);

ALTER TABLE execution_monitor ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public execution_monitor" ON execution_monitor;
CREATE POLICY "Allow public execution_monitor" ON execution_monitor FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS exec_block_idx  ON execution_monitor (block_id);
CREATE INDEX IF NOT EXISTS exec_status_idx ON execution_monitor (execution_status);

-- ====================================================
-- TABLE 6: ml_predictions (prediction log)
-- ====================================================
CREATE TABLE IF NOT EXISTS ml_predictions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  prediction_id    TEXT        UNIQUE,
  model_type       TEXT,        -- 'Delay Prediction' | 'Risk Prediction' | 'Congestion Prediction'
  model_version    TEXT,
  station          TEXT,
  department       TEXT,
  input_reference  JSONB,
  predicted_value  TEXT,
  predicted_numeric DOUBLE PRECISION,
  risk_category    TEXT,
  confidence_score DOUBLE PRECISION,
  actual_outcome   TEXT         -- populated retroactively when actual outcome is known
);

ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public ml_predictions" ON ml_predictions;
CREATE POLICY "Allow public ml_predictions" ON ml_predictions FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS ml_model_idx ON ml_predictions (model_type);
CREATE INDEX IF NOT EXISTS ml_station_idx ON ml_predictions (station);

-- ====================================================
-- TABLE 7: historical_outcomes (self-learning loop)
-- Already created in end_to_end_workflow_migration.sql
-- Add missing columns safely
-- ====================================================
CREATE TABLE IF NOT EXISTS historical_outcomes (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  block_id            TEXT,
  request_id          TEXT,
  department          TEXT,
  station_name        TEXT,
  station_code        TEXT,
  recommended_window  TEXT,
  actual_window       TEXT,
  predicted_conflicts INTEGER     DEFAULT 0,
  observed_conflicts  INTEGER     DEFAULT 0,
  delay_mins          INTEGER     DEFAULT 0,
  completion_status   TEXT        DEFAULT 'COMPLETED',  -- 'COMPLETED' | 'DELAYED' | 'ABORTED'
  officer_id          TEXT,
  approval_action     TEXT,
  approval_comments   TEXT,
  duration_mins       INTEGER,
  department_label    TEXT
);

-- Add columns if the table already exists from prior migration
ALTER TABLE historical_outcomes ADD COLUMN IF NOT EXISTS station_name    TEXT;
ALTER TABLE historical_outcomes ADD COLUMN IF NOT EXISTS station_code    TEXT;
ALTER TABLE historical_outcomes ADD COLUMN IF NOT EXISTS duration_mins   INTEGER;
ALTER TABLE historical_outcomes ADD COLUMN IF NOT EXISTS department_label TEXT;

ALTER TABLE historical_outcomes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public historical_outcomes" ON historical_outcomes;
CREATE POLICY "Allow public historical_outcomes" ON historical_outcomes FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS hist_dept_idx   ON historical_outcomes (department);
CREATE INDEX IF NOT EXISTS hist_status_idx ON historical_outcomes (completion_status);

-- ====================================================
-- TABLE 8: historical_operations (for ML congestion)
-- ====================================================
CREATE TABLE IF NOT EXISTS historical_operations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  block_id         TEXT,
  station_name     TEXT,
  station_code     TEXT,
  department       TEXT,
  active_blocks    INTEGER,
  congestion_level TEXT,        -- 'Low' | 'Medium' | 'High'
  delay_mins       INTEGER,
  operation_date   DATE,
  notes            TEXT
);

ALTER TABLE historical_operations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public historical_operations" ON historical_operations;
CREATE POLICY "Allow public historical_operations" ON historical_operations FOR ALL USING (true) WITH CHECK (true);

-- ====================================================
-- TABLE 9: railway_work (RailwayWorkManager component)
-- ====================================================
CREATE TABLE IF NOT EXISTS railway_work (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  zone             TEXT,
  division         TEXT,
  station          TEXT,
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  work_type        TEXT,
  work_description TEXT,
  track_details    TEXT,
  signal_details   TEXT,
  ohe_details      TEXT,
  status           TEXT        DEFAULT 'Pending'
);

ALTER TABLE railway_work ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public railway_work" ON railway_work;
CREATE POLICY "Allow public railway_work" ON railway_work FOR ALL USING (true) WITH CHECK (true);

-- ====================================================
-- TABLE 10: department_machines (DepartmentDashboard)
-- ====================================================
CREATE TABLE IF NOT EXISTS department_machines (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  machine_id    TEXT        UNIQUE,
  machine_name  TEXT        NOT NULL,
  machine_type  TEXT,
  department    TEXT,
  station_name  TEXT,
  station_code  TEXT,
  status        TEXT        DEFAULT 'Available',
  last_service  DATE,
  next_service  DATE,
  notes         TEXT
);

ALTER TABLE department_machines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public department_machines" ON department_machines;
CREATE POLICY "Allow public department_machines" ON department_machines FOR ALL USING (true) WITH CHECK (true);

-- ====================================================
-- TABLE 11: tmd_assets / st_assets / trd_assets
-- (department-specific asset registers)
-- ====================================================
CREATE TABLE IF NOT EXISTS tmd_assets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ DEFAULT now(),
  asset_code   TEXT        UNIQUE,
  asset_name   TEXT        NOT NULL,
  asset_type   TEXT,
  station_name TEXT,
  station_code TEXT,
  division     TEXT,
  zone         TEXT,
  status       TEXT        DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS st_assets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ DEFAULT now(),
  asset_code   TEXT        UNIQUE,
  asset_name   TEXT        NOT NULL,
  asset_type   TEXT,
  station_name TEXT,
  station_code TEXT,
  division     TEXT,
  zone         TEXT,
  status       TEXT        DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS trd_assets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ DEFAULT now(),
  asset_code   TEXT        UNIQUE,
  asset_name   TEXT        NOT NULL,
  asset_type   TEXT,
  station_name TEXT,
  station_code TEXT,
  division     TEXT,
  zone         TEXT,
  status       TEXT        DEFAULT 'Available'
);

ALTER TABLE tmd_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE st_assets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trd_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public tmd_assets" ON tmd_assets;
DROP POLICY IF EXISTS "Allow public st_assets"  ON st_assets;
DROP POLICY IF EXISTS "Allow public trd_assets" ON trd_assets;

CREATE POLICY "Allow public tmd_assets" ON tmd_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public st_assets"  ON st_assets  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public trd_assets" ON trd_assets FOR ALL USING (true) WITH CHECK (true);

-- ====================================================
-- TABLE 12: tmd_requests / st_requests / trd_requests
-- Core request tables — ensure all needed columns exist
-- (base tables likely already created; this adds missing cols)
-- ====================================================
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS station_name      TEXT;
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS station_code      TEXT;
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS division          TEXT;
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS zone              TEXT;
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS urgency           TEXT DEFAULT 'MEDIUM';
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS safety_criticality TEXT DEFAULT 'MEDIUM';
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS train_impact       TEXT DEFAULT 'LOW';
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS duration_mins      INTEGER;
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS requested_window   TEXT;
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS planning_date      DATE;
ALTER TABLE tmd_requests ADD COLUMN IF NOT EXISTS department         TEXT DEFAULT 'Track Management';

ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS station_name      TEXT;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS station_code      TEXT;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS division          TEXT;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS zone              TEXT;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS urgency           TEXT DEFAULT 'MEDIUM';
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS safety_criticality TEXT DEFAULT 'MEDIUM';
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS train_impact       TEXT DEFAULT 'LOW';
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS duration_mins      INTEGER;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS requested_window   TEXT;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS planning_date      DATE;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS department         TEXT DEFAULT 'Signal & Telecommunication';

ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS station_name      TEXT;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS station_code      TEXT;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS division          TEXT;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS zone              TEXT;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS urgency           TEXT DEFAULT 'MEDIUM';
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS safety_criticality TEXT DEFAULT 'MEDIUM';
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS train_impact       TEXT DEFAULT 'LOW';
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS duration_mins      INTEGER;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS requested_window   TEXT;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS planning_date      DATE;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS department         TEXT DEFAULT 'Traction Distribution';

-- ====================================================
-- TABLE 13: historical_records (LearningLoop / DeptDashboard)
-- ====================================================
CREATE TABLE IF NOT EXISTS historical_records (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ DEFAULT now(),
  block_id          TEXT,
  department        TEXT,
  station_name      TEXT,
  station_code      TEXT,
  planned_date      DATE,
  actual_start      TIMESTAMPTZ,
  actual_end        TIMESTAMPTZ,
  duration_mins     INTEGER,
  delay_mins        INTEGER     DEFAULT 0,
  completion_status TEXT        DEFAULT 'Completed',
  crew_count        INTEGER,
  notes             TEXT
);

ALTER TABLE historical_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public historical_records" ON historical_records;
CREATE POLICY "Allow public historical_records" ON historical_records FOR ALL USING (true) WITH CHECK (true);

-- ====================================================
-- Verify: show all table names in public schema
-- ====================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
