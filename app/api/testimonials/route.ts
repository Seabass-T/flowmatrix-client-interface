import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { client_id, user_id, content } = body

    // Validate input
    if (!client_id || !user_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, user_id, content' },
        { status: 400 }
      )
    }

    // Validate content length (300 characters max)
    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content must be a non-empty string' },
        { status: 400 }
      )
    }

    if (content.length > 300) {
      return NextResponse.json(
        { error: 'Content must be 300 characters or less' },
        { status: 400 }
      )
    }

    // Verify user is authenticated and matches user_id
    if (user.id !== user_id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      )
    }

    // Use admin client to bypass RLS for data queries
    const supabaseAdmin = createAdminClient()

    // Verify user is a client and has access to this client_id
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user_id)
      .single() as { data: { role: string } | null; error: Error | null }

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userData.role !== 'client') {
      return NextResponse.json(
        { error: 'Only clients can submit testimonials' },
        { status: 403 }
      )
    }

    // Verify user has access to this client
    const { data: userClient, error: userClientError } = await supabaseAdmin
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user_id)
      .eq('client_id', client_id)
      .single() as { data: { client_id: string } | null; error: Error | null }

    if (userClientError || !userClient) {
      return NextResponse.json(
        { error: 'User does not have access to this client' },
        { status: 403 }
      )
    }

    // Insert testimonial
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

    const { data: testimonial, error: insertError } = result as { data: TestimonialData | null; error: Error | null }

    if (insertError) {
      console.error('Testimonial insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Testimonial submitted successfully',
        testimonial,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Testimonial submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client for data queries
    const supabaseAdmin = createAdminClient()

    // Check if user is employee
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null; error: Error | null }

    if (!userData || userData.role !== 'employee') {
      return NextResponse.json(
        { error: 'Only employees can view all testimonials' },
        { status: 403 }
      )
    }

    // Fetch all testimonials with client and user info
    const { data: testimonials, error } = await supabaseAdmin
      .from('testimonials')
      .select(`
        *,
        client:clients(id, company_name),
        user:users(id, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Testimonials fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch testimonials' },
        { status: 500 }
      )
    }

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error('Testimonials fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
