import { NextResponse } from 'next/server';
import { generateCertificatePdf, CertificateData } from '@/lib/certificate-generator';

/**
 * ============================================================================
 * API CONTROLLER: DYNAMIC PDF CERTIFICATE STREAMING ENDPOINT
 * ============================================================================
 * Endpoint: GET /api/certificates/download
 *           POST /api/certificates/download
 *
 * Query Params / JSON Body:
 *  - studentName: string
 *  - courseTitle: string
 *  - graduationDate?: string
 *  - certificateId?: string
 *
 * Response:
 *  - High-resolution Landscape A4 PDF binary stream
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const studentName = searchParams.get('studentName') || 'Alex Rivera';
    const courseTitle = searchParams.get('courseTitle') || 'AI Micro Degree';
    const graduationDate = searchParams.get('graduationDate') || undefined;
    const certificateId = searchParams.get('certificateId') || undefined;

    const certData: CertificateData = {
      studentName,
      courseTitle,
      graduationDate,
      certificateId,
    };

    const pdfUint8Array = await generateCertificatePdf(certData);

    return new Response(pdfUint8Array as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="GlobeSkill-Certificate-${studentName.replace(/\s+/g, '_')}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate skilling certificate PDF.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: Partial<CertificateData> = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const certData: CertificateData = {
      studentName: body.studentName || 'Alex Rivera',
      courseTitle: body.courseTitle || 'AI Micro Degree',
      graduationDate: body.graduationDate,
      certificateId: body.certificateId,
      partnerOrganization: body.partnerOrganization,
      gradePercentage: body.gradePercentage,
    };

    const pdfUint8Array = await generateCertificatePdf(certData);

    return new Response(pdfUint8Array as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="GlobeSkill-Certificate-${certData.studentName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate skilling certificate PDF.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
