-- ==========================================
-- FILE: schema.sql
-- ==========================================
-- ==============================================================================
-- GlobeSkill - Supabase PostgreSQL Database Schema (DDL)
-- ==============================================================================
-- Description: Core schema for NGO Skilling Platform
-- Tables:
--   1. profiles (Students, Trainers, Volunteers, Donors, NGO Admins)
--   2. training_projects (Curriculum tracks like IBM SkillsBuild)
--   3. student_enrolments (Student course progress & lifecycle)
--   4. donations (Financial transactions & donor tracking)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'Student', 
        'Trainer', 
        'Volunteer', 
        'Donor', 
        'NGO Administrator'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'draft', 
        'active', 
        'completed', 
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enrolment_status AS ENUM (
        'enrolled', 
        'in_progress', 
        'completed', 
        'dropped'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE donation_status AS ENUM (
        'pending', 
        'succeeded', 
        'failed', 
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- TABLE 1: PROFILES
-- ==============================================================================
-- Extends Supabase auth.users with domain-specific metadata and role access.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'Student',
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    organization TEXT,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- ==============================================================================
-- TABLE 2: TRAINING_PROJECTS
-- ==============================================================================
-- Stores educational tracks and partner programs (e.g., IBM SkillsBuild).
CREATE TABLE IF NOT EXISTS public.training_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    partner_organization TEXT DEFAULT 'IBM SkillsBuild' NOT NULL,
    category TEXT NOT NULL, -- e.g. 'Artificial Intelligence', 'Web Development', 'Cloud'
    difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    duration_weeks INT DEFAULT 4 NOT NULL CHECK (duration_weeks > 0),
    max_capacity INT CHECK (max_capacity IS NULL OR max_capacity > 0),
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status project_status DEFAULT 'active' NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT check_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Training Projects Indexes
CREATE INDEX IF NOT EXISTS idx_training_projects_status ON public.training_projects(status);
CREATE INDEX IF NOT EXISTS idx_training_projects_partner ON public.training_projects(partner_organization);
CREATE INDEX IF NOT EXISTS idx_training_projects_category ON public.training_projects(category);
CREATE INDEX IF NOT EXISTS idx_training_projects_trainer ON public.training_projects(trainer_id);

-- ==============================================================================
-- TABLE 3: STUDENT_ENROLMENTS
-- ==============================================================================
-- Links students to training projects, tracking progress and completion status.
CREATE TABLE IF NOT EXISTS public.student_enrolments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.training_projects(id) ON DELETE CASCADE,
    status enrolment_status DEFAULT 'enrolled' NOT NULL,
    progress_percentage INT DEFAULT 0 NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    completed_at TIMESTAMPTZ,
    certificate_url TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_student_project UNIQUE (student_id, project_id)
);

-- Enrolments Indexes
CREATE INDEX IF NOT EXISTS idx_enrolments_student ON public.student_enrolments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrolments_project ON public.student_enrolments(project_id);
CREATE INDEX IF NOT EXISTS idx_enrolments_status ON public.student_enrolments(status);
CREATE INDEX IF NOT EXISTS idx_enrolments_student_status ON public.student_enrolments(student_id, status);

-- ==============================================================================
-- TABLE 4: DONATIONS
-- ==============================================================================
-- Tracks donor contributions, funding amounts, and targeted impact projects.
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donor_name TEXT,
    donor_email TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    project_id UUID REFERENCES public.training_projects(id) ON DELETE SET NULL,
    payment_method TEXT DEFAULT 'stripe' NOT NULL, -- e.g. 'stripe', 'paypal', 'bank_transfer'
    payment_status donation_status DEFAULT 'succeeded' NOT NULL,
    transaction_id TEXT UNIQUE,
    receipt_url TEXT,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Donations Indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_project ON public.donations(project_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);

-- ==============================================================================
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- ==============================================================================
-- Automatically updates updated_at whenever a record changes.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_training_projects_updated_at ON public.training_projects;
CREATE TRIGGER set_training_projects_updated_at
    BEFORE UPDATE ON public.training_projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_student_enrolments_updated_at ON public.student_enrolments;
CREATE TRIGGER set_student_enrolments_updated_at
    BEFORE UPDATE ON public.student_enrolments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. AUTOMATIC USER PROFILE TRIGGER (SUPABASE AUTH SYNC)
-- ==============================================================================
-- Automatically creates a matching profile in public.profiles on new auth signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'Student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, user-only update
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Training Projects: Public can view active projects, Admins/Trainers can modify
CREATE POLICY "Active training projects are viewable by everyone" 
    ON public.training_projects FOR SELECT USING (status = 'active' OR auth.uid() = trainer_id);

-- Student Enrolments: Students can view their own enrolments
CREATE POLICY "Students can view their own enrolments" 
    ON public.student_enrolments FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can enrol themselves" 
    ON public.student_enrolments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Donations: Donors can view their donations, public can view aggregate
CREATE POLICY "Donors can view their own donations" 
    ON public.donations FOR SELECT USING (auth.uid() = donor_id);


-- ==========================================
-- FILE: auth_profile_trigger.sql
-- ==========================================
-- ==============================================================================
-- GlobeSkill - Secure Supabase Auth to Public Profile Trigger
-- ==============================================================================
-- Purpose:
--   Automatically creates a matching record in public.profiles whenever
--   a user registers through Supabase Auth (Email/Password, Google, etc.).
--
-- Security Best Practices Included:
--   1. SECURITY DEFINER: Executes with elevated privileges to insert into profiles.
--   2. SET search_path = public, auth: Guards against search_path hijacking vulnerabilities.
--   3. ON CONFLICT (id) DO NOTHING: Guarantees idempotency (prevents race condition crashes).
--   4. Exception Handling: Falls back gracefully if custom role casting fails.
-- ==============================================================================

-- Step 1: Create or Replace the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    default_role public.user_role := 'Student';
    assigned_role public.user_role;
    user_name TEXT;
BEGIN
    -- Extract full name from signup metadata or fallback to email username
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1),
        'GlobeSkill Learner'
    );

    -- Safely parse the role from user metadata
    BEGIN
        assigned_role := COALESCE(
            (NEW.raw_user_meta_data->>'role')::public.user_role,
            default_role
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- If an invalid role string was passed, safely default to 'Student'
            assigned_role := default_role;
    END;

    -- Insert into public.profiles
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        assigned_role,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = now();

    RETURN NEW;
END;
$$;

-- Step 2: Drop existing trigger if it exists to allow clean re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Attach the Trigger to auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verification comment
COMMENT ON FUNCTION public.handle_new_user() IS 
    'Syncs new auth.users accounts directly into public.profiles with role and metadata.';


-- ==========================================
-- FILE: assessments_schema_and_rls.sql
-- ==========================================
-- ==============================================================================
-- GlobeSkill - Assessments, Quiz Questions & Student Attempts Schema & RLS
-- ==============================================================================
-- Architecture:
--   1. assessments: Course-level quizzes with metadata, passing scores & timing.
--   2. quiz_questions: Questions, multiple-choice options (JSONB), and correct answers.
--   3. student_attempts: Student answer submissions, evaluated scores, pass/fail status.
--   4. RLS Policies:
--      - Students can INSERT their own attempts & SELECT their own scores.
--      - Trainers can SELECT, INSERT, UPDATE, DELETE quiz questions for their courses.
--      - NGO Administrators have full administrative access across all tables.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: assessments (Quiz Metadata & Course Associations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.training_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INT DEFAULT 70 NOT NULL CHECK (passing_score >= 0 AND passing_score <= 100),
    duration_minutes INT DEFAULT 30 CHECK (duration_minutes > 0),
    max_attempts INT DEFAULT 3 CHECK (max_attempts > 0),
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for course queries
CREATE INDEX IF NOT EXISTS idx_assessments_project_id ON public.assessments(project_id);
CREATE INDEX IF NOT EXISTS idx_assessments_is_published ON public.assessments(is_published);

-- ------------------------------------------------------------------------------
-- 2. TABLE: quiz_questions (Questions, Multiple Choice Options, Answer Keys)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL CHECK (jsonb_typeof(options) = 'array'),
    correct_option_id TEXT NOT NULL,
    explanation TEXT,
    points INT DEFAULT 1 NOT NULL CHECK (points > 0),
    order_index INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for ordering questions in an assessment
CREATE INDEX IF NOT EXISTS idx_quiz_questions_assessment_id ON public.quiz_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON public.quiz_questions(assessment_id, order_index);

-- ------------------------------------------------------------------------------
-- 3. TABLE: student_attempts (Student Answers, Evaluated Scores, Pass/Fail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_points_earned INT DEFAULT 0 NOT NULL CHECK (total_points_earned >= 0),
    total_points_possible INT DEFAULT 0 NOT NULL CHECK (total_points_possible >= 0),
    score_percentage NUMERIC(5, 2) DEFAULT 0.00 NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
    passed BOOLEAN DEFAULT false NOT NULL,
    attempt_number INT DEFAULT 1 NOT NULL CHECK (attempt_number > 0),
    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for student score retrieval and trainer cohort auditing
CREATE INDEX IF NOT EXISTS idx_student_attempts_student ON public.student_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_assessment ON public.student_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_passed ON public.student_attempts(assessment_id, passed);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) ACTIVATION
-- ------------------------------------------------------------------------------
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attempts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5. RLS POLICIES: assessments
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to assessments" ON public.assessments;
DROP POLICY IF EXISTS "Trainers can manage assessments for their courses" ON public.assessments;
DROP POLICY IF EXISTS "Enrolled students can view published assessments" ON public.assessments;

-- Admin Policy
CREATE POLICY "Admins have full access to assessments"
    ON public.assessments
    FOR ALL
    TO authenticated
    USING (public.is_ngo_admin())
    WITH CHECK (public.is_ngo_admin());

-- Trainer Policy: Can view and manage assessments for courses they supervise
CREATE POLICY "Trainers can manage assessments for their courses"
    ON public.assessments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.training_projects tp
            WHERE tp.id = assessments.project_id
              AND (tp.trainer_id = auth.uid() OR public.is_trainer())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.training_projects tp
            WHERE tp.id = assessments.project_id
              AND (tp.trainer_id = auth.uid() OR public.is_trainer())
        )
    );

