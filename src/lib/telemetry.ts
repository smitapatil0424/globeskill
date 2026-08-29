/**
 * ============================================================================
 * CLIENT-SIDE TELEMETRY & SILENT DIAGNOSTIC LOGGING
 * ============================================================================
 * Purpose:
 *  Provides non-blocking, silent diagnostic error dispatching. When a frontend
 *  fetch to a Supabase table fails on a live user's device, this captures the
 *  telemetry and sends it to /api/telemetry/error without interrupting UX.
 */

export interface TelemetryErrorOptions {
  error: unknown;
  table?: string;
  query?: string;
  userId?: string;
  context?: Record<string, unknown>;
}

/**
 * Silently dispatches a diagnostic error payload to the server-side logger.
 * Uses navigator.sendBeacon when available to ensure delivery even during
 * page transitions, falling back to fetch with keepalive: true.
 */
export function captureDiagnosticError(options: TelemetryErrorOptions): void {
  if (typeof window === 'undefined') return;

  try {
    const err = options.error as { message?: string; stack?: string; code?: string; status?: number } | null;

    const payload = {
      errorType: 'SUPABASE_QUERY_ERROR',
      message: err?.message || (typeof options.error === 'string' ? options.error : 'Unknown client-side error'),
      table: options.table,
      query: options.query,
      status: err?.code || err?.status || 'UNKNOWN',
      stack: err?.stack?.slice(0, 1000),
      url: window.location.href,
      userId: options.userId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context: options.context || {},
    };

    const endpoint = '/api/telemetry/error';
    const jsonString = JSON.stringify(payload);

    // 1. Prefer sendBeacon for non-blocking asynchronous transmission
    if (navigator.sendBeacon) {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const queued = navigator.sendBeacon(endpoint, blob);
      if (queued) return;
    }

    // 2. Fallback to fetch with keepalive
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonString,
      keepalive: true,
    }).catch(() => {
      // Intentionally silent: telemetry failures must never throw in client UI
    });
  } catch {
    // Intentionally silent
  }
}

/**
 * Wraps a Supabase query promise with automatic diagnostic capturing.
 *
 * Example:
 *   const { data, error } = await withDiagnosticSupabase(
 *     supabase.from('student_enrolments').select('*'),
 *     { table: 'student_enrolments', query: 'select(*)' }
 *   );
 */
export async function withDiagnosticSupabase<T>(
  queryPromise: PromiseLike<{ data: T | null; error: unknown }>,
  metadata: { table: string; query?: string; userId?: string; context?: Record<string, unknown> }
): Promise<{ data: T | null; error: unknown }> {
  try {
    const result = await queryPromise;
    if (result.error) {
      captureDiagnosticError({
        error: result.error,
        table: metadata.table,
        query: metadata.query,
        userId: metadata.userId,
        context: metadata.context,
      });
    }
    return result;
  } catch (unexpectedError) {
    captureDiagnosticError({
      error: unexpectedError,
      table: metadata.table,
      query: metadata.query,
      userId: metadata.userId,
      context: { unexpectedException: true, ...metadata.context },
    });
    return { data: null, error: unexpectedError };
  }
}
