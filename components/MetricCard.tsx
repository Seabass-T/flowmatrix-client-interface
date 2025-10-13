import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  trend?: {
    percentage: number
    direction: 'up' | 'down' | 'neutral'
  }
  subtitle?: string
  icon?: React.ReactNode
  accentColor?: 'blue' | 'green' | 'orange' | 'teal'
}

/**
 * MetricCard component for displaying key metrics
 *
 * Features:
 * - Large value display
 * - Optional trend indicator with arrow
 * - Optional icon
 * - Hover effect with shadow
 * - Responsive sizing
 *
 * Brand Colors:
 * - Primary: Deep Blue (#1E3A8A) - Default accent
 * - Success: Teal (#0D9488) - For positive metrics
 * - Accent: Orange (#F97316) - For important metrics
 * - Text: Gray-700 for titles, Gray-600 for subtitles
 *
 * Usage:
 * <MetricCard
 *   title="Total ROI"
 *   value="$2,418"
 *   trend={{ percentage: 12, direction: 'up' }}
 *   subtitle="MTD"
 * />
 */
export function MetricCard({
  title,
  value,
  trend,
  subtitle,
  icon,
  accentColor = 'blue',
}: MetricCardProps) {
  // Accent color classes based on brand colors
  const accentColors = {
    blue: 'text-blue-900', // Deep Blue (#1E3A8A)
    green: 'text-teal-600', // Teal (#0D9488)
    orange: 'text-orange-500', // Orange (#F97316)
    teal: 'text-teal-600', // Teal (#0D9488)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>

          <div className="flex items-baseline space-x-2">
            <p className={`text-4xl font-bold ${accentColors[accentColor]}`}>
              {value}
            </p>
            {icon && <div className="text-gray-400">{icon}</div>}
          </div>

          {trend && trend.direction !== 'neutral' && (
            <div className="mt-2 flex items-center">
              <div
                className={`flex items-center text-sm font-medium ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.direction === 'up' ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span>{trend.percentage}%</span>
              </div>
              {subtitle && (
                <span className="ml-2 text-sm text-gray-500">{subtitle}</span>
              )}
            </div>
          )}

          {!trend && subtitle && (
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton loading state for MetricCard
 */
export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}