-- Student Policy: Can view published assessments for courses they are enrolled in
CREATE POLICY "Enrolled students can view published assessments"
    ON public.assessments
    FOR SELECT
    TO authenticated
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM public.student_enrolments se
            WHERE se.project_id = assessments.project_id
              AND se.student_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 6. RLS POLICIES: quiz_questions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Trainers can manage quiz questions for their courses" ON public.quiz_questions;
DROP POLICY IF EXISTS "Enrolled students can view questions for active assessments" ON public.quiz_questions;

-- Admin Policy
CREATE POLICY "Admins have full access to quiz questions"
    ON public.quiz_questions
    FOR ALL
    TO authenticated
    USING (public.is_ngo_admin())
    WITH CHECK (public.is_ngo_admin());

-- Trainer Policy: Full CRUD on quiz questions for courses they teach
CREATE POLICY "Trainers can manage quiz questions for their courses"
    ON public.quiz_questions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.training_projects tp ON a.project_id = tp.id
            WHERE a.id = quiz_questions.assessment_id
              AND (tp.trainer_id = auth.uid() OR public.is_trainer())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.training_projects tp ON a.project_id = tp.id
            WHERE a.id = quiz_questions.assessment_id
              AND (tp.trainer_id = auth.uid() OR public.is_trainer())
        )
    );

