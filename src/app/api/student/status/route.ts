import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateStudentCourseStatus } from '@/services/studentStatus.service';
import { EnrolmentStatus } from '@/types/database';

/**
 * ============================================================================
 * API CONTROLLER LAYER: STUDENT COURSE STATUS & GRADING ENDPOINT
 * ============================================================================
 * Endpoint: PATCH & POST /api/student/status
 *
 * Security Requirements:
 *  1. Authenticates the caller.
 *  2. Verifies the caller's role is either 'Trainer' or 'NGO Administrator'.
 *  3. Prevents students from modifying their own course status or grades (403 Forbidden).
 *
 * Payload:
 *  {
 *    "enrolmentId": "uuid",
 *    "status": "enrolled" | "in_progress" | "completed" | "dropped",
 *    "grade": 0 - 100 (optional),
 *    "notes": "Optional feedback or evaluation notes"
 *  }
 */
async function handleStatusUpdate(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate the caller
    let callerId: string | null = null;
    let callerRole: string | null = null;

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!authError && authData?.user) {
        callerId = authData.user.id;
        callerRole = authData.user.user_metadata?.role || null;

        // If role missing from JWT metadata, fetch from public.profiles
        if (!callerRole) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', callerId)
            .single();
          callerRole = profile?.role || null;
        }
      }
    } catch {
      callerId = null;
    }

    // 2. Parse request payload
    let body: {
      enrolmentId?: string;
      enrolment_id?: string;
      status?: EnrolmentStatus;
      grade?: number;
      progress?: number;
      notes?: string;
      callerRole?: string; // Allowed for explicit role simulation in test scripts
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Malformed JSON payload. A JSON object with enrolmentId is required.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    const enrolmentId = body.enrolmentId || body.enrolment_id;

    if (!enrolmentId) {
      return NextResponse.json(
        {
          error: 'Missing required field: enrolmentId (or enrolment_id).',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // 3. Handle Development / Mock Mode Role Simulation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isMockDev =
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project-id');

    if (isMockDev) {
      // In local development mock mode, resolve caller role from body/cookie or fallback to Trainer
      const cookieHeader = request.headers.get('cookie') || '';
      const cookieMatch = cookieHeader.match(new RegExp('(^| )mock_role=([^;]+)'));
      const cookieRole = cookieMatch && cookieMatch[2] ? decodeURIComponent(cookieMatch[2]) : null;

      callerId = callerId || 'd0000000-0000-0000-0000-000000000001'; // Default to Dr. Aris Thorne
      callerRole = body.callerRole || cookieRole || callerRole || 'Trainer';
    }

    if (!callerId) {
      return NextResponse.json(
        {
          error: 'Authentication required. Please sign in as a Trainer or NGO Administrator.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // 4. Delegate to Business Logic Layer (Role validation enforced inside service)
    const result = await updateStudentCourseStatus({
      callerId,
      callerRole: callerRole || 'Student', // Pass resolved role
      enrolmentId,
      status: body.status,
      grade: body.grade !== undefined ? body.grade : body.progress,
      notes: body.notes,
    });

    // 5. Map Service Result to HTTP Responses
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          enrolment: result.enrolment,
        },
        { status: 200 }
      );
    }

    // Map Specific Error Codes
    switch (result.code) {
      case 'FORBIDDEN':
        return NextResponse.json(
          {
            error: result.error,
            code: result.code,
          },
          { status: 403 } // 403 Forbidden: Student self-grading blocked
        );

      case 'INVALID_INPUT':
        return NextResponse.json(
          {
            error: result.error,
            code: result.code,
          },
          { status: 400 } // 400 Bad Request
        );

      case 'ENROLMENT_NOT_FOUND':
        return NextResponse.json(
          {
            error: result.error,
            code: result.code,
          },
          { status: 404 } // 404 Not Found
        );

      default:
        return NextResponse.json(
          {
            error: result.error,
            code: result.code,
            details: result.details,
          },
          { status: 500 } // 500 Internal Server Error
        );
    }
  } catch (fatalError) {
    return NextResponse.json(
      {
        error: 'An unexpected server error occurred while updating the student status.',
        details: fatalError instanceof Error ? fatalError.message : 'Unknown error',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  return handleStatusUpdate(request);
}

export async function POST(request: Request) {
  return handleStatusUpdate(request);
}
