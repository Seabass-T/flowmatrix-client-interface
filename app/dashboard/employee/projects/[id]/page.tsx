/**
 * Employee Project Detail Page
 *
 * Displays full project details with EDIT MODE for employees.
 * Accessible at: /dashboard/employee/projects/[id]
 *
 * PRD Reference: Section 4.2.8 (Project Detail View) + Section 4.3.5 (Edit Mode)
 *
 * PERFORMANCE: Lazy loads EditableProjectDetailContent to reduce initial bundle size
 *
 * Features:
 * - All project details with editable fields
 * - Auto-save with 1-second debounce
 * - Yellow borders on editable fields
 * - Back button returns to client view
 * - ROI charts and metrics (lazy loaded)
 */

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect, notFound } from 'next/navigation'
import { lazy, Suspense } from 'react'
import { ProjectWithRelations } from '@/types/database'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProjectCardSkeleton } from '@/components/LoadingSkeletons'

// Lazy load the heavy EditableProjectDetailContent component (contains charts)
const EditableProjectDetailContent = lazy(() =>
  import('@/components/EditableProjectDetailContent').then((mod) => ({
    default: mod.EditableProjectDetailContent,
  }))
)

interface EmployeeProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    clientId?: string
  }>
}

export default async function EmployeeProjectDetailPage({ params, searchParams }: EmployeeProjectDetailPageProps) {
  const { id } = await params
  const { clientId } = await searchParams

  // 1. Verify authentication
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  console.log('📄 Employee Project Detail Page: Fetching project', id, 'for user', user.id)

  // 2. Use admin client to fetch project with relations (bypasses RLS)
  const supabaseAdmin = createAdminClient()

  // Verify user is employee
  const { data: userData, error: userError } = (await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null; error: { message?: string } | null }

  if (!userData || userError || userData.role !== 'employee') {
    console.warn('⚠️ Non-employee trying to access employee project detail:', user.id)
    redirect('/dashboard/client')
  }

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

  console.log('✅ Employee Project Detail Page: Successfully loaded project', project.name)

  // Determine back link - use clientId from searchParams or project.client_id
  const backClientId = clientId || project.client_id
  const backHref = `/dashboard/employee/clients/${backClientId}`

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
            Back to Client View
          </Link>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <span className="px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
              EDIT MODE
            </span>
          </div>
        </div>
      </div>

      {/* Edit Mode Notice */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Edit Mode Active</h3>
              <p className="text-sm text-yellow-800 mt-1">
                All fields are editable. Changes auto-save after 1 second. Yellow borders indicate editable fields.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Content with Edit Capabilities */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          }
        >
          <EditableProjectDetailContent project={project} />
        </Suspense>
      </div>
    </div>
  )
}
