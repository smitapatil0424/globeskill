import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * ============================================================================
 * NEXT.JS EDGE MIDDLEWARE - AUTH & RBAC ROUTE PROTECTION
 * ============================================================================
 * Intercepts incoming requests at the edge before rendering or routing happens.
 *
 * Responsibilities:
 *  1. Refreshes active Supabase session cookies automatically.
 *  2. Authentication Guard: Redirects unauthenticated requests away from protected paths to /login.
 *  3. RBAC Guard: Protects /admin routes by verifying user has 'NGO Administrator' role.
 *  4. Guest Guard: Redirects logged-in users away from /login and /signup.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Verify user identity via secure server-side JWT check
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch {
    user = null;
  }

  // Support demo role testing via mock_role cookie if not actively logged in with Supabase JWT
  const mockRole = request.cookies.get('mock_role')?.value;
  if (!user && mockRole) {
    user = {
      id: 'mock-demo-user-uuid',
      email: `${mockRole.toLowerCase().replace(/\s+/g, '')}@globeskill.org`,
      user_metadata: {
        full_name: `Demo ${mockRole}`,
        role: mockRole,
      },
    } as unknown as typeof user;
  }

  const { pathname } = request.nextUrl;

  // Path classifications
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isProtectedRoute = isAdminRoute || pathname.startsWith('/dashboard') || pathname.startsWith('/profile');

  const isTrainerRoute = pathname.startsWith('/dashboard/trainer');

  // Rule 1: Not logged in & requesting a protected route -> Redirect to /login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rule 2A: Trainer Route Guard -> Only 'Trainer' or 'NGO Administrator' allowed
  if (isTrainerRoute && user) {
    let role = user.user_metadata?.role;
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      role = profile?.role;
    }

    if (role !== 'Trainer' && role !== 'NGO Administrator') {
      const unauthUrl = new URL('/unauthorized', request.url);
      unauthUrl.searchParams.set('hub', 'Trainer Management Hub');
      unauthUrl.searchParams.set('required', 'trainer, admin');
      return NextResponse.redirect(unauthUrl);
    }
  }

  // Rule 2B: Logged in & requesting /admin -> Enforce 'NGO Administrator' Role
  if (isAdminRoute && user) {
    let role = user.user_metadata?.role;

    // If role is missing from JWT metadata, fetch from public.profiles
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      role = profile?.role;
    }

    if (role !== 'NGO Administrator') {
      // Forbidden access: Redirect to unauthorized page with context
      const unauthUrl = new URL('/unauthorized', request.url);
      unauthUrl.searchParams.set('hub', 'NGO Admin Command Center');
      unauthUrl.searchParams.set('required', 'admin');
      return NextResponse.redirect(unauthUrl);
    }
  }

  // Rule 3: Already logged in & requesting login/signup -> Redirect to homepage
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static assets)
     * - _next/image (image optimization files)
     * - favicon.ico (browser icon)
     * - Public API health route
     * - Public image files (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
