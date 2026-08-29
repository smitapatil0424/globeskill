import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrollStudentInCourse } from '@/services/enrollment.service';
import {
  checkRateLimit,
  rateLimitResponse,
  sanitizeString,
  applyRateLimitHeaders,
} from '@/lib/security';

/**
 * ============================================================================
 * API CONTROLLER LAYER: COURSE ENROLMENT ENDPOINT
 * ============================================================================
 * Endpoint: POST /api/enroll
 *
 * Security:
 *  - Verifies user authentication via server-side session cookies.
 *  - Enforces double-enrollment prevention.
 *  - Sets enrollment status to 'in_progress' (In-Progress).
 *
 * Payload:
 *  {
 *    "projectId": "uuid-of-course" (or "project_id")
 *  }
 */
export async function POST(request: Request) {
  try {
    // 1. Enforce Rate Limiting (15 enrollment attempts per minute per IP)
    const rateLimit = checkRateLimit(request, { limit: 15, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const supabase = await createClient();

    // 2. Authenticate the User
    let studentId: string | null = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!authError && authData?.user) {
        studentId = authData.user.id;
      }
    } catch {
      studentId = null;
    }

    // 2. Parse Request Payload
    let body: { projectId?: string; project_id?: string; studentId?: string; student_id?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Malformed JSON payload. A JSON object with projectId is required.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    const rawProjectId = body.projectId || body.project_id;
    const projectId = sanitizeString(rawProjectId, { maxLength: 64 });

    if (!projectId) {
      return NextResponse.json(
        {
          error: 'Missing required field: projectId (or project_id).',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // 3. Handle Development / Mock Mode Authentication Fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isMockDev =
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project-id');

    if (!studentId && isMockDev) {
      // In local development mock mode, support demo student session
      studentId = body.studentId || body.student_id || 'd0000000-0000-0000-0000-000000000003';
    }

    if (!studentId) {
      return NextResponse.json(
        {
          error: 'Authentication required. Please sign in as a student to enroll in this course.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // 4. Delegate to Business Logic Layer
    const result = await enrollStudentInCourse({
      studentId,
      projectId,
      status: 'in_progress', // Status In-Progress per specification
    });

    // 5. Map Service Result to HTTP Response
    if (result.success) {
      const successRes = NextResponse.json(
        {
          success: true,
          message: result.message,
          enrolment: result.enrolment,
        },
        { status: 201 }
      );
      return applyRateLimitHeaders(successRes, rateLimit);
    }

    // Map Specific Error Status Codes
    let errorRes: NextResponse;
    switch (result.code) {
      case 'ALREADY_ENROLLED':
        errorRes = NextResponse.json(
          {
            error: result.error,
            code: result.code,
          },
          { status: 409 } // 409 Conflict
        );
        break;

      case 'COURSE_NOT_FOUND':
        errorRes = NextResponse.json(
          {
            error: result.error,
            code: result.code,
          },
          { status: 404 } // 404 Not Found
        );
        break;

      case 'INVALID_INPUT':
        errorRes = NextResponse.json(
          {
            error: result.error,
            code: result.code,
          },
          { status: 400 } // 400 Bad Request
        );
        break;

      default:
        errorRes = NextResponse.json(
          {
            error: result.error,
            code: result.code,
            details: result.details,
          },
          { status: 500 } // 500 Internal Server Error
        );
        break;
    }

    return applyRateLimitHeaders(errorRes, rateLimit);
  } catch (fatalError) {
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while processing the enrollment request.',
        details: fatalError instanceof Error ? fatalError.message : 'Unknown server error',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
