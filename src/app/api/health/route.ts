import { NextResponse } from 'next/server';
import { getPlatformStatus } from '@/lib/platform';

/**
 * ============================================================================
 * API ROUTE LAYER (NEXT.JS APP ROUTER CONTROLLER)
 * ============================================================================
 * Endpoint: GET /api/health
 * 
 * Flow:
 *  1. Receives incoming health probe GET request.
 *  2. Calls async business logic: getPlatformStatus().
 *  3. Encapsulates execution in try-catch to return appropriate HTTP/JSON error responses.
 */
export async function GET() {
  try {
    // Invoke decoupled business logic (queries Supabase for active course counts)
    const statusData = await getPlatformStatus();

    const httpStatusCode = statusData.status === 'ok' ? 200 : 200; // Returns diagnostic JSON payload

    return NextResponse.json(statusData, {
      status: httpStatusCode,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Catch fatal route-level errors
    return NextResponse.json(
      {
        project: 'GlobeSkill',
        status: 'error',
        database: 'error',
        activeCourses: 0,
        message: 'Internal server error while evaluating platform status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
