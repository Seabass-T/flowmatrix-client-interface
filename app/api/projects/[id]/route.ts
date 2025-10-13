import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { User, Project, ProjectWithRelations } from '@/types/database'
import { validateUUID, validateProjectUpdate } from '@/lib/validation'
import {
  unauthorizedError,
  forbiddenError,
  validationError,
  notFoundError,
  handleSupabaseError,
  serverError,
} from '@/lib/errors'

/**
 * GET /api/projects/[id]
 *
 * Fetches a single project with all related data (notes, tasks, files)
 * Uses admin client to bypass RLS for server-side queries
 *
 * Authentication: Required (checked via Supabase session)
 * Authorization: User must be associated with the project's client
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params

    // 1. Validate UUID
    const uuidValidation = validateUUID(id, 'Project ID')
    if (!uuidValidation.isValid && uuidValidation.error) {
      return validationError(uuidValidation.error)
    }

    // 2. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to view project details')
    }

    console.log('📡 API /api/projects/[id]: Fetching project', id, 'for user', user.id)

    // 3. Use admin client to fetch project with relations (bypasses RLS)
    const supabaseAdmin = createAdminClient()

    const { data: project, error: projectError } = (await supabaseAdmin
      .from('projects')
      .select(
        `
        *,
        notes(*),
        tasks(*),
        files(*)
      `
      )
      .eq('id', id)
      .single()) as { data: ProjectWithRelations | null; error: { message?: string } | null }

    if (projectError) {
      return handleSupabaseError(projectError, 'Failed to fetch project')
    }

    if (!project) {
      return notFoundError('Project')
    }

    // 4. Verify user has access to this project (check client association)
    const { data: userData, error: userError } = (await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()) as { data: Pick<User, 'role'> | null; error: { message?: string } | null }

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    const isEmployee = userData.role === 'employee'

    // If not employee, verify client association
    if (!isEmployee) {
      const { data: userClient, error: userClientError } = (await supabaseAdmin
        .from('user_clients')
        .select('client_id')
        .eq('user_id', user.id)
        .single()) as { data: { client_id: string } | null; error: { message?: string } | null }

      if (userClientError) {
        return handleSupabaseError(userClientError, 'Failed to verify client access')
      }

      if (!userClient) {
        return forbiddenError('You are not associated with any clients')
      }

      if (project.client_id !== userClient.client_id) {
        console.warn('⚠️ Unauthorized access attempt: User', user.id, 'tried to access project', id)
        return forbiddenError('You do not have access to this project')
      }
    }

    console.log('✅ API /api/projects/[id]: Successfully fetched project', project.name)

    return NextResponse.json(project)
  } catch (error) {
    console.error('❌ Unexpected error in GET /api/projects/[id]:', error)
    return serverError('An unexpected error occurred while fetching the project', error as Error)
  }
}

/**
 * PATCH /api/projects/[id]
 *
 * Updates a project's editable fields (for employee edit mode)
 * Uses admin client to bypass RLS for server-side mutations
 *
 * Authentication: Required (must be employee)
 * Authorization: Only employees can update project data
 *
 * Editable fields (PRD Section 4.3.5):
 * - hours_saved_daily, hours_saved_weekly, hours_saved_monthly
 * - employee_wage
 * - status (active, dev, proposed, inactive)
 * - dev_cost, implementation_cost, monthly_maintenance
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params

    // 1. Validate UUID
    const uuidValidation = validateUUID(id, 'Project ID')
    if (!uuidValidation.isValid && uuidValidation.error) {
      return validationError(uuidValidation.error)
    }

    // 2. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to update projects')
    }

    console.log('📡 API PATCH /api/projects/[id]: Updating project', id, 'for user', user.id)

    // 3. Verify user is employee (only employees can edit projects)
    const supabaseAdmin = createAdminClient()

    const { data: userData, error: userError } = (await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()) as { data: Pick<User, 'role'> | null; error: { message?: string } | null }

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    if (userData.role !== 'employee') {
      console.warn('⚠️ Unauthorized PATCH attempt: User', user.id, 'is not an employee')
      return forbiddenError('Only employees can edit projects')
    }

    // 4. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const validation = validateProjectUpdate(body)
    if (!validation.isValid) {
      return validationError(validation.errors)
    }

    // 5. Verify project exists
    const { data: existingProject, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return handleSupabaseError(fetchError, 'Failed to fetch project')
    }

    if (!existingProject) {
      return notFoundError('Project')
    }

    console.log('📝 Updating project with data:', body)

    // 6. Update the project using admin client (bypasses RLS)
    const { data: project, error: updateError } = await supabaseAdmin
      .from('projects')
      .update(body as never) // Type assertion needed for Supabase client
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating project:', updateError)
      return handleSupabaseError(updateError, 'Failed to update project')
    }

    if (!project) {
      return serverError('Project was not updated')
    }

    console.log('✅ API PATCH /api/projects/[id]: Successfully updated project')

    return NextResponse.json(project)
  } catch (error) {
    console.error('❌ Unexpected error in PATCH /api/projects/[id]:', error)
    return serverError('An unexpected error occurred while updating the project', error as Error)
  }
}
