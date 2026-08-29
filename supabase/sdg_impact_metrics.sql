-- ==============================================================================
-- GlobeSkill - UN Sustainable Development Goals (SDGs) Impact Analytics
-- ==============================================================================
-- Target Goals:
--   1. SDG 4: Quality Education
--      Ensure inclusive and equitable quality education and promote lifelong learning.
--   2. SDG 8: Decent Work & Economic Growth
--      Promote sustained, inclusive economic growth and decent work for youth.
--   3. SDG 9: Industry, Innovation & Infrastructure
--      Foster innovation and track geographic skilling across Tier 2 & Tier 3 regional hubs.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. REGIONAL HUBS INFRASTRUCTURE (For Tier 2 & Tier 3 Hub Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regional_hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_name TEXT NOT NULL UNIQUE,
    location_city TEXT NOT NULL,
    state_region TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    hub_tier TEXT NOT NULL CHECK (hub_tier IN ('Tier 1 Metro', 'Tier 2 Emerging City', 'Tier 3 Rural District', 'Vocational Training Center')),
    broadband_connectivity TEXT NOT NULL DEFAULT 'Fiber Optic High-Speed',
    workstations_count INT DEFAULT 40 CHECK (workstations_count > 0),
    established_date DATE DEFAULT '2025-01-01',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed Regional Tier 2 & Tier 3 Skilling Hubs
INSERT INTO public.regional_hubs (hub_name, location_city, state_region, country, hub_tier, broadband_connectivity, workstations_count)
VALUES
('Lincoln Community Tech Hub', 'Lincoln', 'Nebraska', 'United States', 'Tier 2 Emerging City', 'High-Speed Fiber', 50),
('Nairobi Youth Digital Lab', 'Nairobi', 'Nairobi County', 'Kenya', 'Tier 2 Emerging City', 'Fiber & Satellite Backup', 60),
('Oakland Tech Bridge', 'Oakland', 'California', 'United States', 'Tier 2 Emerging City', 'Municipal Fiber', 45),
('Jaipur Innovation Center', 'Jaipur', 'Rajasthan', 'India', 'Tier 2 Emerging City', 'Optical Fiber Gigabit', 75),
('Coimbatore Skills Academy', 'Coimbatore', 'Tamil Nadu', 'India', 'Tier 2 Emerging City', 'Dedicated Leased Line', 65),
('Vidarbha Rural Learning Hub', 'Amravati', 'Maharashtra', 'India', 'Tier 3 Rural District', 'Satellite & 5G Fixed Wireless', 35),
('Dharwad Vocational Tech Institute', 'Dharwad', 'Karnataka', 'India', 'Tier 3 Rural District', 'Rural Fiber Network', 40),
('Sundarbans Community Skilling Lab', 'Gosaba', 'West Bengal', 'India', 'Tier 3 Rural District', 'Solar-Powered VSAT & 4G', 25)
ON CONFLICT (hub_name) DO UPDATE SET
    location_city = EXCLUDED.location_city,
    hub_tier = EXCLUDED.hub_tier,
    workstations_count = EXCLUDED.workstations_count;

-- Link Profiles to Regional Hubs if not already mapped
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS hub_id UUID REFERENCES public.regional_hubs(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 2. VIEW: sdg_4_metrics (Quality Education)
-- ------------------------------------------------------------------------------
-- Tracks total learners trained, digital courses completed, total hours, and pass rates.
CREATE OR REPLACE VIEW public.sdg_4_metrics AS
SELECT
    -- Total unique students who have enrolled in skilling tracks
    COUNT(DISTINCT se.student_id) AS total_learners_trained,
    
    -- Total active course enrollments
    COUNT(se.id) AS total_course_enrollments,
    
    -- Total digital course completions (Graduated)
    COUNT(se.id) FILTER (WHERE se.status = 'completed') AS digital_courses_completed,
    
    -- Active in-progress learners currently engaged
    COUNT(se.id) FILTER (WHERE se.status = 'in_progress') AS active_learners_in_progress,
    
    -- Distinct accredited courses delivered
    COUNT(DISTINCT se.project_id) AS accredited_curriculums_delivered,
    
    -- Total estimated training duration delivered in weeks
    COALESCE(SUM(tp.duration_weeks) FILTER (WHERE se.status = 'completed'), 0) AS total_training_weeks_completed,
    
    -- Average assessment score across all student evaluations
    COALESCE(ROUND(AVG(sa.score_percentage), 2), 0.00) AS avg_assessment_score_percentage,
    
    -- Assessment pass rate
    COALESCE(
        ROUND(
            (COUNT(sa.id) FILTER (WHERE sa.passed = true)::numeric / NULLIF(COUNT(sa.id), 0)::numeric) * 100,
            2
        ),
        0.00
    ) AS assessment_pass_rate_percentage,
    
    -- Overall completion rate
    COALESCE(
        ROUND(
            (COUNT(se.id) FILTER (WHERE se.status = 'completed')::numeric / NULLIF(COUNT(se.id), 0)::numeric) * 100,
            2
        ),
        0.00
    ) AS overall_completion_rate_percentage,
    
    -- Timestamp of view query
    now() AS last_aggregated_at
FROM public.student_enrolments se
LEFT JOIN public.training_projects tp ON tp.id = se.project_id
LEFT JOIN public.assessments a ON a.project_id = tp.id
LEFT JOIN public.student_attempts sa ON sa.assessment_id = a.id AND sa.student_id = se.student_id;

-- ------------------------------------------------------------------------------
-- 3. VIEW: sdg_8_metrics (Decent Work & Economic Growth)
-- ------------------------------------------------------------------------------
-- Tracks youth graduated, job-ready credentials issued, and industry transition readiness.
CREATE OR REPLACE VIEW public.sdg_8_metrics AS
SELECT
    -- Total youth who achieved graduation status
    COUNT(DISTINCT se.student_id) FILTER (WHERE se.status = 'completed') AS graduated_youth_count,
    
    -- Total tamper-evident digital certificates issued
    COUNT(se.certificate_url) FILTER (WHERE se.certificate_url IS NOT NULL) AS job_ready_credentials_issued,
    
    -- Graduates from high-growth industry tracks (AI, Cloud, Full-Stack Web)
    COUNT(DISTINCT se.student_id) FILTER (
        WHERE se.status = 'completed' AND tp.category IN ('Artificial Intelligence', 'Cloud Engineering', 'Web Development', 'Data Science')
    ) AS high_growth_tech_graduates,
    
    -- Youth transitioned to active employment tracks / job-ready status (100% completion)
    COUNT(DISTINCT se.student_id) FILTER (WHERE se.progress_percentage = 100) AS employment_ready_candidates,
    
    -- Average duration in weeks invested by youth to achieve industry certification
    COALESCE(ROUND(AVG(tp.duration_weeks) FILTER (WHERE se.status = 'completed'), 1), 0.0) AS avg_weeks_to_graduation,
    
    -- Total active industry mentors & certified trainers supervising cohorts
    (SELECT COUNT(id) FROM public.profiles WHERE role = 'Trainer' AND is_verified = true) AS active_industry_mentors,
    
    -- Youth Economic Mobility Readiness Index (0 to 100 scale)
    COALESCE(
        ROUND(
            (COUNT(se.id) FILTER (WHERE se.status = 'completed' AND se.progress_percentage = 100)::numeric / 
             NULLIF(COUNT(se.id), 0)::numeric) * 100,
            2
        ),
        0.00
    ) AS youth_economic_readiness_index,
    
    now() AS last_aggregated_at
FROM public.student_enrolments se
JOIN public.training_projects tp ON tp.id = se.project_id;

-- ------------------------------------------------------------------------------
-- 4. VIEW: sdg_9_metrics (Industry, Innovation & Infrastructure)
-- ------------------------------------------------------------------------------
-- Tracks geographic distribution of learners across regional Tier 2/3 hubs and tech infrastructure.
CREATE OR REPLACE VIEW public.sdg_9_metrics AS
SELECT
    rh.id AS hub_id,
    rh.hub_name,
    rh.location_city,
    rh.state_region,
    rh.country,
    rh.hub_tier,
    rh.broadband_connectivity,
    rh.workstations_count,
    
    -- Total learners registered under this regional hub
    COUNT(DISTINCT p.id) AS registered_learners,
    
    -- Course enrollments initiated from this hub
    COUNT(DISTINCT se.id) AS hub_enrollments,
    
    -- Youth graduated with certificates from this hub
    COUNT(DISTINCT se.id) FILTER (WHERE se.status = 'completed') AS hub_graduated_count,
    
    -- Advanced innovation tracks completed at this hub (AI, Cloud, Data)
    COUNT(DISTINCT se.id) FILTER (
        WHERE se.status = 'completed' AND tp.category IN ('Artificial Intelligence', 'Cloud Engineering', 'Data Science')
    ) AS innovation_credentials_earned,
    
    -- Digital infrastructure capacity utilization (learners / workstations)
    COALESCE(
        ROUND(
            (COUNT(DISTINCT p.id)::numeric / NULLIF(rh.workstations_count, 0)::numeric) * 100,
            1
        ),
        0.0
    ) AS hub_workstation_utilization_percentage,
    
    now() AS last_aggregated_at
FROM public.regional_hubs rh
LEFT JOIN public.profiles p ON p.hub_id = rh.id OR p.organization = rh.hub_name
LEFT JOIN public.student_enrolments se ON se.student_id = p.id
LEFT JOIN public.training_projects tp ON tp.id = se.project_id
GROUP BY 
    rh.id,
    rh.hub_name,
    rh.location_city,
    rh.state_region,
    rh.country,
    rh.hub_tier,
    rh.broadband_connectivity,
    rh.workstations_count
ORDER BY 
    registered_learners DESC,
    hub_graduated_count DESC;

-- ------------------------------------------------------------------------------
-- 5. ACCESS PERMISSIONS & SECURITY
-- ------------------------------------------------------------------------------
-- Grant read permissions on SDG views to authenticated staff & public impact dashboards
GRANT SELECT ON public.regional_hubs TO authenticated, anon;
GRANT SELECT ON public.sdg_4_metrics TO authenticated, anon;
GRANT SELECT ON public.sdg_8_metrics TO authenticated, anon;
GRANT SELECT ON public.sdg_9_metrics TO authenticated, anon;
