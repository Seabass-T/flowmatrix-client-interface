/**
 * Error Boundary Component
 *
 * Catches React errors in component tree and displays fallback UI.
 * Prevents entire app from crashing due to component errors.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<CustomError />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * Features:
 * - Catches rendering errors, lifecycle errors, constructor errors
 * - Logs errors to console for debugging
 * - Displays user-friendly error message
 * - Provides retry button to attempt recovery
 * - Can be customized with custom fallback UI
 */

'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console (in production, this could send to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = (): void => {
    // Reset error state to attempt re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback Component
 */
interface DefaultErrorFallbackProps {
  error: Error | null
  onRetry: () => void
}

function DefaultErrorFallback({ error, onRetry }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if
          the problem persists.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <summary className="text-sm font-semibold text-red-800 cursor-pointer mb-2">
              Error Details (dev only)
            </summary>
            <pre className="text-xs text-red-700 overflow-auto max-h-40">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-gray-500 mt-6">
          Need help?{' '}
          <a
            href="mailto:info@flowmatrixai.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}

/**
 * Compact Error Fallback
 * For smaller error boundaries within pages
 */
interface CompactErrorFallbackProps {
  error: Error | null
  onRetry: () => void
  title?: string
}

export function CompactErrorFallback({
  error,
  onRetry,
  title = 'Error loading content',
}: CompactErrorFallbackProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center border border-red-200">
      <div className="flex justify-center mb-4">
        <div className="bg-red-100 p-3 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        An unexpected error occurred. Please try again.
      </p>

      {/* Error Details (development only) */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="text-left mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <summary className="text-xs font-semibold text-red-800 cursor-pointer mb-1">
            Error Details (dev only)
          </summary>
          <pre className="text-xs text-red-700 overflow-auto max-h-32">{error.message}</pre>
        </details>
      )}

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  )
}

/**
 * Section Error Boundary
 * For wrapping specific sections with compact error UI
 */
interface SectionErrorBoundaryProps {
  children: ReactNode
  title?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function SectionErrorBoundary({ children, title, onError }: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <CompactErrorFallback
          error={null}
          onRetry={() => window.location.reload()}
          title={title}
        />
      }
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  )
}
