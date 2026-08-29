import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 * SUPABASE SERVICE-ROLE ADMIN INITIALIZER (SERVER-ONLY)
 * ============================================================================
 * CAUTION: NEVER import this into Client Components or expose the service role key!
 * This client bypasses Row Level Security (RLS) and is intended for background
 * administrative jobs, webhook handlers, and database seeds.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment variables.'
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
