import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Supabase client for browser/client components
 * Properly handles cookies for session management with Next.js
 */
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
