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

  // 2. Use admin client for ALL queries (bypasses RLS)
  const supabaseAdmin = createAdminClient()

  // 3. Verify user has access to this project
  const { data: userData } = (await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null }

  const isEmployee = userData?.role === 'employee'

  // 4. Fetch project with relations
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
    notFound()
  }

  // 5. Verify client user has access to this project (employees have access to all)
  if (!isEmployee) {
    const { data: userClient } = (await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id)
      .single()) as { data: { client_id: string } | null }

    // If user has a client association, verify it matches the project
    if (userClient && project.client_id !== userClient.client_id) {
      redirect('/dashboard/client')
    }
  }

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
