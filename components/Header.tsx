'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { LogOut, User } from 'lucide-react'

interface HeaderProps {
  clientName?: string
  userName?: string
  userRole?: 'client' | 'employee'
}

/**
 * Header component for dashboard pages
 *
 * Features:
 * - FlowMatrix AI logo
 * - Client/company name display
 * - User dropdown menu
 * - Logout functionality
 * - Responsive mobile/desktop layout
 *
 * Brand Colors:
 * - Primary: Deep Blue (#1E3A8A) for logo and header
 * - Borders: Gray-200 for separation
 */
export function Header({ clientName, userName, userRole = 'client' }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Name */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
                FlowMatrix AI
              </h1>
            </div>

            {/* Divider */}
            {clientName && (
              <>
                <div className="hidden sm:block h-6 w-px bg-gray-300" />

                {/* Client Name */}
                <div className="hidden sm:flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {clientName}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userName || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userRole}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Client Name */}
        {clientName && (
          <div className="sm:hidden pb-3 flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {clientName}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
