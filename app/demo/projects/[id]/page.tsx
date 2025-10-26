import { notFound } from 'next/navigation'
import { ProjectWithRelations } from '@/types/database'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProjectDetailContent } from '@/components/ProjectDetailContent'
import {
  getDemoProjectById,
  getDemoTasksForProject,
  getDemoNotesForProject,
} from '@/lib/demo-data'

/**
 * Demo Project Detail Page
 *
 * Displays full project details for demo projects at /demo/projects/[id]
 * No authentication required - uses mock data
 *
 * Features:
 * - Back button to return to demo dashboard
 * - All project details with related data
 * - ROI charts and metrics
 * - Read-only view
 */

interface DemoProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DemoProjectDetailPage({ params }: DemoProjectDetailPageProps) {
  const { id } = await params

  // Get demo project by ID
  const project = getDemoProjectById(id)

  if (!project) {
    notFound()
  }

  // Get related data
  const tasks = getDemoTasksForProject(id)
  const notes = getDemoNotesForProject(id)

  // Construct ProjectWithRelations object
  const projectWithRelations: ProjectWithRelations = {
    ...project,
    tasks: tasks.map(t => ({
      id: t.id,
      project_id: t.project_id,
      description: t.description,
      is_completed: t.is_completed,
      due_date: t.due_date,
      created_at: t.created_at,
      completed_at: t.completed_at,
    })),
    notes: notes,
    files: [], // Demo doesn't include files
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/demo"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Demo Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProjectDetailContent project={projectWithRelations} />
      </div>
    </div>
  )
}
