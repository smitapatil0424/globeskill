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
