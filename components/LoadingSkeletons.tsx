/**
 * Loading Skeleton Components
 *
 * Provides skeleton loading states for all major UI components.
 * PRD Reference: Sprint 5 - UI/UX Polish
 *
 * Features:
 * - Animated pulse effect
 * - Maintains layout consistency during loading
 * - Accessible (ARIA labels)
 * - Responsive design
 */

/**
 * Base Skeleton Component
 */
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  )
}

/**
 * Project Card Skeleton
 */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="animate-pulse">
        {/* Status Badge */}
        <div className="h-6 w-20 bg-gray-200 rounded-full mb-4" />

        {/* Project Name */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />

        {/* Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  )
}

/**
 * Project Card List Skeleton (Grid of 3)
 */
export function ProjectCardListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCardSkeleton />
      <ProjectCardSkeleton />
      <ProjectCardSkeleton />
    </div>
  )
}

/**
 * Task List Item Skeleton
 */
export function TaskItemSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-3">
      <div className="animate-pulse flex items-start space-x-3 w-full">
        {/* Checkbox */}
        <div className="h-5 w-5 bg-gray-200 rounded mt-0.5 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

/**
 * Task List Skeleton
 */
export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
      {Array.from({ length: count }).map((_, i) => (
        <TaskItemSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Notes Panel Skeleton
 */
export function NotesPanelSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Client Notes Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>

      {/* FlowMatrix AI Notes Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Client Card Skeleton (Employee Dashboard)
 */
export function ClientCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="animate-pulse">
        {/* Client Name */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="animate-pulse">
        {/* Chart Title */}
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />

        {/* Chart Area */}
        <div
          className="bg-gray-100 rounded"
          style={{ height: `${height}px` }}
        >
          <div className="flex items-end justify-between h-full p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-t w-full mx-1"
                style={{
                  height: `${Math.random() * 60 + 40}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Full Page Loading Skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-96" />
      </div>

      {/* Metric Cards */}
      <div>
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <ProjectCardListSkeleton />
      </div>
    </div>
  )
}
