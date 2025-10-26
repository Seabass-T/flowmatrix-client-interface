/**
 * Demo Data for FlowMatrix AI Client Interface
 *
 * This file contains mock data for the demo experience at /demo
 * Company: Apex Construction Inc.
 * Industry: Construction & Home Services
 *
 * Data includes:
 * - 8 realistic automation projects (7 active, 1 in development)
 * - Tasks, notes, and files for each project
 * - Realistic costs including $12,000/month retainer
 * - ROI metrics spanning 4-10 months
 */

import { Project, Task, Note } from '@/types/database'

// Demo client data
export const DEMO_CLIENT = {
  id: 'demo-client-001',
  company_name: 'Apex Construction Inc.',
  industry: 'Construction & Home Services',
  avg_employee_wage: 28.50,
  created_at: '2023-12-01T00:00:00Z',
  updated_at: '2024-10-26T00:00:00Z',
}

// Demo user data
export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@apexconstruction.com',
  role: 'client' as const,
  created_at: '2023-12-01T00:00:00Z',
  last_login: '2024-10-26T00:00:00Z',
}

/**
 * 8 Demo Projects
 *
 * Costs Breakdown:
 * - Total Dev Costs: $52,000
 * - Total Implementation: $12,000
 * - Monthly Maintenance: $4,800/month (varies by project)
 * - Monthly Retainer: $6,500/month (started Dec 2023, 11 months = $71,500)
 * - Total Costs to Date: ~$135,500
 *
 * ROI Metrics:
 * - Total Active ROI: ~$44,700/month
 * - Total Time Saved: ~167 hours/week
 */

export const DEMO_PROJECTS: Project[] = [
  // 1. Project Management Interface (8 months active)
  {
    id: 'demo-project-001',
    client_id: DEMO_CLIENT.id,
    name: 'Project Management Interface',
    status: 'active',
    hours_saved_daily: null,
    hours_saved_weekly: 40,
    hours_saved_monthly: null,
    employee_wage: 28.50,
    dev_cost: 8000,
    implementation_cost: 1800,
    monthly_maintenance: 650,
    go_live_date: '2024-02-26',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-10-25T00:00:00Z',
  },

  // 2. Invoice Management System (10 months active)
  {
    id: 'demo-project-002',
    client_id: DEMO_CLIENT.id,
    name: 'Invoice Management System',
    status: 'active',
    hours_saved_daily: null,
    hours_saved_weekly: 10,
    hours_saved_monthly: null,
    employee_wage: 28.50,
    dev_cost: 4500,
    implementation_cost: 900,
    monthly_maintenance: 450,
    go_live_date: '2023-12-26',
    created_at: '2023-11-10T00:00:00Z',
    updated_at: '2024-10-24T00:00:00Z',
  },

  // 3. Proposal Generation System (6 months active)
  {
    id: 'demo-project-003',
    client_id: DEMO_CLIENT.id,
    name: 'Proposal Generation System',
    status: 'active',
    hours_saved_daily: null,
    hours_saved_weekly: 35,
    hours_saved_monthly: null,
    employee_wage: 28.50,
    dev_cost: 6500,
    implementation_cost: 1500,
    monthly_maintenance: 550,
    go_live_date: '2024-04-26',
    created_at: '2024-03-05T00:00:00Z',
    updated_at: '2024-10-23T00:00:00Z',
  },

  // 4. Job Scheduling & Dispatch Automation (7 months active)
  {
    id: 'demo-project-004',
    client_id: DEMO_CLIENT.id,
    name: 'Job Scheduling & Dispatch Automation',
    status: 'active',
    hours_saved_daily: null,
    hours_saved_weekly: 25,
    hours_saved_monthly: null,
    employee_wage: 28.50,
    dev_cost: 9500,
    implementation_cost: 2200,
    monthly_maintenance: 800,
    go_live_date: '2024-03-26',
    created_at: '2024-02-08T00:00:00Z',
    updated_at: '2024-10-22T00:00:00Z',
  },

  // 5. Material Ordering & Inventory Tracking (4 months active)
  {
    id: 'demo-project-005',
    client_id: DEMO_CLIENT.id,
    name: 'Material Ordering & Inventory Tracking',
    status: 'active',
    hours_saved_daily: null,
    hours_saved_weekly: 15,
    hours_saved_monthly: null,
    employee_wage: 28.50,
    dev_cost: 5500,
    implementation_cost: 1200,
    monthly_maintenance: 500,
    go_live_date: '2024-06-26',
    created_at: '2024-05-12T00:00:00Z',
    updated_at: '2024-10-21T00:00:00Z',
  },

  // 6. Customer Follow-up & Review Requests (9 months active)
  {
    id: 'demo-project-006',
    client_id: DEMO_CLIENT.id,
    name: 'Customer Follow-up & Review Requests',
    status: 'active',
    hours_saved_daily: null,
    hours_saved_weekly: 12,
    hours_saved_monthly: null,
    employee_wage: 28.50,
    dev_cost: 3800,
    implementation_cost: 700,
    monthly_maintenance: 400,
    go_live_date: '2024-01-26',
    created_at: '2023-12-20T00:00:00Z',
    updated_at: '2024-10-20T00:00:00Z',
  },

  // 7. Timesheet & Payroll Automation (5 months active)
  {
    id: 'demo-project-007',
    client_id: DEMO_CLIENT.id,
    name: 'Timesheet & Payroll Automation',
    status: 'active',
    hours_saved_daily: null,
    hours_saved_weekly: 30,
    hours_saved_monthly: null,
    employee_wage: 28.50,
    dev_cost: 7500,
    implementation_cost: 2000,
    monthly_maintenance: 600,
    go_live_date: '2024-05-26',
    created_at: '2024-04-10T00:00:00Z',
    updated_at: '2024-10-19T00:00:00Z',
  },

  // 8. Subcontractor Management System (In Development)
  {
    id: 'demo-project-008',
    client_id: DEMO_CLIENT.id,
    name: 'Subcontractor Management System',
    status: 'dev',
    hours_saved_daily: null,
    hours_saved_weekly: 20, // Projected
    hours_saved_monthly: null,
    employee_wage: 28.50,
    dev_cost: 6700, // Estimated
    implementation_cost: 1700, // Estimated
    monthly_maintenance: 0, // No maintenance until active
    go_live_date: null, // Expected: Nov 26, 2024
    created_at: '2024-08-26T00:00:00Z',
    updated_at: '2024-10-18T00:00:00Z',
  },
]

