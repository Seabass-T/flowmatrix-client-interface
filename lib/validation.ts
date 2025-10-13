/**
 * Validation Utilities
 *
 * Comprehensive validation functions for forms, inputs, and API data.
 * Provides consistent error messages and type-safe validation.
 *
 * Usage:
 * - Import validation functions in components and API routes
 * - Use validateSchema for complex object validation
 * - Use individual validators for single field validation
 */

/**
 * Validation Result Type
 */
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Email Validation
 * RFC 5322 compliant email regex
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' }
  }

  const trimmedEmail = email.trim()

  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'Email is required' }
  }

  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email is too long (max 254 characters)' }
  }

  return { isValid: true }
}

/**
 * Required Field Validation
 */
export function validateRequired(
  value: string | number | null | undefined,
  fieldName: string
): { isValid: boolean; error?: string } {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  return { isValid: true }
}

/**
 * String Length Validation
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): { isValid: boolean; error?: string } {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string` }
  }

  const length = value.trim().length

  if (length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` }
  }

  if (length > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max} characters` }
  }

  return { isValid: true }
}

/**
 * Number Range Validation
 */
export function validateNumberRange(
  value: number | null | undefined,
  min: number,
  max: number,
  fieldName: string
): { isValid: boolean; error?: string } {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` }
  }

  if (value < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` }
  }

  if (value > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` }
  }

  return { isValid: true }
}

/**
 * Positive Number Validation (optional field)
 */
export function validatePositiveNumber(
  value: number | null | undefined,
  fieldName: string,
  required: boolean = false
): { isValid: boolean; error?: string } {
  if (value === null || value === undefined) {
    if (required) {
      return { isValid: false, error: `${fieldName} is required` }
    }
    return { isValid: true } // Optional field, null is valid
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` }
  }

  if (value < 0) {
    return { isValid: false, error: `${fieldName} must be positive` }
  }

  return { isValid: true }
}

/**
 * Date Validation
 */