-- Student Policy: Can read questions for published assessments in enrolled courses
CREATE POLICY "Enrolled students can view questions for active assessments"
    ON public.quiz_questions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.student_enrolments se ON a.project_id = se.project_id
            WHERE a.id = quiz_questions.assessment_id
              AND a.is_published = true
              AND se.student_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 7. RLS POLICIES: student_attempts
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to student attempts" ON public.student_attempts;
DROP POLICY IF EXISTS "Trainers can view attempts for their courses" ON public.student_attempts;
DROP POLICY IF EXISTS "Students can insert their own attempts" ON public.student_attempts;
DROP POLICY IF EXISTS "Students can view their own attempts and scores" ON public.student_attempts;

-- Admin Policy
CREATE POLICY "Admins have full access to student attempts"
    ON public.student_attempts
    FOR ALL
    TO authenticated
    USING (public.is_ngo_admin())
    WITH CHECK (public.is_ngo_admin());

-- Trainer Policy: Can inspect attempts for courses they supervise
CREATE POLICY "Trainers can view attempts for their courses"
    ON public.student_attempts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.training_projects tp ON a.project_id = tp.id
            WHERE a.id = student_attempts.assessment_id
              AND (tp.trainer_id = auth.uid() OR public.is_trainer())
        )
    );

-- Student Policy 1: Can insert their own quiz attempts
CREATE POLICY "Students can insert their own attempts"
    ON public.student_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = student_id AND
        EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.student_enrolments se ON a.project_id = se.project_id
            WHERE a.id = student_attempts.assessment_id
              AND se.student_id = auth.uid()
              AND a.is_published = true
        )
    );

-- Student Policy 2: Can view their own attempts and calculated scores
CREATE POLICY "Students can view their own attempts and scores"
    ON public.student_attempts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);

