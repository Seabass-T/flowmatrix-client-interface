/**
 * Master Metrics Component
 *
 * Displays aggregate metrics across ALL clients for Employee Dashboard.
 * Shows: Total Clients, Aggregate ROI, Outstanding Tasks
 *
 * Location: Employee Dashboard (PRD Section 4.3.3)
 */

import { MetricCard } from '@/components/MetricCard'
import { formatCurrency } from '@/lib/calculations'

interface MasterMetricsProps {
  totalClients: number
  aggregateROI: number
  outstandingTasks: number
  roiTrend?: {
    percentage: number
    direction: 'up' | 'down' | 'neutral'
  }
}

export function MasterMetrics({
  totalClients,
  aggregateROI,
  outstandingTasks,
  roiTrend,
}: MasterMetricsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Master Metrics Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Clients"
          value={totalClients.toString()}
          subtitle="Active Accounts"
        />

        <MetricCard
          title="Aggregate ROI"
          value={formatCurrency(aggregateROI)}
          trend={roiTrend}
          subtitle="Across All Clients"
        />

        <MetricCard
          title="Outstanding Tasks"
          value={outstandingTasks.toString()}
          subtitle="Across All Clients"
        />
      </div>
    </div>
  )
}
