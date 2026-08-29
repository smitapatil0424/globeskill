import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes temporary lifespan

interface MockEnrolmentRecord {
  id: string;
  student_id: string;
  project_id: string;
  status: string;
  certificate_url: string | null;
  student_name: string;
  course_title: string;
}

const MOCK_ENROLMENTS: Record<string, MockEnrolmentRecord> = {
  'e0000000-0000-0000-0000-000000000001': {
    id: 'e0000000-0000-0000-0000-000000000001',
    student_id: 's0000000-0000-0000-0000-000000000001', // Liam Chen
    project_id: 'c0000000-0000-0000-0000-000000000001',
    status: 'completed',
    certificate_url:
      'https://mock.supabase.co/storage/v1/object/public/learning-assets/certificates/518f25a1-33b6-4713-be7d-079f8e1e6dfa.pdf',
    student_name: 'Liam Chen',
    course_title: 'AI Micro Degree',
  },
  'e0000000-0000-0000-0000-000000000002': {
    id: 'e0000000-0000-0000-0000-000000000002',
    student_id: 's0000000-0000-0000-0000-000000000002', // Carlos Mendoza
    project_id: 'c0000000-0000-0000-0000-000000000002',
    status: 'completed',
    certificate_url:
      'https://mock.supabase.co/storage/v1/object/public/learning-assets/certificates/carlos-mendoza-cloud.pdf',
    student_name: 'Carlos Mendoza',
    course_title: 'Hybrid Cloud & Kubernetes',
  },
};

