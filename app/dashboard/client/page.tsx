import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard'
import { DollarSign, Clock, Wallet } from 'lucide-react'
import {
  calculateTotalHoursSaved,
  calculateROI,
  calculateTotalCost,
  formatCurrency,
  formatHours
} from '@/lib/calculations'
import { Project } from '@/types/database'
import { Suspense } from 'react'
import { TimeRangeFilter } from '@/components/TimeRangeFilter'
import { ProjectCardList } from '@/components/ProjectCardList'
import { NotesPanel } from '@/components/NotesPanel'
import { TasksList } from '@/components/TasksList'
import { TestimonialForm } from '@/components/TestimonialForm'

/**
 * Client Dashboard Page
 *
 * Features:
 * - Fetches all projects for the logged-in client
 * - Calculates aggregate ROI metrics (Total ROI, Time Saved, Total Costs)
 * - Displays 3 MetricCard components
 * - Time range filter support (7 days, month, quarter, all time)
 * - Shows loading and error states
 * - Server-side rendering for performance
 *
 * PRD Reference: Section 4.2.3 (Overview Metrics)
 *
 * Calculations:
 * - Total ROI = Sum of (Hours Saved × Employee Wage) for all active systems
 * - Time Saved = Aggregated hours saved across all active systems
 * - Total Costs = Sum of dev + implementation + (monthly maintenance × months active)
 */

type TimeRange = '7days' | 'month' | 'quarter' | 'all'

interface ClientDashboardProps {
  searchParams: Promise<{
    timeRange?: TimeRange
  }>
}

