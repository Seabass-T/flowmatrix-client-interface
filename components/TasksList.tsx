'use client'

import { useState, memo, useMemo, useCallback } from 'react'
import { Task, Project } from '@/types/database'
import { format } from 'date-fns'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { EmptyTasks } from './EmptyStates'

interface TaskWithProject extends Task {
  project?: Pick<Project, 'id' | 'name'>
}

interface TasksListProps {
  tasks: TaskWithProject[]
  showViewAll?: boolean
  isEmployee?: boolean
  onTaskUpdated?: () => void
}

/**
 * TasksList Component
 *
 * PERFORMANCE: Memoized to prevent expensive re-renders when sorting/filtering tasks
 */
function TasksListComponent({ tasks, showViewAll = true, isEmployee = false, onTaskUpdated }: TasksListProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  // Memoize task completion toggle handler
  const handleToggleComplete = useCallback(async (taskId: string, currentStatus: boolean) => {
    if (!isEmployee) return

    setUpdatingTaskId(taskId)
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          is_completed: !currentStatus,
        }),
      })

      if (response.ok && onTaskUpdated) {
        onTaskUpdated()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }, [isEmployee, onTaskUpdated])

  // Memoize task deletion handler
  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!isEmployee) return
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok && onTaskUpdated) {
        onTaskUpdated()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }, [isEmployee, onTaskUpdated])

  // Memoize filtered and sorted incomplete tasks
  const incompleteTasks = useMemo(() => {
    return tasks
      .filter(task => !task.is_completed)
      .sort((a, b) => {
        // Sort by due date (earliest first), then by created date
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        }
        if (a.due_date) return -1
        if (b.due_date) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(0, 5)
  }, [tasks])

  if (incompleteTasks.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Outstanding Tasks
        </h2>
        <EmptyTasks isEmployee={isEmployee} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Outstanding Tasks ({incompleteTasks.length})
        </h2>
        {showViewAll && tasks.filter(t => !t.is_completed).length > 5 && (
          <Link
            href="/dashboard/client/tasks"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Tasks
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {incompleteTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200"
          >
            {/* Checkbox (interactive for employees) */}
            <div className="flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={task.is_completed}
                disabled={!isEmployee || updatingTaskId === task.id}
                onChange={() => handleToggleComplete(task.id, task.is_completed)}
                className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${
                  isEmployee ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                } ${updatingTaskId === task.id ? 'opacity-50' : ''}`}
                aria-label="Task status"
              />
            </div>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 flex-1 group-hover:text-gray-700 transition-colors">
                  {task.description}
                </p>
                {/* Delete button (employees only) - shows on hover */}
                {isEmployee && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                {/* Due date */}
                {task.due_date && (
                  <span className="text-xs text-gray-500">
                    Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                  </span>
                )}

                {/* Associated project link */}
                {task.project && (
                  <Link
                    href={`/dashboard/client/projects/${task.project.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    {task.project.name}
                  </Link>
                )}
              </div>

              {/* Overdue indicator */}
              {task.due_date && new Date(task.due_date) < new Date() && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded">
                  Overdue
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Export memoized version to prevent unnecessary re-renders
export const TasksList = memo(TasksListComponent)
