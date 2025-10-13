'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, CheckCircle } from 'lucide-react'

interface TestimonialFormProps {
  clientId: string
  userId: string
}

export function TestimonialForm({ clientId, userId }: TestimonialFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const maxChars = 300
  const remainingChars = maxChars - content.length

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('Please enter your testimonial')
      return
    }

    if (content.length > maxChars) {
      setError(`Testimonial must be ${maxChars} characters or less`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          user_id: userId,
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit testimonial')
      }

      // Success
      setIsSubmitted(true)
      setContent('')

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  // Show success message
  if (isSubmitted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-green-600 mb-2">
          <CheckCircle className="w-6 h-6" />
          <h3 className="text-xl font-bold">Thank You!</h3>
        </div>
        <p className="text-gray-700">
          Your testimonial has been submitted successfully. We appreciate your feedback!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-700">Share Your Feedback</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Help us improve by sharing your experience with FlowMatrix AI.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text area */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience..."
            maxLength={maxChars}
            rows={3}
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none bg-white"
            disabled={isSubmitting}
          />

          {/* Character counter */}
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs ${
                remainingChars < 50
                  ? 'text-orange-600'
                  : remainingChars < 20
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 shadow-sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
