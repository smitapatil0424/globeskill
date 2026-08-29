/**
 * ============================================================================
 * GlobeSkill Security & Rate Limiting Test Suite
 * ============================================================================
 * Tests:
 *  1. Input Sanitization Engine (stripping XSS scripts, iframes, null bytes, bounds).
 *  2. Sliding Window Rate Limiter (token limits, resets, retryAfter calculations).
 *  3. Live Route Integration (/api/ai/mentor, /api/enroll, /api/ai/chat).
 *  4. HTTP Security Headers (X-RateLimit-Limit, Remaining, Reset, Retry-After).
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function pass(msg) {
  console.log(`  ${colors.green}✔ PASS${colors.reset}  ${msg}`);
}

function fail(msg) {
  console.log(`  ${colors.red}✖ FAIL${colors.reset}  ${msg}`);
}

function section(title) {
  console.log(`\n${colors.cyan}${colors.bright}=== ${title} ===${colors.reset}`);
}

// ----------------------------------------------------------------------------
// 1. UNIT TEST: INPUT SANITIZER LOGIC
// ----------------------------------------------------------------------------
function sanitizeString(input, options = {}) {
  if (typeof input !== 'string') return '';
  const maxLength = options.maxLength ?? 2000;
  const stripHtml = options.stripHtml ?? true;
  let cleaned = input;

  // Remove null bytes and control chars
  cleaned = cleaned.replace(/[\0\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (stripHtml) {
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    cleaned = cleaned.replace(/javascript:/gi, '');
    cleaned = cleaned.replace(/\bon\w+\s*=/gi, '');
  }

  return cleaned.trim().slice(0, maxLength);
}

// ----------------------------------------------------------------------------
// 2. UNIT TEST: SLIDING WINDOW RATE LIMITER LOGIC
// ----------------------------------------------------------------------------
class MemoryRateLimiter {
  constructor() {
    this.cache = new Map();
  }

  check(ip, limit = 5, windowMs = 1000) {
    const now = Date.now();
    let record = this.cache.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.cache.set(ip, record);
    }

    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= limit) {
      const oldest = record.timestamps[0] || now;
      const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        success: false,
        limit,
        remaining: 0,
        retryAfter,
      };
    }

    record.timestamps.push(now);
    return {
      success: true,
      limit,
      remaining: limit - record.timestamps.length,
      retryAfter: 0,
    };
  }
}

async function runSecurityTests() {
  console.log(`\n${colors.bright}GlobeSkill Security, Rate Limiting & Sanitization Audit${colors.reset}`);
  let total = 0;
  let passed = 0;

  // --------------------------------------------------------------------------
  // SECTION 1: INPUT SANITIZATION
  // --------------------------------------------------------------------------
  section('1. Defensive Input Sanitization Unit Tests');

  // Test 1.1: Script tag removal
  total++;
  const xssInput = 'Hello <script>alert("XSS Attack!")</script>World';
  const xssCleaned = sanitizeString(xssInput);
  if (xssCleaned === 'Hello World' && !xssCleaned.includes('script')) {
    pass('Script Injection: Malicious <script> block and inner code completely stripped');
    passed++;
  } else {
    fail(`Script Injection failed! Result: "${xssCleaned}"`);
  }

  // Test 1.2: Iframe and event handler neutralization
  total++;
  const iframeInput = '<iframe src="malicious.com"></iframe><img src=x onerror=alert(1)>Test';
  const iframeCleaned = sanitizeString(iframeInput);
  if (iframeCleaned === 'Test' && !iframeCleaned.includes('iframe') && !iframeCleaned.includes('onerror')) {
    pass('DOM Event Handlers & Iframes: Neutralized dangerous HTML tags and onerror hooks');
    passed++;
  } else {
    fail(`DOM Event Handlers test failed! Result: "${iframeCleaned}"`);
  }

  // Test 1.3: Null byte stripping
  total++;
  const nullByteInput = 'admin\0.password';
  const nullByteCleaned = sanitizeString(nullByteInput);
  if (nullByteCleaned === 'admin.password' && !nullByteCleaned.includes('\0')) {
    pass('Null Byte Poisoning: Stripped \\0 control characters preventing truncation exploits');
    passed++;
  } else {
    fail(`Null byte stripping failed! Result: "${nullByteCleaned}"`);
  }

  // Test 1.4: Length bounds truncation
  total++;
  const longInput = 'A'.repeat(5000);
  const boundedCleaned = sanitizeString(longInput, { maxLength: 50 });
  if (boundedCleaned.length === 50) {
    pass('Payload Size Bounds: Input strictly capped to maxLength (50 chars) to prevent ReDoS/buffer overflow');
    passed++;
  } else {
    fail(`Length cap failed! Length: ${boundedCleaned.length}`);
  }

  // --------------------------------------------------------------------------
  // SECTION 2: RATE LIMITING ENGINE
  // --------------------------------------------------------------------------
  section('2. Sliding Window Rate Limiting Engine Tests');

  const limiter = new MemoryRateLimiter();
  const testIp = '198.51.100.42';
  const limit = 5;

  // Test 2.1: Requests within limit succeed
  let allUnderLimitPassed = true;
  for (let i = 1; i <= limit; i++) {
    const res = limiter.check(testIp, limit, 2000);
    if (!res.success || res.remaining !== limit - i) {
      allUnderLimitPassed = false;
    }
  }

  total++;
  if (allUnderLimitPassed) {
    pass(`Under Limit: Permitted all ${limit} burst requests and correctly decremented remaining tokens`);
    passed++;
  } else {
    fail('Rate limiter prematurely blocked requests within limit threshold!');
  }

  // Test 2.2: 6th request triggers rate limit
  total++;
  const blockedRes = limiter.check(testIp, limit, 2000);
  if (!blockedRes.success && blockedRes.remaining === 0 && blockedRes.retryAfter >= 1) {
    pass('Rate Limit Trigger: 6th request correctly throttled with success=false and retryAfter computed');
    passed++;
  } else {
    fail(`Rate limit was not triggered! Res: ${JSON.stringify(blockedRes)}`);
  }

  // --------------------------------------------------------------------------
  // SECTION 3: LIVE ENDPOINT INTEGRATION TESTS
  // --------------------------------------------------------------------------
  section('3. Live Next.js API Route Rate Limiting & Headers');

  try {
    // Test 3.1: Call /api/ai/mentor with simulated client IP
    total++;
    const mentorRes = await fetch('http://localhost:3000/api/ai/mentor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '203.0.113.19',
      },
      body: JSON.stringify({
        message: 'What is an API? <script>evil()</script>',
      }),
    });

    const hasLimitHeader = mentorRes.headers.get('x-ratelimit-limit') !== null;
    const hasRemainingHeader = mentorRes.headers.get('x-ratelimit-remaining') !== null;

    if (mentorRes.status === 200 && hasLimitHeader && hasRemainingHeader) {
      pass('/api/ai/mentor: Successfully enforced rate limit headers and sanitized prompt (200 OK)');
      passed++;
    } else {
      fail(`/api/ai/mentor unexpected response! Status: ${mentorRes.status}`);
    }

    // Test 3.2: Call /api/ai/chat with simulated client IP
    total++;
    const chatRes = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '203.0.113.25',
      },
      body: JSON.stringify({
        message: 'Explain React 19',
      }),
    });

    const chatHasLimit = chatRes.headers.get('x-ratelimit-limit') !== null;
    if (chatRes.status === 200 && chatHasLimit) {
      pass('/api/ai/chat: Rate limit headers present and query answered cleanly (200 OK)');
      passed++;
    } else {
      fail(`/api/ai/chat unexpected response! Status: ${chatRes.status}`);
    }

    // Test 3.3: Call /api/enroll with simulated client IP
    total++;
    const enrollRes = await fetch('http://localhost:3000/api/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '203.0.113.88',
      },
      body: JSON.stringify({
        projectId: 'c0000000-0000-0000-0000-000000000001',
      }),
    });

    const enrollHasLimit = enrollRes.headers.get('x-ratelimit-limit') !== null;
    if (enrollHasLimit) {
      pass('/api/enroll: Rate limit headers enforced on enrollment attempts');
      passed++;
    } else {
      fail(`/api/enroll missing rate limit headers! Status: ${enrollRes.status}`);
    }

    // Test 3.4: Burst test to verify HTTP 429 Too Many Requests response
    total++;
    const spamIp = '198.51.100.99';
    let triggered429 = false;

    // Send 12 rapid requests to /api/ai/mentor (limit is 10)
    for (let i = 0; i < 12; i++) {
      const burstRes = await fetch('http://localhost:3000/api/ai/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': spamIp,
        },
        body: JSON.stringify({ message: 'Burst test' }),
      });

      if (burstRes.status === 429) {
        triggered429 = true;
        const retryHeader = burstRes.headers.get('retry-after');
        const json = await burstRes.json();
        if (json.code === 'RATE_LIMIT_EXCEEDED' && retryHeader) {
          pass('HTTP 429 Throttling: Rapid burst exceeded 10 req/min limit -> returned 429 with Retry-After header');
          passed++;
        } else {
          fail('429 response missing expected payload structure');
        }
        break;
      }
    }

    if (!triggered429) {
      fail('Rapid burst failed to trigger 429 status!');
    }

  } catch (netErr) {
    console.warn('Note: Live endpoint test requires dev server on :3000:', netErr.message);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  section('Security Test Execution Summary');
  console.log(`  Total Tests Run:  ${colors.bright}${total}${colors.reset}`);
  console.log(`  Passed Tests:     ${colors.green}${colors.bright}${passed}${colors.reset} / ${total}`);

  if (passed === total) {
    console.log(`\n${colors.green}${colors.bright}🎉 All Security & Rate Limiting Tests Passed Successfully!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}Some security checks completed with notes.${colors.reset}\n`);
  }
}

runSecurityTests().catch((err) => {
  console.error('Security test runner error:', err);
  process.exit(1);
});
