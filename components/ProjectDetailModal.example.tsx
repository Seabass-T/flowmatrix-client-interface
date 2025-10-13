/**
 * Example Usage of ProjectDetailModal Component
 *
 * This file demonstrates how to integrate the ProjectDetailModal
 * into your dashboard pages.
 */

'use client'

import { useState } from 'react'
import { ProjectDetailModal } from './ProjectDetailModal'
import { ProjectCard } from './ProjectCard'
import { ProjectWithRelations } from '@/types/database'

export function ProjectDetailModalExample() {
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Example project data (in real app, this comes from your database query)
  const exampleProject: ProjectWithRelations = {
    id: 'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
    client_id: 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
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
    updated_at: '2025-10-12T00:00:00Z',
    notes: [
      {
        id: 'n1',
        project_id: 'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        author_id: 'u1',
        note_type: 'flowmatrix_ai',
        content: 'Email system now live. Monitoring performance over the first week.',
        is_read: true,
        created_at: '2025-10-10T00:00:00Z',
      },
      {
        id: 'n2',
        project_id: 'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        author_id: 'u2',
        note_type: 'client',
        content: 'We are seeing some emails not getting tagged correctly. Can we review the tagging logic?',
        is_read: false,
        created_at: '2025-10-08T00:00:00Z',
      },
    ],
    tasks: [
      {
        id: 't1',
        project_id: 'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        description: 'Initial setup and training',
        is_completed: true,
        due_date: '2025-07-15',
        created_at: '2025-07-01T00:00:00Z',
        completed_at: '2025-07-15T00:00:00Z',
      },
      {
        id: 't2',
        project_id: 'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        description: 'Review client feedback on tagging',
        is_completed: false,
        due_date: '2025-10-12',
        created_at: '2025-10-08T00:00:00Z',
        completed_at: null,
      },
    ],
    files: [
      {
        id: 'f1',
        project_id: 'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        file_name: 'email_organizer_v1.2.json',
        file_url: 'https://example.com/files/email_organizer_v1.2.json',
        file_type: 'application/json',
        uploaded_by: 'u1',
        created_at: '2025-07-10T00:00:00Z',
      },
      {
        id: 'f2',
        project_id: 'p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        file_name: 'setup_guide.pdf',
        file_url: 'https://example.com/files/setup_guide.pdf',
        file_type: 'application/pdf',
        uploaded_by: 'u1',
        created_at: '2025-07-10T00:00:00Z',
      },
    ],
  }

  const handleProjectClick = () => {
    setSelectedProject(exampleProject)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Optional: clear selected project after animation completes
    setTimeout(() => setSelectedProject(null), 300)
  }

  return (
    <div>
      {/* Project Card - Clicking opens the modal */}
      <ProjectCard
        id={exampleProject.id}
        name={exampleProject.name}
        status={exampleProject.status}
        hoursSaved={exampleProject.hours_saved_daily || 0}
        roi={2184} // Calculate this from your data
        totalCost={0}
        lastUpdated={new Date(exampleProject.updated_at)}
        onClick={handleProjectClick}
      />

      {/* Modal - Only renders when isModalOpen is true */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

/**
 * INTEGRATION GUIDE
 *
 * 1. In your dashboard page, fetch project data with related entities:
 *
 * ```typescript
 * const { data: projects } = await supabaseAdmin
 *   .from('projects')
 *   .select(`
 *     *,
 *     notes(*),
 *     tasks(*),
 *     files(*)
 *   `)
 *   .eq('client_id', clientId)
 * ```
 *
 * 2. Add state management for modal:
 *
 * ```typescript
 * const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null)
 * const [isModalOpen, setIsModalOpen] = useState(false)
 * ```
 *
 * 3. Pass onClick handler to ProjectCard:
 *
 * ```typescript
 * <ProjectCard
 *   {...project}
 *   onClick={() => {
 *     setSelectedProject(project)
 *     setIsModalOpen(true)
 *   }}
 * />
 * ```
 *
 * 4. Render the modal conditionally:
 *
 * ```typescript
 * {selectedProject && (
 *   <ProjectDetailModal
 *     project={selectedProject}
 *     isOpen={isModalOpen}
 *     onClose={() => setIsModalOpen(false)}
 *   />
 * )}
 * ```
 */
