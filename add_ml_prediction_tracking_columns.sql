-- ====================================================
-- ADD SENT_TO_ML_PREDICTION TRACKING COLUMNS MIGRATION
-- Enables explicit request-by-request forwarding to ML Predictions
-- ====================================================

-- 1. TRACK REQUESTS TABLE
ALTER TABLE public.track_requests 
ADD COLUMN IF NOT EXISTS sent_to_ml_prediction BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ml_prediction_sent_at TIMESTAMPTZ;

-- 2. ST REQUESTS TABLE
ALTER TABLE public.st_requests 
ADD COLUMN IF NOT EXISTS sent_to_ml_prediction BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ml_prediction_sent_at TIMESTAMPTZ;

-- 3. TRD REQUESTS TABLE
ALTER TABLE public.trd_requests 
ADD COLUMN IF NOT EXISTS sent_to_ml_prediction BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ml_prediction_sent_at TIMESTAMPTZ;

-- 4. AI PLANNER REQUESTS TABLE
ALTER TABLE public.ai_planner_requests 
ADD COLUMN IF NOT EXISTS sent_to_ml_prediction BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ml_prediction_sent_at TIMESTAMPTZ;

-- 5. WORK REQUESTS TABLE
ALTER TABLE public.work_requests 
ADD COLUMN IF NOT EXISTS sent_to_ml_prediction BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ml_prediction_sent_at TIMESTAMPTZ;

-- Update RLS policies to allow update permissions for sent_to_ml_prediction
CREATE POLICY "Allow public update sent_to_ml_prediction track" ON public.track_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update sent_to_ml_prediction st" ON public.st_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update sent_to_ml_prediction trd" ON public.trd_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update sent_to_ml_prediction ai" ON public.ai_planner_requests FOR UPDATE USING (true) WITH CHECK (true);
