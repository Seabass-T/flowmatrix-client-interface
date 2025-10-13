'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, FileText, Download, Check, AlertCircle } from 'lucide-react'
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
import { ProjectWithRelations, ProjectStatus } from '@/types/database'

/**
 * EditableProjectDetailContent Component
 *
 * Employee version of ProjectDetailContent with all fields editable.
 * Features auto-save with 1-second debounce and yellow borders on editable fields.
 *
 * PRD Reference: Section 4.2.8 (Project Detail View) + Section 4.3.5 (Edit Mode)
 */

// Status badge colors from PRD Section 8.1
const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  dev: 'bg-blue-100 text-blue-800',
  proposed: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
}

type TimeRange = '7days' | 'month' | 'quarter' | 'all'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

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

interface EditableProjectDetailContentProps {
  project: ProjectWithRelations
}

export function EditableProjectDetailContent({ project: initialProject }: EditableProjectDetailContentProps) {
  const router = useRouter()
  const [project, setProject] = useState(initialProject)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Sync local state when project prop changes
  useEffect(() => {
    setProject(initialProject)
  }, [initialProject])

  // Debounced save function (1 second)
  const handleFieldChange = async (field: keyof ProjectWithRelations, value: string | number | null) => {
    // Update local state immediately
    const updatedProject = { ...project, [field]: value }
    setProject(updatedProject)

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(async () => {
      await saveProject(updatedProject)
    }, 1000) // 1-second debounce

    setSaveTimeout(timeout)
  }

  // Save project to API
  const saveProject = async (projectToSave: ProjectWithRelations) => {
    setSaveState('saving')
    setErrorMessage('')

    try {
      const response = await fetch(`/api/projects/${projectToSave.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectToSave.name,
          hours_saved_daily: projectToSave.hours_saved_daily,
          hours_saved_weekly: projectToSave.hours_saved_weekly,
          hours_saved_monthly: projectToSave.hours_saved_monthly,
          employee_wage: projectToSave.employee_wage,
          status: projectToSave.status,
          dev_cost: projectToSave.dev_cost,
          implementation_cost: projectToSave.implementation_cost,
          monthly_maintenance: projectToSave.monthly_maintenance,
          go_live_date: projectToSave.go_live_date,
        }),
      })

      if (!response.ok) {
        let errorMessage = `Failed to save (${response.status})`
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const updatedProject = await response.json()
      setSaveState('saved')

      // Refresh the page data to get updated calculations
      router.refresh()

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveState('idle')
      }, 2000)
    } catch (error) {
      console.error('Error saving project:', error)
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save')
      setProject(initialProject) // Revert on error

      // Reset error state after 5 seconds
      setTimeout(() => {
        setSaveState('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

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
    project.dev_cost || 0,
    project.implementation_cost || 0,
    project.monthly_maintenance || 0,
    goLiveDate || undefined
  )

  // Generate chart data
  const generateChartData = () => {
    const data = []
    const days = timeRange === '7days' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : daysActive
    const step = Math.max(1, Math.floor(days / 20))

    for (let i = 0; i <= days; i += step) {
      const date = new Date(goLiveDate || Date.now())
      date.setDate(date.getDate() + i)

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        roi: dailyROI * i,
        hoursSaved: hoursPerDay * i,
      })
    }

    return data
  }

  const chartData = generateChartData()

  return (
    <div className="space-y-6">
      {/* Save Status Indicator */}
      <div className="flex items-center justify-end gap-2 text-sm font-medium">
        {saveState === 'saving' && (
          <span className="text-gray-500 flex items-center gap-1">
            <span className="animate-spin">⏳</span> Saving...
          </span>
        )}
        {saveState === 'saved' && (
          <span className="text-green-600 flex items-center gap-1">
            <Check className="w-4 h-4" /> Saved
          </span>
        )}
        {saveState === 'error' && (
          <span className="text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errorMessage || 'Error saving'}
          </span>
        )}
      </div>

      {/* Project Name - Editable */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-600">Project Name</label>
          <select
            value={project.status}
            onChange={(e) => handleFieldChange('status', e.target.value as ProjectStatus)}
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase cursor-pointer border-2 border-yellow-300 ${
              STATUS_STYLES[project.status]
            }`}
          >
            <option value="active">Active</option>
            <option value="dev">Dev</option>
            <option value="proposed">Proposed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <input
          type="text"
          value={project.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          className="w-full text-2xl font-bold text-gray-900 border-2 border-yellow-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* ROI Charts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">ROI Over Time</h2>
          <div className="flex gap-2">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === option.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Line Chart - ROI */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Cumulative ROI</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'ROI']} />
              <Legend />
              <Line type="monotone" dataKey="roi" stroke="#f97316" strokeWidth={2} name="ROI" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Hours Saved */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-4">Cumulative Hours Saved</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value}h`} />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Hours Saved']} />
              <Legend />
              <Bar dataKey="hoursSaved" fill="#14b8a6" name="Hours Saved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics Breakdown - Editable */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Metrics Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hours Saved */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Time Savings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Daily:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={project.hours_saved_daily || ''}
                    onChange={(e) => handleFieldChange('hours_saved_daily', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-24 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="0.0"
                  />
                  <span className="text-sm text-gray-600">hours</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weekly:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={project.hours_saved_weekly || ''}
                    onChange={(e) => handleFieldChange('hours_saved_weekly', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-24 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="0.0"
                  />
                  <span className="text-sm text-gray-600">hours</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={project.hours_saved_monthly || ''}
                    onChange={(e) => handleFieldChange('hours_saved_monthly', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-24 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="0.0"
                  />
                  <span className="text-sm text-gray-600">hours</span>
                </div>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-sm font-semibold text-gray-900">Total (All Time):</span>
                <span className="font-semibold text-teal-600">{formatHours(totalHoursSaved)}</span>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Return on Investment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employee Wage ($/hr):</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={project.employee_wage || ''}
                    onChange={(e) => handleFieldChange('employee_wage', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-24 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(dailyROI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Weekly:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(weeklyROI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(monthlyROI)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-sm font-semibold text-gray-900">Total (All Time):</span>
                <span className="font-semibold text-orange-600">{formatCurrency(totalROI)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown - Editable */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost Breakdown</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Development Cost:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">$</span>
              <input
                type="number"
                step="100"
                min="0"
                value={project.dev_cost || ''}
                onChange={(e) => handleFieldChange('dev_cost', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-32 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Implementation Cost:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">$</span>
              <input
                type="number"
                step="100"
                min="0"
                value={project.implementation_cost || ''}
                onChange={(e) => handleFieldChange('implementation_cost', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-32 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Monthly Maintenance:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">$</span>
              <input
                type="number"
                step="10"
                min="0"
                value={project.monthly_maintenance || ''}
                onChange={(e) => handleFieldChange('monthly_maintenance', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-32 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Go Live Date:</span>
            <input
              type="date"
              value={project.go_live_date || ''}
              onChange={(e) => handleFieldChange('go_live_date', e.target.value || null)}
              className="px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="flex justify-between pt-3 border-t">
            <span className="text-sm font-semibold text-gray-900">Total Cost (All Time):</span>
            <span className="font-semibold text-blue-600">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t">
            <span className="text-sm font-semibold text-gray-900">Net Benefit:</span>
            <span className={`font-semibold ${totalROI - totalCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalROI - totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks</h2>
        {project.tasks && project.tasks.length > 0 ? (
          <div className="space-y-2">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 py-2">
                {task.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                <span className={task.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                  {task.description}
                </span>
                {task.due_date && (
                  <span className="text-xs text-gray-500 ml-auto">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No tasks yet</p>
        )}
      </div>

      {/* Notes History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes History</h2>
        {project.notes && project.notes.length > 0 ? (
          <div className="space-y-4">
            {project.notes.map((note) => (
              <div key={note.id} className="border-l-4 border-gray-200 pl-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {note.note_type === 'client' ? 'Client' : 'FlowMatrix AI'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No notes yet</p>
        )}
      </div>

      {/* Files Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Associated Files</h2>
        {project.files && project.files.length > 0 ? (
          <div className="space-y-2">
            {project.files.map((file) => (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                  <p className="text-xs text-gray-500">{file.file_type || 'No description'}</p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No files attached</p>
        )}
      </div>
    </div>
  )
}
