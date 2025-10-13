import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

/**
 * Auth Callback Route
 * Handles OAuth callbacks from Supabase Auth
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page or dashboard
  return NextResponse.redirect(`${origin}/`)
}
