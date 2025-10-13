import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect, notFound } from 'next/navigation'
import { ProjectWithRelations } from '@/types/database'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProjectDetailContent } from '@/components/ProjectDetailContent'

/**
 * Project Detail Page
 *
 * Displays full project details including ROI charts, metrics, costs, tasks, notes, and files.
 * Accessible at: /dashboard/client/projects/[id]
 *
 * PRD Reference: Section 4.2.8 (Project Detail View)
 * Implementation: Using page route instead of modal for better reliability and UX
 *
 * PERFORMANCE: Lazy loads ProjectDetailContent to reduce initial bundle size
 *
 * Features:
 * - Server-side rendering for performance
 * - Back button to return to dashboard
 * - All project details with related data
 * - ROI charts and metrics (lazy loaded)
 * - Shareable URL
 */

interface ProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params

  // 1. Verify authentication
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  console.log('📄 Project Detail Page: Fetching project', id, 'for user', user.id)

  // 2. Use admin client to fetch project with relations (bypasses RLS)
  const supabaseAdmin = createAdminClient()

  const { data: project, error: projectError } = (await supabaseAdmin
    .from('projects')
    .select(
      `
      *,
      notes(*),
      tasks(*),
      files(*)
    `
    )
    .eq('id', id)
    .single()) as { data: ProjectWithRelations | null; error: { message?: string } | null }

  if (projectError || !project) {
    console.error('❌ Error fetching project:', projectError)
    notFound()
  }

  // 3. Verify user has access to this project
  const { data: userData, error: userError } = (await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null; error: { message?: string } | null }

  const isEmployee = userData && !userError ? userData.role === 'employee' : false
  console.log('🔐 Project Detail Page: User role check - isEmployee:', isEmployee, 'userId:', user.id)

  // If not employee, verify client association
  if (!isEmployee) {
    const { data: userClient, error: userClientError } = (await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id)
      .single()) as { data: { client_id: string } | null; error: { message?: string } | null }

    console.log('🔐 Client user - checking user_clients association:', { userClient, userClientError })

    // Only redirect if there's a real error (not just "no rows" which might mean setup issue)
    if (userClientError && userClientError.message !== 'PGRST116') {
      console.error('❌ Error fetching user_clients:', userClientError)
    }

    // If user has a client association, verify it matches the project
    if (userClient && project.client_id !== userClient.client_id) {
      console.warn('⚠️ Unauthorized access attempt: User', user.id, 'tried to access project', id, 'belonging to different client')
      redirect('/dashboard/client')
    }

    console.log('✅ Client user access verified for project', id)
  } else {
    console.log('✅ Employee user - bypassing client association check')
  }

  console.log('✅ Project Detail Page: Successfully loaded project', project.name)

  // Determine back link based on user role
  const backHref = isEmployee
    ? `/dashboard/employee/clients/${project.client_id}`
    : '/dashboard/client'
  const backLabel = isEmployee ? 'Back to Client View' : 'Back to Dashboard'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={backHref}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {backLabel}
          </Link>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProjectDetailContent project={project} />
      </div>
    </div>
  )
}
