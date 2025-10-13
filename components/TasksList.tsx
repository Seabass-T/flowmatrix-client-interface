'use client'

import { Task, Project } from '@/types/database'
import { format } from 'date-fns'
import Link from 'next/link'

interface TaskWithProject extends Task {
  project?: Pick<Project, 'id' | 'name'>
}

interface TasksListProps {
  tasks: TaskWithProject[]
  showViewAll?: boolean
}

export function TasksList({ tasks, showViewAll = true }: TasksListProps) {
  // Filter incomplete tasks and limit to top 5
  const incompleteTasks = tasks
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

  if (incompleteTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Outstanding Tasks
        </h2>
        <p className="text-gray-500 text-center py-8">
          No outstanding tasks at this time. Great job! 🎉
        </p>
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
            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {/* Checkbox (non-interactive for clients) */}
            <div className="flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={false}
                disabled
                className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-not-allowed opacity-50"
                aria-label="Task status"
              />
            </div>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {task.description}
              </p>

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
