-- ====================================================================
-- TRACKIQ AI - INDIAN RAILWAYS SUPABASE DATABASE SCHEMA
-- Full relational schema for Stations, Assets, Requests, Schedules,
-- Approvals, Execution Monitor, ML Models, Predictions, AI Logs, Reports
-- ====================================================================

-- 1. DEPARTMENTS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dept_code VARCHAR(50) UNIQUE NOT NULL,
    dept_name VARCHAR(255) NOT NULL,
    description TEXT,
    head_officer VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.departments (dept_code, dept_name, description)
VALUES 
    ('TMD', 'Track Management', 'Civil engineering, track maintenance, tamping & ballast cleaning'),
    ('SNT', 'Signal & Telecommunication', 'Signalling systems, interlocking, Kavach ATP & telecom infrastructure'),
    ('TRD', 'Traction Distribution', '25kV AC overhead electrification, substations & tower wagons')
ON CONFLICT (dept_code) DO NOTHING;

-- 2. STATIONS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    station_code VARCHAR(50) UNIQUE NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    zone_code VARCHAR(50),
    zone_name VARCHAR(255),
    division VARCHAR(255),
    state VARCHAR(255),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    google_maps_url TEXT,
    station_tier VARCHAR(100) DEFAULT 'Standard',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. UNIFIED ASSETS & DEPARTMENT SPECIFIC ASSET TABLES
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_code VARCHAR(100) UNIQUE NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    station_code VARCHAR(50) REFERENCES public.stations(station_code) ON DELETE SET NULL,
    station_name VARCHAR(255),
    division VARCHAR(255),
    zone VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Available',
    health_score NUMERIC(5,2) DEFAULT 95.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tmd_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_code VARCHAR(100) UNIQUE NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    station_code VARCHAR(50) REFERENCES public.stations(station_code) ON DELETE SET NULL,
    station_name VARCHAR(255),
    division VARCHAR(255),
    zone VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Available',
    health_score NUMERIC(5,2) DEFAULT 95.0,
    last_maintained TIMESTAMPTZ,
    next_maintenance_due TIMESTAMPTZ,
    specifications JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.st_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_code VARCHAR(100) UNIQUE NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    station_code VARCHAR(50) REFERENCES public.stations(station_code) ON DELETE SET NULL,
    station_name VARCHAR(255),
    division VARCHAR(255),
    zone VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Operational',
    health_score NUMERIC(5,2) DEFAULT 98.0,
    kavach_status VARCHAR(50) DEFAULT 'Fitted',
    signalling_type VARCHAR(100),
    specifications JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trd_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_code VARCHAR(100) UNIQUE NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    station_code VARCHAR(50) REFERENCES public.stations(station_code) ON DELETE SET NULL,
    station_name VARCHAR(255),
    division VARCHAR(255),
    zone VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Energized',
    voltage_kv NUMERIC(5,2) DEFAULT 25.0,
    health_score NUMERIC(5,2) DEFAULT 96.5,
    specifications JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EQUIPMENT & HEAVY MACHINES
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_code VARCHAR(100) UNIQUE NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    machine_category VARCHAR(100) NOT NULL,
    home_depot VARCHAR(255),
    current_station VARCHAR(255),
    zone VARCHAR(100),
    division VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Operational',
    next_available_time TIMESTAMPTZ DEFAULT NOW(),
    operator_in_charge VARCHAR(255),
    contact_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.department_machines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_code VARCHAR(100) UNIQUE NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    machine_category VARCHAR(100) NOT NULL,
    home_depot VARCHAR(255),
    current_station VARCHAR(255),
    zone VARCHAR(100),
    division VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Operational',
    next_available_time TIMESTAMPTZ DEFAULT NOW(),
    operator_in_charge VARCHAR(255),
    contact_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORK & MAINTENANCE REQUESTS
CREATE TABLE IF NOT EXISTS public.work_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    station_code VARCHAR(50),
    station_name VARCHAR(255),
    division VARCHAR(255),
    zone VARCHAR(100),
    problem_description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'Medium',
    safety_criticality VARCHAR(50) DEFAULT 'High',
    duration_mins INT NOT NULL DEFAULT 120,
    resources_required TEXT,
    requested_window VARCHAR(100),
    requested_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending Approval',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tmd_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) DEFAULT 'Track Management',
    asset_name VARCHAR(255) NOT NULL,
    station_code VARCHAR(50),
    station_name VARCHAR(255),
    division VARCHAR(255),
    zone VARCHAR(100),
    problem_description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'Medium',
    safety_criticality VARCHAR(50) DEFAULT 'High',
    duration_mins INT NOT NULL DEFAULT 120,
    resources_required TEXT,
    requested_window VARCHAR(100),
    requested_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending Approval',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.st_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) DEFAULT 'Signal & Telecommunication',
    asset_name VARCHAR(255) NOT NULL,
    station_code VARCHAR(50),
    station_name VARCHAR(255),
    division VARCHAR(255),
    zone VARCHAR(100),
    problem_description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'High',
    safety_criticality VARCHAR(50) DEFAULT 'Critical',
    duration_mins INT NOT NULL DEFAULT 90,
    resources_required TEXT,
    requested_window VARCHAR(100),
    requested_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending Approval',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trd_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) DEFAULT 'Traction Distribution',
    asset_name VARCHAR(255) NOT NULL,
    station_code VARCHAR(50),
    station_name VARCHAR(255),
    division VARCHAR(255),
    zone VARCHAR(100),
    problem_description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'Medium',
    safety_criticality VARCHAR(50) DEFAULT 'High',
    duration_mins INT NOT NULL DEFAULT 150,
    resources_required TEXT,
    requested_window VARCHAR(100),
    requested_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending Approval',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BLOCK REQUESTS & OPTIMIZED BLOCK SCHEDULES
