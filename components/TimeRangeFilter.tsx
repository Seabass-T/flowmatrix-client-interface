'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

/**
 * TimeRangeFilter Component
 *
 * Features:
 * - Allows users to filter metrics by time range
 * - Options: Last 7 Days, Last Month, Last Quarter, All Time
 * - Updates URL searchParams for shareable/bookmarkable state
 * - Client-side component for interactivity
 *
 * PRD Reference: Section 4.2.3 (Overview Metrics - Time Range Toggle)
 *
 * Usage:
 * <TimeRangeFilter currentRange="all" />
 */

type TimeRange = '7days' | 'month' | 'quarter' | 'all'

interface TimeRangeOption {
  value: TimeRange
  label: string
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: '7days', label: 'Last 7 Days' },
  { value: 'month', label: 'Last Month' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'all', label: 'All Time' },
]

interface TimeRangeFilterProps {
  currentRange: TimeRange
}

export function TimeRangeFilter({ currentRange }: TimeRangeFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleRangeChange = (newRange: TimeRange) => {
    // Create new search params
    const params = new URLSearchParams(searchParams.toString())

    if (newRange === 'all') {
      // Remove timeRange param if 'all' (default)
      params.delete('timeRange')
    } else {
      params.set('timeRange', newRange)
    }

    // Navigate to new URL with updated params (maintain current path)
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-gray-700">Time Range:</span>
      <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
        {TIME_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleRangeChange(option.value)}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
              ${
                currentRange === option.value
                  ? 'bg-blue-900 text-white shadow-md scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
