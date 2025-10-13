/**
 * Employee Header Component
 *
 * Client component for the employee dashboard header.
 * Handles interactive elements (buttons) that require client-side JavaScript.
 *
 * Features:
 * - FlowMatrix AI logo
 * - Employee email display
 * - Add Employee button (TODO: implement modal)
 * - Logout button
 */

'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface EmployeeHeaderProps {
  email: string
}

export function EmployeeHeader({ email }: EmployeeHeaderProps) {
  const router = useRouter()

  const handleAddEmployee = () => {
    // TODO: Implement Add Employee modal
    alert('Add Employee functionality coming soon!')
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/flowmatrix-logo.png"
              alt="FlowMatrix AI"
              width={40}
              height={40}
              className="rounded"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleAddEmployee}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add Employee
            </button>

            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
