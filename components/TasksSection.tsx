'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TasksList } from './TasksList'
import { AddTaskForm } from './AddTaskForm'
import { Task, Project } from '@/types/database'

interface TaskWithProject extends Task {
  project?: Pick<Project, 'id' | 'name'>
}

interface TasksSectionProps {
  initialTasks: TaskWithProject[]
  projects: Project[]
  isEmployee: boolean
}

/**
 * Client Component wrapper for Tasks Section
 *
 * Handles refreshing the page after task updates (create, complete, delete)
 * since the parent page is a Server Component.
 */
export function TasksSection({ initialTasks, projects, isEmployee }: TasksSectionProps) {
  const router = useRouter()
  const [tasks] = useState(initialTasks)

  const handleTaskUpdated = () => {
    // Refresh the page to get updated tasks from the server
    router.refresh()
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks & Action Items</h2>
      {isEmployee && <AddTaskForm projects={projects} onTaskAdded={handleTaskUpdated} />}
      {tasks && tasks.length > 0 && (
        <TasksList
          tasks={tasks}
          showViewAll={false}
          isEmployee={isEmployee}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  )
}
