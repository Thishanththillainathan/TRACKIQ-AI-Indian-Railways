-- ====================================================================
-- MIGRATION: END-TO-END RAILWAY MAINTENANCE WORKFLOW TABLES & COLUMNS
-- ====================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor to enable
-- all database-backed workflow tables, alerts, and historical datasets.

-- 1. Ensure requested_date exists on request tables
ALTER TABLE track_requests ADD COLUMN IF NOT EXISTS requested_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE st_requests ADD COLUMN IF NOT EXISTS requested_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE trd_requests ADD COLUMN IF NOT EXISTS requested_date DATE DEFAULT CURRENT_DATE;

-- 2. AI Planner Intake Table Updates
ALTER TABLE ai_planner_requests ADD COLUMN IF NOT EXISTS requested_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE ai_planner_requests ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE ai_planner_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'RECEIVED';

-- 3. Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  asset_code TEXT UNIQUE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  department TEXT NOT NULL,
  station_name TEXT,
  station_code TEXT,
  division TEXT,
  zone TEXT,
  status TEXT DEFAULT 'ACTIVE'
);

-- Seed initial assets if empty
INSERT INTO assets (asset_code, asset_name, asset_type, department, station_name, station_code, division, zone)
VALUES
  ('TRK-101', 'Turnout Switch #104A', 'Switch & Crossing', 'TRACK', 'Coimbatore Junction', 'CBE', 'Salem', 'Southern Railway'),
  ('TRK-102', 'Rail Joint Flaw Inspection Track 2', 'Track Section', 'TRACK', 'Salem Junction', 'SA', 'Salem', 'Southern Railway'),
  ('TRK-103', 'Crossover Points 201/202', 'Crossover', 'TRACK', 'Erode Junction', 'ED', 'Salem', 'Southern Railway'),
  ('ST-201', 'Point Machine #42B Dual Control', 'Point Machine', 'S&T', 'Coimbatore Junction', 'CBE', 'Salem', 'Southern Railway'),
  ('ST-202', 'Axle Counter Sensor Loop Line 3', 'Axle Counter', 'S&T', 'Katpadi Junction', 'KPD', 'Chennai', 'Southern Railway'),
  ('ST-203', 'Signal Interlocking Panel Relay', 'Signal Relay', 'S&T', 'Chennai Central', 'MAS', 'Chennai', 'Southern Railway'),
  ('TRD-301', '25kV OHE Catenary Wire Section 12', 'OHE Catenary', 'TRD', 'Coimbatore Junction', 'CBE', 'Salem', 'Southern Railway'),
  ('TRD-302', 'Traction Sub-Station Feeder Breaker', 'Substation Breaker', 'TRD', 'Jalarpettai Junction', 'JTJ', 'Chennai', 'Southern Railway'),
  ('TRD-303', 'Section Insulator Assembly Line 1', 'Section Insulator', 'TRD', 'Salem Junction', 'SA', 'Salem', 'Southern Railway')
ON CONFLICT (asset_code) DO NOTHING;

-- 4. AI Planner Alerts Table
CREATE TABLE IF NOT EXISTS ai_planner_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  request_id TEXT,
  department TEXT,
  alert_type TEXT DEFAULT 'AI_REQUEST_RECEIVED',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'UNREAD'
);

-- 5. Historical Outcomes Table for Self-Learning Architecture
CREATE TABLE IF NOT EXISTS historical_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  block_id TEXT,
  request_id TEXT,
  department TEXT,
  recommended_window TEXT,
  actual_window TEXT,
  predicted_conflicts INT DEFAULT 0,
  observed_conflicts INT DEFAULT 0,
  delay_mins INT DEFAULT 0,
  completion_status TEXT DEFAULT 'COMPLETED',
  officer_id TEXT,
  approval_action TEXT,
  approval_comments TEXT
);

-- 6. Enable RLS and permissive policies
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_planner_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_outcomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public assets" ON assets;
CREATE POLICY "Allow public assets" ON assets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public alerts" ON ai_planner_alerts;
CREATE POLICY "Allow public alerts" ON ai_planner_alerts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public historical_outcomes" ON historical_outcomes;
CREATE POLICY "Allow public historical_outcomes" ON historical_outcomes FOR ALL USING (true) WITH CHECK (true);
