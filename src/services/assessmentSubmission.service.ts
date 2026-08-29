import { createClient } from '@/lib/supabase/server';

export interface SubmitAssessmentParams {
  callerId: string;
  callerRole?: string;
  assessmentId: string;
  answers: Record<string, string>; // { [questionId: string]: string (selected option key e.g. "b") }
  timeSpentSeconds?: number;
}

export interface QuestionResultSummary {
  questionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
  explanation?: string | null;
  // NOTE: correct_option_id is purposefully OMITTED to prevent answer leaking
}

export interface AssessmentSubmissionResponse {
  success: boolean;
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  scorePercentage: number;
  pointsEarned: number;
  totalPoints: number;
  passingScore: number;
  passed: boolean;
  status: 'Graduated' | 'In-Progress';
  enrollmentUpdated: boolean;
  timeSpentSeconds?: number;
  questionBreakdown: QuestionResultSummary[];
}

// Fallback mock questions for local dev mode
const MOCK_ASSESSMENT_CATALOG: Record<
  string,
  {
    title: string;
    projectId: string;
    passingScore: number;
    questions: Array<{
      id: string;
      points: number;
      correct_option_id: string;
      explanation: string;
    }>;
  }
> = {
  'a0000000-0000-0000-0000-000000000001': {
    title: 'Frontend Web Development Certification Milestone Quiz',
    projectId: 'c0000000-0000-0000-0000-000000000001',
    passingScore: 75,
    questions: [
      {
        id: 'q0000000-0000-0000-0000-000000000001',
        points: 10,
        correct_option_id: 'b',
        explanation: 'useState() manages reactive component-level state and triggers UI updates.',
      },
      {
        id: 'q0000000-0000-0000-0000-000000000002',
        points: 10,
        correct_option_id: 'c',
        explanation: 'PostgreSQL RLS isolates tenant rows based on auth.uid() at the engine layer.',
      },
    ],
  },
  'a0000000-0000-0000-0000-000000000002': {
    title: 'Introduction to AI and Digital Skills Milestone Assessment',
    projectId: 'c0000000-0000-0000-0000-000000000002',
    passingScore: 70,
    questions: [
      {
        id: 'q0000000-0000-0000-0000-000000000011',
        points: 20,
        correct_option_id: 'b',
        explanation:
          'In traditional programming, developers hand-craft algorithmic logic. In Machine Learning, statistical models analyze data inputs and learn rules autonomously.',
      },
      {
        id: 'q0000000-0000-0000-0000-000000000012',
        points: 20,
        correct_option_id: 'c',
        explanation:
          'Tokens are chunks of characters or words that AI models convert into numerical vectors (embeddings) to predict subsequent outputs.',
      },
      {
        id: 'q0000000-0000-0000-0000-000000000013',
        points: 20,
        correct_option_id: 'b',
        explanation:
          'Providing role framing, constraints, and few-shot examples guides the model probability distribution toward high accuracy.',
      },
      {
        id: 'q0000000-0000-0000-0000-000000000014',
        points: 20,
        correct_option_id: 'b',
        explanation:
          'Hallucinations occur when an LLM produces plausible-sounding but factually fabricated information due to probability text generation.',
      },
      {
        id: 'q0000000-0000-0000-0000-000000000015',
        points: 20,
        correct_option_id: 'a',
        explanation:
          'Protecting personally identifiable information (PII) safeguards individuals against data theft and unauthorized exploitation.',
      },
    ],
  },
  'quiz-fe-milestone': {
    title: 'Frontend & Full-Stack Certification Milestone',
    projectId: 'c0000000-0000-0000-0000-000000000001',
    passingScore: 70,
    questions: [
      {
        id: 'q-fe-01',
        points: 10,
        correct_option_id: 'b',
        explanation: 'useState() declares a state variable that can be updated across renders.',
      },
      {
        id: 'q-fe-02',
        points: 10,
        correct_option_id: 'b',
        explanation: '"use client" marks the boundary for client-side React rendering.',
      },
      {
        id: 'q-fe-03',
        points: 10,
        correct_option_id: 'c',
        explanation: 'RLS policies filter and restrict database records directly within PostgreSQL.',
      },
      {
        id: 'q-fe-04',
        points: 10,
        correct_option_id: 'b',
        explanation: 'transition-all duration-300 enables CSS transitions with a 300ms curve.',
      },
      {
        id: 'q-fe-05',
        points: 10,
        correct_option_id: 'd',
        explanation: 'HTTP 409 Conflict indicates resource state collision (e.g. duplicate enrollment).',
      },
    ],
  },
};

/**
 * ============================================================================
 * BUSINESS LOGIC: SECURE ASSESSMENT EVALUATION & GRADUATION SERVICE
 * ============================================================================
 * Invariants & Security Rules:
 *  1. Server-side grading: Correct answers are never sent to or trusted from the client.
 *  2. No Answer Leaks: The response excludes 'correct_option_id' for unselected/all options.
 *  3. Automatic Graduation: Passing scores (>= passing_score) automatically update the
 *     student's enrollment to 'completed' ("Graduated") with 100% progress and certificate.
 *  4. Audit Trail: All attempts are recorded in 'student_attempts'.
 */