-- ------------------------------------------------------------------------------
-- 8. AUTOMATED SCORING ENGINE (Server-Side Evaluation Function)
-- ------------------------------------------------------------------------------
-- Calculates score server-side, preventing tamper with points or answers.
CREATE OR REPLACE FUNCTION public.evaluate_and_save_attempt(
    p_assessment_id UUID,
    p_student_id UUID,
    p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_total_points INT := 0;
    v_earned_points INT := 0;
    v_score_percentage NUMERIC(5, 2) := 0.00;
    v_passing_score INT := 70;
    v_is_passed BOOLEAN := false;
    v_attempt_num INT := 1;
    v_q RECORD;
    v_submitted_answer TEXT;
    v_new_attempt_id UUID;
BEGIN
    -- 1. Fetch assessment passing score
    SELECT passing_score INTO v_passing_score
    FROM public.assessments
    WHERE id = p_assessment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Assessment with ID % not found.', p_assessment_id;
    END IF;

    -- 2. Count prior attempts
    SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_attempt_num
    FROM public.student_attempts
    WHERE student_id = p_student_id AND assessment_id = p_assessment_id;

    -- 3. Iterate through questions and evaluate
    FOR v_q IN
        SELECT id, correct_option_id, points
        FROM public.quiz_questions
        WHERE assessment_id = p_assessment_id
    LOOP
        v_total_points := v_total_points + v_q.points;
        v_submitted_answer := p_answers->>v_q.id::text;

        IF v_submitted_answer IS NOT NULL AND v_submitted_answer = v_q.correct_option_id THEN
            v_earned_points := v_earned_points + v_q.points;
        END IF;
    END LOOP;

    -- 4. Calculate percentage & pass status
    IF v_total_points > 0 THEN
        v_score_percentage := ROUND((v_earned_points::numeric / v_total_points::numeric) * 100, 2);
    ELSE
        v_score_percentage := 0.00;
    END IF;

    v_is_passed := (v_score_percentage >= v_passing_score);

    -- 5. Insert record into student_attempts
    INSERT INTO public.student_attempts (
        student_id,
        assessment_id,
        answers,
        total_points_earned,
        total_points_possible,
        score_percentage,
        passed,
        attempt_number,
        submitted_at
    ) VALUES (
        p_student_id,
        p_assessment_id,
        p_answers,
        v_earned_points,
        v_total_points,
        v_score_percentage,
        v_is_passed,
        v_attempt_num,
        now()
    ) RETURNING id INTO v_new_attempt_id;

    -- 6. Return evaluated result summary
    RETURN jsonb_build_object(
        'attempt_id', v_new_attempt_id,
        'student_id', p_student_id,
        'assessment_id', p_assessment_id,
        'total_points_earned', v_earned_points,
        'total_points_possible', v_total_points,
        'score_percentage', v_score_percentage,
        'passed', v_is_passed,
        'attempt_number', v_attempt_num
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. SAMPLE SEED DATA FOR DEMO & TESTING
-- ------------------------------------------------------------------------------
-- Sample Assessment for IBM SkillsBuild Frontend (c0000000-0000-0000-0000-000000000001)
INSERT INTO public.assessments (
    id,
    project_id,
    title,
    description,
    passing_score,
    duration_minutes,
    max_attempts,
    is_published
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Frontend Web Development Certification Milestone Quiz',
    'Assess your foundational mastery of semantic HTML5, modern Tailwind CSS, and React 19 state management.',
    75,
    30,
    3,
    true
) ON CONFLICT (id) DO NOTHING;

-- Sample Questions for Assessment 1
INSERT INTO public.quiz_questions (
    id,
    assessment_id,
    question_text,
    options,
    correct_option_id,
    explanation,
    points,
    order_index
) VALUES 
(
    'q0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Which React hook is designed for managing state transitions and holding component-level state?',
    '[{"id": "a", "text": "useEffect"}, {"id": "b", "text": "useState"}, {"id": "c", "text": "useMemo"}, {"id": "d", "text": "useContext"}]'::jsonb,
    'b',
    'useState declares a state variable that you can update directly across re-renders.',
    10,
    1
),
(
    'q0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'What is the primary architectural purpose of PostgreSQL Row Level Security (RLS) in Supabase?',
    '[{"id": "a", "text": "Compiling TypeScript interfaces at build time"}, {"id": "b", "text": "Compressing media files stored in S3"}, {"id": "c", "text": "Enforcing fine-grained user data access policies directly at the database engine level"}, {"id": "d", "text": "Routing client requests between web workers"}]'::jsonb,
    'c',
    'RLS filters and checks rows per user context (auth.uid()) inside the database engine, providing security in depth.',
    10,
    2
) ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- FILE: rls_policies.sql
-- ==========================================
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


-- ==========================================
-- FILE: sdg_impact_metrics.sql
-- ==========================================
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


-- ==========================================
-- FILE: storage_setup.sql
-- ==========================================
-- ==============================================================================
-- GlobeSkill - Supabase Storage Setup: Private 'learning-assets' Bucket
-- ==============================================================================
-- Purpose:
--   1. Create private storage bucket 'learning-assets' for certificates & course PDFs.
--   2. Enforce Row-Level Security (RLS) on storage.objects.
--   3. NGO Administrators and Trainers: Allowed to UPLOAD, UPDATE, and DELETE.
--   4. Authenticated Students: Allowed to READ and DOWNLOAD.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create Private Storage Bucket
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'learning-assets',
    'learning-assets',
    false, -- Private bucket (no anonymous public URLs allowed)
    10485760, -- 10MB file limit
    ARRAY[
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/webp'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

-- ------------------------------------------------------------------------------
-- 2. Storage RLS Policies on storage.objects
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins and Trainers can upload learning assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read learning assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins and Trainers can delete learning assets" ON storage.objects;

-- POLICY 1: Upload (INSERT) - Only NGO Administrators and Trainers
CREATE POLICY "Admins and Trainers can upload learning assets"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'learning-assets'
        AND (
            public.is_ngo_admin()
            OR public.is_trainer()
        )
    );

-- POLICY 2: Read / Download (SELECT) - All Authenticated Users (Students, Trainers, Admins)
CREATE POLICY "Authenticated users can read learning assets"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'learning-assets'
    );

-- POLICY 3: Delete / Update - Only NGO Administrators and Trainers
CREATE POLICY "Admins and Trainers can delete learning assets"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'learning-assets'
        AND (
            public.is_ngo_admin()
            OR public.is_trainer()
        )
    );


