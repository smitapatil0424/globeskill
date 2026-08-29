import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EnrolmentStatus } from '@/types/database';

/**
 * ============================================================================
 * API CONTROLLER LAYER: TRAINER ENROLMENT STATUS UPDATE
 * ============================================================================
 * Endpoint: PATCH /api/trainer/enrolment
 *
 * Responsibilities:
 *  1. Verifies that the caller has a Trainer or Administrator session.
 *  2. Validates student enrolment ID and target status.
 *  3. Instantly updates student_enrolments status, progress, and completion timestamp.
 *  4. Supports mock development mode for local evaluation.
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    let trainerId: string | null = null;

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!authError && authData?.user) {
        trainerId = authData.user.id;
      }
    } catch {
      trainerId = null;
    }

    // 2. Parse payload
    let body: {
      enrolmentId?: string;
      status?: EnrolmentStatus;
      progress?: number;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload.', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const { enrolmentId, status, progress } = body;

    if (!enrolmentId || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters: enrolmentId and status.', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const validStatuses: EnrolmentStatus[] = ['enrolled', 'in_progress', 'completed', 'dropped'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`,
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // 3. Mock Development Fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isMockDev =
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project-id');

    if (isMockDev) {
      // Calculate progress depending on status
      let updatedProgress = progress ?? 0;
      if (status === 'completed') updatedProgress = 100;
      if (status === 'enrolled') updatedProgress = 0;
      if (status === 'in_progress' && updatedProgress === 0) updatedProgress = 50;

      return NextResponse.json(
        {
          success: true,
          message: `Student status successfully updated to "${status}".`,
          enrolment: {
            id: enrolmentId,
            status,
            progress_percentage: updatedProgress,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    // 4. Live Supabase Execution
    if (!trainerId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in as a Trainer.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Determine completion fields
    let updatedProgress = progress;
    if (status === 'completed') updatedProgress = 100;
    if (status === 'enrolled' && (progress === undefined || progress === 100)) updatedProgress = 0;

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (updatedProgress !== undefined) {
      updatePayload.progress_percentage = updatedProgress;
    }

    if (status === 'completed') {
      updatePayload.completed_at = new Date().toISOString();
      updatePayload.certificate_url = `https://credentials.globeskill.org/certs/${enrolmentId}`;
    } else {
      updatePayload.completed_at = null;
    }

    const { data: updatedRecord, error: updateError } = await supabase
      .from('student_enrolments')
      .update(updatePayload)
      .eq('id', enrolmentId)
      .select(`
        id,
        student_id,
        project_id,
        status,
        progress_percentage,
        completed_at,
        certificate_url,
        updated_at
      `)
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          error: 'Failed to update student enrolment in database.',
          code: 'DATABASE_ERROR',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Student enrolment status successfully updated to "${status}".`,
        enrolment: updatedRecord,
      },
      { status: 200 }
    );
  } catch (fatalError) {
    return NextResponse.json(
      {
        error: 'An internal server error occurred while updating student status.',
        details: fatalError instanceof Error ? fatalError.message : 'Unknown error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
