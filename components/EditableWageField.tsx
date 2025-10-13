'use client'

import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'

interface EditableWageFieldProps {
  clientId: string
  currentWage: number | null
  onUpdate?: (newWage: number) => void
}

export function EditableWageField({ clientId, currentWage, onUpdate }: EditableWageFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [wage, setWage] = useState(currentWage?.toString() || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const wageValue = parseFloat(wage)

    if (isNaN(wageValue) || wageValue < 0) {
      setError('Please enter a valid wage')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avg_employee_wage: wageValue }),
      })

      if (!response.ok) {
        throw new Error('Failed to update wage')
      }

      setIsEditing(false)
      if (onUpdate) {
        onUpdate(wageValue)
      }
    } catch (err) {
      setError('Failed to save wage')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setWage(currentWage?.toString() || '')
    setError('')
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-lg font-semibold text-gray-900">
          {currentWage ? `$${currentWage.toFixed(2)}/hr` : 'Not set'}
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Edit wage"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={wage}
            onChange={(e) => setWage(e.target.value)}
            className="pl-6 pr-12 py-1 w-32 border-2 border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
            placeholder="0.00"
            autoFocus
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">/hr</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors"
          aria-label="Save"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {saving && <p className="text-xs text-gray-500">Saving...</p>}
    </div>
  )
}
