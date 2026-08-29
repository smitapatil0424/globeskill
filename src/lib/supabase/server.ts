import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * ============================================================================
 * SUPABASE SERVER-SIDE INITIALIZER
 * ============================================================================
 * Purpose: Used in Server Components, Server Actions, and Route Handlers (/api/*).
 * 
 * Cookie Handling: Next.js App Router (Next.js 15 & 16) treats cookies() as an
 * asynchronous call. This helper handles reading and setting auth session cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '⚠️ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local. Falling back to mock configuration.'
    );
  }

  return createServerClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be safely ignored if middleware is managing session refreshes.
          }
        },
      },
    }
  );
}