-- ==========================================
-- FILE: seed.sql
-- ==========================================
-- ==============================================================================
-- GlobeSkill - Seed Data Script
-- ==============================================================================
-- Seeds:
--   - 2 Trainers + 3 Students + 1 Donor in auth.users & public.profiles
--   - 3 Active Training Projects (IBM SkillsBuild Frontend, AI Micro Degree, IT Cert)
--   - 3 Student Enrolments linking students to training tracks with progress
--   - 2 Dummy Donations (1 Named Earmarked, 1 Anonymous Grant)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED DUMMY AUTH USERS (Satisfies profiles.id foreign key constraint)
-- ------------------------------------------------------------------------------
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
)
VALUES
-- Trainers
(
    'd0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'aris.thorne@globeskill.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Aris Thorne","role":"Trainer"}',
    'authenticated',
    'authenticated',
    now(),
    now()
),
(
    'd0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'maya.patel@globeskill.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Maya Patel","role":"Trainer"}',
    'authenticated',
    'authenticated',
    now(),
    now()
),
-- Students
(
    'd0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'liam.chen@student.globeskill.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Liam Chen","role":"Student"}',
    'authenticated',
    'authenticated',
    now(),
    now()
),
(
    'd0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'amina.diallo@student.globeskill.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Amina Diallo","role":"Student"}',
    'authenticated',
    'authenticated',
    now(),
    now()
),
(
    'd0000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'carlos.m@student.globeskill.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Carlos Mendoza","role":"Student"}',
    'authenticated',
    'authenticated',
    now(),
    now()
),
-- Donor
(
    'd0000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'elena.rostova@philanthropy.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Elena Rostova","role":"Donor"}',
    'authenticated',
    'authenticated',
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. SEED PROFILES (Enrich profile information)
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, email, role, bio, organization, is_verified)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'Dr. Aris Thorne',
    'aris.thorne@globeskill.org',
    'Trainer',
    'Senior AI Research Scientist & Lead Curriculum Architect for youth AI education.',
    'GlobeSkill AI Academy',
    true
),
(
    'd0000000-0000-0000-0000-000000000002',
    'Maya Patel',
    'maya.patel@globeskill.org',
    'Trainer',
    'Full-Stack Developer with 8+ years experience coaching underserved students in cloud & web development.',
    'IBM SkillsBuild Partner Network',
    true
),
(
    'd0000000-0000-0000-0000-000000000003',
    'Liam Chen',
    'liam.chen@student.globeskill.org',
    'Student',
    'Aspiring frontend developer passionate about accessible and mobile-first UI design.',
    'Lincoln Community Tech Hub',
    true
),
(
    'd0000000-0000-0000-0000-000000000004',
    'Amina Diallo',
    'amina.diallo@student.globeskill.org',
    'Student',
    'High school senior focused on machine learning fundamentals and climate data.',
    'Nairobi Youth Digital Lab',
    true
),
(
    'd0000000-0000-0000-0000-000000000005',
    'Carlos Mendoza',
    'carlos.m@student.globeskill.org',
    'Student',
    'First-generation learner building foundations in computer hardware and IT support.',
    'Oakland Tech Bridge',
    true
),
(
    'd0000000-0000-0000-0000-000000000006',
    'Elena Rostova',
    'elena.rostova@philanthropy.org',
    'Donor',
    'Tech Philanthropist advocating for digital equity and hardware access in underserved schools.',
    'Global Education Futures Fund',
    true
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    organization = EXCLUDED.organization,
    is_verified = EXCLUDED.is_verified;

-- ------------------------------------------------------------------------------
-- 3. SEED 3 ACTIVE TRAINING PROJECTS
-- ------------------------------------------------------------------------------
INSERT INTO public.training_projects (
    id,
    title,
    slug,
    description,
    partner_organization,
    category,
    difficulty_level,
    duration_weeks,
    max_capacity,
    trainer_id,
    status,
    start_date,
    end_date
)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'IBM SkillsBuild - Frontend Development',
    'ibm-skillsbuild-frontend-dev',
    'Foundational web development track covering HTML5, modern responsive CSS, TypeScript, and React. Sponsored by IBM SkillsBuild for underserved youth.',
    'IBM SkillsBuild',
    'Web Development',
    'Beginner',
    6,
    35,
    'd0000000-0000-0000-0000-000000000002', -- Maya Patel
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '42 days'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'AI Micro Degree',
    'ai-micro-degree',
    'Hands-on artificial intelligence and prompt engineering curriculum demystifying machine learning, ethical AI usage, and data science pipelines.',
    'GlobeSkill AI Initiative',
    'Artificial Intelligence',
    'Intermediate',
    8,
    25,
    'd0000000-0000-0000-0000-000000000001', -- Dr. Aris Thorne
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '56 days'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Certificate Program in IT',
    'certificate-program-it',
    'Essential IT support, networking fundamentals, computer hardware maintenance, and cloud basics preparing students for entry-level digital support careers.',
    'IBM SkillsBuild',
    'Information Technology',
    'Beginner',
    4,
    40,
    'd0000000-0000-0000-0000-000000000002', -- Maya Patel
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '28 days'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 4. SEED STUDENT ENROLMENTS (Linking students to tracks)
-- ------------------------------------------------------------------------------
INSERT INTO public.student_enrolments (
    student_id,
    project_id,
    status,
    progress_percentage,
    enrolled_at,
    notes
)
VALUES
(
    'd0000000-0000-0000-0000-000000000003', -- Liam Chen
    'c0000000-0000-0000-0000-000000000001', -- IBM Frontend
    'in_progress',
    65,
    now() - INTERVAL '14 days',
    'Excelling in CSS layouts; working on responsive portfolio project.'
),
(
    'd0000000-0000-0000-0000-000000000004', -- Amina Diallo
    'c0000000-0000-0000-0000-000000000002', -- AI Micro Degree
    'in_progress',
    40,
    now() - INTERVAL '10 days',
    'Completed Python AI basics; currently studying supervised learning models.'
),
(
    'd0000000-0000-0000-0000-000000000005', -- Carlos Mendoza
    'c0000000-0000-0000-0000-000000000003', -- Certificate Program in IT
    'enrolled',
    15,
    now() - INTERVAL '3 days',
    'Orientation completed; started hardware components module.'
)
ON CONFLICT (student_id, project_id) DO UPDATE SET
    progress_percentage = EXCLUDED.progress_percentage,
    status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 5. SEED 2 DUMMY DONATIONS
-- ------------------------------------------------------------------------------
INSERT INTO public.donations (
    id,
    donor_id,
    donor_name,
    donor_email,
    amount,
    currency,
    project_id,
    payment_method,
    payment_status,
    transaction_id,
    message,
    is_anonymous,
    created_at
)
VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000006', -- Elena Rostova
    'Elena Rostova',
    'elena.rostova@philanthropy.org',
    5000.00,
    'USD',
    'c0000000-0000-0000-0000-000000000002', -- Earmarked for AI Micro Degree
    'stripe',
    'succeeded',
    'ch_seed_stripe_9876543210',
    'Dedicated to funding AI compute credits and hardware kits for 25 high school learners.',
    false,
    now() - INTERVAL '5 days'
),
(
    'f0000000-0000-0000-0000-000000000002',
    NULL, -- Anonymous Donor
    'Anonymous Benefactor',
    'donor@communityfund.org',
    2500.00,
    'USD',
    'c0000000-0000-0000-0000-000000000001', -- Earmarked for IBM Frontend
    'wire_transfer',
    'succeeded',
    'wire_seed_global_123456',
    'Community grant dedicated to providing high-speed internet stipends to student households.',
    true,
    now() - INTERVAL '2 days'
)
ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    payment_status = EXCLUDED.payment_status;


