'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    if (!companyName.trim()) {
      return 'Company name is required'
    }
    return null
  }

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            company_name: companyName.trim(),
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (!authData.user) {
        throw new Error('No user data returned')
      }

      // 2. Create user record in users table
      const { error: userInsertError } = (await supabase.from('users').insert({
        id: authData.user.id,
        email: email.trim(),
        role: 'client' as 'client' | 'employee', // Default role for self-signup
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as { error: { message?: string } | null }

      if (userInsertError) {
        // If user already exists, that's okay (might be from previous signup attempt)
        const errorMessage = userInsertError.message || ''
        if (!errorMessage.includes('duplicate key')) {
          throw new Error(errorMessage)
        }
      }

      // 3. Create client company record
      const { data: clientData, error: clientInsertError } = await supabase
        .from('clients')
        .insert({
          company_name: companyName.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .select()
        .single() as { data: { id: string } | null; error: { message?: string } | null }

      if (clientInsertError) {
        throw new Error(clientInsertError.message || 'Failed to create client')
      }

      if (!clientData) {
        throw new Error('Failed to create client record')
      }

      // 4. Link user to client company
      const { error: userClientError } = (await supabase.from('user_clients').insert({
        user_id: authData.user.id,
        client_id: clientData.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as { error: { message?: string } | null }

      if (userClientError) {
        throw new Error(userClientError.message || 'Failed to link user to client')
      }

      // Show success message
      setSuccess(true)
    } catch (err: unknown) {
      console.error('Signup error:', err)

      // User-friendly error messages
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      if (errorMessage.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.')
      } else if (errorMessage.includes('invalid email')) {
        setError('Please enter a valid email address.')
      } else {
        setError(errorMessage || 'An error occurred during signup. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email!
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a verification link to <strong>{email}</strong>. Please
              check your inbox and click the link to verify your account.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
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
            Create your account to start tracking automation ROI
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSignup} className="space-y-6">
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

            {/* Company Name Field */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors text-gray-900"
                placeholder="Your Company LLC"
                disabled={loading}
              />
            </div>

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
                placeholder="you@company.com"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors text-gray-900"
                placeholder="••••••••"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
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
