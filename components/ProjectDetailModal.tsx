'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Download, CheckCircle2, Circle, FileText } from 'lucide-react'
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
import { formatCurrency, formatHours, calculateROI, calculateTotalCost } from '@/lib/calculations'
import { ProjectWithRelations } from '@/types/database'

/**
 * ProjectDetailModal Component
 *
 * PRD Reference: Section 4.2.8 (Project Detail Popup)
 *
 * Features:
 * - Modal with close button and click-outside-to-close
 * - ROI Charts (Line and Bar charts using Recharts)
 * - Time range selector for charts
 * - Metrics Breakdown (hours, wage, ROI calculations)
 * - Cost Breakdown (dev, implementation, maintenance costs)
 * - Tasks section with completion status
 * - Full note history (client + FlowMatrix AI notes)
 * - Associated files with download links
 *
 * Layout follows exact wireframe from PRD Section 4.2.8
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

interface ProjectDetailModalProps {
  project: ProjectWithRelations
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

export function ProjectDetailModal({ project, isOpen, onClose, isLoading = false }: ProjectDetailModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const modalRef = useRef<HTMLDivElement>(null)

  // Click-outside-to-close functionality
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // ESC key to close
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Calculate metrics
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
    project.dev_cost,
    project.implementation_cost,
    project.monthly_maintenance,
    goLiveDate || undefined
  )

  // Generate chart data (mock data for time-based visualization)
  const generateChartData = () => {
    const data = []
    const days = timeRange === '7days' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : daysActive
    const step = Math.max(1, Math.floor(days / 20)) // Show max 20 data points

    for (let i = 0; i <= days; i += step) {
      const date = new Date(goLiveDate || Date.now())
      date.setDate(date.getDate() + i)

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hoursSaved: hoursPerDay * i,
        roi: dailyROI * i,
      })
    }

    return data
  }

  const chartData = generateChartData()

  // Generate weekly ROI data for bar chart
  const generateWeeklyROIData = () => {
    const weeks = Math.min(weeksActive, 12) // Show max 12 weeks
    return Array.from({ length: weeks }, (_, i) => ({
      week: `Week ${i + 1}`,
      roi: weeklyROI,
    }))
  }

  const weeklyROIData = generateWeeklyROIData()

  // Sort notes by date (newest first)
  const sortedNotes = [...(project.notes || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Sort tasks (incomplete first, then by due date)
  const sortedTasks = [...(project.tasks || [])].sort((a, b) => {
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1
    }
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    return 0
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 z-20 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Loading project details...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${STATUS_STYLES[project.status]}`}>
              {project.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* ROI Charts Section */}
          <section>
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
              {/* Time Saved Over Time (Line Chart) */}
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

              {/* ROI Trend (Bar Chart) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">ROI Trend</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyROIData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    />
                    <Legend />
                    <Bar dataKey="roi" fill="#0D9488" name="Weekly ROI ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Metrics Breakdown */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Metrics Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hours Saved/Day:</p>
                <p className="text-lg font-bold text-gray-900">{formatHours(hoursPerDay)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Employee Wage:</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(project.employee_wage || 0)}/hr</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Daily ROI:</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(dailyROI)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly ROI:</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(weeklyROI)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly ROI:</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(monthlyROI)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total ROI ({weeksActive} weeks):</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalROI)}</p>
              </div>
            </div>
          </section>

          {/* Cost Breakdown */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Development Cost:</p>
                <p className="text-lg font-bold text-gray-900">
                  {project.dev_cost === 0 ? 'Free' : formatCurrency(project.dev_cost)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Implementation Cost:</p>
                <p className="text-lg font-bold text-gray-900">
                  {project.implementation_cost === 0 ? 'Free' : formatCurrency(project.implementation_cost)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Maintenance:</p>
                <p className="text-lg font-bold text-gray-900">
                  {project.monthly_maintenance === 0 ? 'Free' : formatCurrency(project.monthly_maintenance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cost to Date:</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalCost === 0 ? 'Free' : formatCurrency(totalCost)}
                </p>
              </div>
            </div>
          </section>

          {/* Tasks Section */}
          <section className="bg-gray-50 rounded-lg p-6">
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
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                      {task.completed_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Completed: {new Date(task.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Full Note History */}
          <section className="bg-gray-50 rounded-lg p-6">
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
                        {new Date(note.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Associated Files */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Associated Files</h3>
            {!project.files || project.files.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No files yet</p>
            ) : (
              <div className="space-y-3">
                {project.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
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
      </div>
    </div>
  )
}
