/**
 * Empty State Components
 *
 * Provides friendly empty states when there's no data to display.
 * PRD Reference: Sprint 5 - UI/UX Polish
 *
 * Features:
 * - Friendly messaging
 * - Clear call-to-action where appropriate
 * - Icon support
 * - Responsive design
 * - Accessible
 */

import {
  FolderOpen,
  ClipboardList,
  MessageSquare,
  Users,
  AlertCircle,
  Inbox,
} from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Base Empty State Component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/**
 * Empty Projects State
 */
export function EmptyProjects({ isEmployee = false }: { isEmployee?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <EmptyState
        icon={<FolderOpen className="w-16 h-16" />}
        title="No projects yet"
        description={
          isEmployee
            ? "This client doesn't have any projects yet. Add a new project to get started tracking ROI metrics."
            : "You don't have any automation projects yet. Your FlowMatrix AI team will add projects as they're created."
        }
      />
    </div>
  )
}

/**
 * Empty Tasks State
 */
export function EmptyTasks({ isEmployee = false }: { isEmployee?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <EmptyState
        icon={<ClipboardList className="w-16 h-16" />}
        title="No tasks to show"
        description={
          isEmployee
            ? "All tasks are completed! Great work. Create new tasks to track upcoming action items."
            : "You don't have any outstanding tasks at the moment. Check back later for updates from your FlowMatrix AI team."
        }
      />
    </div>
  )
}

/**
 * Empty Notes State
 */
export function EmptyNotes({ type }: { type: 'client' | 'flowmatrix_ai' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <MessageSquare className="w-12 h-12 text-gray-400 mb-3" />
      <h4 className="text-sm font-semibold text-gray-900 mb-1">
        No {type === 'client' ? 'client' : 'FlowMatrix AI'} notes yet
      </h4>
      <p className="text-xs text-gray-600 max-w-xs">
        {type === 'client'
          ? 'Add a note to communicate with your FlowMatrix AI team about project updates or questions.'
          : 'Notes from your FlowMatrix AI team will appear here with project updates and system information.'}
      </p>
    </div>
  )
}

/**
 * Empty Clients State (Employee Dashboard)
 */
export function EmptyClients() {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <EmptyState
        icon={<Users className="w-16 h-16" />}
        title="No clients yet"
        description="You don't have any client accounts yet. Clients will appear here once they sign up and are added to the system."
      />
    </div>
  )
}

/**
 * Error State
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error loading this data. Please try refreshing the page.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <EmptyState
        icon={<AlertCircle className="w-16 h-16 text-red-500" />}
        title={title}
        description={description}
        action={
          onRetry
            ? {
                label: 'Try Again',
                onClick: onRetry,
              }
            : undefined
        }
      />
    </div>
  )
}

/**
 * No Results State (Search/Filter)
 */
export function NoResults({
  searchTerm,
  onClearSearch,
}: {
  searchTerm?: string
  onClearSearch?: () => void
}) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <EmptyState
        icon={<Inbox className="w-16 h-16" />}
        title="No results found"
        description={
          searchTerm
            ? `No results found for "${searchTerm}". Try adjusting your search or filters.`
            : 'No results match your current filters. Try adjusting your criteria.'
        }
        action={
          onClearSearch
            ? {
                label: 'Clear Search',
                onClick: onClearSearch,
              }
            : undefined
        }
      />
    </div>
  )
}

/**
 * Compact Empty State (for smaller containers)
 */
export function CompactEmptyState({
  icon,
  message,
}: {
  icon?: React.ReactNode
  message: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
      {icon && (
        <div className="mb-2 text-gray-400">
          {icon}
        </div>
      )}
      <p className="text-sm text-gray-600">
        {message}
      </p>
    </div>
  )
}
