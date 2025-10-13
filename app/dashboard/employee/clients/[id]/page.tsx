/**
 * Employee View of Individual Client Dashboard
 *
 * This page allows employees to view and edit a specific client's dashboard.
 * Features (PRD Section 4.3.5 - Edit Mode):
 * - View client's projects, metrics, notes, tasks
 * - Edit mode with auto-save functionality (1-second debounce)
 * - Add FlowMatrix AI notes
 * - Manage tasks
 * - View client notes (read-only)
 *
 * PRD Reference: Section 4.3.5 (Edit Mode)
 * Access: Only users with role='employee'
 */

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { ProjectCardList } from '@/components/ProjectCardList'
import { NotesPanel } from '@/components/NotesPanel'
import { TasksSection } from '@/components/TasksSection'
import { EditableWageField } from '@/components/EditableWageField'
import { MetricCard } from '@/components/MetricCard'
import { DollarSign, Clock, Wallet } from 'lucide-react'
import {
  calculateTotalHoursSaved,
  calculateROI,
  calculateTotalCost,
  formatCurrency,
  formatHours,
} from '@/lib/calculations'
import { Project, Client } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EmployeeClientViewPage({ params }: PageProps) {
  const { id: clientId } = await params

  console.log('🔍 [Employee Client View] Loading page for client:', clientId)

  // 1. Auth check with regular client
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log('🔐 [Employee Client View] Auth check:', {
    hasUser: !!user,
    userId: user?.id,
    authError: authError?.message,
  })

  if (!user) {
    console.error('❌ [Employee Client View] No authenticated user - redirecting to login')
    redirect('/login')
  }

  // 2. Use ADMIN CLIENT for data queries
  const supabaseAdmin = createAdminClient()

  // Verify user is employee
  const { data: userData, error: userError } = (await supabaseAdmin
    .from('users')
    .select('email, role')
    .eq('id', user.id)
    .single()) as { data: { email: string; role: 'client' | 'employee' } | null; error: Error | null }

  console.log('👤 [Employee Client View] User role check:', {
    hasUserData: !!userData,
    role: userData?.role,
    email: userData?.email,
    userError: userError?.message,
  })

  if (!userData || userData.role !== 'employee') {
    console.error('❌ [Employee Client View] User is not employee - redirecting to client dashboard')
    redirect('/dashboard/client')
  }

  // 3. Fetch client data with projects
  const { data: client, error: clientError } = (await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()) as { data: Client | null; error: Error | null }

  console.log('🏢 [Employee Client View] Client fetch:', {
    hasClient: !!client,
    clientName: client?.company_name,
    clientError: clientError?.message,
  })

  if (clientError || !client) {
    console.error('❌ [Employee Client View] Client not found - calling notFound()')
    notFound()
  }

  // 4. Fetch all projects for this client
  const { data: projects, error: projectsError } = (await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })) as { data: Project[] | null; error: Error | null }

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
  }

  // 5. Fetch all tasks for client's projects
  const projectIds = projects?.map((p) => p.id) || []
  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select(
      `
      *,
      project:projects!inner(id, name)
    `
    )
    .in('project_id', projectIds)
    .order('due_date', { ascending: true, nullsFirst: false })

  // 6. Calculate aggregate metrics
  const metrics = calculateAggregateMetrics(projects || [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/dashboard/employee"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Employee Dashboard
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{client.company_name}</h1>
            <p className="text-gray-600 mt-1">
              {client.industry || 'Industry not specified'} • Employee View
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Edit Mode Notice */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <Pencil className="h-5 w-5 text-yellow-800 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Edit Mode Active</h3>
              <p className="text-sm text-yellow-800 mt-1">
                All project fields are editable. Changes auto-save after 1 second. Yellow borders indicate editable fields.
              </p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Company Name</p>
              <p className="text-lg font-semibold text-gray-900">{client.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Industry</p>
              <p className="text-lg font-semibold text-gray-900">
                {client.industry || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Default Wage</p>
              <EditableWageField
                clientId={client.id}
                currentWage={client.avg_employee_wage}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Client Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(client.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Total ROI"
              value={formatCurrency(metrics.totalROI)}
              subtitle="all time"
              icon={<DollarSign className="h-6 w-6" />}
              accentColor="orange"
            />
            <MetricCard
              title="Time Saved"
              value={formatHours(metrics.totalTimeSaved)}
              subtitle="all time"
              icon={<Clock className="h-6 w-6" />}
              accentColor="teal"
            />
            <MetricCard
              title="Total Costs"
              value={formatCurrency(metrics.totalCosts)}
              subtitle="all time"
              icon={<Wallet className="h-6 w-6" />}
              accentColor="blue"
            />
          </div>
        </div>

        {/* Tasks Section */}
        <TasksSection
          initialTasks={tasks || []}
          projects={projects || []}
          isEmployee={true}
        />

        {/* Projects Section - WITH EDIT MODE */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Projects & Systems
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({projects?.length || 0} total)
            </span>
          </h2>
          <ProjectCardList
            projects={projects || []}
            timeRange="all"
            isEditMode={true} // ⭐ EDIT MODE ENABLED
            basePath="/dashboard/employee/projects" // Navigate to employee project detail page
          />
        </div>

        {/* Notes Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Communication</h2>
          <NotesPanel
            projects={projects || []}
            userId={user.id}
            userRole="employee"
            initialNotes={[]}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate aggregate metrics from all projects
 */
function calculateAggregateMetrics(projects: Project[]) {
  // Filter only active projects for ROI calculations
  const activeProjects = projects.filter((p) => p.status === 'active')

  let totalROI = 0
  let totalTimeSaved = 0
  let totalCosts = 0

  for (const project of activeProjects) {
    // Calculate hours saved for this project
    const hoursForProject = calculateTotalHoursSaved(
      project.hours_saved_daily || undefined,
      project.hours_saved_weekly || undefined,
      project.hours_saved_monthly || undefined,
      project.go_live_date ? new Date(project.go_live_date) : undefined,
      'all'
    )

    totalTimeSaved += hoursForProject

    // Calculate ROI for this project
    if (project.employee_wage) {
      const roi = calculateROI(hoursForProject, project.employee_wage)
      totalROI += roi
    }

    // Calculate total costs (always all-time)
    const cost = calculateTotalCost(
      project.dev_cost || 0,
      project.implementation_cost || 0,
      project.monthly_maintenance || 0,
      project.go_live_date ? new Date(project.go_live_date) : undefined
    )
    totalCosts += cost
  }

  return {
    totalROI,
    totalTimeSaved,
    totalCosts,
    activeProjectsCount: activeProjects.length,
    totalProjectsCount: projects.length,
  }
}
