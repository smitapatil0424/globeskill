import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncIBMSkillsBuildCourses, fetchExternalIBMCourses } from '@/lib/lms-sync';

/**
 * ============================================================================
 * API CONTROLLER LAYER: LMS SYNCHRONIZATION ENDPOINT
 * ============================================================================
 * Endpoint: POST /api/admin/sync-lms
 *
 * Security:
 *  - Enforces 'NGO Administrator' RBAC role validation.
 *  - Triggers automated schema mapping and upserting from IBM SkillsBuild.
 *  - Returns comprehensive execution logs and statistics.
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Authenticate caller & check role
    let callerId: string | null = null;
    let callerRole: string | null = null;

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!authError && authData?.user) {
        callerId = authData.user.id;
        callerRole = authData.user.user_metadata?.role || null;

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

    // 2. Local development mock mode fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isMockDev =
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project-id');

    if (isMockDev) {
      callerId = callerId || 'd0000000-0000-0000-0000-000000000001';
      callerRole = callerRole || 'NGO Administrator';
    }

    // Role Guard: NGO Administrator only
    if (callerRole !== 'NGO Administrator') {
      return NextResponse.json(
        {
          error: 'Access Denied: Only NGO Administrators can trigger LMS course synchronization.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // 3. Execute LMS Synchronization
    const syncResult = await syncIBMSkillsBuildCourses();

    return NextResponse.json(
      {
        success: syncResult.success,
        message: `LMS Sync completed: ${syncResult.inserted} inserted, ${syncResult.updated} updated.`,
        data: syncResult,
      },
      { status: syncResult.success ? 200 : 500 }
    );
  } catch (fatalError) {
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during LMS synchronization.',
        details: fatalError instanceof Error ? fatalError.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Preview available courses from IBM SkillsBuild without writing to DB
 */
export async function GET() {
  try {
    const rawCourses = await fetchExternalIBMCourses();
    return NextResponse.json({
      success: true,
      source: 'IBM SkillsBuild External LMS',
      count: rawCourses.length,
      preview: rawCourses,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch external preview.', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
