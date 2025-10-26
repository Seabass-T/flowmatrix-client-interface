'use client'

import { useState, memo, useMemo } from 'react'
import { CheckCircle2, Circle, FileText, Download } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency, formatHours, calculateROI, calculateTotalCost, formatDate, formatDateLong } from '@/lib/calculations'
import { ProjectWithRelations } from '@/types/database'

/**
 * ProjectDetailContent Component
 *
 * Reusable content for project details - can be used in modal or on a page.
 * Displays ROI charts, metrics, costs, tasks, notes, and files.
 *
 * PERFORMANCE: Memoized to prevent expensive re-renders of charts and calculations
 *
 * PRD Reference: Section 4.2.8 (Project Detail View)
 */

// Status badge colors from PRD Section 8.1
const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  dev: 'bg-blue-100 text-blue-800',
  proposed: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
}

type TimeRange = '7days' | 'month' | 'quarter' | 'all'

interface TimeRangeOption {
  value: TimeRange
  label: string
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: '7days', label: 'Last 7 Days' },
  { value: 'month', label: 'Last Month' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'all', label: 'All Time' },
]

interface ProjectDetailContentProps {
  project: ProjectWithRelations
}

function ProjectDetailContentComponent({ project }: ProjectDetailContentProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all')

  // Memoize expensive calculations
  const metrics = useMemo(() => {
    const goLiveDate = project.go_live_date ? new Date(project.go_live_date) : null
    const daysActive = goLiveDate
      ? Math.max(0, Math.floor((Date.now() - goLiveDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 0
    const weeksActive = Math.floor(daysActive / 7)

    // Calculate hours saved per day
    let hoursPerDay = 0
    if (project.hours_saved_daily) {
      hoursPerDay = project.hours_saved_daily
    } else if (project.hours_saved_weekly) {
      hoursPerDay = project.hours_saved_weekly / 7
    } else if (project.hours_saved_monthly) {
      hoursPerDay = project.hours_saved_monthly / 30
    }

    // Calculate ROI metrics
    const dailyROI = calculateROI(hoursPerDay, project.employee_wage || 0)
    const weeklyROI = dailyROI * 7
    const monthlyROI = dailyROI * 30
    const totalHoursSaved = hoursPerDay * daysActive
    const totalROI = calculateROI(totalHoursSaved, project.employee_wage || 0)

    // Calculate costs
    const totalCost = calculateTotalCost(
      project.dev_cost || 0,
      project.implementation_cost || 0,
      project.monthly_maintenance || 0,
      goLiveDate || undefined
    )

    // Calculate time-range specific metrics
    let rangeHoursSaved = 0
    let rangeROI = 0
    let rangeCosts = 0
    const oneTimeCosts = (project.dev_cost || 0) + (project.implementation_cost || 0)
    const weeklyMaintenance = (project.monthly_maintenance || 0) / 4

    switch (timeRange) {
      case '7days':
        rangeHoursSaved = hoursPerDay * 7
        rangeROI = weeklyROI
        rangeCosts = oneTimeCosts + weeklyMaintenance
        break
      case 'month':
        rangeHoursSaved = hoursPerDay * 30
        rangeROI = monthlyROI
        rangeCosts = oneTimeCosts + (weeklyMaintenance * 4)
        break
      case 'quarter':
        rangeHoursSaved = hoursPerDay * 90
        rangeROI = dailyROI * 90
        rangeCosts = oneTimeCosts + (weeklyMaintenance * 13)
        break
      case 'all':
        rangeHoursSaved = totalHoursSaved
        rangeROI = totalROI
        rangeCosts = totalCost
        break
      default:
        rangeHoursSaved = totalHoursSaved
        rangeROI = totalROI
        rangeCosts = totalCost
    }

    return {
      goLiveDate,
      daysActive,
      weeksActive,
      hoursPerDay,
      dailyROI,
      weeklyROI,
      monthlyROI,
      totalHoursSaved,
      totalROI,
      totalCost,
      rangeHoursSaved,
      rangeROI,
      rangeCosts,
    }
  }, [
    timeRange,
    project.go_live_date,
    project.hours_saved_daily,
    project.hours_saved_weekly,
    project.hours_saved_monthly,
    project.employee_wage,
    project.dev_cost,
    project.implementation_cost,
    project.monthly_maintenance,
  ])

  // Memoize chart data generation
  const chartData = useMemo(() => {
    const data = []
    const days =
      timeRange === '7days' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : metrics.daysActive
    const step = Math.max(1, Math.floor(days / 20))

    for (let i = 0; i <= days; i += step) {
      const date = new Date(metrics.goLiveDate || Date.now())
      date.setDate(date.getDate() + i)

      data.push({
        date: formatDate(date),
        hoursSaved: metrics.hoursPerDay * i,
        roi: metrics.dailyROI * i,
      })
    }

    return data
  }, [timeRange, metrics.daysActive, metrics.goLiveDate, metrics.hoursPerDay, metrics.dailyROI])

  // Memoize Total ROI and Total Costs over time
  const roiVsCostsData = useMemo(() => {
    // Calculate number of weeks based on time range
    let weeks = 0
    switch (timeRange) {
      case '7days':
        weeks = 1
        break
      case 'month':
        weeks = 4
        break
      case 'quarter':
        weeks = 13
        break
      case 'all':
        weeks = metrics.weeksActive
        break
      default:
        weeks = metrics.weeksActive
    }

    const weeklyMaintenance = (project.monthly_maintenance || 0) / 4
    const oneTimeCosts = (project.dev_cost || 0) + (project.implementation_cost || 0)

    return Array.from({ length: weeks }, (_, i) => {
      const weekNumber = i + 1
      const cumulativeROI = metrics.weeklyROI * weekNumber
      const cumulativeMaintenanceCost = weeklyMaintenance * weekNumber
      const totalCosts = oneTimeCosts + cumulativeMaintenanceCost

      return {
        week: `Week ${weekNumber}`,
        totalROI: Math.round(cumulativeROI),
        totalCosts: Math.round(totalCosts),
      }
    })
  }, [timeRange, metrics.weeksActive, metrics.weeklyROI, project.monthly_maintenance, project.dev_cost, project.implementation_cost])

  // Memoize sorted notes
  const sortedNotes = useMemo(
    () =>
      [...(project.notes || [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [project.notes]
  )

  // Memoize sorted tasks
  const sortedTasks = useMemo(
    () =>
      [...(project.tasks || [])].sort((a, b) => {
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1
        }
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        }
        return 0
      }),
    [project.tasks]
  )

  return (
    <div className="space-y-8">
      {/* Status Badge */}
      <div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${STATUS_STYLES[project.status]}`}>
          {project.status}
        </span>
      </div>

      {/* ROI Charts Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">ROI Charts</h3>
          {/* Time Range Selector */}
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`
                  px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200
                  ${
                    timeRange === option.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Saved Over Time */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Time Saved Over Time</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hoursSaved"
                  stroke="#1E3A8A"
                  strokeWidth={2}
                  name="Hours Saved"
                  dot={{ fill: '#1E3A8A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ROI Trend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">ROI Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={roiVsCostsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalROI"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Total ROI ($)"
                  dot={{ fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="totalCosts"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Total Costs ($)"
                  dot={{ fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Metrics Breakdown */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Metrics Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Hours Saved/Day:</p>
            <p className="text-lg font-bold text-gray-900">{formatHours(metrics.hoursPerDay)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Employee Wage:</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(project.employee_wage || 0)}/hr</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Hours Saved:</p>
            <p className="text-lg font-bold text-gray-900">{formatHours(metrics.rangeHoursSaved)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total ROI:</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(metrics.rangeROI)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Costs:</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(metrics.rangeCosts)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Net Profit:</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(metrics.rangeROI - metrics.rangeCosts)}</p>
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Development Cost:</p>
            <p className="text-lg font-bold text-gray-900">
              {project.dev_cost === 0 ? 'Free' : formatCurrency(project.dev_cost || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Implementation Cost:</p>
            <p className="text-lg font-bold text-gray-900">
              {project.implementation_cost === 0 ? 'Free' : formatCurrency(project.implementation_cost || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Maintenance:</p>
            <p className="text-lg font-bold text-gray-900">
              {project.monthly_maintenance === 0 ? 'Free' : formatCurrency(project.monthly_maintenance || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Cost (selected period):</p>
            <p className="text-lg font-bold text-gray-900">
              {metrics.rangeCosts === 0 ? 'Free' : formatCurrency(metrics.rangeCosts)}
            </p>
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Tasks</h3>
        {sortedTasks.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No tasks yet</p>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3">
                {task.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${task.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.description}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {formatDateLong(task.due_date)}
                    </p>
                  )}
                  {task.completed_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Completed: {formatDateLong(task.completed_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Full Note History */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Full Note History</h3>
        {sortedNotes.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No notes yet</p>
        ) : (
          <div className="space-y-4">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border-l-4 ${
                  note.note_type === 'client'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-purple-50 border-purple-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-gray-600">
                    [{note.note_type === 'client' ? 'CLIENT' : 'FLOWMATRIX AI'}]
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateLong(note.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Associated Files */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Associated Files</h3>
        {!project.files || project.files.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No files yet</p>
        ) : (
          <div className="space-y-3">
            {project.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                    {file.file_type && (
                      <p className="text-xs text-gray-500">{file.file_type}</p>
                    )}
                  </div>
                </div>
                <a
                  href={file.file_url}
                  download
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// Export memoized version to prevent unnecessary re-renders
export const ProjectDetailContent = memo(ProjectDetailContentComponent)
