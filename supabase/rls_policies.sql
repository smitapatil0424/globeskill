-- ==============================================================================
-- GlobeSkill - Row Level Security (RLS) Policies
-- ==============================================================================
-- Core Objectives:
--   1. Enable RLS on all sensitive tables (profiles, enrolments, donations, projects).
--   2. Students: Only view/edit their own profile and enrolment records.
--   3. Trainers: Read and update enrolments for courses they actively teach.
--   4. NGO Administrators: Complete full access (ALL: SELECT, INSERT, UPDATE, DELETE).
--   5. Donors: View their own donation history.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Enable RLS on All Tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- STEP 2: Administrative Helper Function (Prevents RLS Recursion)
-- ------------------------------------------------------------------------------
-- A SECURITY DEFINER function bypasses RLS while checking admin status,
-- preventing infinite recursion when querying public.profiles inside a policy.
CREATE OR REPLACE FUNCTION public.is_ngo_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND role = 'NGO Administrator'
    );
$$;

-- Helper to check if user is a Trainer
CREATE OR REPLACE FUNCTION public.is_trainer()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND role = 'Trainer'
    );
$$;

-- ------------------------------------------------------------------------------
-- STEP 3: PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Drop existing policies to allow clean re-application
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 1. NGO Admins have full access to all profiles
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.is_ngo_admin())
    WITH CHECK (public.is_ngo_admin());

-- 2. Users (Students, Trainers, Donors) can view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- STEP 4: STUDENT_ENROLMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to enrolments" ON public.student_enrolments;
DROP POLICY IF EXISTS "Students can view their own enrolments" ON public.student_enrolments;
DROP POLICY IF EXISTS "Students can enrol themselves" ON public.student_enrolments;
DROP POLICY IF EXISTS "Trainers can view enrolments for their courses" ON public.student_enrolments;
DROP POLICY IF EXISTS "Trainers can update enrolments for their courses" ON public.student_enrolments;

-- 1. NGO Admins have full access to all enrolments
CREATE POLICY "Admins have full access to enrolments"
    ON public.student_enrolments
    FOR ALL
    TO authenticated
    USING (public.is_ngo_admin())
    WITH CHECK (public.is_ngo_admin());

-- 2. Students can only view their own enrolment records
CREATE POLICY "Students can view their own enrolments"
    ON public.student_enrolments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);

-- 3. Students can enroll themselves into a project
CREATE POLICY "Students can enrol themselves"
    ON public.student_enrolments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

-- 4. Trainers can read enrolment records for courses they teach
CREATE POLICY "Trainers can view enrolments for their courses"
    ON public.student_enrolments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.training_projects tp
            WHERE tp.id = student_enrolments.project_id
              AND tp.trainer_id = auth.uid()
        )
    );

-- 5. Trainers can update student progress for courses they teach
CREATE POLICY "Trainers can update enrolments for their courses"
    ON public.student_enrolments
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.training_projects tp
            WHERE tp.id = student_enrolments.project_id
              AND tp.trainer_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.training_projects tp
            WHERE tp.id = student_enrolments.project_id
              AND tp.trainer_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- STEP 5: DONATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can submit a donation" ON public.donations;

-- 1. NGO Admins have full access to all donation transactions
CREATE POLICY "Admins have full access to donations"
    ON public.donations
    FOR ALL
    TO authenticated
    USING (public.is_ngo_admin())
    WITH CHECK (public.is_ngo_admin());

-- 2. Donors can view their own donation history
CREATE POLICY "Donors can view their own donations"
    ON public.donations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = donor_id);

-- 3. Anyone (authenticated or public) can submit a new donation
CREATE POLICY "Anyone can submit a donation"
    ON public.donations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- STEP 6: TRAINING_PROJECTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to training projects" ON public.training_projects;
DROP POLICY IF EXISTS "Public can view active training projects" ON public.training_projects;
DROP POLICY IF EXISTS "Trainers can view and update their own projects" ON public.training_projects;

-- 1. NGO Admins have full access to all training tracks
CREATE POLICY "Admins have full access to training projects"
    ON public.training_projects
    FOR ALL
    TO authenticated
    USING (public.is_ngo_admin())
    WITH CHECK (public.is_ngo_admin());

-- 2. Public and students can view active projects
CREATE POLICY "Public can view active training projects"
    ON public.training_projects
    FOR SELECT
    TO anon, authenticated
    USING (status = 'active');

-- 3. Trainers can view and update courses they are assigned to
CREATE POLICY "Trainers can view and update their own projects"
    ON public.training_projects
    FOR ALL
    TO authenticated
    USING (auth.uid() = trainer_id)
    WITH CHECK (auth.uid() = trainer_id);