-- ==========================================
-- FILE: seed_ai_assessment.sql
-- ==========================================
-- ==============================================================================
-- GlobeSkill - Seed Script: "Introduction to AI and Digital Skills" Assessment
-- ==============================================================================
-- Course: AI Micro Degree (c0000000-0000-0000-0000-000000000002)
-- Assessment: a0000000-0000-0000-0000-000000000002
-- Total Questions: 5 | Total Points: 100 (20 pts each) | Passing Score: 70%
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. INSERT ASSESSMENT METADATA
-- ------------------------------------------------------------------------------
INSERT INTO public.assessments (
    id,
    project_id,
    title,
    description,
    passing_score,
    duration_minutes,
    max_attempts,
    is_published,
    created_by
) VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'Introduction to AI and Digital Skills Milestone Assessment',
    'Foundational evaluation covering machine learning concepts, generative AI tokenization, prompt engineering best practices, hallucination awareness, and digital privacy.',
    70,
    25,
    3,
    true,
    'd0000000-0000-0000-0000-000000000001' -- Dr. Aris Thorne
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    passing_score = EXCLUDED.passing_score,
    duration_minutes = EXCLUDED.duration_minutes,
    max_attempts = EXCLUDED.max_attempts,
    is_published = EXCLUDED.is_published;

