import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { validateTaskCreate } from '@/lib/validation'
import {
  unauthorizedError,
  forbiddenError,
  validationError,
  handleSupabaseError,
  serverError,
} from '@/lib/errors'

/**
 * POST /api/tasks
 *
 * Create a new task
 *
 * Authentication: Required (employee only)
 * Body: { project_id, description, due_date? }
 */
export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to create tasks')
    }

    // 2. Verify user is employee (only employees can create tasks)
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user permissions')
    }

    if (!userData || (userData as { role: string }).role !== 'employee') {
      return forbiddenError('Only employees can create tasks')
    }

    // 3. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    // Validate task data
    const validation = validateTaskCreate(body)
    if (!validation.isValid) {
      return validationError(validation.errors)
    }

    const { project_id, description, due_date } = body

    // 4. Verify project exists
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return validationError('Invalid project_id: Project does not exist')
    }

    // 5. Create task
    const { data: task, error: createError } = await supabaseAdmin
      .from('tasks')
      .insert({
        project_id,
        description: (description as string).trim(),
        due_date: due_date || null,
        is_completed: false,
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating task:', createError)
      return handleSupabaseError(createError, 'Failed to create task')
    }

    if (!task) {
      return serverError('Task was not created')
    }

    return new Response(JSON.stringify(task), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Unexpected error in POST /api/tasks:', error)
    return serverError('An unexpected error occurred while creating the task', error as Error)
  }
}

/**
 * PATCH /api/tasks
 *
 * Update a task (mark complete/incomplete)
 *
 * Authentication: Required (employee only)
 * Body: { id, is_completed }
 */
export async function PATCH(request: Request) {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to update tasks')
    }

    // 2. Verify user is employee (only employees can update tasks)
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user permissions')
    }

    if (!userData || (userData as { role: string }).role !== 'employee') {
      return forbiddenError('Only employees can update tasks')
    }

    // 3. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const { id, is_completed } = body

    // Validate required fields
    if (!id) {
      return validationError('Task ID is required')
    }

    if (is_completed === undefined || typeof is_completed !== 'boolean') {
      return validationError('is_completed must be a boolean value')
    }

    // 4. Verify task exists
    const { data: existingTask, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('id', id)
      .single()

    if (taskError || !existingTask) {
      return validationError('Task not found')
    }

    // 5. Update task
    const updateData: { is_completed: boolean; completed_at?: string | null } = {
      is_completed,
    }

    // Set completed_at timestamp when marking as complete
    if (is_completed) {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    const { data: task, error: updateError } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating task:', updateError)
      return handleSupabaseError(updateError, 'Failed to update task')
    }

    if (!task) {
      return serverError('Task was not updated')
    }

    return new Response(JSON.stringify(task), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Unexpected error in PATCH /api/tasks:', error)
    return serverError('An unexpected error occurred while updating the task', error as Error)
  }
}

/**
 * DELETE /api/tasks
 *
 * Delete a task
 *
 * Authentication: Required (employee only)
 * Query: id (task ID)
 */
export async function DELETE(request: Request) {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to delete tasks')
    }

    // 2. Verify user is employee
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user permissions')
    }

    if (!userData || (userData as { role: string }).role !== 'employee') {
      return forbiddenError('Only employees can delete tasks')
    }

    // 3. Get and validate task ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return validationError('Task ID is required')
    }

    // 4. Verify task exists before deleting
    const { data: existingTask, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('id', id)
      .single()

    if (taskError || !existingTask) {
      return validationError('Task not found')
    }

    // 5. Delete task
    const { error: deleteError } = await supabaseAdmin.from('tasks').delete().eq('id', id)

    if (deleteError) {
      console.error('❌ Error deleting task:', deleteError)
      return handleSupabaseError(deleteError, 'Failed to delete task')
    }

    return new Response(JSON.stringify({ success: true, message: 'Task deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Unexpected error in DELETE /api/tasks:', error)
    return serverError('An unexpected error occurred while deleting the task', error as Error)
  }
}
