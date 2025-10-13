import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { validateNoteCreate, validateUUID, validateLength } from '@/lib/validation'
import {
  unauthorizedError,
  forbiddenError,
  validationError,
  notFoundError,
  handleSupabaseError,
  serverError,
} from '@/lib/errors'
import { User, UserClient, Project } from '@/types/database'

/**
 * GET /api/notes?project_id={id}
 * Fetch all notes for a specific project
 */
export async function GET(request: Request) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to view notes')
    }

    // 2. Validate query params
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return validationError('project_id parameter is required')
    }

    const uuidValidation = validateUUID(projectId, 'Project ID')
    if (!uuidValidation.isValid && uuidValidation.error) {
      return validationError(uuidValidation.error)
    }

    // 3. Get user role
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select<'role', Pick<User, 'role'>>('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    const userRole = userData.role

    // 4. Authorization: Verify access to project
    if (userRole === 'client') {
      const { data: userClients, error: ucError } = await supabaseAdmin
        .from('user_clients')
        .select<'client_id', Pick<UserClient, 'client_id'>>('client_id')
        .eq('user_id', user.id)

      if (ucError) {
        return handleSupabaseError(ucError, 'Failed to verify client access')
      }

      if (!userClients || userClients.length === 0) {
        return forbiddenError('You are not associated with any clients')
      }

      const clientIds = userClients.map((uc) => uc.client_id)

      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select<'client_id', Pick<Project, 'client_id'>>('client_id')
        .eq('id', projectId)
        .single()

      if (projectError) {
        return handleSupabaseError(projectError, 'Failed to verify project access')
      }

      if (!project) {
        return notFoundError('Project')
      }

      if (!clientIds.includes(project.client_id)) {
        return forbiddenError('You do not have access to this project')
      }
    }

    // 5. Fetch notes for the project
    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return handleSupabaseError(error, 'Failed to fetch notes')
    }

    return new Response(JSON.stringify(notes || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/notes:', error)
    return serverError('An unexpected error occurred while fetching notes', error as Error)
  }
}

/**
 * POST /api/notes
 * Create a new note
 */
