/**
 * Example usage of TasksList component
 *
 * This component displays outstanding (incomplete) tasks for a client,
 * showing the top 5 tasks sorted by due date.
 *
 * PRD Reference: Section 4.2.4 - Outstanding Tasks Section
 */

import { TasksList } from '@/components/TasksList'

// Example 1: Basic usage with tasks
const tasksWithProjects = [
  {
    id: 'task-1',
    project_id: 'project-1',
    description: 'Provide feedback on ERP wireframes',
    is_completed: false,
    due_date: '2025-10-15',
    created_at: '2025-10-01',
    completed_at: null,
    project: {
      id: 'project-1',
      name: 'Company ERP'
    }
  },
  {
    id: 'task-2',
    project_id: 'project-2',
    description: 'Review email automation logs for errors',
    is_completed: false,
    due_date: '2025-10-12',
    created_at: '2025-10-05',
    completed_at: null,
    project: {
      id: 'project-2',
      name: 'Email Organizer'
    }
  },
  {
    id: 'task-3',
    project_id: 'project-1',
    description: 'Approve maintenance plan for Q4',
    is_completed: false,
    due_date: null, // No due date
    created_at: '2025-10-08',
    completed_at: null,
    project: {
      id: 'project-1',
      name: 'Company ERP'
    }
  }
]

export function TasksListExample() {
  return (
    <div className="space-y-8">
      {/* Basic usage */}
      <div>
        <h2 className="text-xl font-bold mb-4">Basic Usage</h2>
        <TasksList tasks={tasksWithProjects} showViewAll={true} />
      </div>

      {/* With no tasks */}
      <div>
        <h2 className="text-xl font-bold mb-4">Empty State</h2>
        <TasksList tasks={[]} showViewAll={true} />
      </div>

      {/* With only completed tasks */}
      <div>
        <h2 className="text-xl font-bold mb-4">All Tasks Completed</h2>
        <TasksList
          tasks={[
            {
              id: 'task-4',
              project_id: 'project-1',
              description: 'Initial setup completed',
              is_completed: true,
              due_date: '2025-10-01',
              created_at: '2025-09-20',
              completed_at: '2025-10-01',
            }
          ]}
          showViewAll={false}
        />
      </div>
    </div>
  )
}

/**
 * FEATURES:
 *
 * ✅ Shows top 5 incomplete tasks
 * ✅ Sorts by due date (earliest first)
 * ✅ Non-interactive checkboxes for clients
 * ✅ Displays task description, due date, and associated project
 * ✅ Links to project detail pages
 * ✅ Shows "Overdue" indicator for past-due tasks
 * ✅ "View All Tasks" link when more than 5 tasks exist
 * ✅ Empty state when no tasks exist
 * ✅ Responsive design (mobile-friendly)
 *
 * INTEGRATION:
 *
 * // In server component (e.g., app/dashboard/client/page.tsx)
 * const { data: tasks } = await supabaseAdmin
 *   .from('tasks')
 *   .select(`
 *     *,
 *     project:projects!inner(id, name)
 *   `)
 *   .in('project_id', projectIds)
 *   .order('due_date', { ascending: true, nullsFirst: false })
 *
 * return <TasksList tasks={tasks || []} showViewAll={true} />
 */
