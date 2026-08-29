import { NextResponse } from 'next/server';

/**
 * ============================================================================
 * GLOBESKILL SECURITY SUITE: INPUT SANITIZATION & RATE LIMITING
 * ============================================================================
 * Purpose:
 *  1. Lightweight server-side sliding-window rate limiter per client IP.
 *  2. Defensive input sanitization (XSS mitigation, control char stripping, length bounds).
 *  3. Standardized HTTP security headers (X-RateLimit-*, Retry-After, 429 status).
 */

// ----------------------------------------------------------------------------
// 1. IN-MEMORY RATE LIMITER ENGINE (SLIDING WINDOW)
// ----------------------------------------------------------------------------

interface RateLimitRecord {
  timestamps: number[];
  lastCleanup: number;
}

export interface RateLimitConfig {
  /** Max allowed requests within the time window. Default: 15 */
  limit?: number;
  /** Window duration in milliseconds. Default: 60,000ms (1 minute) */
  windowMs?: number;
  /** Custom identifier key override. Defaults to client IP */
  key?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Epoch timestamp in seconds
  retryAfter: number; // Seconds to wait
}

// Map cache stored in module scope for persistent memory across route invocations
const rateLimitCache = new Map<string, RateLimitRecord>();

// Periodic cleanup threshold to prevent memory bloat
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastGlobalCleanup = Date.now();

function purgeExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL_MS) return;

  lastGlobalCleanup = now;
  for (const [key, record] of rateLimitCache.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitCache.delete(key);
    }
  }
}

/**
 * Extracts client IP from incoming request headers
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;

  // 1. Standard reverse-proxy forwarded header
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  // 2. Cloudflare connecting IP
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  // 3. Real IP header
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  // 4. Fallback localhost for local dev/testing
  return '127.0.0.1';
}

/**
 * Checks request rate limit against the client IP address
 */
export function checkRateLimit(req: Request, config: RateLimitConfig = {}): RateLimitResult {
  const limit = config.limit ?? 15;
  const windowMs = config.windowMs ?? 60 * 1000;
  const ip = config.key || getClientIp(req);
  const now = Date.now();

  purgeExpiredRecords(windowMs);

  let record = rateLimitCache.get(ip);
  if (!record) {
    record = { timestamps: [], lastCleanup: now };
    rateLimitCache.set(ip, record);
  }

  // Filter out timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const currentCount = record.timestamps.length;
  const resetSeconds = Math.ceil((now + windowMs) / 1000);

  if (currentCount >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetSeconds,
      retryAfter: retryAfterSeconds,
    };
  }

  // Record this request
  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    success: true,
    limit,
    remaining,
    reset: resetSeconds,
    retryAfter: 0,
  };
}

/**
 * Helper to generate a standardized HTTP 429 Too Many Requests response
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests. Please slow down and try again.',
      code: 'RATE_LIMIT_EXCEEDED',
      limit: result.limit,
      retryAfterSeconds: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
        'Retry-After': String(result.retryAfter),
      },
    }
  );
}

/**
 * Applies X-RateLimit headers to any outgoing successful response
 */
export function applyRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.reset));
  return response;
}

// ----------------------------------------------------------------------------
// 2. DEFENSIVE INPUT SANITIZATION & VALIDATION
// ----------------------------------------------------------------------------

export interface SanitizeOptions {
  maxLength?: number;
  stripHtml?: boolean;
}

/**
 * Sanitizes an untrusted user input string:
 * - Strips dangerous HTML tags (<script>, <iframe>, <object>, etc.)
 * - Strips inline javascript: and event handlers (onload=, onerror=)
 * - Removes null bytes (\0) and invisible control characters
 * - Truncates to maxLength (default: 2000 characters)
 * - Trims leading and trailing whitespace
 */
export function sanitizeString(input: unknown, options: SanitizeOptions = {}): string {
  if (typeof input !== 'string') {
    return '';
  }

  const maxLength = options.maxLength ?? 2000;
  const stripHtml = options.stripHtml ?? true;

  let cleaned = input;

  // 1. Remove null bytes and non-printable control characters (except newline \n, tab \t)
  cleaned = cleaned.replace(/[\0\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (stripHtml) {
    // 2. Strip dangerous script and iframe blocks entirely (including content)
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

    // 3. Remove all remaining HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // 4. Neutralize javascript: URI schemes and DOM event handlers
    cleaned = cleaned.replace(/javascript:/gi, '');
    cleaned = cleaned.replace(/\bon\w+\s*=/gi, '');
  }

  // 5. Trim whitespace and enforce maximum bounds
  return cleaned.trim().slice(0, maxLength);
}

/**
 * Validates whether a given string is a valid UUID (v1-v5 format)
 */
export function isValidUUID(uuid: unknown): boolean {
  if (typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
}

/**
 * Validates a basic email address format
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Deep-sanitizes all string fields within an arbitrary JSON-compatible object or array
 */
export function sanitizeObject<T>(data: T, options: SanitizeOptions = {}): T {
  if (typeof data === 'string') {
    return sanitizeString(data, options) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item, options)) as unknown as T;
  }

  if (data !== null && typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      sanitizedObj[key] = sanitizeObject(val, options);
    }
    return sanitizedObj as T;
  }

  return data;
}
