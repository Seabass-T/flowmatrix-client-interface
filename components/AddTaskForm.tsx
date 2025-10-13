'use client'

import { useState } from 'react'
import { Project } from '@/types/database'
import { Plus, AlertCircle, Check } from 'lucide-react'
import { validateLength, validateRequired } from '@/lib/validation'
import { isNetworkError, getUserFriendlyErrorMessage } from '@/lib/errors'

interface AddTaskFormProps {
  projects: Project[]
  onTaskAdded?: () => void
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function AddTaskForm({ projects, onTaskAdded }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Validation: Project ID
  const validateProjectId = (): boolean => {
    const result = validateRequired(projectId, 'Project')
    if (!result.isValid && result.error) {
      setFieldErrors((prev) => ({ ...prev, projectId: result.error! }))
      return false
    }
    setFieldErrors((prev) => ({ ...prev, projectId: '' }))
    return true
  }

  // Validation: Description
  const validateDescription = (): boolean => {
    const requiredCheck = validateRequired(description, 'Description')
    if (!requiredCheck.isValid && requiredCheck.error) {
      setFieldErrors((prev) => ({ ...prev, description: requiredCheck.error! }))
      return false
    }

    const lengthCheck = validateLength(description, 1, 500, 'Description')
    if (!lengthCheck.isValid && lengthCheck.error) {
      setFieldErrors((prev) => ({ ...prev, description: lengthCheck.error! }))
      return false
    }

    setFieldErrors((prev) => ({ ...prev, description: '' }))
    return true
  }

  // Client-side validation before submit
  const validateForm = (): boolean => {
    const isProjectIdValid = validateProjectId()
    const isDescriptionValid = validateDescription()
    return isProjectIdValid && isDescriptionValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Client-side validation
    if (!validateForm()) {
      setFormState('error')
      setError('Please fix the errors above')
      return
    }

    // Prevent multiple submissions
    if (formState === 'submitting') {
      return
    }

    setFormState('submitting')

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          description: description.trim(),
          due_date: dueDate || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle validation errors from API
        if (errorData.details && typeof errorData.details === 'object') {
          setFieldErrors(errorData.details)
          setFormState('error')
          setError('Please fix the errors above')
          return
        }

        throw new Error(errorData.error || 'Failed to create task')
      }

      // Success!
      setFormState('success')

      // Reset form after short delay
      setTimeout(() => {
        setProjectId('')
        setDescription('')
        setDueDate('')
        setIsOpen(false)
        setFormState('idle')

        // Notify parent to refresh
        if (onTaskAdded) {
          onTaskAdded()
        }
      }, 1000)
    } catch (err) {
      console.error('Error creating task:', err)
      setFormState('error')

      // User-friendly error messages
      if (isNetworkError(err)) {
        setError(
          'Unable to connect to the server. Please check your internet connection and try again.'
        )
      } else {
        setError(getUserFriendlyErrorMessage(err))
      }

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setFormState('idle')
        setError('')
      }, 5000)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Task
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg border-2 border-blue-300 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Selection */}
        <div>
          <label htmlFor="task-project" className="block text-sm font-medium text-gray-700 mb-1">
            Project / System <span className="text-red-500">*</span>
          </label>
          <select
            id="task-project"
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value)
              setFieldErrors((prev) => ({ ...prev, projectId: '' }))
            }}
            onBlur={validateProjectId}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 text-gray-900 ${
              fieldErrors.projectId
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={formState === 'submitting' || formState === 'success'}
            required
          >
            <option value="">Select a project...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {fieldErrors.projectId && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {fieldErrors.projectId}
            </p>
          )}
        </div>

        {/* Task Description */}
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
            Task Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setFieldErrors((prev) => ({ ...prev, description: '' }))
            }}
            onBlur={validateDescription}
            placeholder="Describe the task..."
            rows={3}
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 resize-none text-gray-900 placeholder:text-gray-400 ${
              fieldErrors.description
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={formState === 'submitting' || formState === 'success'}
            required
          />
          <div className="flex items-center justify-between mt-1">
            <div>
              {fieldErrors.description && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.description}
                </p>
              )}
            </div>
            <span
              className={`text-xs ${description.length > 450 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}
            >
              {description.length}/500 characters
            </span>
          </div>
        </div>

        {/* Due Date (Optional) */}
        <div>
          <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date (Optional)
          </label>
          <input
            type="date"
            id="task-due-date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            disabled={formState === 'submitting' || formState === 'success'}
          />
        </div>

        {/* Success Message */}
        {formState === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">Task created successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {formState === 'error' && error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={
              formState === 'submitting' || formState === 'success' || !projectId || !description.trim()
            }
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {formState === 'submitting' && <span className="animate-spin">⏳</span>}
            {formState === 'submitting' ? 'Creating Task...' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setProjectId('')
              setDescription('')
              setDueDate('')
              setError('')
              setFieldErrors({})
              setFormState('idle')
            }}
            disabled={formState === 'submitting'}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
