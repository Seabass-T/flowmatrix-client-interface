import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Validate required environment variables
 * Throws descriptive errors if any are missing or invalid
 */
function validateEnvVars() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missing: string[] = []
  const invalid: string[] = []

  // Check for missing variables
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please copy .env.example to .env.local and fill in your Supabase credentials.\n` +
      `Get your keys from: https://supabase.com/dashboard/project/_/settings/api`
    )
  }

  // Validate URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    invalid.push(
      'NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL (format: https://[project-ref].supabase.co)'
    )
  }

  // Validate anon key format (should be a JWT)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!anonKey.includes('.') || anonKey.length < 100) {
    invalid.push(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (should be a JWT token)'
    )
  }

  if (invalid.length > 0) {
    throw new Error(
      `Invalid environment variables:\n${invalid.map(v => `  - ${v}`).join('\n')}`
    )
  }
}

// Validate environment variables before creating client
validateEnvVars()

/**
 * Supabase client for client-side operations
 * Uses anonymous key and respects Row-Level Security (RLS) policies
 */
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

/**
 * Helper to check if Supabase client is properly initialized
 * Useful for debugging connection issues
 */
export function getSupabaseStatus() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    isConfigured: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  }
}

// Type exports for convenience
export type { Database }
