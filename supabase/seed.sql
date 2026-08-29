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
