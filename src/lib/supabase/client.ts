import { createBrowserClient } from '@supabase/ssr';

/**
 * ============================================================================
 * SUPABASE CLIENT-SIDE INITIALIZER
 * ============================================================================
 * Purpose: Used in Client Components ('use client').
 * 
 * Security: Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * These are safe to expose to the browser because queries are protected
 * by Supabase Row-Level Security (RLS) policies.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '⚠️ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local. Falling back to mock configuration.'
    );
  }

  return createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  );
}
