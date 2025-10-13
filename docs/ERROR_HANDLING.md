# Error Handling Guide

## Overview

This document describes the comprehensive error handling system implemented across the FlowMatrix AI Client Interface application.

---

## Architecture

### 1. **Validation Layer** (`lib/validation.ts`)

Provides client-side and server-side validation functions for all data types.

**Key Functions:**
- `validateEmail()` - Email format validation
- `validateRequired()` - Required field validation
- `validateLength()` - String length validation (min/max)
- `validateNumberRange()` - Number range validation
- `validatePositiveNumber()` - Positive number validation
- `validateDate()` - Date format validation
- `validateEnum()` - Enum/allowed values validation
- `validateUUID()` - UUID format validation
- `validateSchema()` - Complex object validation

**Domain-Specific Validators:**
- `validateProjectUpdate()` - Project data validation
- `validateTaskCreate()` - Task creation validation
- `validateNoteCreate()` - Note creation validation
- `validateEmployeeInvite()` - Employee invitation validation
- `validateClientWageUpdate()` - Client wage update validation

**Usage Example:**
```typescript
import { validateTaskCreate } from '@/lib/validation'

const validation = validateTaskCreate(requestData)
if (!validation.isValid) {
  return validationError(validation.errors)
}
```

---

### 2. **Error Utilities** (`lib/errors.ts`)

Provides standardized error responses and Supabase error handling.

**Key Functions:**

#### Error Response Helpers:
- `createErrorResponse()` - Create standardized API error response
- `validationError()` - Return 400 validation error
- `unauthorizedError()` - Return 401 auth error
- `forbiddenError()` - Return 403 permission error
- `notFoundError()` - Return 404 not found error
- `serverError()` - Return 500 server error

#### Supabase Error Handling:
- `getSupabaseErrorMessage()` - Convert Supabase errors to user-friendly messages
- `handleSupabaseError()` - Handle Supabase errors in API routes
- `handleAuthError()` - Handle authentication errors

#### Client-Side Utilities:
- `isNetworkError()` - Detect network connectivity errors
- `getUserFriendlyErrorMessage()` - Get user-friendly error message from any error type

**Usage Example (API Route):**
```typescript
import {
  unauthorizedError,
  handleSupabaseError,
  validationError
} from '@/lib/errors'

// Authentication error
if (!user) {
  return unauthorizedError('You must be logged in')
}

// Supabase error
if (dbError) {
  return handleSupabaseError(dbError, 'Failed to fetch data')
}

// Validation error
if (!isValid) {
  return validationError(errors)
}
```

**Usage Example (Client Component):**
```typescript
import { isNetworkError, getUserFriendlyErrorMessage } from '@/lib/errors'

try {
  // API call
} catch (err) {
  if (isNetworkError(err)) {
    setError('Unable to connect. Please check your internet connection.')
  } else {
    setError(getUserFriendlyErrorMessage(err))
  }
}
```

---

### 3. **Error Boundary** (`components/ErrorBoundary.tsx`)

React Error Boundary for catching rendering errors.

**Components:**
- `ErrorBoundary` - Main error boundary component
- `DefaultErrorFallback` - Full-page error UI
- `CompactErrorFallback` - Inline error UI for sections
- `SectionErrorBoundary` - Pre-configured boundary for sections

**Usage Example:**
```tsx
import { ErrorBoundary, SectionErrorBoundary } from '@/components/ErrorBoundary'

// Wrap entire page
<ErrorBoundary>
  <YourPage />
</ErrorBoundary>

// Wrap specific section
<SectionErrorBoundary title="Failed to load projects">
  <ProjectsList />
</SectionErrorBoundary>
```

**Features:**
- Catches React rendering errors
- Logs errors to console (expandable to error reporting service)
- Displays user-friendly fallback UI
- Provides retry functionality
- Shows error details in development mode only

---

## API Route Error Handling Pattern

### Standard Pattern (Updated `/app/api/tasks/route.ts`):

