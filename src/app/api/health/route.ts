import { NextResponse } from 'next/server';
import { getPlatformStatus } from '@/services/platform.service';

/**
 * ============================================================================
 * API / BACKEND LAYER
 * ============================================================================
 * Endpoint: GET /api/health
 * 
 * Flow:
 *  1. Client sends GET request to /api/health
 *  2. Route handler delegates data retrieval to getPlatformStatus() (Business Logic)
 *  3. Route handler formats and returns the JSON response with HTTP status 200
 */
export async function GET() {
  try {
    // Call reusable business logic function
    const platformData = getPlatformStatus();

    // Return formatted JSON response
    return NextResponse.json(platformData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        project: 'GlobeSkill',
        message: 'Failed to retrieve platform status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
