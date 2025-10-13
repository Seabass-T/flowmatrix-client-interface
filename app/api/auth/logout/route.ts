import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 *
 * Signs out the current user and clears the session cookie
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 500 }
      )
    }

    // Return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
