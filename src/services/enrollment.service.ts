import { createClient } from '@/lib/supabase/server';
import { EnrolmentStatus, StudentEnrolment } from '@/types/database';

export interface EnrollStudentParams {
  studentId: string;
  projectId: string;
  status?: EnrolmentStatus;
}

export type EnrollErrorCode =
  | 'UNAUTHORIZED'
  | 'ALREADY_ENROLLED'
  | 'COURSE_NOT_FOUND'
  | 'INVALID_INPUT'
  | 'DATABASE_ERROR';

export type EnrollServiceResult =
  | {
      success: true;
      enrolment: StudentEnrolment;
      message: string;
    }
  | {
      success: false;
      error: string;
      code: EnrollErrorCode;
      details?: string;
    };

// Track mock enrollments in local memory for dev/test sessions
const mockEnrolmentCache = new Set<string>([
  'd0000000-0000-0000-0000-000000000003:c0000000-0000-0000-0000-000000000001', // Liam Chen in Frontend Dev
  'd0000000-0000-0000-0000-000000000004:c0000000-0000-0000-0000-000000000002', // Amina Diallo in AI
  'd0000000-0000-0000-0000-000000000005:c0000000-0000-0000-0000-000000000003', // Carlos Mendoza in IT
]);

/**
 * ============================================================================
 * BUSINESS LOGIC LAYER: STUDENT ENROLMENT SERVICE
 * ============================================================================
 * Location: src/services/enrollment.service.ts
 *
 * Responsibilities:
 *  1. Validates student and course identifiers.
 *  2. Prevents duplicate registrations (idempotent / double-enrollment guard).
 *  3. Persists new enrolment record with status 'in_progress' (In-Progress).
 *  4. Manages graceful local mock fallback for unconfigured development environments.
 */
export async function enrollStudentInCourse(
  params: EnrollStudentParams
): Promise<EnrollServiceResult> {
  const { studentId, projectId, status = 'in_progress' } = params;

  // 1. Input Validation
  if (!studentId || typeof studentId !== 'string') {
    return {
      success: false,
      error: 'Invalid or missing student identifier.',
      code: 'INVALID_INPUT',
    };
  }

  if (!projectId || typeof projectId !== 'string') {
    return {
      success: false,
      error: 'Invalid or missing course project identifier.',
      code: 'INVALID_INPUT',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isMockDev =
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('your-project-id');

  // 2. Mock Mode Handler (Dev / Offline Resiliency)
  if (isMockDev) {
    const cacheKey = `${studentId}:${projectId}`;

    // Prevent double enrollment in mock mode
    if (mockEnrolmentCache.has(cacheKey)) {
      return {
        success: false,
        error: 'Student is already enrolled in this course.',
        code: 'ALREADY_ENROLLED',
      };
    }

    mockEnrolmentCache.add(cacheKey);

    const mockEnrolment: StudentEnrolment = {
      id: `e-mock-${projectId.slice(0, 8)}`,
      student_id: studentId,
      project_id: projectId,
      status: status,
      progress_percentage: 0,
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: 'Enrolled via GlobeSkill Course Registration Service',
    };

    return {
      success: true,
      enrolment: mockEnrolment,
      message: 'Course registration successful. Enrolment status set to In-Progress.',
    };
  }

  // 3. Live Supabase PostgreSQL Execution
  try {
    const supabase = await createClient();

    // Verify course exists
    const { data: project, error: projectError } = await supabase
      .from('training_projects')
      .select('id, title, status')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) {
      return {
        success: false,
        error: 'Failed to verify course details.',
        code: 'DATABASE_ERROR',
        details: projectError.message,
      };
    }

    if (!project) {
      return {
        success: false,
        error: 'Course not found or is currently unavailable for registration.',
        code: 'COURSE_NOT_FOUND',
      };
    }

    // Step A: Check for existing enrollment (Guard against double-enrollment)
    const { data: existingEnrolment, error: checkError } = await supabase
      .from('student_enrolments')
      .select('id, status, progress_percentage')
      .eq('student_id', studentId)
      .eq('project_id', projectId)
      .maybeSingle();

    if (checkError) {
      return {
        success: false,
        error: 'Database check failed while checking enrollment eligibility.',
        code: 'DATABASE_ERROR',
        details: checkError.message,
      };
    }

    if (existingEnrolment) {
      return {
        success: false,
        error: 'Student is already enrolled in this course.',
        code: 'ALREADY_ENROLLED',
      };
    }

    // Step B: Insert new enrollment record with status 'in_progress'
    const { data: newEnrolment, error: insertError } = await supabase
      .from('student_enrolments')
      .insert({
        student_id: studentId,
        project_id: projectId,
        status: status,
        progress_percentage: 0,
        enrolled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Catch Postgres unique constraint violation (code 23505) in race conditions
      if (insertError.code === '23505') {
        return {
          success: false,
          error: 'Student is already enrolled in this course.',
          code: 'ALREADY_ENROLLED',
        };
      }

      return {
        success: false,
        error: 'Failed to register student enrollment.',
        code: 'DATABASE_ERROR',
        details: insertError.message,
      };
    }

    return {
      success: true,
      enrolment: newEnrolment as StudentEnrolment,
      message: 'Course registration successful. Enrolment status set to In-Progress.',
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown database error';
    return {
      success: false,
      error: 'An internal server error occurred while processing enrollment.',
      code: 'DATABASE_ERROR',
      details: errorMsg,
    };
  }
}
