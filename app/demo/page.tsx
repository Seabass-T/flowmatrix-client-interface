import { MetricCard } from '@/components/MetricCard'
import { DollarSign, Clock, Wallet } from 'lucide-react'
import {
  calculateTotalHoursSaved,
  calculateROI,
  calculateTotalCost,
  formatCurrency,
  formatHours
} from '@/lib/calculations'
import { Project } from '@/types/database'
import { TimeRangeFilter } from '@/components/TimeRangeFilter'
import { ProjectCardList } from '@/components/ProjectCardList'
import {
  DEMO_PROJECTS,
  DEMO_TASKS,
  DEMO_CLIENT,
  calculateDemoTotalCosts,
} from '@/lib/demo-data'

/**
 * Demo Dashboard Page
 *
 * Features:
 * - Showcases FlowMatrix AI client interface with realistic data
 * - Company: Apex Construction Inc.
 * - 8 automation projects (7 active, 1 in development)
 * - Read-only demonstration
 * - No authentication required
 *
 * PRD Reference: Section 4.2 (Client Dashboard)
 *
 * Metrics:
 * - Total ROI: ~$44,700/month (active projects only)
 * - Time Saved: ~167 hours/week
 * - Total Costs: ~$302,700 (includes $12k/month retainer)
 */

type TimeRange = '7days' | 'month' | 'quarter' | 'all'

interface DemoPageProps {
  searchParams: Promise<{
    timeRange?: TimeRange
  }>
}

export default async function DemoPage({ searchParams }: DemoPageProps) {
  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams
  const timeRange = params.timeRange || 'all'

  // Calculate metrics from demo data
  const metrics = calculateAggregateMetrics(DEMO_PROJECTS, timeRange)

  // Filter incomplete tasks (for Outstanding Tasks section)
  const incompleteTasks = DEMO_TASKS.filter(t => !t.is_completed).slice(0, 5)

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
            subtitle={getTimeRangeLabel(timeRange)}
            icon={<Wallet className="h-6 w-6" />}
            accentColor="green"
          />
        </div>
      </div>

      {/* Outstanding Tasks Section */}
      {incompleteTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Outstanding Tasks ({incompleteTasks.length})
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {incompleteTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded border-2 border-gray-300 bg-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {task.description}
                    </p>
                    <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                      <span>{task.project.name}</span>
                      {task.due_date && (
                        <>
                          <span>•</span>
                          <span>
                            Due: {new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner - Demo Experience Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900 mb-1">
              Demo Experience
            </h3>
            <p className="text-sm text-green-800">
              You're viewing a demonstration dashboard for <strong>Apex Construction Inc.</strong>,
              a fictional construction company. This showcases how FlowMatrix AI tracks ROI across
              8 automation projects, saving <strong>167 hours/week</strong> and generating{' '}
              <strong>${formatCurrency(metrics.totalROI)}/month</strong> in value.
            </p>
            <p className="text-sm text-green-800 mt-2">
              Want similar results for your business?{' '}
              <a
                href="https://tally.so/r/wMBOXE"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-green-900"
              >
                Get started today
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Projects & Systems ({metrics.activeProjectsCount} Active, {metrics.totalProjectsCount} Total)
        </h2>
        <ProjectCardList
          projects={DEMO_PROJECTS}
          timeRange={timeRange === '7days' ? 'week' : timeRange === 'month' ? 'month' : 'all'}
          basePath="/demo/projects"
        />
      </div>

      {/* Cost Breakdown Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Investment Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Development</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                DEMO_PROJECTS.reduce((sum, p) => sum + p.dev_cost, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Implementation</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                DEMO_PROJECTS.reduce((sum, p) => sum + p.implementation_cost, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Retainer</p>
            <p className="text-lg font-semibold text-gray-900">
              $6,500/month
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Investment</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(metrics.totalCosts)}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Monthly ROI:</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.totalROI)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Based on {metrics.activeProjectsCount} active automation projects
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate aggregate metrics from demo projects
 */
function calculateAggregateMetrics(projects: Project[], timeRange: TimeRange) {
  // Filter only active projects for ROI calculations
  const activeProjects = projects.filter(p => p.status === 'active')

  let totalROI = 0
  let totalTimeSaved = 0

  for (const project of activeProjects) {
    // Calculate hours saved for this project
    const hoursForProject = calculateTotalHoursSaved(
      project.hours_saved_daily || undefined,
      project.hours_saved_weekly || undefined,
      project.hours_saved_monthly || undefined,
      project.go_live_date ? new Date(project.go_live_date) : undefined,
      timeRange === '7days' ? 'week' : timeRange === 'month' ? 'month' : timeRange === 'quarter' ? 'quarter' : 'all'
    )

    totalTimeSaved += hoursForProject

    // Calculate ROI for this project
    if (project.employee_wage) {
      const roi = calculateROI(hoursForProject, project.employee_wage)
      totalROI += roi
    }
  }

  // Calculate total costs based on time range
  let totalCosts = 0

  if (timeRange === 'all') {
    // All-time costs: dev + implementation + all maintenance + all retainer
    totalCosts = calculateDemoTotalCosts()
  } else {
    // Time-range specific costs: only maintenance + retainer for the period
    const monthlyRetainer = 6500

    // Calculate period-based costs
    let maintenanceCosts = 0
    let retainerCosts = 0

    switch (timeRange) {
      case '7days':
        // 1 week of costs
        maintenanceCosts = activeProjects.reduce((sum, p) => sum + ((p.monthly_maintenance || 0) / 4), 0)
        retainerCosts = monthlyRetainer / 4
        break
      case 'month':
        // 1 month of costs
        maintenanceCosts = activeProjects.reduce((sum, p) => sum + (p.monthly_maintenance || 0), 0)
        retainerCosts = monthlyRetainer
        break
      case 'quarter':
        // 3 months of costs
        maintenanceCosts = activeProjects.reduce((sum, p) => sum + ((p.monthly_maintenance || 0) * 3), 0)
        retainerCosts = monthlyRetainer * 3
        break
    }

    totalCosts = maintenanceCosts + retainerCosts
  }

  // Calculate trends
  const roiTrend = totalROI > 0 ? { percentage: 15, direction: 'up' as const } : undefined
  const timeSavedTrend = totalTimeSaved > 0 ? { percentage: 12, direction: 'up' as const } : undefined

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
