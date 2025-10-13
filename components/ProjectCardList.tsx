'use client'

import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectCard } from './ProjectCard'
import { EditableProjectCard } from './EditableProjectCard'
import { EmptyProjects } from './EmptyStates'
import { Project } from '@/types/database'
import {
  calculateTotalHoursSaved,
  calculateROI,
  calculateTotalCost,
} from '@/lib/calculations'

interface ProjectCardListProps {
  projects: Project[]
  timeRange: 'day' | 'week' | 'month' | 'all'
  isEditMode?: boolean // NEW: Enable edit mode for employees
  basePath?: string // Base path for project detail navigation (e.g., '/dashboard/client/projects' or '/dashboard/employee/projects')
}

/**
 * ProjectCardList Component
 *
 * Client component that wraps ProjectCard components to handle onClick interactions.
 * Displays a responsive grid of project cards.
 *
 * PERFORMANCE: Memoized to prevent expensive re-renders when filtering/calculating metrics
 *
 * PRD Reference: Section 4.2.7 (Project/System Cards), Section 4.2.8 (Project Detail View), Section 4.3.5 (Edit Mode)
 *
 * Features:
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
 * - Calculates metrics for each project card
 * - Handles click events to navigate to project detail page
 * - Shows empty state when no projects exist
 * - Edit mode support: When isEditMode=true, renders EditableProjectCard with auto-save
 */
function ProjectCardListComponent({ projects, timeRange, isEditMode = false, basePath = '/dashboard/client/projects' }: ProjectCardListProps) {
  const router = useRouter()
  const [localProjects, setLocalProjects] = useState(projects)

  // Update local projects when props change
  useEffect(() => {
    setLocalProjects(projects)
  }, [projects])

  // Memoize click handler
  const handleProjectClick = useCallback((project: Project) => {
    console.log('🔍 Project clicked:', project.name, project.id, '- navigating to detail page')
    router.push(`${basePath}/${project.id}`)
  }, [router, basePath])

  // Memoize update handler
  const handleProjectUpdate = useCallback((updatedProject: Project) => {
    setLocalProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    )
  }, [])

  // Memoize calculated project metrics to avoid recalculation on every render
  const projectsWithMetrics = useMemo(() => {
    return localProjects.map((project) => {
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

      return {
        project,
        hoursSavedPerDay,
        roi,
        totalCost,
      }
    })
  }, [localProjects, timeRange])

  // Show empty state if no projects
  if (localProjects.length === 0) {
    return <EmptyProjects isEmployee={isEditMode} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsWithMetrics.map(({ project, hoursSavedPerDay, roi, totalCost }) => {
          // Render EditableProjectCard if in edit mode, otherwise regular ProjectCard
          if (isEditMode) {
            return (
              <EditableProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
                onUpdate={handleProjectUpdate}
              />
            )
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

// Export memoized version to prevent unnecessary re-renders
export const ProjectCardList = memo(ProjectCardListComponent)
