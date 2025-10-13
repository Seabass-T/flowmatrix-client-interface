/**
 * Client Card Component (PRD Section 4.3.4)
 *
 * Displays client account summary for Employee Dashboard.
 * Shows: Active Workflows, Uncompleted Tasks, New Notes indicator, Total ROI,
 * Payment Status (hardcoded for MVP), Total Revenue (hardcoded $0)
 *
 * Features:
 * - Responsive card layout with hover effects
 * - 'View Dashboard' button navigates to client dashboard with edit mode enabled
 * - Red indicator (🔴) for new/unread client notes
 * - Payment status badge (Paid ✓, Overdue ⚠️, Pending ⏳)
 *
 * Usage:
 * ```tsx
 * <ClientCard
 *   id={client.id}
 *   companyName="UBL Group"
 *   activeWorkflows={3}
 *   uncompletedTasks={2}
 *   newClientNotes={1}
 *   totalROI={2418}
 *   paymentStatus="paid"
 *   totalRevenue={0}
 * />
 * ```
 *
 * Grid Layout (Parent Container):
 * ```tsx
 * <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 *   {clients.map(client => <ClientCard key={client.id} {...client} />)}
 * </div>
 * ```
 */

'use client'

import { formatCurrency } from '@/lib/calculations'
import { useRouter } from 'next/navigation'

interface ClientCardProps {
  id: string
  companyName: string
  activeWorkflows: number
  uncompletedTasks: number
  newClientNotes: number
  totalROI: number
  paymentStatus?: 'paid' | 'overdue' | 'pending'
  totalRevenue?: number
}

const PAYMENT_STATUS_STYLES = {
  paid: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
  overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: '⚠️' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
}

export function ClientCard({
  id,
  companyName,
  activeWorkflows,
  uncompletedTasks,
  newClientNotes,
  totalROI,
  paymentStatus = 'paid',
  totalRevenue = 0,
}: ClientCardProps) {
  const router = useRouter()
  const paymentStyle = PAYMENT_STATUS_STYLES[paymentStatus]

  const handleViewDashboard = () => {
    // Navigate to client dashboard with edit mode enabled (employee access)
    // Sprint 4: Full edit mode implementation (PRD Section 4.3.5)
    router.push(`/dashboard/employee/clients/${id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-200">
      {/* Header with client name and action button */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{companyName}</h3>
        <button
          onClick={handleViewDashboard}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          aria-label={`View dashboard for ${companyName}`}
        >
          View Dashboard
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Metrics Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active Workflows:</span>
          <span className="text-sm font-semibold text-gray-900">{activeWorkflows}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Uncompleted Tasks:</span>
          <span className="text-sm font-semibold text-gray-900">{uncompletedTasks}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">New Client Notes:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{newClientNotes}</span>
            {newClientNotes > 0 && (
              <span className="text-red-600 animate-pulse" aria-label="Unread notes">
                🔴
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total ROI:</span>
          <span className="text-sm font-bold text-green-600">{formatCurrency(totalROI)}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-3" />

        {/* Payment Status (Phase 2 feature, hardcoded for MVP) */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment Status:</span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${paymentStyle.bg} ${paymentStyle.text}`}
          >
            {paymentStyle.icon} {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Revenue:</span>
          <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>
    </div>
  )
}