/**
 * ============================================================================
 * SECURE CERTIFICATE DOWNLOAD ENDPOINT WITH SIGNED URLS
 * ============================================================================
 * Endpoint: GET /api/certificates/download/[enrolmentId]
 *
 * Security Invariants:
 *  1. Authenticates requesting user context.
 *  2. Ownership Verification: Enforces that students can ONLY access certificates
 *     for their own enrolment records (student_id == auth.uid()).
 *  3. Non-owners (other students) are rejected with 403 Forbidden.
 *  4. Generates a temporary, short-expiry signed URL (5 minutes) from Supabase
 *     Storage ('learning-assets' bucket), preventing permanent link leakage.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ enrolmentId: string }> }
) {
  try {
    const { enrolmentId } = await params;
    const url = new URL(request.url);
    const redirectDirectly = url.searchParams.get('redirect') === 'true';

    if (!enrolmentId) {
      return NextResponse.json(
        { error: 'Validation Error: enrolmentId path parameter is required.', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Authenticate Requesting User
    let callerId: string | null = null;
    let callerRole: string | null = null;

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (!authErr && authData?.user) {
        callerId = authData.user.id;
        callerRole = authData.user.user_metadata?.role || null;
      }
    } catch {
      callerId = null;
    }

    // Dev/Mock fallback overrides via header, cookie, or query param for automated testing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isMockDev =
      !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('your-project-id');

    if (isMockDev) {
      const testCallerId = url.searchParams.get('testCallerId') || request.headers.get('x-caller-id');
      const testCallerRole = url.searchParams.get('testCallerRole') || request.headers.get('x-caller-role');

      callerId = testCallerId || callerId || 's0000000-0000-0000-0000-000000000001'; // Default: Liam Chen
      callerRole = testCallerRole || callerRole || 'Student';
    }

    if (!callerId) {
      return NextResponse.json(
        {
          error: 'Authentication Required: Please log in to download this certificate.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // 2. Fetch Enrolment Profile & Certificate Information
    let enrolmentStudentId = '';
    let certificateUrl: string | null = null;
    let studentName = '';
    let courseTitle = '';
    let status = '';

    if (!isMockDev) {
      const { data: enrolment, error: fetchErr } = await supabase
        .from('student_enrolments')
        .select(
          `
          id,
          student_id,
          status,
          certificate_url,
          profiles:student_id (full_name),
          training_projects:project_id (title)
        `
        )
        .eq('id', enrolmentId)
        .single();

      if (fetchErr || !enrolment) {
        return NextResponse.json(
          { error: `Enrolment record with ID "${enrolmentId}" not found.`, code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      enrolmentStudentId = enrolment.student_id;
      certificateUrl = enrolment.certificate_url;
      status = enrolment.status;

      const profile = enrolment.profiles as unknown as { full_name?: string };
      const project = enrolment.training_projects as unknown as { title?: string };
      studentName = profile?.full_name || 'Learner';
      courseTitle = project?.title || 'Skilling Course';
    } else {
      // Mock lookup
      const mockRecord = MOCK_ENROLMENTS[enrolmentId];
      if (!mockRecord) {
        return NextResponse.json(
          { error: `Enrolment record with ID "${enrolmentId}" not found.`, code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      enrolmentStudentId = mockRecord.student_id;
      certificateUrl = mockRecord.certificate_url;
      status = mockRecord.status;
      studentName = mockRecord.student_name;
      courseTitle = mockRecord.course_title;
    }

    // 3. SECURITY GUARD: Ownership Verification
    // Students can ONLY access certificates for their own enrolment profile.
    // Staff (Trainer, NGO Administrator) may access supervised records.
    const isOwner = callerId === enrolmentStudentId;
    const isStaff = callerRole === 'Trainer' || callerRole === 'NGO Administrator';

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        {
          error:
            'Access Denied: You do not own this enrolment record. Students can only download their own verified credentials.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // 4. Verify that the student has graduated / certificate has been issued
    if (status !== 'completed' && !certificateUrl) {
      return NextResponse.json(
        {
          error:
            'Certificate Not Available: You must complete and graduate from this course before a certificate can be downloaded.',
          code: 'CERTIFICATE_NOT_ISSUED',
        },
        { status: 400 }
      );
    }

    // 5. Extract Storage Path from certificate_url
    // e.g. "https://.../storage/v1/object/public/learning-assets/certificates/uuid.pdf" -> "certificates/uuid.pdf"
    let storagePath = `certificates/${enrolmentId}.pdf`;

    if (certificateUrl) {
      const match = certificateUrl.match(/learning-assets\/(.+)$/);
      if (match && match[1]) {
        storagePath = decodeURIComponent(match[1]);
      }
    }

    // 6. Generate Temporary Short-Expiry Signed URL from Supabase Storage
    let signedUrl = '';
    const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY_SECONDS * 1000).toISOString();

    if (!isMockDev) {
      const { data: signedData, error: signErr } = await supabase.storage
        .from('learning-assets')
        .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

      if (signErr || !signedData?.signedUrl) {
        throw new Error(
          `Failed to sign certificate storage object: ${signErr?.message || 'Storage error'}`
        );
      }

      signedUrl = signedData.signedUrl;
    } else {
      // Local Mock Signed URL simulation with expiry token
      const mockToken = Buffer.from(`${enrolmentId}:${Date.now()}:${SIGNED_URL_EXPIRY_SECONDS}`).toString('hex');
      signedUrl = `http://localhost:3000/api/certificates/download?studentName=${encodeURIComponent(studentName)}&courseTitle=${encodeURIComponent(courseTitle)}&token=${mockToken}&expiresIn=${SIGNED_URL_EXPIRY_SECONDS}`;
    }

    // 7. Optional Browser Direct Redirect
    if (redirectDirectly) {
      return NextResponse.redirect(signedUrl, { status: 307 });
    }

    // 8. Return Secure JSON Payload with Short-Lived Signed URL
    return NextResponse.json(
      {
        success: true,
        message: 'Temporary signed download link generated successfully.',
        data: {
          enrolmentId,
          studentName,
          courseTitle,
          storageBucket: 'learning-assets',
          storagePath,
          signedUrl,
          expiresInSeconds: SIGNED_URL_EXPIRY_SECONDS,
          expiresAt,
          securityNote: 'This signed URL is valid for 5 minutes only and cannot be accessed publicly without this token.',
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err) {
    console.error('Certificate download authorization error:', err);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while generating the signed certificate link.',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