/**
 * Demo Tasks
 * Mix of completed and pending tasks across all projects
 */
export const DEMO_TASKS: (Task & { project: { id: string; name: string } })[] = [
  // Project 1 tasks
  {
    id: 'demo-task-001',
    project_id: 'demo-project-001',
    description: 'Initial training session with project managers',
    is_completed: true,
    due_date: '2024-02-20',
    created_at: '2024-02-15T00:00:00Z',
    completed_at: '2024-02-20T14:30:00Z',
    project: { id: 'demo-project-001', name: 'Project Management Interface' },
  },
  {
    id: 'demo-task-002',
    project_id: 'demo-project-001',
    description: 'Configure custom project templates for residential jobs',
    is_completed: true,
    due_date: '2024-03-05',
    created_at: '2024-02-25T00:00:00Z',
    completed_at: '2024-03-04T16:00:00Z',
    project: { id: 'demo-project-001', name: 'Project Management Interface' },
  },
  {
    id: 'demo-task-003',
    project_id: 'demo-project-001',
    description: 'Review Q4 project analytics dashboard',
    is_completed: false,
    due_date: '2024-11-01',
    created_at: '2024-10-15T00:00:00Z',
    completed_at: null,
    project: { id: 'demo-project-001', name: 'Project Management Interface' },
  },

  // Project 2 tasks
  {
    id: 'demo-task-004',
    project_id: 'demo-project-002',
    description: 'Connect QuickBooks integration for invoice sync',
    is_completed: true,
    due_date: '2024-01-10',
    created_at: '2023-12-28T00:00:00Z',
    completed_at: '2024-01-09T11:20:00Z',
    project: { id: 'demo-project-002', name: 'Invoice Management System' },
  },
  {
    id: 'demo-task-005',
    project_id: 'demo-project-002',
    description: 'Set up automated payment reminder emails',
    is_completed: true,
    due_date: '2024-01-25',
    created_at: '2024-01-12T00:00:00Z',
    completed_at: '2024-01-24T09:45:00Z',
    project: { id: 'demo-project-002', name: 'Invoice Management System' },
  },

  // Project 3 tasks
  {
    id: 'demo-task-006',
    project_id: 'demo-project-003',
    description: 'Create proposal templates for commercial projects',
    is_completed: true,
    due_date: '2024-05-10',
    created_at: '2024-05-01T00:00:00Z',
    completed_at: '2024-05-09T15:30:00Z',
    project: { id: 'demo-project-003', name: 'Proposal Generation System' },
  },
  {
    id: 'demo-task-007',
    project_id: 'demo-project-003',
    description: 'Update material cost database for winter pricing',
    is_completed: false,
    due_date: '2024-11-05',
    created_at: '2024-10-20T00:00:00Z',
    completed_at: null,
    project: { id: 'demo-project-003', name: 'Proposal Generation System' },
  },

  // Project 4 tasks
  {
    id: 'demo-task-008',
    project_id: 'demo-project-004',
    description: 'Configure crew availability calendar integration',
    is_completed: true,
    due_date: '2024-04-10',
    created_at: '2024-03-28T00:00:00Z',
    completed_at: '2024-04-09T13:00:00Z',
    project: { id: 'demo-project-004', name: 'Job Scheduling & Dispatch Automation' },
  },
  {
    id: 'demo-task-009',
    project_id: 'demo-project-004',
    description: 'Train dispatch team on route optimization features',
    is_completed: true,
    due_date: '2024-04-20',
    created_at: '2024-04-12T00:00:00Z',
    completed_at: '2024-04-19T10:30:00Z',
    project: { id: 'demo-project-004', name: 'Job Scheduling & Dispatch Automation' },
  },

  // Project 5 tasks
  {
    id: 'demo-task-010',
    project_id: 'demo-project-005',
    description: 'Connect primary supplier API for real-time inventory',
    is_completed: true,
    due_date: '2024-07-15',
    created_at: '2024-07-01T00:00:00Z',
    completed_at: '2024-07-14T16:20:00Z',
    project: { id: 'demo-project-005', name: 'Material Ordering & Inventory Tracking' },
  },
  {
    id: 'demo-task-011',
    project_id: 'demo-project-005',
    description: 'Review monthly inventory reports and adjust reorder thresholds',
    is_completed: false,
    due_date: '2024-11-10',
    created_at: '2024-10-25T00:00:00Z',
    completed_at: null,
    project: { id: 'demo-project-005', name: 'Material Ordering & Inventory Tracking' },
  },

  // Project 6 tasks
  {
    id: 'demo-task-012',
    project_id: 'demo-project-006',
    description: 'Set up Google Review request automation workflow',
    is_completed: true,
    due_date: '2024-02-10',
    created_at: '2024-01-28T00:00:00Z',
    completed_at: '2024-02-09T14:00:00Z',
    project: { id: 'demo-project-006', name: 'Customer Follow-up & Review Requests' },
  },

  // Project 7 tasks
  {
    id: 'demo-task-013',
    project_id: 'demo-project-007',
    description: 'Configure biweekly payroll export to ADP',
    is_completed: true,
    due_date: '2024-06-10',
    created_at: '2024-05-28T00:00:00Z',
    completed_at: '2024-06-09T11:40:00Z',
    project: { id: 'demo-project-007', name: 'Timesheet & Payroll Automation' },
  },
  {
    id: 'demo-task-014',
    project_id: 'demo-project-007',
    description: 'Review overtime tracking accuracy with field supervisors',
    is_completed: false,
    due_date: '2024-11-08',
    created_at: '2024-10-22T00:00:00Z',
    completed_at: null,
    project: { id: 'demo-project-007', name: 'Timesheet & Payroll Automation' },
  },

  // Project 8 tasks (In Development)
  {
    id: 'demo-task-015',
    project_id: 'demo-project-008',
    description: 'Finalize vendor onboarding workflow design',
    is_completed: true,
    due_date: '2024-09-15',
    created_at: '2024-09-01T00:00:00Z',
    completed_at: '2024-09-14T15:30:00Z',
    project: { id: 'demo-project-008', name: 'Subcontractor Management System' },
  },
  {
    id: 'demo-task-016',
    project_id: 'demo-project-008',
    description: 'Build payment tracking dashboard prototype',
    is_completed: true,
    due_date: '2024-10-10',
    created_at: '2024-09-20T00:00:00Z',
    completed_at: '2024-10-09T12:00:00Z',
    project: { id: 'demo-project-008', name: 'Subcontractor Management System' },
  },
  {
    id: 'demo-task-017',
    project_id: 'demo-project-008',
    description: 'Complete user acceptance testing with accounting team',
    is_completed: false,
    due_date: '2024-11-15',
    created_at: '2024-10-15T00:00:00Z',
    completed_at: null,
    project: { id: 'demo-project-008', name: 'Subcontractor Management System' },
  },
  {
    id: 'demo-task-018',
    project_id: 'demo-project-008',
    description: 'Schedule go-live training sessions for operations team',
    is_completed: false,
    due_date: '2024-11-20',
    created_at: '2024-10-18T00:00:00Z',
    completed_at: null,
    project: { id: 'demo-project-008', name: 'Subcontractor Management System' },
  },
]

