'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/calculations'
import { ProjectStatus, Project } from '@/types/database'
import { Check, AlertCircle } from 'lucide-react'

interface EditableProjectCardProps {
  project: Project
  onClick?: () => void
  onUpdate?: (updatedProject: Project) => void
}

// Status badge colors from PRD Section 8.1
const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  dev: 'bg-blue-100 text-blue-800',
  proposed: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * EditableProjectCard Component
 *
 * Editable version of ProjectCard for employee edit mode (PRD Section 4.3.5)
 *
 * Features:
 * - All key fields are editable (hours saved, wage, status, costs)
 * - Auto-save with 1-second debounce on blur
 * - Visual feedback: "Saving..." → "Saved ✓" or error message
 * - Yellow border on editable fields (PRD requirement)
 * - Proper TypeScript types and error handling
 *
 * Editable Fields:
 * - hours_saved_daily (number input)
 * - employee_wage (number input, $/hr)
 * - status (dropdown: active, dev, proposed, inactive)
 * - dev_cost, implementation_cost, monthly_maintenance (number inputs)
 */
export function EditableProjectCard({
  project,
  onClick,
  onUpdate,
}: EditableProjectCardProps) {
  // Local state for editable fields
  const [localProject, setLocalProject] = useState(project)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Fix hydration: Render date only client-side
  const [formattedDate, setFormattedDate] = useState<string>('')

  useEffect(() => {
    setFormattedDate(new Date(localProject.updated_at).toLocaleDateString())
  }, [localProject.updated_at])
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Sync local state when project prop changes
  useEffect(() => {
    setLocalProject(project)
  }, [project])

  // Debounced save function (1 second)
  const handleFieldChange = async (field: keyof Project, value: string | number | null) => {
    // Update local state immediately
    const updatedProject = { ...localProject, [field]: value }
    setLocalProject(updatedProject)

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
  const saveProject = async (projectToSave: Project) => {
    setSaveState('saving')
    setErrorMessage('')

    try {
      const response = await fetch(`/api/projects/${projectToSave.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hours_saved_daily: projectToSave.hours_saved_daily,
          hours_saved_weekly: projectToSave.hours_saved_weekly,
          hours_saved_monthly: projectToSave.hours_saved_monthly,
          employee_wage: projectToSave.employee_wage,
          status: projectToSave.status,
          dev_cost: projectToSave.dev_cost,
          implementation_cost: projectToSave.implementation_cost,
          monthly_maintenance: projectToSave.monthly_maintenance,
        }),
      })

      if (!response.ok) {
        let errorMessage = `Failed to save (${response.status})`
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const updatedProject = await response.json()

      // Success!
      setSaveState('saved')
      if (onUpdate) {
        onUpdate(updatedProject)
      }

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveState('idle')
      }, 2000)
    } catch (error) {
      console.error('Error saving project:', error)
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save')

      // Revert local state to original project
      setLocalProject(project)

      // Reset error state after 5 seconds
      setTimeout(() => {
        setSaveState('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  // Handle card click (but not when clicking on inputs)
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on an input
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
      return
    }
    if (onClick) {
      onClick()
    }
  }

  // Calculate hours saved per day for display
  const hoursSavedPerDay =
    localProject.hours_saved_daily ||
    (localProject.hours_saved_weekly ? localProject.hours_saved_weekly / 7 : 0) ||
    (localProject.hours_saved_monthly ? localProject.hours_saved_monthly / 30 : 0) ||
    0

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1 relative"
    >
      {/* Save Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-medium">
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
            <AlertCircle className="w-4 h-4" /> Error
          </span>
        )}
      </div>

      {/* Status Badge - Editable */}
      <div className="flex items-center justify-between mb-4 pr-20">
        <select
          value={localProject.status}
          onChange={(e) => handleFieldChange('status', e.target.value as ProjectStatus)}
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase cursor-pointer border-2 border-yellow-300 ${
            STATUS_STYLES[localProject.status]
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="active">Active</option>
          <option value="dev">Dev</option>
          <option value="proposed">Proposed</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Project Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">{localProject.name}</h3>

      {/* Editable Metrics */}
      <div className="space-y-3 text-sm">
        {/* Hours Saved Per Day */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Hours Saved/Day:</span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={localProject.hours_saved_daily || ''}
            onChange={(e) =>
              handleFieldChange('hours_saved_daily', e.target.value ? parseFloat(e.target.value) : null)
            }
            onClick={(e) => e.stopPropagation()}
            className="w-20 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="0.0"
          />
        </div>

        {/* Employee Wage */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Employee Wage ($/hr):</span>
          <input
            type="number"
            step="1"
            min="0"
            value={localProject.employee_wage || ''}
            onChange={(e) =>
              handleFieldChange('employee_wage', e.target.value ? parseFloat(e.target.value) : null)
            }
            onClick={(e) => e.stopPropagation()}
            className="w-20 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="0"
          />
        </div>

        {/* Calculated ROI (Display Only) */}
        <div className="flex justify-between">
          <span className="text-gray-600">ROI:</span>
          <span className="font-semibold text-green-600">
            {formatCurrency((hoursSavedPerDay * (localProject.employee_wage || 0) * 30))}
            /mo
          </span>
        </div>

        {/* Cost Fields - Collapsible */}
        <details className="pt-2 border-t border-gray-200">
          <summary className="cursor-pointer text-gray-600 font-medium">
            💰 Cost Details
          </summary>
          <div className="mt-2 space-y-2 pl-4">
            {/* Dev Cost */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs">Dev Cost:</span>
              <input
                type="number"
                step="1"
                min="0"
                value={localProject.dev_cost || ''}
                onChange={(e) =>
                  handleFieldChange('dev_cost', e.target.value ? parseFloat(e.target.value) : null)
                }
                onClick={(e) => e.stopPropagation()}
                className="w-20 px-2 py-1 text-right text-xs font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="0"
              />
            </div>

            {/* Implementation Cost */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs">Implementation:</span>
              <input
                type="number"
                step="1"
                min="0"
                value={localProject.implementation_cost || ''}
                onChange={(e) =>
                  handleFieldChange('implementation_cost', e.target.value ? parseFloat(e.target.value) : null)
                }
                onClick={(e) => e.stopPropagation()}
                className="w-20 px-2 py-1 text-right text-xs font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="0"
              />
            </div>

            {/* Monthly Maintenance */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs">Monthly Maintenance:</span>
              <input
                type="number"
                step="1"
                min="0"
                value={localProject.monthly_maintenance || ''}
                onChange={(e) =>
                  handleFieldChange('monthly_maintenance', e.target.value ? parseFloat(e.target.value) : null)
                }
                onClick={(e) => e.stopPropagation()}
                className="w-20 px-2 py-1 text-right text-xs font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="0"
              />
            </div>
          </div>
        </details>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Last Updated: {formattedDate || '...'}
        </span>
      </div>
    </div>
  )
}