-- ------------------------------------------------------------------------------
-- 2. INSERT 5 MULTIPLE CHOICE QUESTIONS
-- ------------------------------------------------------------------------------

-- QUESTION 1: Traditional Programming vs Machine Learning (20 Points)
INSERT INTO public.quiz_questions (
    id,
    assessment_id,
    question_text,
    options,
    correct_option_id,
    explanation,
    points,
    order_index
) VALUES (
    'q0000000-0000-0000-0000-000000000011',
    'a0000000-0000-0000-0000-000000000002',
    'What is the core difference between traditional computer programming and Artificial Intelligence (Machine Learning)?',
    '[
        {"id": "a", "text": "Traditional programs learn by themselves from data, while AI requires humans to manually write every single IF/THEN rule."},
        {"id": "b", "text": "Traditional programming follows explicit human-written instructions, while Machine Learning models discover patterns from data to make predictions."},
        {"id": "c", "text": "Traditional programming only works on smartphones, while AI only works on supercomputers."},
        {"id": "d", "text": "There is no difference; AI is simply a marketing buzzword for HTML tables."}
    ]'::jsonb,
    'b',
    'In traditional software engineering, developers hand-craft algorithmic logic. In Machine Learning, statistical models analyze data inputs and learn the underlying mathematical rules autonomously.',
    20,
    1
) ON CONFLICT (id) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points,
    order_index = EXCLUDED.order_index;

-- QUESTION 2: Tokens in Generative AI & LLMs (20 Points)
INSERT INTO public.quiz_questions (
    id,
    assessment_id,
    question_text,
    options,
    correct_option_id,
    explanation,
    points,
    order_index
) VALUES (
    'q0000000-0000-0000-0000-000000000012',
    'a0000000-0000-0000-0000-000000000002',
    'In generative AI and Large Language Models (LLMs), what is a "token"?',
    '[
        {"id": "a", "text": "A physical plastic coin inserted into arcade machine slots."},
        {"id": "b", "text": "The physical graphics processing chip (GPU) soldered onto a server motherboard."},
        {"id": "c", "text": "A basic unit of text (such as a word, syllable, or character fragment) that an AI processes mathematically."},
        {"id": "d", "text": "A CSS property used to apply shadows to button components."}
    ]'::jsonb,
    'c',
    'Tokens are the fundamental building blocks of text processed by LLMs. Words are split into numerical tokens that allow the neural network to compute mathematical embeddings and predict subsequent outputs.',
    20,
    2
) ON CONFLICT (id) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points,
    order_index = EXCLUDED.order_index;

