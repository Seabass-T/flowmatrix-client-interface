/**
 * Example Usage: NotesPanel Component
 *
 * This component implements PRD.md Section 4.2.5 - Notes Section (Dual Panel)
 *
 * Features:
 * - Left Panel: Client Notes
 *   - Add note form with project dropdown
 *   - Note thread display (newest first)
 *   - Edit/delete own notes (clients can only edit their own, employees can edit all)
 *
 * - Right Panel: FlowMatrix AI Notes
 *   - Read-only display
 *   - Chronological order
 *   - No editing capabilities for clients
 *
 * - Real-time note fetching when project selection changes
 * - RLS enforcement: Clients can only add 'client' type notes
 */

import { NotesPanel } from '@/components/NotesPanel'
import { Project } from '@/types/database'

// Example 1: Usage in Client Dashboard
export function ClientDashboardExample() {
  // In a real Server Component, fetch these from Supabase
  const projects: Project[] = [
    {
      id: 'project-1',
      client_id: 'client-1',
      name: 'Email Organizer & Summarizer',
      status: 'active',
      hours_saved_daily: 1.0,
      hours_saved_weekly: null,
      hours_saved_monthly: null,
      employee_wage: 26.0,
      dev_cost: 0,
      implementation_cost: 0,
      monthly_maintenance: 0,
      go_live_date: '2025-07-10',
      created_at: '2025-07-01T00:00:00Z',
      updated_at: '2025-07-10T00:00:00Z',
    },
    {
      id: 'project-2',
      client_id: 'client-1',
      name: 'Developer Email Outreach',
      status: 'active',
      hours_saved_daily: null,
      hours_saved_weekly: null,
      hours_saved_monthly: 3.0,
      employee_wage: 26.0,
      dev_cost: 0,
      implementation_cost: 0,
      monthly_maintenance: 0,
      go_live_date: '2025-07-10',
      created_at: '2025-07-01T00:00:00Z',
      updated_at: '2025-07-10T00:00:00Z',
    },
    {
      id: 'project-3',
      client_id: 'client-1',
      name: 'Company ERP',
      status: 'dev',
      hours_saved_daily: null,
      hours_saved_weekly: 35.0,
      hours_saved_monthly: null,
      employee_wage: 30.0,
      dev_cost: 0,
      implementation_cost: 0,
      monthly_maintenance: 0,
      go_live_date: null,
      created_at: '2025-07-01T00:00:00Z',
      updated_at: '2025-08-01T00:00:00Z',
    },
  ]

  const userId = 'user-123'
  const userRole: 'client' | 'employee' = 'client'

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Communication</h2>

      <NotesPanel
        projects={projects}
        userId={userId}
        userRole={userRole}
        initialNotes={[]}
      />
    </div>
  )
}

// Example 2: Usage in Employee Dashboard (when viewing a client)
export function EmployeeDashboardExample() {
  const projects: Project[] = [
    // Same projects as above...
  ]

  const employeeId = 'employee-456'
  const userRole: 'client' | 'employee' = 'employee'

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Client Communication - UBL Group
      </h2>

      <NotesPanel
        projects={projects}
        userId={employeeId}
        userRole={userRole}
        initialNotes={[]}
      />
    </div>
  )
}

// Example 3: Integration with Server Component
/**
 * app/dashboard/client/page.tsx
 */
/*
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { NotesPanel } from '@/components/NotesPanel'

export default async function ClientDashboard() {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch data with admin client
  const supabaseAdmin = createAdminClient()

  // Get user details
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('email, role')
    .eq('id', user.id)
    .single()

  // Get client's projects
  const { data: userClients } = await supabaseAdmin
    .from('user_clients')
    .select('client_id')
    .eq('user_id', user.id)

  const clientIds = userClients?.map(uc => uc.client_id) || []

  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*')
    .in('client_id', clientIds)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Other dashboard sections *\/}

      <section className="mt-8">
        <NotesPanel
          projects={projects || []}
          userId={user.id}
          userRole={userData?.role || 'client'}
          initialNotes={[]}
        />
      </section>
    </div>
  )
}
*/

// Example 4: API Endpoints
/**
 * The NotesPanel component uses the following API endpoints:
 *
 * GET /api/notes?project_id={id}
 * - Fetches all notes for a specific project
 * - Returns: Note[]
 *
 * POST /api/notes
 * - Creates a new note
 * - Body: { project_id: string, author_id: string, note_type: 'client' | 'flowmatrix_ai', content: string }
 * - Returns: Note
 * - RLS Enforcement:
 *   - Clients can only create 'client' type notes
 *   - Employees can only create 'flowmatrix_ai' type notes
 *
 * PATCH /api/notes
 * - Updates an existing note (content only)
 * - Body: { id: string, content: string }
 * - Returns: Note
 * - Permission:
 *   - Employees can edit all notes
 *   - Clients can only edit their own client notes
 *
 * DELETE /api/notes
 * - Deletes a note
 * - Body: { id: string }
 * - Returns: { success: true }
 * - Permission:
 *   - Employees can delete all notes
 *   - Clients can only delete their own client notes
 */

// Example 5: RLS Policies (from PRD.md)
/**
 * Supabase RLS policies ensure database-level security:
 *
 * SELECT Policy:
 * - Users can view notes for projects they have access to
 * - Employees can view all notes
 *
 * INSERT Policy:
 * - Clients can insert notes with note_type = 'client' only
 * - Employees can insert notes with note_type = 'flowmatrix_ai' only
 *
 * UPDATE/DELETE Policy:
 * - Employees can update/delete all notes
 * - Clients can only update/delete their own client notes
 *
 * See PRD.md lines 1877-1910 for full SQL policies
 */

// Example 6: State Management
/**
 * The NotesPanel component manages its own state:
 *
 * - selectedProjectId: string - Currently selected project for viewing/adding notes
 * - notes: Note[] - All notes for the selected project (fetched from API)
 * - newNoteContent: string - Content for new note being composed
 * - editingNoteId: string | null - ID of note being edited (null if none)
 * - editContent: string - Content of note being edited
 * - loading: boolean - Whether notes are being fetched
 * - submitting: boolean - Whether a new note is being submitted
 *
 * Real-time updates:
 * - useEffect hook fetches notes when selectedProjectId changes
 * - Notes are automatically refreshed when project selection changes
 */

// Example 7: Styling & Layout
/**
 * The NotesPanel uses a responsive dual-panel layout:
 *
 * Desktop (lg: 1024px+):
 * - Two columns side-by-side
 * - Left: Client Notes (50% width)
 * - Right: FlowMatrix AI Notes (50% width)
 *
 * Mobile/Tablet (< 1024px):
 * - Single column stacked layout
 * - Client Notes panel appears first
 * - FlowMatrix AI Notes panel below
 *
 * Visual Design:
 * - Client Notes: Blue-themed (bg-blue-50, border-blue-200)
 * - FlowMatrix AI Notes: Green-themed (bg-green-50, border-green-200)
 * - Max height with scroll for long note threads
 * - Timestamps use date-fns for relative time ("2 hours ago")
 */

// Example 8: Accessibility
/**
 * Accessibility features:
 *
 * - Semantic HTML: <form>, <label>, <textarea>, <button>
 * - ARIA labels: aria-label on icon buttons
 * - Keyboard navigation: Tab through form fields and buttons
 * - Focus states: Visible focus rings on interactive elements
 * - Required fields: HTML required attribute on form inputs
 * - Character counter: Visible feedback on textarea (500 char limit)
 * - Error states: Confirmation dialog for delete operations
 */
