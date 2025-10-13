import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Supabase ADMIN client for server-side operations
 *
 * IMPORTANT: This uses the SERVICE_ROLE_KEY which BYPASSES ALL RLS POLICIES.
 *
 * Use this ONLY in:
 * - Server Components
 * - Server Actions
 * - API Routes
 * - Middleware
 *
 * NEVER import this in Client Components - it would expose the service role key!
 *
 * This eliminates ALL RLS issues for server-side queries.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
