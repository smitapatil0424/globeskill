import { NextResponse } from 'next/server';
import { getPlatformStatus } from '@/lib/platform';

/**
 * ============================================================================
 * API ROUTE LAYER (NEXT.JS APP ROUTER CONTROLLER)
 * ============================================================================
 * Endpoint: GET /api/health
 * 
 * Architectural Flow:
 *  [1] Frontend (Browser/Client) calls GET /api/health
 *  [2] Next.js API Route handler intercepts the incoming HTTP request
 *  [3] API Route delegates data retrieval to Business Logic: getPlatformStatus()
 *  [4] API Route serializes the returned object into a clean JSON response
 */
export async function GET() {
  // Step 3: Invoke reusable business logic
  const statusData = getPlatformStatus();

  // Step 4: Return JSON response with HTTP 200 status
  return NextResponse.json(statusData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
    },
  });
}
