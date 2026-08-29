import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * ============================================================================
 * SECURE SIGNED URL GENERATOR FOR LEARNING ASSETS
 * ============================================================================
 * Endpoint: GET /api/assets/download?path=certificates/cert-01.pdf
 * 
 * Responsibilities:
 *  1. Enforces user authentication via Supabase session cookie.
 *  2. Creates a temporary, cryptographically signed URL for private bucket objects.
 *  3. Automatically prompts browser download dialog ({ download: true }).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return NextResponse.json(
      { error: 'Missing required query parameter: "path"' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // 1. Authenticate user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized: You must be signed in to download learning assets.' },
      { status: 401 }
    );
  }

  // 2. Generate signed download URL valid for 60 seconds
  const expiresInSeconds = 60;
  const { data, error: storageError } = await supabase
    .storage
    .from('learning-assets')
    .createSignedUrl(filePath, expiresInSeconds, {
      download: true,
    });

  if (storageError) {
    return NextResponse.json(
      { error: storageError.message },
      { status: 500 }
    );
  }

  // 3. Return signed download URL payload
  return NextResponse.json({
    signedUrl: data.signedUrl,
    expiresInSeconds,
    fileName: filePath.split('/').pop(),
  });
}
