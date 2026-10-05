-- ====================================================
-- PLANNED & ACTUAL EXECUTION DATA TABLES MIGRATION
-- Establishes strict separation between Planned Data and Actual Data
-- ====================================================

-- 1. PLANNED EXECUTION DATA TABLE
CREATE TABLE IF NOT EXISTS public.planned_execution_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT NOT NULL,
    activity_id TEXT,
    station_id TEXT,
    station_name TEXT NOT NULL,
    station_code TEXT,
    block_id TEXT,
    maintenance_type TEXT NOT NULL,
    planned_start_time TEXT,
    planned_end_time TEXT,
    planned_duration NUMERIC NOT NULL DEFAULT 60,
    planned_resource TEXT,
    planned_team TEXT,
    planned_status TEXT DEFAULT 'Planned',
    planned_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTUAL EXECUTION DATA TABLE
CREATE TABLE IF NOT EXISTS public.actual_execution_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT NOT NULL,
    activity_id TEXT,
    station_id TEXT,
    station_name TEXT NOT NULL,
    station_code TEXT,
    block_id TEXT,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    actual_duration NUMERIC,
    actual_status TEXT DEFAULT 'Ready',
    failure_confirmed BOOLEAN DEFAULT FALSE,
    problem_found TEXT,
    action_taken TEXT,
    delay_minutes NUMERIC DEFAULT 0,
    actual_resource TEXT,
    actual_team TEXT,
    actual_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and add policies
ALTER TABLE public.planned_execution_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actual_execution_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select planned_execution_data" ON public.planned_execution_data;
DROP POLICY IF EXISTS "Allow public insert planned_execution_data" ON public.planned_execution_data;
DROP POLICY IF EXISTS "Allow public update planned_execution_data" ON public.planned_execution_data;
DROP POLICY IF EXISTS "Allow public delete planned_execution_data" ON public.planned_execution_data;

CREATE POLICY "Allow public select planned_execution_data" ON public.planned_execution_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert planned_execution_data" ON public.planned_execution_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update planned_execution_data" ON public.planned_execution_data FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete planned_execution_data" ON public.planned_execution_data FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select actual_execution_data" ON public.actual_execution_data;
DROP POLICY IF EXISTS "Allow public insert actual_execution_data" ON public.actual_execution_data;
DROP POLICY IF EXISTS "Allow public update actual_execution_data" ON public.actual_execution_data;
DROP POLICY IF EXISTS "Allow public delete actual_execution_data" ON public.actual_execution_data;

CREATE POLICY "Allow public select actual_execution_data" ON public.actual_execution_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert actual_execution_data" ON public.actual_execution_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update actual_execution_data" ON public.actual_execution_data FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete actual_execution_data" ON public.actual_execution_data FOR DELETE USING (true);

-- Indexes for request_id & block_id lookup
CREATE INDEX IF NOT EXISTS idx_planned_exec_req_id ON public.planned_execution_data(request_id);
CREATE INDEX IF NOT EXISTS idx_planned_exec_block_id ON public.planned_execution_data(block_id);
CREATE INDEX IF NOT EXISTS idx_actual_exec_req_id ON public.actual_execution_data(request_id);
CREATE INDEX IF NOT EXISTS idx_actual_exec_block_id ON public.actual_execution_data(block_id);
