import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Supabase client for browser/client components
 * Properly handles cookies for session management with Next.js
 */
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'MISSING')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'MISSING')
    throw new Error('Supabase configuration error: Missing environment variables')
  }

  if (!supabaseUrl.startsWith('http')) {
    console.error('❌ Invalid SUPABASE_URL format:', supabaseUrl)
    throw new Error('Supabase URL must start with http:// or https://')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
