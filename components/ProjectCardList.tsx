'use client'

import { useRouter } from 'next/navigation'
import { ProjectCard } from './ProjectCard'
import { Project } from '@/types/database'
import {
  calculateTotalHoursSaved,
  calculateROI,
  calculateTotalCost,
} from '@/lib/calculations'

interface ProjectCardListProps {
  projects: Project[]
  timeRange: 'day' | 'week' | 'month' | 'all'
}

/**
 * ProjectCardList Component
 *
 * Client component that wraps ProjectCard components to handle onClick interactions.
 * Displays a responsive grid of project cards.
 *
 * PRD Reference: Section 4.2.7 (Project/System Cards), Section 4.2.8 (Project Detail View)
 *
 * Features:
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
 * - Calculates metrics for each project card
 * - Handles click events to navigate to project detail page
 * - Shows empty state when no projects exist
 */
export function ProjectCardList({ projects, timeRange }: ProjectCardListProps) {
  const router = useRouter()

  const handleProjectClick = (project: Project) => {
    console.log('🔍 Project clicked:', project.name, project.id, '- navigating to detail page')
    router.push(`/dashboard/client/projects/${project.id}`)
  }

  // Show empty state if no projects
  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-600 mb-2">No projects yet</p>
        <p className="text-sm text-gray-500">
          Your FlowMatrix AI representative will add projects to your account soon.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          // Calculate metrics for each project
          const hoursSaved = calculateTotalHoursSaved(
            project.hours_saved_daily || undefined,
            project.hours_saved_weekly || undefined,
            project.hours_saved_monthly || undefined,
            project.go_live_date ? new Date(project.go_live_date) : undefined,
            timeRange
          )

          const roi = project.employee_wage
            ? calculateROI(hoursSaved, project.employee_wage)
            : 0

          const totalCost = calculateTotalCost(
            project.dev_cost || 0,
            project.implementation_cost || 0,
            project.monthly_maintenance || 0,
            project.go_live_date ? new Date(project.go_live_date) : undefined
          )

          // Convert hours saved to per-day for display
          // Based on timeRange, calculate daily average
          let hoursSavedPerDay = 0
          if (timeRange === 'day') {
            hoursSavedPerDay = hoursSaved
          } else if (timeRange === 'week') {
            hoursSavedPerDay = hoursSaved / 7
          } else if (timeRange === 'month') {
            hoursSavedPerDay = hoursSaved / 30
          } else {
            // For 'all' time, calculate average per day
            if (project.go_live_date) {
              const daysActive = Math.max(
                1,
                Math.floor(
                  (Date.now() - new Date(project.go_live_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )
              hoursSavedPerDay = hoursSaved / daysActive
            }
          }

          return (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              status={project.status}
              hoursSaved={hoursSavedPerDay}
              roi={roi}
              totalCost={totalCost}
              lastUpdated={new Date(project.updated_at)}
              onClick={() => handleProjectClick(project)}
            />
          )
        })}
    </div>
  )
}
