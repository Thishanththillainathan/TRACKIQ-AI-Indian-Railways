-- ============================================================
-- RAILWAY 3-DEPARTMENT DATA INTEGRATION MIGRATION
-- Run in Supabase Dashboard → SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- ── ir_zones ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_zones (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code        TEXT NOT NULL UNIQUE,
  zone_name        TEXT NOT NULL,
  headquarters     TEXT,
  established      TEXT,
  divisions_count  INTEGER,
  divisions_list   TEXT,
  route_km         TEXT,
  track_km         TEXT,
  electrified_pct  TEXT,
  gauge            TEXT,
  website          TEXT,
  states_served    TEXT,
  google_maps_hq   TEXT,
  source_file      TEXT,
  source_sheet     TEXT,
  department       TEXT DEFAULT 'SHARED',
  created_at       TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ir_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_zones" ON ir_zones;
CREATE POLICY "public_ir_zones" ON ir_zones FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS ir_zones_code_idx ON ir_zones(zone_code);

-- ── ir_divisions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_divisions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code     TEXT NOT NULL,
  zone_name     TEXT,
  division      TEXT NOT NULL,
  division_hq   TEXT,
  state         TEXT,
  status        TEXT DEFAULT 'Operational',
  google_maps   TEXT,
  source_file   TEXT,
  source_sheet  TEXT,
  department    TEXT DEFAULT 'SHARED',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (zone_code, division)
);
ALTER TABLE ir_divisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_divisions" ON ir_divisions;
CREATE POLICY "public_ir_divisions" ON ir_divisions FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS ir_divisions_zone_idx ON ir_divisions(zone_code);

-- ── Extend stations table (add columns if missing) ────────────
ALTER TABLE stations ADD COLUMN IF NOT EXISTS district      TEXT;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS gauge         TEXT;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS heritage_line TEXT;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS trains_serving INTEGER;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS snt_tier      INTEGER;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS data_basis    TEXT;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS source_file   TEXT;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS source_sheet  TEXT;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS department    TEXT DEFAULT 'SHARED';
ALTER TABLE stations ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT now();

-- ── tmd_zonal_offices ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tmd_zonal_offices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code           TEXT NOT NULL UNIQUE,
  zone_name           TEXT,
  hq_city             TEXT,
  pce_office          TEXT,
  divisions           TEXT,
  track_machines_cell TEXT,
  tms_cell            TEXT,
  source_url          TEXT,
  source_file         TEXT,
  source_sheet        TEXT,
  department          TEXT DEFAULT 'TMD',
  created_at          TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tmd_zonal_offices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_tmd_zonal_offices" ON tmd_zonal_offices;
CREATE POLICY "public_tmd_zonal_offices" ON tmd_zonal_offices FOR ALL USING (true) WITH CHECK (true);

