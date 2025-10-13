'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Clear any corrupted auth data on component mount
  useEffect(() => {
    // Clear localStorage items that might be corrupted
    const keysToCheck = Object.keys(localStorage).filter(key =>
      key.startsWith('sb-') || key.includes('supabase')
    )
    keysToCheck.forEach(key => {
      try {
        const value = localStorage.getItem(key)
        if (value && value.startsWith('base64-')) {
          console.log('🧹 Clearing corrupted localStorage key:', key)
          localStorage.removeItem(key)
        }
      } catch {
        console.log('🧹 Removing invalid localStorage key:', key)
        localStorage.removeItem(key)
      }
    })
  }, [])

  // Form validation
  const validateForm = (): string | null => {
    if (!email.trim()) {
      return 'Email is required'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }
    if (!password) {
      return 'Password is required'
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return null
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    console.log('🔐 Starting login process...')

    try {
      // Sign in with Supabase Auth
      console.log('📧 Signing in with email:', email.trim())
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        console.error('❌ Sign in error:', signInError)
        throw signInError
      }

      console.log('✅ Sign in successful, user ID:', data.user?.id)

      if (!data.user) {
        throw new Error('No user data returned')
      }

      // Get user role from JWT metadata (no database query needed!)
      console.log('🔍 Reading user role from JWT metadata...')
      const userRole = data.user.user_metadata?.role as 'client' | 'employee' | undefined

      if (!userRole) {
        console.error('❌ No role found in user metadata')
        throw new Error('User role not found. Please contact support to have your account configured.')
      }

      console.log('✅ User role from JWT:', userRole)

      // Redirect based on role
      const dashboardPath = userRole === 'employee'
        ? '/dashboard/employee'
        : '/dashboard/client'

      console.log('🚀 Redirecting to:', dashboardPath)

      // Force a full page reload to ensure cookies are set properly
      // Using replace to prevent back button issues
      window.location.replace(dashboardPath)

      // This line may not execute due to page navigation
      console.log('✅ Redirect initiated')
    } catch (err: unknown) {
      console.error('Login error:', err)

      // User-friendly error messages
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Please verify your email address before logging in.')
      } else {
        setError(errorMessage || 'An error occurred during login. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FlowMatrix AI
          </h1>
          <h2 className="text-xl font-semibold text-gray-700">
            Client Interface
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            Sign in to view your automation ROI metrics
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors text-gray-900"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors text-gray-900"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          © 2025 FlowMatrix AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
