import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { validateTestimonialCreate, validateUUID } from '@/lib/validation'
import {
  unauthorizedError,
  forbiddenError,
  validationError,
  notFoundError,
  handleSupabaseError,
  serverError,
} from '@/lib/errors'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to submit testimonials')
    }

    // 2. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const validation = validateTestimonialCreate(body)
    if (!validation.isValid) {
      return validationError(validation.errors)
    }

    const { client_id, user_id, content } = body as {
      client_id: string
      user_id: string
      content: string
    }

    // 3. Verify user is authenticated and matches user_id
    if (user.id !== user_id) {
      return forbiddenError('User ID does not match authenticated user')
    }

    // 4. Use admin client to bypass RLS for data queries
    const supabaseAdmin = createAdminClient()

    // 5. Verify user is a client
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user_id)
      .single() as { data: { role: string } | null; error: { message?: string } | null }

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    if (userData.role !== 'client') {
      return forbiddenError('Only clients can submit testimonials')
    }

    // 6. Verify user has access to this client
    const { data: userClient, error: userClientError } = await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user_id)
      .eq('client_id', client_id)
      .single() as { data: { client_id: string } | null; error: { message?: string } | null }

    if (userClientError) {
      return handleSupabaseError(userClientError, 'Failed to verify client access')
    }

    if (!userClient) {
      return forbiddenError('You do not have access to this client')
    }

    // 7. Insert testimonial
    interface TestimonialData {
      id: string
      client_id: string
      user_id: string
      content: string
      created_at: string
    }

    interface TestimonialInsert {
      client_id: string
      user_id: string
      content: string
    }

    const insertData: TestimonialInsert = {
      client_id,
      user_id,
      content: content.trim(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (supabaseAdmin.from('testimonials') as any)
      .insert(insertData)
      .select()
      .single()

    const { data: testimonial, error: insertError } = result as {
      data: TestimonialData | null
      error: { message?: string } | null
    }

    if (insertError) {
      console.error('Testimonial insert error:', insertError)
      return handleSupabaseError(insertError, 'Failed to submit testimonial')
    }

    if (!testimonial) {
      return serverError('Testimonial was not created')
    }

    return NextResponse.json(
      {
        message: 'Testimonial submitted successfully',
        testimonial,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/testimonials:', error)
    return serverError('An unexpected error occurred while submitting the testimonial', error as Error)
  }
}

export async function GET() {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to view testimonials')
    }

    // 2. Use admin client for data queries
    const supabaseAdmin = createAdminClient()

    // 3. Check if user is employee
    const { data: userData, error: userError } = (await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()) as { data: { role: string } | null; error: { message?: string } | null }

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    if (userData.role !== 'employee') {
      return forbiddenError('Only employees can view all testimonials')
    }

    // 4. Fetch all testimonials with client and user info
    const { data: testimonials, error } = await supabaseAdmin
      .from('testimonials')
      .select(
        `
        *,
        client:clients(id, company_name),
        user:users(id, email)
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Testimonials fetch error:', error)
      return handleSupabaseError(error, 'Failed to fetch testimonials')
    }

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error('Unexpected error in GET /api/testimonials:', error)
    return serverError('An unexpected error occurred while fetching testimonials', error as Error)
  }
}
