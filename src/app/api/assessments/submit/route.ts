import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitAndGradeAssessment } from '@/services/assessmentSubmission.service';

/**
 * ============================================================================
 * API CONTROLLER: SECURE ASSESSMENT SUBMISSION & GRADUATION ENDPOINT
 * ============================================================================
 * Endpoint: POST /api/assessments/submit
 *
 * Capabilities:
 *  1. Receives student's selected choices for a quiz.
 *  2. Queries correct answers from Supabase `quiz_questions` server-side.
 *  3. Computes the final grade & records the attempt in `student_attempts`.
 *  4. Automatically marks course enrollment as "Graduated" (status = 'completed')
 *     if score exceeds the passing threshold (e.g. >= 70%).
 *  5. Returns detailed grading feedback securely WITHOUT leaking answer keys.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate caller
    let callerId: string | null = null;
    let callerRole: string | null = null;

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!authError && authData?.user) {
        callerId = authData.user.id;
        callerRole = authData.user.user_metadata?.role || null;
      }
    } catch {
      callerId = null;
    }

    // 2. Parse request payload
    let body: {
      assessmentId?: string;
      answers?: Record<string, string>;
      timeSpentSeconds?: number;
      studentId?: string;
      callerRole?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid JSON request body. Expected assessmentId and answers object.',
          code: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    const { assessmentId, answers, timeSpentSeconds } = body;

    // Fallback for local mock dev mode or testing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isMockDev =
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project-id');

    if (isMockDev) {
      callerId = body.studentId || callerId || 's0000000-0000-0000-0000-000000000001';
      callerRole = body.callerRole || callerRole || 'Student';
    }

    // Validate authentication
    if (!callerId) {
      return NextResponse.json(
        {
          error: 'Authentication Required: You must be logged in as a student to submit assessments.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Validate payload
    if (!assessmentId) {
      return NextResponse.json(
        {
          error: 'Validation Error: "assessmentId" is a required field.',
          code: 'MISSING_ASSESSMENT_ID',
        },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        {
          error: 'Validation Error: "answers" must be an object mapping question IDs to selected choices.',
          code: 'INVALID_ANSWERS',
        },
        { status: 400 }
      );
    }

    // 3. Delegate to Assessment Submission Service
    const result = await submitAndGradeAssessment({
      callerId,
      callerRole: callerRole || 'Student',
      assessmentId,
      answers,
      timeSpentSeconds: timeSpentSeconds ?? 0,
    });

    // 4. Return secure result payload
    return NextResponse.json(
      {
        success: true,
        message: result.passed
          ? `🎉 Congratulations! You passed with ${result.scorePercentage}% and have been marked as Graduated.`
          : `Assessment completed. You scored ${result.scorePercentage}% (Passing score: ${result.passingScore}%).`,
        data: result,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Assessment submission error:', err);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while processing the assessment.',
        details: err instanceof Error ? err.message : 'Unknown error',
        code: 'SUBMISSION_ERROR',
      },
      { status: 500 }
    );
  }
}
