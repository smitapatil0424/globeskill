import { createClient } from '@/lib/supabase/server';
import { EnrolmentStatus, StudentEnrolment, UserRole } from '@/types/database';

export interface UpdateStudentStatusParams {
  callerId: string;
  callerRole: UserRole | string;
  enrolmentId: string;
  status?: EnrolmentStatus;
  grade?: number; // 0 - 100 final grade or progress score
  notes?: string;
}

export type StatusUpdateErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_INPUT'
  | 'ENROLMENT_NOT_FOUND'
  | 'DATABASE_ERROR';

export type StatusUpdateResult =
  | {
      success: true;
      message: string;
      enrolment: StudentEnrolment;
    }
  | {
      success: false;
      error: string;
      code: StatusUpdateErrorCode;
      details?: string;
    };

const ALLOWED_STAFF_ROLES: UserRole[] = ['Trainer', 'NGO Administrator'];

/**
 * ============================================================================
 * BUSINESS LOGIC LAYER: STUDENT GRADING & STATUS MANAGEMENT
 * ============================================================================
 * Location: src/services/studentStatus.service.ts
 *
 * Security & Invariants:
 *  1. Role Enforcement: Only 'Trainer' and 'NGO Administrator' can update status/grades.
 *  2. Student Self-Grading Prevention: Strictly blocks students from modifying their own records.
 *  3. Progress & Grade Validation: Bounds grade scores within 0 - 100%.
 *  4. Automated Credential Timestamping: Assigns completion timestamp and certificate URL
 *     when status advances to 'completed'.
 */
export async function updateStudentCourseStatus(
  params: UpdateStudentStatusParams
): Promise<StatusUpdateResult> {
  const { callerId, callerRole, enrolmentId, status, grade, notes } = params;

  // 1. Role Validation (Security Guard)
  if (!callerRole || !ALLOWED_STAFF_ROLES.includes(callerRole as UserRole)) {
    return {
      success: false,
      error: `Access Denied: Role "${callerRole || 'Unknown'}" is not authorized to update course status or grades. Only Trainers and NGO Administrators have grading permissions.`,
      code: 'FORBIDDEN',
    };
  }

  // 2. Input Validation
  if (!enrolmentId || typeof enrolmentId !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid enrolmentId.',
      code: 'INVALID_INPUT',
    };
  }

  if (grade !== undefined && (typeof grade !== 'number' || grade < 0 || grade > 100)) {
    return {
      success: false,
      error: 'Invalid grade score. Grade must be a numerical percentage between 0 and 100.',
      code: 'INVALID_INPUT',
    };
  }

  const validStatuses: EnrolmentStatus[] = ['enrolled', 'in_progress', 'completed', 'dropped'];
  if (status && !validStatuses.includes(status)) {
    return {
      success: false,
      error: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`,
      code: 'INVALID_INPUT',
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isMockDev =
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('your-project-id');

  // 3. Mock Development Execution
  if (isMockDev) {
    const finalStatus: EnrolmentStatus = status || (grade !== undefined && grade >= 100 ? 'completed' : 'in_progress');
    const finalProgress: number = grade !== undefined ? grade : finalStatus === 'completed' ? 100 : finalStatus === 'enrolled' ? 0 : 75;

    const mockEnrolment: StudentEnrolment = {
      id: enrolmentId,
      student_id: 'd0000000-0000-0000-0000-000000000003',
      project_id: 'c0000000-0000-0000-0000-000000000001',
      status: finalStatus,
      progress_percentage: finalProgress,
      notes: notes || (grade !== undefined ? `Evaluated by ${callerRole}: Final Grade ${grade}%` : 'Status updated by staff'),
      completed_at: finalStatus === 'completed' ? new Date().toISOString() : null,
      certificate_url: finalStatus === 'completed' ? `https://credentials.globeskill.org/certs/${enrolmentId}` : null,
      enrolled_at: '2026-08-01T10:00:00Z',
      updated_at: new Date().toISOString(),
    };

    return {
      success: true,
      message: `Student status successfully updated to "${finalStatus}" with grade ${finalProgress}%.`,
      enrolment: mockEnrolment,
    };
  }

  // 4. Live Supabase PostgreSQL Execution
  try {
    const supabase = await createClient();

    // Verify enrolment exists
    const { data: existingEnrolment, error: fetchError } = await supabase
      .from('student_enrolments')
      .select(`
        id,
        student_id,
        project_id,
        status,
        progress_percentage,
        training_projects:project_id (
          id,
          trainer_id
        )
      `)
      .eq('id', enrolmentId)
      .maybeSingle();

    if (fetchError) {
      return {
        success: false,
        error: 'Failed to query student enrolment record.',
        code: 'DATABASE_ERROR',
        details: fetchError.message,
      };
    }

    if (!existingEnrolment) {
      return {
        success: false,
        error: `Enrolment record with ID "${enrolmentId}" was not found.`,
        code: 'ENROLMENT_NOT_FOUND',
      };
    }

    // Additional Trainer Scope Verification:
    // If the caller is a Trainer (and not NGO Administrator), ensure they teach this course
    if (callerRole === 'Trainer') {
      const course = existingEnrolment.training_projects as unknown as { id: string; trainer_id?: string | null };
      if (course?.trainer_id && course.trainer_id !== callerId) {
        return {
          success: false,
          error: 'Forbidden: You can only evaluate and grade students in courses assigned to you.',
          code: 'FORBIDDEN',
        };
      }
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updatePayload.status = status;
    }

    if (grade !== undefined) {
      updatePayload.progress_percentage = grade;
    }

    if (notes !== undefined) {
      updatePayload.notes = notes;
    }

    // Determine completion state
    const resolvedStatus = status || existingEnrolment.status;
    if (resolvedStatus === 'completed' || (grade !== undefined && grade >= 100)) {
      updatePayload.status = 'completed';
      updatePayload.completed_at = new Date().toISOString();
      updatePayload.certificate_url = `https://credentials.globeskill.org/certs/${enrolmentId}`;
    } else if (status && status !== 'completed') {
      updatePayload.completed_at = null;
    }

    const { data: updatedRecord, error: updateError } = await supabase
      .from('student_enrolments')
      .update(updatePayload)
      .eq('id', enrolmentId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: 'Database update failed while writing student grade.',
        code: 'DATABASE_ERROR',
        details: updateError.message,
      };
    }

    return {
      success: true,
      message: `Student status successfully updated to "${updatePayload.status || resolvedStatus}".`,
      enrolment: updatedRecord as StudentEnrolment,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown database error';
    return {
      success: false,
      error: 'An internal server error occurred while updating student status.',
      code: 'DATABASE_ERROR',
      details: errorMsg,
    };
  }
}