-- QUESTION 3: Effective Prompt Engineering (20 Points)
INSERT INTO public.quiz_questions (
    id,
    assessment_id,
    question_text,
    options,
    correct_option_id,
    explanation,
    points,
    order_index
) VALUES (
    'q0000000-0000-0000-0000-000000000013',
    'a0000000-0000-0000-0000-000000000002',
    'Which prompt engineering technique produces the most accurate and reliable answers from an AI assistant?',
    '[
        {"id": "a", "text": "Typing a single ambiguous word in ALL CAPS with zero background instructions."},
        {"id": "b", "text": "Providing clear persona framing, explicit operational constraints, required output schemas, and concrete reference examples (Few-Shot Prompting)."},
        {"id": "c", "text": "Expecting the model to infer requirements without providing any text input."},
        {"id": "d", "text": "Entering unencrypted passwords and private API keys into public prompts."}
    ]'::jsonb,
    'b',
    'Giving models explicit role context, step-by-step reasoning constraints, and concrete few-shot examples drastically reduces ambiguity and primes the model for high-fidelity responses.',
    20,
    3
) ON CONFLICT (id) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points,
    order_index = EXCLUDED.order_index;

-- QUESTION 4: AI Hallucinations & Critical Evaluation (20 Points)
INSERT INTO public.quiz_questions (
    id,
    assessment_id,
    question_text,
    options,
    correct_option_id,
    explanation,
    points,
    order_index
) VALUES (
    'q0000000-0000-0000-0000-000000000014',
    'a0000000-0000-0000-0000-000000000002',
    'What does it mean when an Artificial Intelligence model "hallucinates"?',
    '[
        {"id": "a", "text": "The computer monitor hardware begins glowing neon colors and overheating."},
        {"id": "b", "text": "The AI generates factually incorrect, ungrounded, or fabricated information presented with high linguistic confidence."},
        {"id": "c", "text": "The operating system automatically uninstalls the web browser."},
        {"id": "d", "text": "The computer speaker plays random sound effects due to low battery."}
    ]'::jsonb,
    'b',
    'Hallucinations happen because LLMs generate text based on statistical probability distributions rather than absolute truth retrieval. Developers must employ Grounding, RAG, and human verification to catch factual errors.',
    20,
    4
) ON CONFLICT (id) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points,
    order_index = EXCLUDED.order_index;

-- QUESTION 5: Digital Safety & Privacy Ethics (20 Points)
INSERT INTO public.quiz_questions (
    id,
    assessment_id,
    question_text,
    options,
    correct_option_id,
    explanation,
    points,
    order_index
) VALUES (
    'q0000000-0000-0000-0000-000000000015',
    'a0000000-0000-0000-0000-000000000002',
    'When using modern digital tools and AI applications, why is digital privacy and data security crucial?',
    '[
        {"id": "a", "text": "Because sensitive personal data (passwords, health records, identity details) can be compromised, misused, or leaked if not safeguarded with encryption and access controls."},
        {"id": "b", "text": "Because privacy settings reduce the physical screen brightness of laptops."},
        {"id": "c", "text": "Because computers cannot process JavaScript code without public passwords."},
        {"id": "d", "text": "Privacy does not matter because all digital data on the internet is already public domain."}
    ]'::jsonb,
    'a',
    'Enforcing strict data privacy (like Supabase Row Level Security and TLS encryption) prevents identity theft, data breaches, and unauthorized exploitation of sensitive personal information.',
    20,
    5
) ON CONFLICT (id) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points,
    order_index = EXCLUDED.order_index;

-- ------------------------------------------------------------------------------
-- 3. VERIFICATION & TEST EVALUATION QUERIES
-- ------------------------------------------------------------------------------
-- Test 1: Verify all 5 questions and total points
SELECT 
    a.title AS assessment_title,
    COUNT(q.id) AS total_questions,
    SUM(q.points) AS total_points,
    a.passing_score
FROM public.assessments a
JOIN public.quiz_questions q ON q.assessment_id = a.id
WHERE a.id = 'a0000000-0000-0000-0000-000000000002'
GROUP BY a.title, a.passing_score;

-- Test 2: Simulate Evaluation via Stored Procedure (Passing Score: 100%)
-- Student: Liam Chen ('d0000000-0000-0000-0000-000000000003')
-- Answers: All 5 correct ('b', 'c', 'b', 'b', 'a')
/*
SELECT public.evaluate_and_save_attempt(
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'd0000000-0000-0000-0000-000000000003'::uuid,
    '{
        "q0000000-0000-0000-0000-000000000011": "b",
        "q0000000-0000-0000-0000-000000000012": "c",
        "q0000000-0000-0000-0000-000000000013": "b",
        "q0000000-0000-0000-0000-000000000014": "b",
        "q0000000-0000-0000-0000-000000000015": "a"
    }'::jsonb
);
*/
