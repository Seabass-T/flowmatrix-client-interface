import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { User, ProjectWithRelations } from '@/types/database'

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

    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📡 API /api/projects/[id]: Fetching project', id, 'for user', user.id)

    // 2. Use admin client to fetch project with relations (bypasses RLS)
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

    if (projectError || !project) {
      console.error('❌ Error fetching project:', projectError)
      return NextResponse.json(
        { error: 'Project not found', details: projectError },
        { status: 404 }
      )
    }

    // 3. Verify user has access to this project (check client association)
    const { data: userClient, error: userClientError } = (await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id)
      .single()) as { data: { client_id: string } | null; error: { message?: string } | null }

    // Check if user is employee (can access all projects)
    const { data: userData, error: userError } = (await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()) as { data: Pick<User, 'role'> | null; error: { message?: string } | null }

    const isEmployee = userData && !userError ? userData.role === 'employee' : false

    // If not employee, verify client association
    if (!isEmployee) {
      if (!userClient || userClientError) {
        console.warn('⚠️ User not associated with any client:', user.id)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      if (project.client_id !== userClient.client_id) {
        console.warn('⚠️ Unauthorized access attempt: User', user.id, 'tried to access project', id)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    console.log('✅ API /api/projects/[id]: Successfully fetched project', project.name)

    return NextResponse.json(project)
  } catch (error) {
    console.error('❌ Unexpected error in /api/projects/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