export function validateDate(
  value: string | null | undefined,
  fieldName: string,
  required: boolean = false
): { isValid: boolean; error?: string } {
  if (!value) {
    if (required) {
      return { isValid: false, error: `${fieldName} is required` }
    }
    return { isValid: true } // Optional field
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} must be a valid date` }
  }

  return { isValid: true }
}

/**
 * Enum Validation (for status fields, etc.)
 */
export function validateEnum<T extends string>(
  value: string | null | undefined,
  allowedValues: T[],
  fieldName: string
): { isValid: boolean; error?: string } {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  if (!allowedValues.includes(value as T)) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    }
  }

  return { isValid: true }
}

/**
 * Project Status Validation
 */
export function validateProjectStatus(status: string | null | undefined): {
  isValid: boolean
  error?: string
} {
  return validateEnum(status, ['active', 'dev', 'proposed', 'inactive'], 'Status')
}

/**
 * Note Type Validation
 */
export function validateNoteType(noteType: string | null | undefined): {
  isValid: boolean
  error?: string
} {
  return validateEnum(noteType, ['client', 'flowmatrix_ai'], 'Note type')
}

/**
 * UUID Validation
 */
export function validateUUID(id: string | null | undefined, fieldName: string): {
  isValid: boolean
  error?: string
} {
  if (!id) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(id)) {
    return { isValid: false, error: `${fieldName} must be a valid UUID` }
  }

  return { isValid: true }
}

/**
 * Schema Validation
 * Validates an object against a schema of validation functions
 */
export function validateSchema<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, (value: unknown) => { isValid: boolean; error?: string }>
): ValidationResult {
  const errors: Record<string, string> = {}

  for (const [key, validator] of Object.entries(schema)) {
    const result = validator(data[key as keyof T])
    if (!result.isValid && result.error) {
      errors[key] = result.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Project Update Validation (for API routes)
 */
export function validateProjectUpdate(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate hours_saved fields (optional, but must be positive if present)
  if ('hours_saved_daily' in data && data.hours_saved_daily !== null) {
    const result = validatePositiveNumber(
      data.hours_saved_daily as number,
      'Hours saved daily',
      false
    )
    if (!result.isValid && result.error) {
      errors.hours_saved_daily = result.error
    }
  }

  if ('hours_saved_weekly' in data && data.hours_saved_weekly !== null) {
    const result = validatePositiveNumber(
      data.hours_saved_weekly as number,
      'Hours saved weekly',
      false
    )
    if (!result.isValid && result.error) {
      errors.hours_saved_weekly = result.error
    }
  }

  if ('hours_saved_monthly' in data && data.hours_saved_monthly !== null) {
    const result = validatePositiveNumber(
      data.hours_saved_monthly as number,
      'Hours saved monthly',
      false
    )
    if (!result.isValid && result.error) {
      errors.hours_saved_monthly = result.error
    }
  }

  // Validate employee_wage (optional, but must be positive if present)
  if ('employee_wage' in data && data.employee_wage !== null) {
    const result = validateNumberRange(
      data.employee_wage as number,
      0,
      1000,
      'Employee wage'
    )
    if (!result.isValid && result.error) {
      errors.employee_wage = result.error
    }
  }

  // Validate status (if present)
  if ('status' in data) {
    const result = validateProjectStatus(data.status as string)
    if (!result.isValid && result.error) {
      errors.status = result.error
    }
  }

  // Validate cost fields (optional, but must be non-negative if present)
  const costFields = ['dev_cost', 'implementation_cost', 'monthly_maintenance'] as const

  for (const field of costFields) {
    if (field in data && data[field] !== null) {
      const result = validatePositiveNumber(data[field] as number, field, false)
      if (!result.isValid && result.error) {
        errors[field] = result.error
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Task Creation Validation
 */
export function validateTaskCreate(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate project_id (required, must be UUID)
  const projectIdResult = validateUUID(data.project_id as string, 'Project ID')
  if (!projectIdResult.isValid && projectIdResult.error) {
    errors.project_id = projectIdResult.error
  }

  // Validate description (required, 1-500 characters)
  const descriptionResult = validateRequired(data.description, 'Description')
  if (!descriptionResult.isValid && descriptionResult.error) {
    errors.description = descriptionResult.error
  } else {
    const lengthResult = validateLength(data.description as string, 1, 500, 'Description')
    if (!lengthResult.isValid && lengthResult.error) {
      errors.description = lengthResult.error
    }
  }

  // Validate due_date (optional, must be valid date)
  if ('due_date' in data && data.due_date) {
    const dateResult = validateDate(data.due_date as string, 'Due date', false)
    if (!dateResult.isValid && dateResult.error) {
      errors.due_date = dateResult.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Note Creation Validation
 */
export function validateNoteCreate(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate project_id (required, must be UUID)
  const projectIdResult = validateUUID(data.project_id as string, 'Project ID')
  if (!projectIdResult.isValid && projectIdResult.error) {
    errors.project_id = projectIdResult.error
  }

  // Validate author_id (required, must be UUID)
  const authorIdResult = validateUUID(data.author_id as string, 'Author ID')
  if (!authorIdResult.isValid && authorIdResult.error) {
    errors.author_id = authorIdResult.error
  }

  // Validate note_type (required, must be enum)
  const noteTypeResult = validateNoteType(data.note_type as string)
  if (!noteTypeResult.isValid && noteTypeResult.error) {
    errors.note_type = noteTypeResult.error
  }

  // Validate content (required, 1-500 characters)
  const contentResult = validateRequired(data.content, 'Content')
  if (!contentResult.isValid && contentResult.error) {
    errors.content = contentResult.error
  } else {
    const lengthResult = validateLength(data.content as string, 1, 500, 'Content')
    if (!lengthResult.isValid && lengthResult.error) {
      errors.content = lengthResult.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Employee Invitation Validation
 */
export function validateEmployeeInvite(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate email (required, must be valid email)
  const emailResult = validateEmail(data.email as string)
  if (!emailResult.isValid && emailResult.error) {
    errors.email = emailResult.error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Client Wage Update Validation
 */
export function validateClientWageUpdate(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate default_employee_wage (required, 0-1000)
  if ('default_employee_wage' in data) {
    const result = validateNumberRange(
      data.default_employee_wage as number,
      0,
      1000,
      'Default employee wage'
    )
    if (!result.isValid && result.error) {
      errors.default_employee_wage = result.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate Testimonial Create Data
 *
 * Required fields:
 * - client_id (UUID)
 * - user_id (UUID)
 * - content (string, 1-300 characters)
 */
export function validateTestimonialCreate(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate client_id
  const clientIdResult = validateUUID(data.client_id as string, 'Client ID')
  if (!clientIdResult.isValid && clientIdResult.error) {
    errors.client_id = clientIdResult.error
  }

  // Validate user_id
  const userIdResult = validateUUID(data.user_id as string, 'User ID')
  if (!userIdResult.isValid && userIdResult.error) {
    errors.user_id = userIdResult.error
  }

  // Validate content (required, 1-300 characters)
  const contentRequiredResult = validateRequired(data.content, 'Content')
  if (!contentRequiredResult.isValid && contentRequiredResult.error) {
    errors.content = contentRequiredResult.error
  } else {
    const contentLengthResult = validateLength(data.content as string, 1, 300, 'Content')
    if (!contentLengthResult.isValid && contentLengthResult.error) {
      errors.content = contentLengthResult.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
