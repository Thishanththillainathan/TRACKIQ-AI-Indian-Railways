-- ====================================================
-- LEARNING LOOP INSIGHTS TABLE MIGRATION
-- Stores analyzer learning loop recommendations & historical insights
-- ====================================================

CREATE TABLE IF NOT EXISTS public.learning_loop_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT,
    block_id TEXT,
    department TEXT,
    station_code TEXT,
    station_name TEXT,
    planned_value TEXT,
    actual_value TEXT,
    planned_duration NUMERIC,
    actual_duration NUMERIC,
    time_variance NUMERIC,
    performance_percentage NUMERIC,
    delay_category TEXT,
    observed_pattern TEXT,
    root_cause TEXT,
    learning_insight TEXT NOT NULL,
    recommended_adjustment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and add public access policies
ALTER TABLE public.learning_loop_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select learning_loop_insights" ON public.learning_loop_insights;
DROP POLICY IF EXISTS "Allow public insert learning_loop_insights" ON public.learning_loop_insights;
DROP POLICY IF EXISTS "Allow public update learning_loop_insights" ON public.learning_loop_insights;
DROP POLICY IF EXISTS "Allow public delete learning_loop_insights" ON public.learning_loop_insights;

CREATE POLICY "Allow public select learning_loop_insights" ON public.learning_loop_insights FOR SELECT USING (true);
CREATE POLICY "Allow public insert learning_loop_insights" ON public.learning_loop_insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update learning_loop_insights" ON public.learning_loop_insights FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete learning_loop_insights" ON public.learning_loop_insights FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_learning_loop_insights_dept ON public.learning_loop_insights(department);
CREATE INDEX IF NOT EXISTS idx_learning_loop_insights_station ON public.learning_loop_insights(station_code);
