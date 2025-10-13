/**
 * Employee Dashboard Layout
 *
 * Wraps all employee dashboard routes.
 * Ensures only authenticated users with role='employee' can access.
 * Prevents infinite redirect loops by using admin client for role verification.
 *
 * PRD Reference: Section 4.3 (Employee Dashboard)
 * CRITICAL: Uses admin client to bypass RLS for role checks (see CLAUDE.md Section 3)
 */

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  // 1. Auth check with regular client
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Use ADMIN CLIENT for role verification (bypasses RLS)
  const supabaseAdmin = createAdminClient()
  const { data: userData } = (await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: 'client' | 'employee' } | null }

  // 3. Redirect non-employees to client dashboard
  if (!userData || userData.role !== 'employee') {
    redirect('/dashboard/client')
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