export async function submitAndGradeAssessment(
  params: SubmitAssessmentParams
): Promise<AssessmentSubmissionResponse> {
  const { callerId, assessmentId, answers, timeSpentSeconds } = params;
  const supabase = await createClient();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isMockDev =
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('your-project-id');

  let assessmentTitle = 'Curriculum Milestone Assessment';
  let projectId = 'c0000000-0000-0000-0000-000000000001';
  let passingScore = 70;
  let questions: Array<{
    id: string;
    points: number;
    correct_option_id: string;
    explanation?: string | null;
  }> = [];

  // 1. Fetch Assessment & Questions from Database
  if (!isMockDev) {
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, title, project_id, passing_score, is_published')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessmentData) {
      throw new Error(`Assessment with ID "${assessmentId}" not found.`);
    }

    assessmentTitle = assessmentData.title;
    projectId = assessmentData.project_id;
    passingScore = assessmentData.passing_score ?? 70;

    const { data: questionRows, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, points, correct_option_id, explanation')
      .eq('assessment_id', assessmentId)
      .order('order_index', { ascending: true });

    if (questionsError || !questionRows || questionRows.length === 0) {
      throw new Error('No quiz questions could be retrieved for this assessment.');
    }

    questions = questionRows;
  } else {
    // Local Mock Mode Fallback
    const mockAssessment =
      MOCK_ASSESSMENT_CATALOG[assessmentId] ||
      MOCK_ASSESSMENT_CATALOG['quiz-fe-milestone'];

    assessmentTitle = mockAssessment.title;
    projectId = mockAssessment.projectId;
    passingScore = mockAssessment.passingScore;
    questions = mockAssessment.questions;
  }

  // 2. Server-side Grading Evaluation (Correct answers kept secure on server)
  let pointsEarned = 0;
  let totalPoints = 0;
  const questionBreakdown: QuestionResultSummary[] = [];

  for (const q of questions) {
    const pts = q.points || 10;
    totalPoints += pts;

    const studentChoice = answers[q.id];
    const isCorrect =
      Boolean(studentChoice) &&
      studentChoice.trim().toLowerCase() === q.correct_option_id.trim().toLowerCase();

    if (isCorrect) {
      pointsEarned += pts;
    }

    // Secure payload: NEVER include q.correct_option_id here!
    questionBreakdown.push({
      questionId: q.id,
      isCorrect,
      pointsEarned: isCorrect ? pts : 0,
      pointsPossible: pts,
      explanation: q.explanation || null,
    });
  }

  const scorePercentage =
    totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
  const passed = scorePercentage >= passingScore;
  const status: 'Graduated' | 'In-Progress' = passed ? 'Graduated' : 'In-Progress';

  const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 3. Record Student Attempt in Supabase
  if (!isMockDev) {
    try {
      const { count: priorAttempts } = await supabase
        .from('student_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', callerId)
        .eq('assessment_id', assessmentId);

      const attemptNum = (priorAttempts || 0) + 1;

      await supabase.from('student_attempts').insert({
        student_id: callerId,
        assessment_id: assessmentId,
        answers,
        total_points_earned: pointsEarned,
        total_points_possible: totalPoints,
        score_percentage: scorePercentage,
        passed,
        attempt_number: attemptNum,
        submitted_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Attempt logging warning:', err);
    }
  }

  // 4. Automatic Graduation: If passed (score >= passing_score), mark course enrollment as 'completed'
  let enrollmentUpdated = false;

  if (passed) {
    if (!isMockDev) {
      try {
        const { data: existingEnrolment } = await supabase
          .from('student_enrolments')
          .select('id')
          .eq('student_id', callerId)
          .eq('project_id', projectId)
          .maybeSingle();

        if (existingEnrolment?.id) {
          const { error: updateError } = await supabase
            .from('student_enrolments')
            .update({
              status: 'completed', // "Graduated" in system domain
              progress_percentage: 100,
              completed_at: new Date().toISOString(),
              notes: `Graduated with assessment score of ${scorePercentage}% on ${new Date().toISOString()}`,
              certificate_url: `https://credentials.globeskill.org/verify/gs-cert-${callerId.slice(0, 8)}-${Date.now()}`,
            })
            .eq('id', existingEnrolment.id);

          if (!updateError) {
            enrollmentUpdated = true;
          }
        }
      } catch (err) {
        console.warn('Enrollment status graduation warning:', err);
      }
    } else {
      enrollmentUpdated = true;
    }
  }

  // 5. Return Clean & Secure Evaluation Response
  return {
    success: true,
    attemptId,
    assessmentId,
    assessmentTitle,
    scorePercentage,
    pointsEarned,
    totalPoints,
    passingScore,
    passed,
    status,
    enrollmentUpdated,
    timeSpentSeconds,
    questionBreakdown,
  };
}