/**
 * Demo Notes
 * Mix of client and FlowMatrix AI notes for each project
 */
export const DEMO_NOTES: Note[] = [
  // Project 1 notes
  {
    id: 'demo-note-001',
    project_id: 'demo-project-001',
    author_id: DEMO_USER.id,
    note_type: 'client',
    content: 'Team is loving the new project dashboard! Much easier to track commercial job progress.',
    is_read: true,
    created_at: '2024-10-15T10:30:00Z',
  },
  {
    id: 'demo-note-002',
    project_id: 'demo-project-001',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'System running smoothly. Added custom report for residential vs commercial job breakdown per your request.',
    is_read: true,
    created_at: '2024-10-18T14:20:00Z',
  },

  // Project 2 notes
  {
    id: 'demo-note-003',
    project_id: 'demo-project-002',
    author_id: DEMO_USER.id,
    note_type: 'client',
    content: 'Invoice processing time has dropped from 3 days to same-day. This is a game changer!',
    is_read: true,
    created_at: '2024-09-20T09:15:00Z',
  },
  {
    id: 'demo-note-004',
    project_id: 'demo-project-002',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Updated automated payment reminders to include early payment discount messaging.',
    is_read: true,
    created_at: '2024-10-10T11:45:00Z',
  },

  // Project 3 notes
  {
    id: 'demo-note-005',
    project_id: 'demo-project-003',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Proposal generation system live! Now creating professional quotes in under 10 minutes instead of 3 hours.',
    is_read: true,
    created_at: '2024-05-01T08:00:00Z',
  },
  {
    id: 'demo-note-006',
    project_id: 'demo-project-003',
    author_id: DEMO_USER.id,
    note_type: 'client',
    content: 'Can we add a section for optional add-ons in the proposal template? Would help with upselling.',
    is_read: true,
    created_at: '2024-08-12T15:30:00Z',
  },
  {
    id: 'demo-note-007',
    project_id: 'demo-project-003',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Optional add-ons section added to all proposal templates. Also included dynamic pricing based on project size.',
    is_read: true,
    created_at: '2024-08-20T10:00:00Z',
  },

  // Project 4 notes
  {
    id: 'demo-note-008',
    project_id: 'demo-project-004',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Job scheduling system deployed. Integrated with Google Calendar for crew availability tracking.',
    is_read: true,
    created_at: '2024-04-01T09:30:00Z',
  },
  {
    id: 'demo-note-009',
    project_id: 'demo-project-004',
    author_id: DEMO_USER.id,
    note_type: 'client',
    content: 'Route optimization is saving us 2-3 hours per day in drive time. Crews are happier too!',
    is_read: true,
    created_at: '2024-07-18T16:45:00Z',
  },

  // Project 5 notes
  {
    id: 'demo-note-010',
    project_id: 'demo-project-005',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Inventory system connected to primary supplier API. Real-time stock levels now available.',
    is_read: true,
    created_at: '2024-07-15T13:00:00Z',
  },
  {
    id: 'demo-note-011',
    project_id: 'demo-project-005',
    author_id: DEMO_USER.id,
    note_type: 'client',
    content: 'No more emergency material runs! System alerts us before we run out. Huge time saver.',
    is_read: true,
    created_at: '2024-09-05T11:20:00Z',
  },

  // Project 6 notes
  {
    id: 'demo-note-012',
    project_id: 'demo-project-006',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Review request automation live. Customers receive follow-up 3 days after job completion.',
    is_read: true,
    created_at: '2024-02-10T10:00:00Z',
  },
  {
    id: 'demo-note-013',
    project_id: 'demo-project-006',
    author_id: DEMO_USER.id,
    note_type: 'client',
    content: 'Google reviews increased 400% since launch. Great for our local SEO!',
    is_read: true,
    created_at: '2024-06-22T14:30:00Z',
  },

  // Project 7 notes
  {
    id: 'demo-note-014',
    project_id: 'demo-project-007',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Timesheet automation deployed with mobile clock-in/out. Syncs automatically with ADP payroll.',
    is_read: true,
    created_at: '2024-06-01T08:45:00Z',
  },
  {
    id: 'demo-note-015',
    project_id: 'demo-project-007',
    author_id: DEMO_USER.id,
    note_type: 'client',
    content: 'Payroll processing used to take our bookkeeper 2 full days. Now it takes 2 hours!',
    is_read: true,
    created_at: '2024-08-30T09:00:00Z',
  },

  // Project 8 notes (In Development)
  {
    id: 'demo-note-016',
    project_id: 'demo-project-008',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Development progressing well. Vendor onboarding workflow complete, now building payment tracking.',
    is_read: true,
    created_at: '2024-09-25T11:00:00Z',
  },
  {
    id: 'demo-note-017',
    project_id: 'demo-project-008',
    author_id: DEMO_USER.id,
    note_type: 'client',
    content: 'Excited to see the payment dashboard! Managing 15+ subcontractors manually is painful.',
    is_read: true,
    created_at: '2024-10-08T15:20:00Z',
  },
  {
    id: 'demo-note-018',
    project_id: 'demo-project-008',
    author_id: 'flowmatrix-employee-001',
    note_type: 'flowmatrix_ai',
    content: 'Payment tracking dashboard prototype complete. Scheduling UAT with your accounting team for Nov 15.',
    is_read: true,
    created_at: '2024-10-20T09:30:00Z',
  },
]

