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
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Which React hook is designed for managing state transitions and holding component-level state?',
    '[{"id": "a", "text": "useEffect"}, {"id": "b", "text": "useState"}, {"id": "c", "text": "useMemo"}, {"id": "d", "text": "useContext"}]'::jsonb,
    'b',
    'useState declares a state variable that you can update directly across re-renders.',
    10,
    1
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'What is the primary architectural purpose of PostgreSQL Row Level Security (RLS) in Supabase?',
    '[{"id": "a", "text": "Compiling TypeScript interfaces at build time"}, {"id": "b", "text": "Compressing media files stored in S3"}, {"id": "c", "text": "Enforcing fine-grained user data access policies directly at the database engine level"}, {"id": "d", "text": "Routing client requests between web workers"}]'::jsonb,
    'c',
    'RLS filters and checks rows per user context (auth.uid()) inside the database engine, providing security in depth.',
    10,
    2
) ON CONFLICT (id) DO NOTHING;