export async function POST(request: Request) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to create notes')
    }

    // 2. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const validation = validateNoteCreate(body)
    if (!validation.isValid) {
      return validationError(validation.errors)
    }

    const { project_id, note_type, content } = body as {
      project_id: string
      note_type: string
      content: string
    }

    // 3. Get user role
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select<'role', Pick<User, 'role'>>('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    const userRole = userData.role

    // 4. Authorization: Verify note type permissions
    if (userRole === 'client' && note_type !== 'client') {
      return forbiddenError('Clients can only create client notes')
    }

    if (userRole === 'employee' && note_type !== 'flowmatrix_ai') {
      return forbiddenError('Employees can only create FlowMatrix AI notes')
    }

    // 5. Authorization: Verify access to project
    if (userRole === 'client') {
      const { data: userClients, error: ucError } = await supabaseAdmin
        .from('user_clients')
        .select<'client_id', Pick<UserClient, 'client_id'>>('client_id')
        .eq('user_id', user.id)

      if (ucError) {
        return handleSupabaseError(ucError, 'Failed to verify client access')
      }

      if (!userClients || userClients.length === 0) {
        return forbiddenError('You are not associated with any clients')
      }

      const clientIds = userClients.map((uc) => uc.client_id)

      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select<'client_id', Pick<Project, 'client_id'>>('client_id')
        .eq('id', project_id)
        .single()

      if (projectError) {
        return handleSupabaseError(projectError, 'Failed to verify project access')
      }

      if (!project) {
        return notFoundError('Project')
      }

      if (!clientIds.includes(project.client_id)) {
        return forbiddenError('You do not have access to this project')
      }
    }

    // 6. Verify project exists (for employees)
    if (userRole === 'employee') {
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .single()

      if (projectError || !project) {
        return validationError('Invalid project_id: Project does not exist')
      }
    }

    // 7. Create the note
    const { data: newNote, error } = await supabaseAdmin
      .from('notes')
      .insert({
        project_id,
        author_id: user.id,
        note_type: note_type as 'client' | 'flowmatrix_ai',
        content: content.trim(),
        is_read: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return handleSupabaseError(error, 'Failed to create note')
    }

    if (!newNote) {
      return serverError('Note was not created')
    }

    return new Response(JSON.stringify(newNote), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/notes:', error)
    return serverError('An unexpected error occurred while creating the note', error as Error)
  }
}

/**
 * PATCH /api/notes
 * Update an existing note (content only)
 */
export async function PATCH(request: Request) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to update notes')
    }

    // 2. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const { id, content } = body

    // Validate required fields
    const idValidation = validateUUID(id as string, 'Note ID')
    if (!idValidation.isValid && idValidation.error) {
      return validationError(idValidation.error)
    }

    const lengthValidation = validateLength(content as string, 1, 500, 'Content')
    if (!lengthValidation.isValid && lengthValidation.error) {
      return validationError(lengthValidation.error)
    }

    // 3. Get existing note
    const supabaseAdmin = createAdminClient()
    const { data: existingNote, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select<'*', { id: string; author_id: string; note_type: string; content: string }>('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return handleSupabaseError(fetchError, 'Failed to fetch note')
    }

    if (!existingNote) {
      return notFoundError('Note')
    }

    // 4. Get user role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select<'role', Pick<User, 'role'>>('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    const userRole = userData.role

    // 5. Authorization: Permission check
    if (userRole === 'client') {
      if (existingNote.author_id !== user.id) {
        return forbiddenError('You can only edit your own notes')
      }
      if (existingNote.note_type !== 'client') {
        return forbiddenError('Clients can only edit client notes')
      }
    }

    // 6. Update the note
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateResult = await (supabaseAdmin as any)
      .from('notes')
      .update({ content: (content as string).trim() })
      .eq('id', id)
      .select()
      .single()

    const { data: updatedNote, error: updateError } = updateResult as {
      data: unknown
      error: { message: string } | null
    }

    if (updateError) {
      console.error('Error updating note:', updateError)
      return handleSupabaseError(updateError, 'Failed to update note')
    }

    if (!updatedNote) {
      return serverError('Note was not updated')
    }

    return new Response(JSON.stringify(updatedNote), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/notes:', error)
    return serverError('An unexpected error occurred while updating the note', error as Error)
  }
}

/**
 * DELETE /api/notes
 * Delete a note
 */
export async function DELETE(request: Request) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to delete notes')
    }

    // 2. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const { id } = body

    const idValidation = validateUUID(id as string, 'Note ID')
    if (!idValidation.isValid && idValidation.error) {
      return validationError(idValidation.error)
    }

    // 3. Get existing note
    const supabaseAdmin = createAdminClient()
    const { data: existingNote, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select<'*', { id: string; author_id: string; note_type: string; content: string }>('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return handleSupabaseError(fetchError, 'Failed to fetch note')
    }

    if (!existingNote) {
      return notFoundError('Note')
    }

    // 4. Get user role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select<'role', Pick<User, 'role'>>('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    const userRole = userData.role

    // 5. Authorization: Permission check
    if (userRole === 'client') {
      if (existingNote.author_id !== user.id) {
        return forbiddenError('You can only delete your own notes')
      }
      if (existingNote.note_type !== 'client') {
        return forbiddenError('Clients can only delete client notes')
      }
    }

    // 6. Delete the note
    const { error: deleteError } = await supabaseAdmin.from('notes').delete().eq('id', id)

    if (deleteError) {
      console.error('Error deleting note:', deleteError)
      return handleSupabaseError(deleteError, 'Failed to delete note')
    }

    return new Response(JSON.stringify({ success: true, message: 'Note deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/notes:', error)
    return serverError('An unexpected error occurred while deleting the note', error as Error)
  }
}
