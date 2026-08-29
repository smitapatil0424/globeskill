import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse, sanitizeString } from '@/lib/security';

export interface ClientDiagnosticPayload {
  errorType?: string;
  message: string;
  table?: string;
  query?: string;
  status?: number | string;
  stack?: string;
  url?: string;
  userId?: string;
  userAgent?: string;
  timestamp?: string;
  context?: Record<string, unknown>;
}

/**
 * ============================================================================
 * API ROUTE: SERVER-SIDE SILENT ERROR CAPTURE & TELEMETRY
 * ============================================================================
 * Endpoint: POST /api/telemetry/error
 *
 * Purpose:
 *  Ingests silent diagnostic reports from frontend devices when Supabase
 *  table queries, network calls, or client boundaries fail in production.
 *
 * Log Destination:
 *  Outputs structured JSON to stdout/stderr, which Vercel Serverless Logs
 *  automatically indexes and forwards to configured log drains (Axiom,
 *  Datadog, BetterStack, or Sentry).
 */
export async function POST(request: Request) {
  try {
    // 1. Rate Limit Diagnostic Submissions (30 reports/min per IP to prevent spam)
    const rateLimit = checkRateLimit(request, { limit: 30, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    let payload: ClientDiagnosticPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid diagnostic payload.' }, { status: 400 });
    }

    const cleanMessage = sanitizeString(payload.message, { maxLength: 500 });
    if (!cleanMessage) {
      return NextResponse.json({ error: 'Diagnostic message required.' }, { status: 400 });
    }

    const diagnosticRecord = {
      severity: 'ERROR',
      service: 'globeskill-client',
      source: 'live-user-device',
      errorType: sanitizeString(payload.errorType || 'SUPABASE_QUERY_ERROR', { maxLength: 64 }),
      message: cleanMessage,
      table: payload.table ? sanitizeString(payload.table, { maxLength: 64 }) : null,
      query: payload.query ? sanitizeString(payload.query, { maxLength: 256 }) : null,
      status: payload.status || 'CLIENT_FETCH_FAILED',
      url: payload.url ? sanitizeString(payload.url, { maxLength: 256 }) : null,
      userId: payload.userId ? sanitizeString(payload.userId, { maxLength: 64 }) : 'anonymous',
      userAgent: request.headers.get('user-agent') || payload.userAgent || 'unknown',
      stack: payload.stack ? sanitizeString(payload.stack, { maxLength: 1000 }) : null,
      context: payload.context || {},
      receivedAt: new Date().toISOString(),
    };

    // Structured server-side diagnostic log emitted to Vercel runtime
    console.error(`[SILENT_DIAGNOSTIC_LOG]`, JSON.stringify(diagnosticRecord));

    return NextResponse.json({
      received: true,
      diagnosticId: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: diagnosticRecord.receivedAt,
    });
  } catch (error) {
    console.error('Diagnostic logging endpoint failure:', error);
    return NextResponse.json({ error: 'Internal telemetry error' }, { status: 500 });
  }
}