CREATE TABLE IF NOT EXISTS public.block_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    station_code VARCHAR(50),
    station_name VARCHAR(255),
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    duration_mins INT,
    requested_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.optimized_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    block_id VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) DEFAULT 'Multi-Department',
    station VARCHAR(255) NOT NULL,
    station_code VARCHAR(50),
    zone VARCHAR(100),
    division VARCHAR(100),
    corridor VARCHAR(255),
    planning_date DATE DEFAULT CURRENT_DATE,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    duration_minutes INT NOT NULL,
    jobs_count INT DEFAULT 1,
    track_jobs INT DEFAULT 0,
    st_jobs INT DEFAULT 0,
    trd_jobs INT DEFAULT 0,
    train_impact VARCHAR(255),
    delay_risk NUMERIC(5,2) DEFAULT 11.2,
    confidence NUMERIC(5,2) DEFAULT 96.5,
    asset_availability_gain NUMERIC(5,2) DEFAULT 22.0,
    status VARCHAR(50) DEFAULT 'Scheduled',
    merged_jobs JSONB,
    schedule_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.block_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    block_id VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) DEFAULT 'Multi-Department',
    station VARCHAR(255) NOT NULL,
    station_code VARCHAR(50),
    planning_date DATE DEFAULT CURRENT_DATE,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. APPROVAL WORKFLOW
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    approval_id VARCHAR(100) UNIQUE NOT NULL,
    request_id VARCHAR(100) NOT NULL,
    block_id VARCHAR(100),
    requester_name VARCHAR(255) NOT NULL,
    requester_department VARCHAR(100) NOT NULL,
    approver_name VARCHAR(255),
    approver_role VARCHAR(100) DEFAULT 'Sr. Divisional Engineer',
    status VARCHAR(50) DEFAULT 'Pending Review',
    rejection_reason TEXT,
    ai_confidence NUMERIC(5,2),
    approval_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    approval_id VARCHAR(100) UNIQUE NOT NULL,
    request_id VARCHAR(100) NOT NULL,
    block_id VARCHAR(100),
    requester_name VARCHAR(255) NOT NULL,
    requester_department VARCHAR(100) NOT NULL,
    approver_name VARCHAR(255),
    approver_role VARCHAR(100) DEFAULT 'Sr. Divisional Engineer / Sr. DSTE',
    status VARCHAR(50) DEFAULT 'Pending Review',
    rejection_reason TEXT,
    ai_confidence NUMERIC(5,2),
    approval_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXECUTION RECORDS & MONITORING