/**
 * Helper function to get project by ID
 */
export function getDemoProjectById(id: string): Project | undefined {
  return DEMO_PROJECTS.find(p => p.id === id)
}

/**
 * Helper function to get tasks for a project
 */
export function getDemoTasksForProject(projectId: string) {
  return DEMO_TASKS.filter(t => t.project_id === projectId)
}

/**
 * Helper function to get notes for a project
 */
export function getDemoNotesForProject(projectId: string) {
  return DEMO_NOTES.filter(n => n.project_id === projectId)
}

/**
 * Helper function to get all active projects
 */
export function getDemoActiveProjects() {
  return DEMO_PROJECTS.filter(p => p.status === 'active')
}

/**
 * Calculate total costs including retainer
 *
 * Monthly Retainer: $6,500/month (started Dec 2023, 11 months to Oct 2024)
 * Total Retainer: $71,500
 */
export function calculateDemoTotalCosts(): number {
  const devCosts = DEMO_PROJECTS.reduce((sum, p) => sum + p.dev_cost, 0)
  const implementationCosts = DEMO_PROJECTS.reduce((sum, p) => sum + p.implementation_cost, 0)

  // Calculate maintenance costs per project based on months active
  let maintenanceCosts = 0
  const now = new Date('2024-10-26')

  for (const project of DEMO_PROJECTS) {
    if (project.go_live_date && project.status === 'active') {
      const goLiveDate = new Date(project.go_live_date)
      const monthsActive = Math.max(0, Math.floor((now.getTime() - goLiveDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      maintenanceCosts += project.monthly_maintenance * monthsActive
    }
  }

  // Add monthly retainer (Dec 2023 to Oct 2024 = 11 months)
  const monthlyRetainer = 6500
  const retainerMonths = 11
  const totalRetainer = monthlyRetainer * retainerMonths

  return devCosts + implementationCosts + maintenanceCosts + totalRetainer
}
