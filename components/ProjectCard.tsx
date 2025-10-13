import { formatCurrency, formatHours } from '@/lib/calculations'
import { ProjectStatus } from '@/types/database'

interface ProjectCardProps {
  id: string
  name: string
  status: ProjectStatus
  hoursSaved: number
  roi: number
  totalCost: number
  lastUpdated: Date
  onClick: () => void
}

// Status badge colors from PRD Section 8.1
const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  dev: 'bg-blue-100 text-blue-800',
  proposed: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
}

/**
 * ProjectCard Component
 *
 * Displays a project/system card with status badge, key metrics, and last updated date.
 *
 * PRD Reference: Section 4.2.7 (Project/System Cards), Section 10.6 (Component Code)
 *
 * Features:
 * - Status badge with color coding (active=green, dev=blue, proposed=yellow, inactive=gray)
 * - Key metrics: Time saved, ROI, Cost
 * - Hover effect with elevation and translation
 * - Clickable to open project detail modal
 * - Last updated timestamp
 * - Responsive design
 *
 * Status Colors (PRD Section 8.1):
 * - Active: Green (#10B981)
 * - Dev: Blue (#3B82F6)
 * - Proposed: Yellow (#F59E0B)
 * - Inactive: Gray (#6B7280)
 */
export function ProjectCard({
  name,
  status,
  hoursSaved,
  roi,
  totalCost,
  lastUpdated,
  onClick,
}: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1"
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${STATUS_STYLES[status]}`}>
          {status}
        </span>
      </div>

      {/* Project Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">{name}</h3>

      {/* Key Metrics */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Time Saved:</span>
          <span className="font-semibold text-gray-900">{formatHours(hoursSaved)}/day</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ROI:</span>
          <span className="font-semibold text-green-600">{formatCurrency(roi)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Cost:</span>
          <span className="font-semibold text-gray-900">
            {totalCost === 0 ? 'Free' : formatCurrency(totalCost)}
          </span>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Last Updated: {lastUpdated.toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