CREATE TABLE IF NOT EXISTS public.execution_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id VARCHAR(100) UNIQUE NOT NULL,
    block_id VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    start_timestamp TIMESTAMPTZ NOT NULL,
    estimated_end_timestamp TIMESTAMPTZ NOT NULL,
    actual_end_timestamp TIMESTAMPTZ,
    delay_mins INT DEFAULT 0,
    progress_percentage INT DEFAULT 0,
    execution_status VARCHAR(50) DEFAULT 'Active',
    safety_clearance_given BOOLEAN DEFAULT TRUE,
    work_crew_assigned INT DEFAULT 5,
    live_logs JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.execution_monitor (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id VARCHAR(100) UNIQUE NOT NULL,
    block_id VARCHAR(100) REFERENCES public.optimized_blocks(block_id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    start_timestamp TIMESTAMPTZ NOT NULL,
    estimated_end_timestamp TIMESTAMPTZ NOT NULL,
    actual_end_timestamp TIMESTAMPTZ,
    progress_percentage INT DEFAULT 0,
    execution_status VARCHAR(50) DEFAULT 'Active',
    safety_clearance_given BOOLEAN DEFAULT TRUE,
    work_crew_assigned INT DEFAULT 5,
    live_logs JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. HISTORICAL OPERATIONS & OUTCOMES
CREATE TABLE IF NOT EXISTS public.historical_operations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id VARCHAR(100) UNIQUE NOT NULL,
    event_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    station_name VARCHAR(255),
    station_code VARCHAR(50),
    asset_name VARCHAR(255),
    event_title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Completed',
    scheduled_duration_mins INT,
    actual_duration_mins INT,
    delay_mins INT DEFAULT 0,
    risk_outcome VARCHAR(50),
    congestion_level VARCHAR(50),
    source_sheet VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.historical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id VARCHAR(100) UNIQUE NOT NULL,
    event_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    station_name VARCHAR(255),
    station_code VARCHAR(50),
    asset_name VARCHAR(255),
    event_title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Completed',
    metric_name VARCHAR(100),
    metric_value VARCHAR(100),
    source_sheet VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ML MODELS REGISTRY & ML PREDICTIONS Persistent Table
CREATE TABLE IF NOT EXISTS public.ml_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    target_variable VARCHAR(100) NOT NULL,
    features_used JSONB,
    evaluation_metrics JSONB,
    dataset_size INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Trained',
    trained_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ml_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prediction_id VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    station VARCHAR(255),
    station_code VARCHAR(50),
    department VARCHAR(100),
    asset_name VARCHAR(255),
    input_reference JSONB,
    predicted_value VARCHAR(255) NOT NULL,
    predicted_numeric NUMERIC(10,2),
    confidence_score NUMERIC(5,2),
    risk_category VARCHAR(50),
    prediction_status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AI REQUESTS & AI RESPONSES LOGS
CREATE TABLE IF NOT EXISTS public.ai_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id VARCHAR(100) UNIQUE NOT NULL,
    user_prompt TEXT NOT NULL,
    provider VARCHAR(50) DEFAULT 'Unified',
    context_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    response_id VARCHAR(100) UNIQUE NOT NULL,
    request_id VARCHAR(100) REFERENCES public.ai_requests(request_id) ON DELETE CASCADE,
    provider_used VARCHAR(50) NOT NULL,
    response_text TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    generated_by VARCHAR(255) DEFAULT 'System Admin',
    period_start DATE,
    period_end DATE,
    summary JSONB,
    download_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. EMAIL AUTOMATION LOGS
CREATE TABLE IF NOT EXISTS public.email_automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id VARCHAR(100) UNIQUE NOT NULL,
    request_id VARCHAR(100),
    block_id VARCHAR(100),
    department VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    email_subject VARCHAR(255) NOT NULL,
    email_type VARCHAR(100) DEFAULT 'Block Approval Request',
    email_status VARCHAR(50) DEFAULT 'Sent',
    sent_timestamp TIMESTAMPTZ DEFAULT NOW(),
    ai_generated_message TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DEPARTMENT WORK DETAILS (For Track, S&T, TRD Sub-Head Apps)
CREATE TABLE IF NOT EXISTS public.department_work_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id VARCHAR(100) UNIQUE NOT NULL,
    request_id VARCHAR(100),
    department VARCHAR(50) NOT NULL CHECK (department IN ('TRACK', 'S&T', 'TRD')),
    work_category VARCHAR(150),
    work_description TEXT,
    asset_equipment VARCHAR(200),
    location VARCHAR(200),
    km_chainage VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'NORMAL',
    requested_date DATE,
    requested_start_time TIME,
    estimated_duration INT,
    assigned_workers INT DEFAULT 0,
    safety_requirements TEXT,
    materials_tools TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. OFFICER APPROVAL DETAILS (Independent Trace History)
CREATE TABLE IF NOT EXISTS public.officer_approval_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id VARCHAR(100) NOT NULL,
    request_id VARCHAR(100),
    department VARCHAR(50) NOT NULL CHECK (department IN ('TRACK', 'S&T', 'TRD')),
    approval_status VARCHAR(50) NOT NULL,
    approved_by VARCHAR(200) NOT NULL,
    officer_id VARCHAR(100),
    approval_date DATE DEFAULT CURRENT_DATE,
    approval_time TIME DEFAULT CURRENT_TIME,
    approval_remarks TEXT,
    approval_action VARCHAR(100),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. EXECUTION WORK DETAILS (Field Monitoring Telemetry)
CREATE TABLE IF NOT EXISTS public.execution_work_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id VARCHAR(100) UNIQUE NOT NULL,
    request_id VARCHAR(100),
    department VARCHAR(50) NOT NULL CHECK (department IN ('TRACK', 'S&T', 'TRD')),
    execution_status VARCHAR(50) DEFAULT 'Pending',
    progress_percentage INT DEFAULT 0,
    assigned_worker_count INT DEFAULT 0,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    delay_status VARCHAR(50) DEFAULT 'On Time',
    delay_reason TEXT,
    issues TEXT,
    safety_status VARCHAR(100) DEFAULT 'Safe',
    materials_used TEXT,
    execution_remarks TEXT,
    completion_notes TEXT,
    sent_to_execution_monitor_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
