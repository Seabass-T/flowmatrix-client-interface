import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { validateUUID, validateClientWageUpdate } from '@/lib/validation'
import {
  unauthorizedError,
  forbiddenError,
  validationError,
  notFoundError,
  handleSupabaseError,
  serverError,
} from '@/lib/errors'

/**
 * PATCH /api/clients/[id]
 *
 * Update client data (default wage, etc.)
 *
 * Authentication: Required (employee only)
 * Body: { avg_employee_wage? }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Validate UUID
    const uuidValidation = validateUUID(id, 'Client ID')
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
      return unauthorizedError('You must be logged in to update client data')
    }

    // 3. Verify user is employee
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    if ((userData as { role: string }).role !== 'employee') {
      return forbiddenError('Only employees can update client data')
    }

    // 4. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const validation = validateClientWageUpdate(body)
    if (!validation.isValid) {
      return validationError(validation.errors)
    }

    // 5. Verify client exists
    const { data: existingClient, error: fetchError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return handleSupabaseError(fetchError, 'Failed to fetch client')
    }

    if (!existingClient) {
      return notFoundError('Client')
    }

    // 6. Update client
    const { data: client, error: updateError } = await supabaseAdmin
      .from('clients')
      .update({ avg_employee_wage: body.avg_employee_wage as number })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating client:', updateError)
      return handleSupabaseError(updateError, 'Failed to update client')
    }

    if (!client) {
      return serverError('Client was not updated')
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('❌ Unexpected error in PATCH /api/clients/[id]:', error)
    return serverError('An unexpected error occurred while updating the client', error as Error)
  }
}
