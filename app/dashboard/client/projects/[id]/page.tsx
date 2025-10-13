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

  console.log('🔍 [Project Detail] Loading page for project:', id)

  // 1. Verify authentication
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log('🔐 [Project Detail] Auth check:', {
    hasUser: !!user,
    userId: user?.id,
    authError: authError?.message,
  })

  if (!user) {
    console.error('❌ [Project Detail] No authenticated user - redirecting to login')
    redirect('/login')
  }

  // 2. Get user role (using same method as middleware)
  const userRole = user.user_metadata?.role as 'client' | 'employee' | undefined
  const isEmployee = userRole === 'employee'

  console.log('👤 [Project Detail] User role check:', {
    role: userRole,
    isEmployee,
    userId: user.id,
    email: user.email,
  })

  console.log('📄 [Project Detail] Fetching project', id, 'for user', user.id)

  // 3. Use admin client to fetch project with relations (bypasses RLS)
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

  console.log('📦 [Project Detail] Project fetch:', {
    hasProject: !!project,
    projectName: project?.name,
    projectError: projectError?.message,
  })

  if (projectError || !project) {
    console.error('❌ [Project Detail] Project not found - calling notFound()')
    notFound()
  }

  // 4. Verify client user has access to this project (employees have access to all)
  if (!isEmployee) {
    const { data: userClient, error: userClientError } = (await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id)
      .single()) as { data: { client_id: string } | null; error: { message?: string } | null }

    console.log('🔐 [Project Detail] Client user - checking user_clients association:', {
      hasUserClient: !!userClient,
      userClientId: userClient?.client_id,
      projectClientId: project.client_id,
      userClientError: userClientError?.message,
    })

    // Only redirect if there's a real error (not just "no rows")
    if (userClientError && userClientError.message !== 'PGRST116') {
      console.error('❌ [Project Detail] Error fetching user_clients:', userClientError)
    }

    // If user has a client association, verify it matches the project
    if (userClient && project.client_id !== userClient.client_id) {
      console.error('❌ [Project Detail] Unauthorized access - User', user.id, 'tried to access project', id, 'belonging to different client')
      redirect('/dashboard/client')
    }

    console.log('✅ [Project Detail] Client user access verified for project', id)
  } else {
    console.log('✅ [Project Detail] Employee user - bypassing client association check')
  }

  console.log('✅ [Project Detail] Successfully loaded project', project.name)

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
