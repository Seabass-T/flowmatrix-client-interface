'use client'

import { formatCurrency, formatHours } from '@/lib/calculations'
import { ProjectStatus } from '@/types/database'
import { useState, useEffect } from 'react'

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
  // Fix hydration error: Render date only on client-side
  const [formattedDate, setFormattedDate] = useState<string>('')

  useEffect(() => {
    setFormattedDate(lastUpdated.toLocaleDateString())
  }, [lastUpdated])

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] border border-transparent hover:border-blue-200"
    >
      {/* Status Badge with glow effect on hover */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase transition-all duration-300 ${STATUS_STYLES[status]} group-hover:shadow-sm`}>
          {status}
        </span>
      </div>

      {/* Project Name with color shift on hover */}
      <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-900 transition-colors duration-300">
        {name}
      </h3>

      {/* Key Metrics with staggered animation on hover */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300">
          <span className="text-gray-600">Time Saved:</span>
          <span className="font-semibold text-gray-900 tabular-nums">{formatHours(hoursSaved)}/day</span>
        </div>
        <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300 delay-50">
          <span className="text-gray-600">ROI:</span>
          <span className="font-semibold text-green-600 tabular-nums group-hover:text-green-700 transition-colors">
            {formatCurrency(roi)}
          </span>
        </div>
        <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300 delay-100">
          <span className="text-gray-600">Cost:</span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {totalCost === 0 ? 'Free' : formatCurrency(totalCost)}
          </span>
        </div>
      </div>

      {/* Last Updated with fade effect */}
      <div className="mt-4 pt-4 border-t border-gray-200 group-hover:border-gray-300 transition-colors duration-300">
        <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
          Last Updated: {formattedDate || '...'}
        </span>
      </div>

      {/* Hover indicator - subtle arrow or shine effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-3 right-3">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
