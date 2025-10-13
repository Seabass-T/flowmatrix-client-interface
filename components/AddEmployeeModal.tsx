/**
 * Add Employee Modal Component
 *
 * Modal for inviting new employees to the FlowMatrix AI platform.
 * Features:
 * - Email input with validation
 * - Sends Supabase Auth invitation via API route
 * - Success/error feedback
 * - Click-outside and ESC to close
 *
 * PRD Reference: Section 4.3.2 (Employee Invitation System)
 */

'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { X, Mail, AlertCircle, Check } from 'lucide-react'
import { validateEmail } from '@/lib/validation'
import { isNetworkError, getUserFriendlyErrorMessage } from '@/lib/errors'

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldError, setFieldError] = useState('')

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [isOpen])

  // Click-outside and ESC to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setSubmitState('idle')
      setErrorMessage('')
      setFieldError('')
    }
  }, [isOpen])

  // Validate email on blur
  const handleEmailBlur = () => {
    const validation = validateEmail(email)
    if (!validation.isValid && validation.error) {
      setFieldError(validation.error)
    } else {
      setFieldError('')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate email
    const validation = validateEmail(email)
    if (!validation.isValid && validation.error) {
      setFieldError(validation.error)
      setSubmitState('error')
      return
    }

    // Prevent multiple submissions
    if (submitState === 'submitting') return

    setSubmitState('submitting')
    setErrorMessage('')
    setFieldError('')

    try {
      const response = await fetch('/api/employees/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Check for field-specific errors
        if (errorData.details && typeof errorData.details === 'object') {
          if (errorData.details.email) {
            setFieldError(errorData.details.email)
          }
          setSubmitState('error')
          return
        }

        throw new Error(errorData.error || 'Failed to send invitation')
      }

      setSubmitState('success')

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error sending invitation:', error)
      setSubmitState('error')

      // Network error detection
      if (isNetworkError(error)) {
        setErrorMessage('Unable to connect. Please check your internet connection.')
      } else {
        setErrorMessage(getUserFriendlyErrorMessage(error))
      }

      // Reset error state after 5 seconds
      setTimeout(() => {
        setSubmitState('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Invite Employee</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="employee-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              ref={emailInputRef}
              id="employee-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFieldError('')
              }}
              onBlur={handleEmailBlur}
              placeholder="employee@flowmatrixai.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
                fieldError ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={submitState === 'submitting' || submitState === 'success'}
              required
            />
            {fieldError && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                <AlertCircle className="w-4 h-4" />
                {fieldError}
              </p>
            )}
            {!fieldError && (
              <p className="text-xs text-gray-500 mt-2">
                An invitation email will be sent with a signup link.
              </p>
            )}
          </div>

          {/* Error Message */}
          {submitState === 'error' && errorMessage && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {submitState === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Invitation sent successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={submitState === 'submitting'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={submitState === 'submitting' || submitState === 'success'}
            >
              {submitState === 'submitting' && (
                <span className="animate-spin">⏳</span>
              )}
              {submitState === 'submitting' ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
