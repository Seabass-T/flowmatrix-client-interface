import { redirect } from 'next/navigation'

/**
 * Home page - redirects to login
 * Authenticated users are redirected to their dashboard by middleware
 */
export default function Home() {
  // Redirect to login page
  // Middleware will redirect authenticated users to their dashboard
  redirect('/login')
}
