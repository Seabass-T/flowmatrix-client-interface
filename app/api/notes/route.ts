import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { User, UserClient, Project } from '@/types/database'

/**
 * GET /api/notes?project_id={id}
 * Fetch all notes for a specific project
 */
export async function GET(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
    }

    // Use admin client for data queries
    const supabaseAdmin = createAdminClient()

    // Verify user has access to this project
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select<'role', Pick<User, 'role'>>('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = userData.role

    // If client, verify they own this project
    if (userRole === 'client') {
      const { data: userClients, error: ucError } = await supabaseAdmin
        .from('user_clients')
        .select<'client_id', Pick<UserClient, 'client_id'>>('client_id')
        .eq('user_id', user.id)

      if (ucError || !userClients) {
        return NextResponse.json({ error: 'Failed to verify access' }, { status: 500 })
      }

      const clientIds = userClients.map((uc) => uc.client_id)

      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select<'client_id', Pick<Project, 'client_id'>>('client_id')
        .eq('id', projectId)
        .single()

      if (projectError || !project || !clientIds.includes(project.client_id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Fetch notes for the project
    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(notes || [])
  } catch (error) {
    console.error('Unexpected error in GET /api/notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/notes
 * Create a new note
 */
export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { project_id, note_type, content } = body

    // Validate required fields
    if (!project_id || !note_type || !content) {
      return NextResponse.json(
        { error: 'project_id, note_type, and content are required' },
        { status: 400 }
      )
    }

    // Validate note_type
    if (!['client', 'flowmatrix_ai'].includes(note_type)) {
      return NextResponse.json(
        { error: 'note_type must be "client" or "flowmatrix_ai"' },
        { status: 400 }
      )
    }

    // Use admin client for data queries
    const supabaseAdmin = createAdminClient()

    // Get user role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select<'role', Pick<User, 'role'>>('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = userData.role

    // CRITICAL RLS ENFORCEMENT: Clients can only create 'client' type notes
    if (userRole === 'client' && note_type !== 'client') {
      return NextResponse.json(
        { error: 'Clients can only create client notes' },
        { status: 403 }
      )
    }

    // Employees can create 'flowmatrix_ai' type notes
    if (userRole === 'employee' && note_type !== 'flowmatrix_ai') {
      return NextResponse.json(
        { error: 'Employees can only create FlowMatrix AI notes' },
        { status: 403 }
      )
    }

    // Verify user has access to this project
    if (userRole === 'client') {
      const { data: userClients, error: ucError } = await supabaseAdmin
        .from('user_clients')
        .select<'client_id', Pick<UserClient, 'client_id'>>('client_id')
        .eq('user_id', user.id)

      if (ucError || !userClients) {
        return NextResponse.json({ error: 'Failed to verify access' }, { status: 500 })
      }

      const clientIds = userClients.map((uc) => uc.client_id)

      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select<'client_id', Pick<Project, 'client_id'>>('client_id')
        .eq('id', project_id)
        .single()

      if (projectError || !project || !clientIds.includes(project.client_id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Create the note
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/notes
 * Update an existing note (content only)
 */
export async function PATCH(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, content } = body

    if (!id || !content) {
      return NextResponse.json({ error: 'id and content are required' }, { status: 400 })
    }

    // Use admin client for data queries
    const supabaseAdmin = createAdminClient()

    // Get the existing note
    const { data: existingNote, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select<'*', { id: string; author_id: string; note_type: string; content: string }>('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Get user role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select<'role', Pick<User, 'role'>>('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = userData.role

    // Permission check: Employees can edit all notes, clients can only edit their own
    if (userRole === 'client') {
      if (existingNote.author_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
      if (existingNote.note_type !== 'client') {
        return NextResponse.json({ error: 'Clients can only edit client notes' }, { status: 403 })
      }
    }

    // Update the note
    // Type assertion needed due to Supabase client type inference issues with admin client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateResult = await (supabaseAdmin as any)
      .from('notes')
      .update({ content: content.trim() })
      .eq('id', id)
      .select()
      .single()

    const { data: updatedNote, error: updateError } = updateResult as {
      data: unknown
      error: { message: string } | null
    }

    if (updateError) {
      console.error('Error updating note:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Unexpected error in PATCH /api/notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/notes
 * Delete a note
 */
export async function DELETE(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Use admin client for data queries
    const supabaseAdmin = createAdminClient()

    // Get the existing note
    const { data: existingNote, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select<'*', { id: string; author_id: string; note_type: string; content: string }>('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Get user role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select<'role', Pick<User, 'role'>>('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = userData.role

    // Permission check: Employees can delete all notes, clients can only delete their own
    if (userRole === 'client') {
      if (existingNote.author_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
      if (existingNote.note_type !== 'client') {
        return NextResponse.json(
          { error: 'Clients can only delete client notes' },
          { status: 403 }
        )
      }
    }

    // Delete the note
    const { error: deleteError } = await supabaseAdmin.from('notes').delete().eq('id', id)

    if (deleteError) {
      console.error('Error deleting note:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
