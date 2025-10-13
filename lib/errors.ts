/**
 * Error Handling Utilities
 *
 * Standardized error handling for API routes and Supabase operations.
 * Provides user-friendly error messages and proper HTTP status codes.
 */

import { NextResponse } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  error: string
  details?: string | Record<string, unknown>
  statusCode: number
}

/**
 * Convert Supabase error to user-friendly message
 */
export function getSupabaseErrorMessage(error: PostgrestError | { message?: string }): string {
  // Common Supabase error codes and their user-friendly messages
  const errorMessages: Record<string, string> = {
    // Authentication errors
    '401': 'Authentication required. Please log in.',
    '403': 'You do not have permission to perform this action.',

    // Not found errors
    '404': 'The requested resource was not found.',
    PGRST116: 'No data found matching your request.',

    // Validation errors
    '400': 'Invalid request. Please check your input.',
    '22P02': 'Invalid data format provided.',
    '23502': 'Required field is missing.',
    '23503': 'Referenced data does not exist.',
    '23505': 'This record already exists.',
    '23514': 'Data violates a check constraint.',

    // RLS (Row-Level Security) errors
    '42501': 'Access denied. You do not have permission to view or modify this data.',
    PGRST301: 'Access denied. You do not have permission to view or modify this data.',

    // Connection errors
    ECONNREFUSED: 'Unable to connect to the database. Please try again later.',
    ETIMEDOUT: 'Database connection timed out. Please try again.',

    // Generic database errors
    '08000': 'Database connection error. Please try again.',
    '53300': 'Database is too busy. Please try again in a moment.',
  }

  // Check if error has a code property (Supabase PostgrestError)
  if ('code' in error && error.code) {
    const userMessage = errorMessages[error.code]
    if (userMessage) {
      return userMessage
    }
  }

  // Check error message for specific patterns
  const message = error.message || 'An unexpected error occurred'

  if (message.includes('duplicate key')) {
    return 'This record already exists in the database.'
  }

  if (message.includes('foreign key')) {
    return 'Unable to perform this action because other data depends on it.'
  }

  if (message.includes('violates not-null')) {
    return 'A required field is missing.'
  }

  if (message.includes('permission denied') || message.includes('RLS')) {
    return 'You do not have permission to access this data.'
  }

  if (message.includes('timeout')) {
    return 'The request took too long. Please try again.'
  }

  // Return generic message for unknown errors
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Create standardized error response for API routes
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: string | Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error: message,
    statusCode,
  }

  // Include details in development mode or for client errors (4xx)
  if (details && (process.env.NODE_ENV === 'development' || statusCode < 500)) {
    response.details = details
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Handle Supabase errors in API routes
 */
export function handleSupabaseError(
  error: PostgrestError | { message?: string } | null,
  fallbackMessage: string = 'Database operation failed'
): NextResponse<ApiErrorResponse> {
  if (!error) {
    return createErrorResponse('Unknown error occurred', 500)
  }

  // Determine HTTP status code from error
  let statusCode = 500

  if ('code' in error) {
    const code = error.code
    if (code === '42501' || code === 'PGRST301' || code === '403') {
      statusCode = 403
    } else if (code === 'PGRST116' || code === '404') {
      statusCode = 404
    } else if (
      code === '400' ||
      code === '22P02' ||
      code === '23502' ||
      code === '23503' ||
      code === '23505' ||
      code === '23514'
    ) {
      statusCode = 400
    }
  }

  const userMessage = getSupabaseErrorMessage(error)

  return createErrorResponse(userMessage, statusCode, error.message)
}

/**
 * Handle authentication errors
 */
export function handleAuthError(errorType?: string): NextResponse<ApiErrorResponse> {
  const authErrors: Record<string, { message: string; statusCode: number }> = {
    invalid_credentials: {
      message: 'Invalid email or password.',
      statusCode: 401,
    },
    email_not_confirmed: {
      message: 'Please verify your email address before logging in.',
      statusCode: 401,
    },
    user_already_exists: {
      message: 'An account with this email already exists.',
      statusCode: 409,
    },
    weak_password: {
      message: 'Password is too weak. Please use at least 8 characters.',
      statusCode: 400,
    },
    invalid_email: {
      message: 'Please provide a valid email address.',
      statusCode: 400,
    },
    token_expired: {
      message: 'Your session has expired. Please log in again.',
      statusCode: 401,
    },
    unauthorized: {
      message: 'You must be logged in to access this resource.',
      statusCode: 401,
    },
    forbidden: {
      message: 'You do not have permission to perform this action.',
      statusCode: 403,
    },
  }

  const error = errorType ? authErrors[errorType] : authErrors.unauthorized

  return createErrorResponse(error.message, error.statusCode)
}

/**
 * Validation Error Response
 */
export function validationError(
  errors: Record<string, string> | string
): NextResponse<ApiErrorResponse> {
  const message = typeof errors === 'string' ? errors : 'Validation failed'
  const details = typeof errors === 'object' ? errors : undefined

  return createErrorResponse(message, 400, details)
}

/**
 * Not Found Error Response
 */
export function notFoundError(resource: string = 'Resource'): NextResponse<ApiErrorResponse> {
  return createErrorResponse(`${resource} not found`, 404)
}

/**
 * Unauthorized Error Response
 */
export function unauthorizedError(
  message: string = 'Authentication required'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(message, 401)
}

/**
 * Forbidden Error Response
 */
export function forbiddenError(
  message: string = 'You do not have permission to access this resource'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(message, 403)
}

/**
 * Server Error Response
 */
export function serverError(
  message: string = 'Internal server error',
  error?: Error
): NextResponse<ApiErrorResponse> {
  console.error('Server Error:', error)
  return createErrorResponse(message, 500, error?.message)
}

/**
 * Try-Catch Wrapper for API Routes
 * Automatically handles errors and returns proper responses
 */
export async function handleApiRoute<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse<ApiErrorResponse>> {
  try {
    return await handler()
  } catch (error) {
    console.error('API Route Error:', error)

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('Unauthorized')) {
        return unauthorizedError()
      }
      if (error.message.includes('Forbidden')) {
        return forbiddenError()
      }
      if (error.message.includes('Not found')) {
        return notFoundError()
      }

      return serverError('An unexpected error occurred', error)
    }

    return serverError()
  }
}

/**
 * Network Error Detection (for client-side)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    )
  }
  return false
}

/**
 * Get User-Friendly Error Message (for client-side)
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  // Network errors
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message
  }

  // API response error
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return (error as { error: string }).error
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.'
}