```typescript
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

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in')
    }

    // 2. Authorization
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify permissions')
    }

    if (!userData || userData.role !== 'employee') {
      return forbiddenError('Only employees can perform this action')
    }

    // 3. Parse & Validate Request
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const validation = validateTaskCreate(body)
    if (!validation.isValid) {
      return validationError(validation.errors)
    }

    // 4. Business Logic
    const { data, error: dbError } = await supabaseAdmin
      .from('tasks')
      .insert(data)
      .select()
      .single()

    if (dbError) {
      return handleSupabaseError(dbError, 'Failed to create task')
    }

    if (!data) {
      return serverError('Task was not created')
    }

    // 5. Success Response
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return serverError('An unexpected error occurred', error as Error)
  }
}
```

**Key Points:**
1. ✅ Always wrap in try-catch
2. ✅ Check authentication first
3. ✅ Verify authorization/permissions
4. ✅ Validate input data
5. ✅ Use specific error helpers (unauthorizedError, validationError, etc.)
6. ✅ Handle Supabase errors with handleSupabaseError()
7. ✅ Return proper HTTP status codes
8. ✅ Log errors for debugging
9. ✅ Never expose sensitive details in production

---

## Component Error Handling Pattern

### Form Component Pattern (Updated `/components/AddTaskForm.tsx`):

