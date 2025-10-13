/**
 * ClientCard Component - Example Usage
 *
 * This file demonstrates how to use the ClientCard component
 * in the Employee Dashboard.
 *
 * Component: /components/ClientCard.tsx
 * PRD Reference: Section 4.3.4 (Client Account Cards)
 */

import { ClientCard } from './ClientCard'

export function ClientCardExamples() {
  return (
    <div className="space-y-12 p-8 bg-gray-50">
      {/* Example 1: Grid Layout (Recommended) */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Example 1: Responsive Grid Layout</h2>
        <p className="text-gray-600 mb-4">
          3-column grid on desktop (lg), 2-column on tablet (md), 1-column on mobile
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ClientCard
            id="client-1"
            companyName="UBL Group"
            activeWorkflows={3}
            uncompletedTasks={2}
            newClientNotes={1}
            totalROI={2418}
            paymentStatus="paid"
            totalRevenue={0}
          />
          <ClientCard
            id="client-2"
            companyName="ABC Construction"
            activeWorkflows={5}
            uncompletedTasks={4}
            newClientNotes={0}
            totalROI={8950}
            paymentStatus="overdue"
            totalRevenue={1200}
          />
          <ClientCard
            id="client-3"
            companyName="Tech Startup Inc"
            activeWorkflows={2}
            uncompletedTasks={1}
            newClientNotes={3}
            totalROI={1540}
            paymentStatus="pending"
            totalRevenue={500}
          />
        </div>
      </section>

      {/* Example 2: Single Card */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Example 2: Single Card</h2>
        <div className="max-w-md">
          <ClientCard
            id="client-solo"
            companyName="Solo Client"
            activeWorkflows={1}
            uncompletedTasks={0}
            newClientNotes={0}
            totalROI={750}
            paymentStatus="paid"
            totalRevenue={0}
          />
        </div>
      </section>

      {/* Example 3: Card with New Notes Indicator */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Example 3: Card with Unread Notes (🔴)</h2>
        <div className="max-w-md">
          <ClientCard
            id="client-notes"
            companyName="Client with Unread Notes"
            activeWorkflows={4}
            uncompletedTasks={3}
            newClientNotes={5}
            totalROI={12500}
            paymentStatus="paid"
            totalRevenue={3000}
          />
        </div>
      </section>

      {/* Example 4: Different Payment Statuses */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Example 4: Payment Status Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ClientCard
            id="client-paid"
            companyName="Paid Client"
            activeWorkflows={2}
            uncompletedTasks={1}
            newClientNotes={0}
            totalROI={5000}
            paymentStatus="paid"
            totalRevenue={2000}
          />
          <ClientCard
            id="client-pending"
            companyName="Pending Payment"
            activeWorkflows={3}
            uncompletedTasks={2}
            newClientNotes={1}
            totalROI={3200}
            paymentStatus="pending"
            totalRevenue={0}
          />
          <ClientCard
            id="client-overdue"
            companyName="Overdue Client"
            activeWorkflows={1}
            uncompletedTasks={5}
            newClientNotes={2}
            totalROI={1800}
            paymentStatus="overdue"
            totalRevenue={0}
          />
        </div>
      </section>

      {/* Example 5: Integration with Real Data */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Example 5: Real Data Integration</h2>
        <p className="text-gray-600 mb-4">
          How to use ClientCard with data from Supabase (Server Component)
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
          {`// app/dashboard/employee/page.tsx
import { ClientCard } from '@/components/ClientCard'
import { createAdminClient } from '@/lib/supabase-admin'

export default async function EmployeeDashboard() {
  const supabaseAdmin = createAdminClient()

  // Fetch clients with projects, tasks, and notes
  const { data: clients } = await supabaseAdmin
    .from('clients')
    .select(\`
      id,
      company_name,
      projects (
        id,
        status,
        tasks (id, is_completed),
        notes (id, note_type, is_read)
      )
    \`)

  // Calculate metrics for each client
  const clientMetrics = clients?.map(client => {
    const activeWorkflows = client.projects
      ?.filter(p => p.status === 'active').length || 0

    const uncompletedTasks = client.projects
      ?.flatMap(p => p.tasks)
      ?.filter(t => !t.is_completed).length || 0

    const newClientNotes = client.projects
      ?.flatMap(p => p.notes)
      ?.filter(n => n.note_type === 'client' && !n.is_read).length || 0

    return {
      id: client.id,
      companyName: client.company_name,
      activeWorkflows,
      uncompletedTasks,
      newClientNotes,
      totalROI: calculateClientROI(client.projects), // Custom function
      paymentStatus: 'paid', // Hardcoded for MVP
      totalRevenue: 0 // Hardcoded for MVP
    }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clientMetrics?.map(client => (
        <ClientCard key={client.id} {...client} />
      ))}
    </div>
  )
}`}
        </pre>
      </section>

      {/* Features Documentation */}
      <section className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Component Features</h2>
        <ul className="space-y-2 text-gray-700">
          <li>
            <strong>✅ Active Workflows:</strong> Count of systems with status = &apos;active&apos;
          </li>
          <li>
            <strong>✅ Uncompleted Tasks:</strong> Count of tasks where is_completed = false
          </li>
          <li>
            <strong>✅ New Client Notes:</strong> Count of unread client notes with red indicator (🔴)
          </li>
          <li>
            <strong>✅ Total ROI:</strong> Aggregated ROI for this client (formatted currency)
          </li>
          <li>
            <strong>✅ Payment Status:</strong> Paid ✓, Overdue ⚠️, or Pending ⏳ (hardcoded for MVP)
          </li>
          <li>
            <strong>✅ Total Revenue:</strong> Sum of payments received (hardcoded $0 for MVP)
          </li>
          <li>
            <strong>✅ View Dashboard Button:</strong> Navigates to client dashboard with edit mode
            enabled
          </li>
          <li>
            <strong>✅ Hover Effects:</strong> Card elevation and shadow transitions on hover
          </li>
          <li>
            <strong>✅ Responsive Design:</strong> Mobile-first with breakpoints (sm, md, lg)
          </li>
        </ul>
      </section>

      {/* Grid Breakpoints */}
      <section className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Responsive Grid Breakpoints</h2>
        <table className="w-full text-left">
          <thead className="border-b-2 border-gray-200">
            <tr>
              <th className="pb-2">Device</th>
              <th className="pb-2">Breakpoint</th>
              <th className="pb-2">Columns</th>
              <th className="pb-2">Tailwind Class</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-b border-gray-100">
              <td className="py-2">Mobile</td>
              <td className="py-2">&lt; 768px</td>
              <td className="py-2">1</td>
              <td className="py-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">grid-cols-1</code>
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Tablet</td>
              <td className="py-2">≥ 768px</td>
              <td className="py-2">2</td>
              <td className="py-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">md:grid-cols-2</code>
              </td>
            </tr>
            <tr>
              <td className="py-2">Desktop</td>
              <td className="py-2">≥ 1024px</td>
              <td className="py-2">3</td>
              <td className="py-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">lg:grid-cols-3</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}
