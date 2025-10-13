import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { ErrorBoundary } from '@/components/ErrorBoundary'

/**
 * Client Dashboard Layout
 *
 * Features:
 * - Server-side authentication check
 * - Fetches client company name for header
 * - Wraps all client dashboard pages
 * - Consistent header across all client pages
 * - Mobile-responsive layout
 *
 * Layout Structure:
 * - Sticky header with logout
 * - Content area with max-width container
 * - Gray background for contrast with white cards
 */
export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Get current user (use regular client for auth)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user details and role using ADMIN CLIENT (bypasses RLS)
  const { data: userData } = (await supabaseAdmin
    .from('users')
    .select('email, role')
    .eq('id', user.id)
    .single()) as { data: { email: string; role: 'client' | 'employee' } | null }

  // Verify user is a client
  if (userData?.role !== 'client') {
    redirect('/dashboard/employee')
  }

  // Get client company information using ADMIN CLIENT (bypasses RLS)
  let clientName = 'Client Portal'

  try {
    const { data: userClientData } = (await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id)
      .single()) as { data: { client_id: string } | null }

    if (userClientData) {
      const { data: clientData } = (await supabaseAdmin
        .from('clients')
        .select('company_name')
        .eq('id', userClientData.client_id)
        .single()) as { data: { company_name: string } | null }

      if (clientData) {
        clientName = clientData.company_name
      }
    }
  } catch (error) {
    console.error('Error fetching client name:', error)
    // Continue with default name if fetch fails
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header
          clientName={clientName}
          userName={userData?.email}
          userRole="client"
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  )
}
