import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

/**
 * Middleware for protected routes and role-based access control
 *
 * Protected Routes:
 * - /dashboard/client - Requires 'client' role
 * - /dashboard/employee - Requires 'employee' role
 *
 * Public Routes:
 * - /login, /signup, /api/auth/callback
 * - / (home page)
 *
 * Logic:
 * 1. Check if user has active session using getUser() (secure)
 * 2. If no session and accessing protected route → redirect to /login
 * 3. If session exists, verify user role from database
 * 4. Redirect to appropriate dashboard based on role
 * 5. Prevent role mismatch (client accessing employee dashboard, etc.)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getUser() instead of getSession() for security
  // This validates the JWT token with the Supabase Auth server
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log('🔧 Middleware:', pathname, 'User:', user ? 'Yes' : 'No')

  // Define route patterns
  const isAuthRoute = pathname === '/login' || pathname === '/signup'
  const isAuthCallback = pathname.startsWith('/api/auth')
  const isPublicRoute = pathname === '/' || isAuthRoute || isAuthCallback

  const isClientDashboard = pathname.startsWith('/dashboard/client')
  const isEmployeeDashboard = pathname.startsWith('/dashboard/employee')
  const isProtectedRoute = isClientDashboard || isEmployeeDashboard

  // 1. No user/authentication error - handle appropriately
  if (!user || authError) {
    // Allow access to auth routes and callbacks
    if (isAuthRoute || isAuthCallback) {
      return supabaseResponse
    }

    // Redirect all other routes to login
    const redirectUrl = new URL('/login', request.url)
    if (pathname !== '/') {
      redirectUrl.searchParams.set('redirectTo', pathname)
    }
    console.log('🔧 Middleware: No user, redirecting to login')
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Has authenticated user - handle role-based access
  try {
    // Get user role from JWT metadata (no database query needed!)
    const userRole = user.user_metadata?.role as 'client' | 'employee' | undefined

    if (!userRole) {
      console.error('🔧 Middleware: No role found in user metadata for user:', user.id)
      // If no role in metadata and not on auth callback, redirect to login
      if (!isAuthCallback) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return supabaseResponse
    }

    console.log('🔧 Middleware: User role:', userRole, 'Path:', pathname)

    // Redirect authenticated users away from auth pages
    if (isAuthRoute) {
      const dashboardPath = userRole === 'employee'
        ? '/dashboard/employee'
        : '/dashboard/client'
      console.log('🔧 Middleware: Auth route with session, redirecting to:', dashboardPath)
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }

    // Role-based access control for dashboards
    if (isClientDashboard && userRole !== 'client') {
      // Employee trying to access client dashboard → redirect to employee dashboard
      console.log('🔧 Middleware: Role mismatch, redirecting employee to their dashboard')
      return NextResponse.redirect(new URL('/dashboard/employee', request.url))
    }

    if (isEmployeeDashboard && userRole !== 'employee') {
      // Client trying to access employee dashboard → redirect to client dashboard
      console.log('🔧 Middleware: Role mismatch, redirecting client to their dashboard')
      return NextResponse.redirect(new URL('/dashboard/client', request.url))
    }

    // Redirect from home page to appropriate dashboard
    if (pathname === '/') {
      const dashboardPath = userRole === 'employee'
        ? '/dashboard/employee'
        : '/dashboard/client'
      console.log('🔧 Middleware: Home page, redirecting to:', dashboardPath)
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }
  } catch (error) {
    console.error('🔧 Middleware: Unexpected error:', error)
    // On unexpected error, allow auth callbacks through, otherwise redirect to login
    if (isAuthCallback) {
      return supabaseResponse
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

/**
 * Specify which routes this middleware should run on
 * Runs on all routes except static files, images, and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, etc. (metadata files)
     * - public folder files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