-- ── tmd_org_structure ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tmd_org_structure (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level              TEXT,
  designation        TEXT NOT NULL,
  jurisdiction       TEXT,
  reporting_to       TEXT,
  key_responsibilities TEXT,
  source_file        TEXT,
  source_sheet       TEXT,
  department         TEXT DEFAULT 'TMD',
  created_at         TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tmd_org_structure ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_tmd_org" ON tmd_org_structure;
CREATE POLICY "public_tmd_org" ON tmd_org_structure FOR ALL USING (true) WITH CHECK (true);

-- ── tmd_track_statistics ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS tmd_track_statistics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric      TEXT NOT NULL,
  value       TEXT,
  unit        TEXT,
  remarks     TEXT,
  source_file TEXT,
  source_sheet TEXT,
  department  TEXT DEFAULT 'TMD',
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tmd_track_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_tmd_stats" ON tmd_track_statistics;
CREATE POLICY "public_tmd_stats" ON tmd_track_statistics FOR ALL USING (true) WITH CHECK (true);

-- ── tmd_responsibilities ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS tmd_responsibilities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT,
  function    TEXT NOT NULL,
  description TEXT,
  key_metrics TEXT,
  source_file TEXT,
  source_sheet TEXT,
  department  TEXT DEFAULT 'TMD',
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tmd_responsibilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_tmd_resp" ON tmd_responsibilities;
CREATE POLICY "public_tmd_resp" ON tmd_responsibilities FOR ALL USING (true) WITH CHECK (true);

-- ── tmd_assets (missing, needed by DepartmentDashboard) ──────
CREATE TABLE IF NOT EXISTS tmd_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code   TEXT UNIQUE,
  asset_name   TEXT NOT NULL,
  asset_type   TEXT,
  station_name TEXT,
  station_code TEXT,
  division     TEXT,
  zone         TEXT,
  status       TEXT DEFAULT 'Available',
  source_file  TEXT,
  source_sheet TEXT,
  department   TEXT DEFAULT 'TMD',
  created_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tmd_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_tmd_assets" ON tmd_assets;
CREATE POLICY "public_tmd_assets" ON tmd_assets FOR ALL USING (true) WITH CHECK (true);

-- ── snt_org_structure ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snt_org_structure (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level                TEXT,
  designation          TEXT NOT NULL,
  jurisdiction         TEXT,
  reports_to           TEXT,
  key_responsibilities TEXT,
  data_basis           TEXT,
  source_file          TEXT,
  source_sheet         TEXT,
  department           TEXT DEFAULT 'SNT',
  created_at           TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE snt_org_structure ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_snt_org" ON snt_org_structure;
CREATE POLICY "public_snt_org" ON snt_org_structure FOR ALL USING (true) WITH CHECK (true);

-- ── snt_signalling_systems ────────────────────────────────────
CREATE TABLE IF NOT EXISTS snt_signalling_systems (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system              TEXT NOT NULL,
  category            TEXT,
  function            TEXT,
  typical_deployment  TEXT,
  status_2026         TEXT,
  data_basis          TEXT,
  source_file         TEXT,
  source_sheet        TEXT,
  department          TEXT DEFAULT 'SNT',
  created_at          TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE snt_signalling_systems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_snt_sig" ON snt_signalling_systems;
CREATE POLICY "public_snt_sig" ON snt_signalling_systems FOR ALL USING (true) WITH CHECK (true);

-- ── snt_kavach_deployment ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS snt_kavach_deployment (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item        TEXT NOT NULL,
  value       TEXT,
  period      TEXT,
  detail      TEXT,
  data_basis  TEXT,
  source_file TEXT,
  source_sheet TEXT,
  department  TEXT DEFAULT 'SNT',
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE snt_kavach_deployment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_snt_kavach" ON snt_kavach_deployment;
CREATE POLICY "public_snt_kavach" ON snt_kavach_deployment FOR ALL USING (true) WITH CHECK (true);

-- ── snt_signalling_by_zone ────────────────────────────────────
CREATE TABLE IF NOT EXISTS snt_signalling_by_zone (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code        TEXT NOT NULL,
  zone_name        TEXT,
  stations_count   INTEGER,
  share_pct        TEXT,
  ei_stations_model INTEGER,
  notes            TEXT,
  data_basis       TEXT,
  source_file      TEXT,
  source_sheet     TEXT,
  department       TEXT DEFAULT 'SNT',
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (zone_code)
);
ALTER TABLE snt_signalling_by_zone ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_snt_zbz" ON snt_signalling_by_zone;
CREATE POLICY "public_snt_zbz" ON snt_signalling_by_zone FOR ALL USING (true) WITH CHECK (true);

-- ── snt_rolling_stock ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snt_rolling_stock (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_train     TEXT NOT NULL,
  train_type      TEXT,
  power_speed     TEXT,
  snt_fitment     TEXT,
  data_basis      TEXT,
  source_file     TEXT,
  source_sheet    TEXT,
  department      TEXT DEFAULT 'SNT',
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE snt_rolling_stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_snt_rs" ON snt_rolling_stock;
CREATE POLICY "public_snt_rs" ON snt_rolling_stock FOR ALL USING (true) WITH CHECK (true);

-- ── snt_glossary ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snt_glossary (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abbreviation  TEXT NOT NULL UNIQUE,
  expansion     TEXT,
  meaning       TEXT,
  data_basis    TEXT,
  source_file   TEXT,
  source_sheet  TEXT,
  department    TEXT DEFAULT 'SNT',
  created_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE snt_glossary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_snt_gloss" ON snt_glossary;
CREATE POLICY "public_snt_gloss" ON snt_glossary FOR ALL USING (true) WITH CHECK (true);

-- ── st_assets ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS st_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code   TEXT UNIQUE,
  asset_name   TEXT NOT NULL,
  asset_type   TEXT,
  station_name TEXT,
  station_code TEXT,
  division     TEXT,
  zone         TEXT,
  status       TEXT DEFAULT 'Available',
  source_file  TEXT,
  source_sheet TEXT,
  department   TEXT DEFAULT 'SNT',
  created_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE st_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_st_assets" ON st_assets;
CREATE POLICY "public_st_assets" ON st_assets FOR ALL USING (true) WITH CHECK (true);

-- ── ir_trains ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_trains (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_no            INTEGER NOT NULL UNIQUE,
  train_name          TEXT,
  train_type          TEXT,
  origin_code         TEXT,
  origin_station      TEXT,
  destination_code    TEXT,
  destination_station TEXT,
  distance_km         INTEGER,
  duration_hhmm       TEXT,
  days_of_run         TEXT,
  stops_count         INTEGER,
  zone_origin         TEXT,
  google_maps         TEXT,
  source_file         TEXT,
  source_sheet        TEXT,
  department          TEXT DEFAULT 'TRD',
  created_at          TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ir_trains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_trains" ON ir_trains;
CREATE POLICY "public_ir_trains" ON ir_trains FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS ir_trains_origin_idx ON ir_trains(origin_code);
CREATE INDEX IF NOT EXISTS ir_trains_type_idx ON ir_trains(train_type);

-- ── ir_locomotives ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_locomotives (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class            TEXT NOT NULL UNIQUE,
  traction         TEXT,
  gauge            TEXT,
  loco_type        TEXT,
  power_hp         TEXT,
  max_speed_kmh    TEXT,
  tractive_effort  TEXT,
  axle_load_t      TEXT,
  builder          TEXT,
  year_introduced  TEXT,
  status           TEXT,
  notes            TEXT,
  source_file      TEXT,
  source_sheet     TEXT,
  department       TEXT DEFAULT 'TRD',
  created_at       TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ir_locomotives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_loco" ON ir_locomotives;
CREATE POLICY "public_ir_loco" ON ir_locomotives FOR ALL USING (true) WITH CHECK (true);

-- ── ir_loco_sheds ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_loco_sheds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shed_name       TEXT NOT NULL,
  city            TEXT,
  state           TEXT,
  zone            TEXT,
  traction        TEXT,
  gauge           TEXT,
  classes_housed  TEXT,
  coordinates     TEXT,
  google_maps     TEXT,
  notes           TEXT,
  source_file     TEXT,
  source_sheet    TEXT,
  department      TEXT DEFAULT 'TRD',
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (shed_name)
);
ALTER TABLE ir_loco_sheds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_sheds" ON ir_loco_sheds;
CREATE POLICY "public_ir_sheds" ON ir_loco_sheds FOR ALL USING (true) WITH CHECK (true);

-- ── ir_trunk_routes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_trunk_routes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name   TEXT NOT NULL,
  from_city    TEXT,
  to_city      TEXT,
  via_stations TEXT,
  route_km     TEXT,
  gauge        TEXT,
  electrified  TEXT,
  opened       TEXT,
  zones        TEXT,
  states       TEXT,
  google_maps  TEXT,
  notes        TEXT,
  source_file  TEXT,
  source_sheet TEXT,
  department   TEXT DEFAULT 'TRD',
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (route_name)
);
ALTER TABLE ir_trunk_routes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_routes" ON ir_trunk_routes;
CREATE POLICY "public_ir_routes" ON ir_trunk_routes FOR ALL USING (true) WITH CHECK (true);

-- ── ir_bridges ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_bridges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_name    TEXT NOT NULL,
  river          TEXT,
  route_section  TEXT,
  zone           TEXT,
  length_m       TEXT,
  bridge_type    TEXT,
  opened         TEXT,
  state          TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  google_maps    TEXT,
  notes          TEXT,
  source_file    TEXT,
  source_sheet   TEXT,
  department     TEXT DEFAULT 'TRD',
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (bridge_name)
);
ALTER TABLE ir_bridges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_bridges" ON ir_bridges;
CREATE POLICY "public_ir_bridges" ON ir_bridges FOR ALL USING (true) WITH CHECK (true);

-- ── ir_tunnels ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_tunnels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tunnel_name   TEXT NOT NULL,
  route_section TEXT,
  zone          TEXT,
  length_m      TEXT,
  opened        TEXT,
  state         TEXT,
  coordinates   TEXT,
  google_maps   TEXT,
  notes         TEXT,
  source_file   TEXT,
  source_sheet  TEXT,
  department    TEXT DEFAULT 'TRD',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tunnel_name)
);
ALTER TABLE ir_tunnels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_tunnels" ON ir_tunnels;
CREATE POLICY "public_ir_tunnels" ON ir_tunnels FOR ALL USING (true) WITH CHECK (true);

-- ── ir_network_stats ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_network_stats (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     TEXT,
  parameter    TEXT NOT NULL,
  value_1      TEXT,
  value_2      TEXT,
  electrified  TEXT,
  electrified_pct TEXT,
  gauge_breakup TEXT,
  divisions    TEXT,
  details      TEXT,
  source_notes TEXT,
  source_file  TEXT,
  source_sheet TEXT,
  department   TEXT DEFAULT 'TRD',
  created_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ir_network_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_netstats" ON ir_network_stats;
CREATE POLICY "public_ir_netstats" ON ir_network_stats FOR ALL USING (true) WITH CHECK (true);

-- ── ir_trainsets_emu ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ir_trainsets_emu (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  emu_type     TEXT,
  builder      TEXT,
  introduced   TEXT,
  consist      TEXT,
  capacity     TEXT,
  max_speed_kmh TEXT,
  traction     TEXT,
  routes       TEXT,
  gauge        TEXT,
  source_file  TEXT,
  source_sheet TEXT,
  department   TEXT DEFAULT 'TRD',
  created_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ir_trainsets_emu ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_ir_emu" ON ir_trainsets_emu;
CREATE POLICY "public_ir_emu" ON ir_trainsets_emu FOR ALL USING (true) WITH CHECK (true);

-- ── trd_assets ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trd_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code   TEXT UNIQUE,
  asset_name   TEXT NOT NULL,
  asset_type   TEXT,
  station_name TEXT,
  station_code TEXT,
  division     TEXT,
  zone         TEXT,
  status       TEXT DEFAULT 'Available',
  source_file  TEXT,
  source_sheet TEXT,
  department   TEXT DEFAULT 'TRD',
  created_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE trd_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_trd_assets" ON trd_assets;
CREATE POLICY "public_trd_assets" ON trd_assets FOR ALL USING (true) WITH CHECK (true);

-- ── department_machines (missing, needed by DepartmentDashboard) ──
CREATE TABLE IF NOT EXISTS department_machines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id    TEXT UNIQUE,
  machine_name  TEXT NOT NULL,
  machine_type  TEXT,
  department    TEXT,
  zone          TEXT,
  division      TEXT,
  station_name  TEXT,
  station_code  TEXT,
  status        TEXT DEFAULT 'Operational',
  loco_class    TEXT,
  traction      TEXT,
  gauge         TEXT,
  power_hp      TEXT,
  max_speed_kmh TEXT,
  source_file   TEXT,
  source_sheet  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE department_machines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_dept_machines" ON department_machines;
CREATE POLICY "public_dept_machines" ON department_machines FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS dept_machines_dept_idx ON department_machines(department);

-- ── historical_records (missing, needed by DepartmentDashboard) ──
CREATE TABLE IF NOT EXISTS historical_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id          TEXT,
  department        TEXT,
  station_name      TEXT,
  station_code      TEXT,
  planned_date      DATE,
  actual_start      TIMESTAMPTZ,
  actual_end        TIMESTAMPTZ,
  duration_mins     INTEGER,
  delay_mins        INTEGER DEFAULT 0,
  completion_status TEXT DEFAULT 'Completed',
  crew_count        INTEGER,
  notes             TEXT,
  source_file       TEXT,
  source_sheet      TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE historical_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_hist_records" ON historical_records;
CREATE POLICY "public_hist_records" ON historical_records FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS hist_records_dept_idx ON historical_records(department);

-- ── RLS for stations (ensure permissive) ─────────────────────
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public stations" ON stations;
CREATE POLICY "Allow public stations" ON stations FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS stations_code_idx  ON stations(station_code);
CREATE INDEX IF NOT EXISTS stations_zone_idx  ON stations(zone_code);
CREATE INDEX IF NOT EXISTS stations_state_idx ON stations(state);
