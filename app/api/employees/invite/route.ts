/**
 * Employee Invitation API Route
 *
 * Sends Supabase Auth invitation to new employee email addresses.
 * Features:
 * - Validates employee role of requester
 * - Uses Supabase Admin API to send invitation
 * - Creates employee record in users table
 * - Sends signup link via email
 *
 * PRD Reference: Section 4.3.2 (Employee Invitation System)
 *
 * POST /api/employees/invite
 * Body: { email: string }
 * Returns: { success: true, message: string } | { error: string }
 */

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { validateEmployeeInvite } from '@/lib/validation'
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
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in to invite employees')
    }

    // 2. Verify requester is an employee
    const supabaseAdmin = createAdminClient()
    const { data: requesterData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!requesterData) {
      return notFoundError('User')
    }

    if (requesterData.role !== 'employee') {
      return forbiddenError('Only employees can invite other employees')
    }

    // 3. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const validation = validateEmployeeInvite(body)
    if (!validation.isValid) {
      return validationError(validation.errors)
    }

    const { email } = body as { email: string }

    // 4. Check if user already exists in auth.users
    const { data: existingAuthUser, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error checking existing users:', listError)
      return serverError('Failed to check existing users', listError)
    }

    if (!existingAuthUser) {
      return serverError('Failed to retrieve user list')
    }

    const userExists = existingAuthUser.users.some((u) => u.email === email)

    if (userExists) {
      return validationError('User with this email already exists')
    }

    // 5. Send invitation using Supabase Admin API
    // This creates a user in auth.users and sends an invitation email
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          role: 'employee', // Store role in user metadata
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`, // Redirect after signup
      }
    )

    if (inviteError) {
      console.error('Error sending invitation:', inviteError)
      return serverError(`Failed to send invitation: ${inviteError.message}`, inviteError)
    }

    if (!inviteData || !inviteData.user) {
      return serverError('Invitation was not sent')
    }

    // 6. Create user record in users table
    // NOTE: This will be populated when the user accepts the invitation and signs up
    // The auth trigger should handle this, but we can add a record here for tracking
    const { error: insertError } = await supabaseAdmin.from('users').insert({
      id: inviteData.user.id,
      email: email,
      role: 'employee',
    })

    if (insertError) {
      // Log error but don't fail the request - the user was already invited
      console.error('Error creating user record:', insertError)
      // Continue - the user can still sign up via the invitation email
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/employees/invite:', error)
    return serverError('An unexpected error occurred while sending the invitation', error as Error)
  }
}
