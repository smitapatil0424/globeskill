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
    'b0000000-0000-0000-0000-000000000011',
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
    'b0000000-0000-0000-0000-000000000012',
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
    'b0000000-0000-0000-0000-000000000013',
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
    'b0000000-0000-0000-0000-000000000014',
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
    'b0000000-0000-0000-0000-000000000015',
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
        "b0000000-0000-0000-0000-000000000011": "b",
        "b0000000-0000-0000-0000-000000000012": "c",
        "b0000000-0000-0000-0000-000000000013": "b",
        "b0000000-0000-0000-0000-000000000014": "b",
        "b0000000-0000-0000-0000-000000000015": "a"
    }'::jsonb
);
*/