export default async function ClientDashboard({ searchParams }: ClientDashboardProps) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams

  // Get current user (still use regular client for auth)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch client data and all projects using ADMIN CLIENT (bypasses RLS)
  try {
    console.log('📊 Client Dashboard: Fetching data for user:', user.id)

    // 1. Get client ID for the current user
    const { data: userClientData, error: userClientError } = (await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id)
      .single()) as { data: { client_id: string } | null; error: { code?: string; message?: string } | null }

    console.log('📊 Client Dashboard: userClientData =', userClientData, 'error =', userClientError)

    // Check if user is not associated with any client company yet
    if (userClientError?.code === 'PGRST116' || !userClientData) {
      console.log('⚠️ User not associated with a client company yet:', user.id)
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to FlowMatrix AI</h1>
            <p className="mt-2 text-gray-600">
              Your account setup is in progress
            </p>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Account Setup Required
            </h3>
            <div className="space-y-4 text-blue-800">
              <p>
                Your user account has been created, but we cannot access your client company data. This could be due to:
              </p>
              <div className="bg-white rounded-lg p-6 border border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-3">Possible Issues:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Missing RLS Policies</strong> - Row-Level Security policies need to be configured (most common)</li>
                  <li><strong>Missing Data</strong> - No client company record or user association in database</li>
                  <li><strong>Incorrect Policies</strong> - RLS policies exist but are blocking your access</li>
                </ol>
              </div>
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-3">🔧 RECOMMENDED FIX: Run RLS Policy Script</h4>
                <p className="text-sm text-yellow-800 mb-3">
                  Open <code className="bg-yellow-100 px-2 py-1 rounded">docs/FIX_RLS_POLICIES.sql</code> and run it in Supabase SQL Editor.
                  This will fix all Row-Level Security policies.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-3">For Database Setup:</h4>
                <p className="text-sm mb-3">Run these SQL commands in your Supabase SQL Editor:</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`-- 1. Create a client company
INSERT INTO clients (company_name, industry, avg_employee_wage)
VALUES ('Your Company Name', 'Your Industry', 26.00)
RETURNING id;

-- 2. Link your user to the company (replace the IDs)
INSERT INTO user_clients (user_id, client_id)
VALUES ('${user.id}', 'paste-client-id-from-step-1');`}
                </pre>
              </div>
              <p className="text-sm">
                <strong>Your User ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{user.id}</code>
              </p>
              <p className="text-sm">
                After completing the setup, refresh this page to see your dashboard.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Handle other potential errors
    if (userClientError) {
      console.error('Error fetching user client data:', userClientError)
      throw new Error('Failed to fetch client association')
    }

    const clientId = userClientData.client_id
    console.log('📊 Client Dashboard: clientId =', clientId)

    // 2. Fetch all projects for this client using ADMIN CLIENT (bypasses RLS)
    const { data: projects, error: projectsError } = (await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })) as { data: Project[] | null; error: { message?: string } | null }

    console.log('📊 Client Dashboard: projects =', projects, 'error =', projectsError)

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      throw new Error('Failed to fetch projects')
    }

    // 3. Fetch all tasks for this client's projects
    const projectIds = projects?.map(p => p.id) || []
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        project:projects!inner(id, name)
      `)
      .in('project_id', projectIds)
      .order('due_date', { ascending: true, nullsFirst: false })

    console.log('📊 Client Dashboard: tasks =', tasks, 'error =', tasksError)

    if (tasksError) {
      console.error('⚠️ Error fetching tasks:', tasksError)
      // Don't throw error - just log and continue with empty tasks
    }

    // 4. Calculate aggregate metrics
    const timeRange = params.timeRange || 'all'
    console.log('📊 Client Dashboard: timeRange =', timeRange, 'projects count =', projects?.length || 0)
    const metrics = calculateAggregateMetrics(projects || [], timeRange)
    console.log('📊 Client Dashboard: metrics calculated =', metrics)
    console.log('✅ Client Dashboard: Rendering page successfully')

    return (
      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            View your automation ROI metrics and project status
          </p>
        </div>

        {/* Time Range Filter */}
        <TimeRangeFilter currentRange={timeRange} />

        {/* Overview Metrics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Overview Metrics
          </h2>
          <Suspense fallback={<MetricCardsLoading />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                title="Total ROI"
                value={formatCurrency(metrics.totalROI)}
                trend={metrics.roiTrend}
                subtitle="MTD"
                icon={<DollarSign className="h-6 w-6" />}
                accentColor="orange"
              />
              <MetricCard
                title="Time Saved"
                value={formatHours(metrics.totalTimeSaved)}
                trend={metrics.timeSavedTrend}
                subtitle={getTimeRangeLabel(timeRange)}
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
          </Suspense>
        </div>

        {/* Outstanding Tasks Section */}
        <TasksList tasks={tasks || []} showViewAll={true} />

        {/* Notes Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Project Communication
          </h2>
          <NotesPanel
            projects={projects || []}
            userId={user.id}
            userRole="client"
            initialNotes={[]}
          />
        </div>

        {/* Projects Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Projects & Systems
          </h2>
          <ProjectCardList
            projects={projects || []}
            timeRange={timeRange === '7days' ? 'week' : timeRange === 'month' ? 'month' : 'all'}
          />
        </div>

        {/* Testimonial Section - More subtle placement at bottom */}
        <TestimonialForm clientId={clientId} userId={user.id} />
      </div>
    )
  } catch (error) {
    console.error('Error in ClientDashboard:', error)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            View your automation ROI metrics and project status
          </p>
        </div>

        {/* Error State */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-sm text-red-800">
            We encountered an error while loading your dashboard data. Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    )
  }
}

/**
 * Calculate aggregate metrics from all projects
 */
function calculateAggregateMetrics(projects: Project[], timeRange: TimeRange) {
  // Filter only active projects for ROI calculations
  const activeProjects = projects.filter(p => p.status === 'active')

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
      timeRange === '7days' ? 'week' : timeRange === 'month' ? 'month' : 'all'
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

  // TODO: Calculate actual trends from previous period
  // For MVP, using placeholder trends
  const roiTrend = totalROI > 0 ? { percentage: 12, direction: 'up' as const } : undefined
  const timeSavedTrend = totalTimeSaved > 0 ? { percentage: 8, direction: 'up' as const } : undefined

  return {
    totalROI,
    totalTimeSaved,
    totalCosts,
    roiTrend,
    timeSavedTrend,
    activeProjectsCount: activeProjects.length,
    totalProjectsCount: projects.length,
  }
}

/**
 * Get label for time range filter
 */
function getTimeRangeLabel(timeRange: TimeRange): string {
  switch (timeRange) {
    case '7days':
      return 'this week'
    case 'month':
      return 'this month'
    case 'quarter':
      return 'this quarter'
    case 'all':
      return 'all time'
    default:
      return 'all time'
  }
}

/**
 * Loading skeleton for metric cards
 */
function MetricCardsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  )
}
