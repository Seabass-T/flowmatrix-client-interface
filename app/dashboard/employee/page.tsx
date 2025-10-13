/**
 * Employee Dashboard Page
 *
 * Displays master metrics and all client accounts for FlowMatrix AI employees.
 * Features:
 * - Master metrics overview (total clients, aggregate ROI, outstanding tasks)
 * - All client account cards with key metrics
 * - Navigation to individual client dashboards in edit mode
 *
 * PRD Reference: Section 4.3 (Employee Dashboard)
 * Access: Only users with role='employee'
 */

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { MasterMetrics } from '@/components/MasterMetrics'
import { ClientAccountCard } from '@/components/ClientAccountCard'
import { EmployeeHeader } from '@/components/EmployeeHeader'
import { calculateROI, calculateTotalHoursSaved } from '@/lib/calculations'

// Types for nested Supabase query
interface Task {
  id: string
  is_completed: boolean
}

interface Note {
  id: string
  note_type: 'client' | 'flowmatrix_ai'
  is_read: boolean
}

interface Project {
  id: string
  name: string
  status: 'active' | 'dev' | 'proposed' | 'inactive'
  hours_saved_daily: number | null
  hours_saved_weekly: number | null
  hours_saved_monthly: number | null
  employee_wage: number | null
  dev_cost: number | null
  implementation_cost: number | null
  monthly_maintenance: number | null
  go_live_date: string | null
  created_at: string
  tasks?: Task[]
  notes?: Note[]
}

interface Client {
  id: string
  company_name: string
  industry: string | null
  avg_employee_wage: number | null
  created_at: string
  projects?: Project[]
}

export default async function EmployeeDashboard() {
  // 1. Auth check with regular client
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Use ADMIN CLIENT for ALL data queries
  const supabaseAdmin = createAdminClient()

  // Verify user is employee
  const { data: userData } = (await supabaseAdmin
    .from('users')
    .select('email, role')
    .eq('id', user.id)
    .single()) as { data: { email: string; role: 'client' | 'employee' } | null }

  if (!userData || userData.role !== 'employee') {
    redirect('/dashboard/client')
  }

  // 3. Fetch ALL clients with their projects, notes, and tasks
  const { data: clients } = await supabaseAdmin
    .from('clients')
    .select(
      `
      id,
      company_name,
      industry,
      avg_employee_wage,
      created_at,
      projects (
        id,
        name,
        status,
        hours_saved_daily,
        hours_saved_weekly,
        hours_saved_monthly,
        employee_wage,
        dev_cost,
        implementation_cost,
        monthly_maintenance,
        go_live_date,
        created_at,
        tasks (
          id,
          is_completed
        ),
        notes (
          id,
          note_type,
          is_read
        )
      )
    `
    )
    .order('company_name', { ascending: true })

  // 4. Calculate aggregate metrics
  let totalClients = 0
  let aggregateROI = 0
  let totalOutstandingTasks = 0

  const clientMetrics =
    (clients as Client[] | null)?.map((client) => {
      totalClients++

      // Calculate metrics for this client
      let clientROI = 0
      let activeWorkflows = 0
      let uncompletedTasks = 0
      let newClientNotes = 0

      client.projects?.forEach((project) => {
        // Count active workflows
        if (project.status === 'active') {
          activeWorkflows++

          // Calculate ROI for active projects only
          const totalHours = calculateTotalHoursSaved(
            project.hours_saved_daily || undefined,
            project.hours_saved_weekly || undefined,
            project.hours_saved_monthly || undefined,
            project.go_live_date ? new Date(project.go_live_date) : undefined
          )

          const projectROI = calculateROI(totalHours, project.employee_wage || 0)
          clientROI += projectROI
        }

        // Count uncompleted tasks
        const incompleteTasks = project.tasks?.filter((task) => !task.is_completed).length || 0
        uncompletedTasks += incompleteTasks

        // Count unread client notes
        const unreadClientNotes =
          project.notes?.filter((note) => note.note_type === 'client' && !note.is_read).length ||
          0
        newClientNotes += unreadClientNotes
      })

      aggregateROI += clientROI
      totalOutstandingTasks += uncompletedTasks

      return {
        id: client.id,
        companyName: client.company_name,
        activeWorkflows,
        uncompletedTasks,
        newClientNotes,
        totalROI: clientROI,
        paymentStatus: 'paid' as const, // Hardcoded for MVP (Phase 2 feature)
        totalRevenue: 0, // Hardcoded for MVP (Phase 2 feature)
      }
    }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <EmployeeHeader email={userData.email} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Master Metrics Overview */}
        <MasterMetrics
          totalClients={totalClients}
          aggregateROI={aggregateROI}
          outstandingTasks={totalOutstandingTasks}
        />

        {/* All Client Accounts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Client Accounts</h2>

          {clientMetrics.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">No clients yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Client accounts will appear here once created.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clientMetrics.map((client) => (
                <ClientAccountCard key={client.id} {...client} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