```typescript
'use client'

import { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { validateLength, validateRequired } from '@/lib/validation'
import { isNetworkError, getUserFriendlyErrorMessage } from '@/lib/errors'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function YourForm() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Field-level validation
  const validateField = (value: string, fieldName: string): boolean => {
    const result = validateRequired(value, fieldName)
    if (!result.isValid && result.error) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: result.error! }))
      return false
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: '' }))
    return true
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Client-side validation
    if (!validateForm()) {
      setFormState('error')
      setError('Please fix the errors above')
      return
    }

    // Prevent multiple submissions
    if (formState === 'submitting') {
      return
    }

    setFormState('submitting')

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle API validation errors
        if (errorData.details && typeof errorData.details === 'object') {
          setFieldErrors(errorData.details)
          setFormState('error')
          setError('Please fix the errors above')
          return
        }

        throw new Error(errorData.error || 'Request failed')
      }

      // Success!
      setFormState('success')

      // Reset form after delay
      setTimeout(() => {
        resetForm()
        onSuccess?.()
      }, 1000)

    } catch (err) {
      console.error('Error:', err)
      setFormState('error')

      // User-friendly error messages
      if (isNetworkError(err)) {
        setError('Unable to connect. Please check your internet connection.')
      } else {
        setError(getUserFriendlyErrorMessage(err))
      }

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setFormState('idle')
        setError('')
      }, 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Input Field with Error */}
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setFieldErrors(prev => ({ ...prev, fieldName: '' }))
          }}
          onBlur={() => validateField(value, 'fieldName')}
          className={`${fieldErrors.fieldName ? 'border-red-300' : 'border-gray-300'}`}
          disabled={formState === 'submitting' || formState === 'success'}
        />
        {fieldErrors.fieldName && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {fieldErrors.fieldName}
          </p>
        )}
      </div>

      {/* Success Message */}
      {formState === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <Check className="w-5 h-5 text-green-600" />
          <p>Success!</p>
        </div>
      )}

      {/* Error Message */}
      {formState === 'error' && error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formState === 'submitting' || formState === 'success'}
      >
        {formState === 'submitting' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

**Key Points:**
1. ✅ Use FormState type ('idle' | 'submitting' | 'success' | 'error')
2. ✅ Separate field-level and form-level errors
3. ✅ Validate on blur and on submit
4. ✅ Clear field errors on change
5. ✅ Prevent multiple submissions
6. ✅ Handle API validation errors
7. ✅ Provide user-friendly error messages
8. ✅ Disable inputs during submission
9. ✅ Auto-clear errors after timeout
10. ✅ Show loading indicators

---

## Error Message Best Practices

### User-Friendly Messages

**❌ Bad:**
```
PGRST116: No rows found
23505: duplicate key value violates unique constraint
```

**✅ Good:**
```
No data found matching your request
This record already exists in the database
```

### Error Message Guidelines

1. **Be Specific but Simple:**
   - ❌ "Database error occurred"
   - ✅ "Failed to create task. Please try again."

2. **Provide Context:**
   - ❌ "Error"
   - ✅ "Unable to connect to the server. Please check your internet connection."

3. **Offer Solutions:**
   - ❌ "Invalid input"
   - ✅ "Email must be at least 3 characters long"

4. **Be Polite:**
   - ❌ "You can't do that"
   - ✅ "You don't have permission to perform this action"

5. **Avoid Technical Jargon:**
   - ❌ "RLS policy violation on projects table"
   - ✅ "You don't have permission to view this project"

---

## Testing Error Scenarios

### Network Errors
```typescript
// Test network failure
navigator.serviceWorker.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(Promise.reject(new Error('Network error')))
  }
})
```

### Validation Errors
```typescript
// Test empty required fields
await fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify({ description: '' })
})
// Expected: 400 with validation errors
```

### Authentication Errors
```typescript
// Test unauthorized access
// 1. Log out
// 2. Try to access protected API
// Expected: 401 Unauthorized
```

### Permission Errors
```typescript
// Test forbidden action
// 1. Log in as client
// 2. Try to create task (employee-only)
// Expected: 403 Forbidden
```

---

## Common Error Scenarios

### 1. **Form Submission Fails**
**Cause:** Network error, validation error, server error
**Solution:**
- Display user-friendly error message
- Keep form data intact
- Allow retry
- Show which fields have errors

### 2. **API Returns Validation Errors**
**Cause:** Invalid data sent to API
**Solution:**
- Parse `details` object from response
- Display field-specific errors
- Highlight invalid fields with red border

### 3. **Authentication Expired**
**Cause:** Session timeout, token expired
**Solution:**
- Redirect to login page
- Show message: "Your session has expired. Please log in again."
- Preserve intended destination

### 4. **Permission Denied**
**Cause:** User role doesn't have access
**Solution:**
- Show 403 error message
- Don't expose system details
- Provide clear explanation

### 5. **Database Connection Failed**
**Cause:** Supabase timeout, network issue
**Solution:**
- Show generic error: "Unable to connect. Please try again."
- Retry button
- Don't expose database details

---

## Migration Guide

To update existing components with new error handling:

### API Routes:
1. Import error utilities from `@/lib/errors`
2. Import validators from `@/lib/validation`
3. Replace manual error responses with helper functions
4. Add validation before database operations
5. Use `handleSupabaseError()` for database errors

### Components:
1. Replace boolean `loading` state with `FormState` type
2. Add `fieldErrors` state for field-level errors
3. Import validation functions from `@/lib/validation`
4. Use `isNetworkError()` and `getUserFriendlyErrorMessage()`
5. Add field validation on blur
6. Display field-specific error messages
7. Disable inputs during submission
8. Show success/error feedback

---

## Next Steps

1. **Apply to Remaining API Routes:**
   - `/api/notes/route.ts`
   - `/api/projects/[id]/route.ts`
   - `/api/clients/[id]/route.ts`
   - `/api/employees/invite/route.ts`

2. **Apply to Remaining Components:**
   - `NotesPanel.tsx`
   - `AddEmployeeModal.tsx`
   - `EditableProjectCard.tsx`
   - `EditableProjectDetailContent.tsx`
   - `TasksList.tsx`

3. **Add Error Boundaries:**
   - Wrap page-level components
   - Wrap async data-loading sections
   - Wrap third-party components

4. **Testing:**
   - Test network failures
   - Test validation errors
   - Test permission errors
   - Test edge cases (empty data, long strings, special characters)

---

## Resources

- **Validation Functions:** `lib/validation.ts`
- **Error Utilities:** `lib/errors.ts`
- **Error Boundary:** `components/ErrorBoundary.tsx`
- **Example API Route:** `app/api/tasks/route.ts`
- **Example Component:** `components/AddTaskForm.tsx`
