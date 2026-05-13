import { useState } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { CreateEmployeeAccountRequest } from '../../api/hr'

interface CreateAccountModalEmployeeInfo {
  id: number
  full_name: string
  email?: string
}

interface CreateAccountModalProps {
  employee: CreateAccountModalEmployeeInfo
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEmployeeAccountRequest) => Promise<void>
  isLoading: boolean
}

export function CreateAccountModal({ employee, isOpen, onClose, onSubmit, isLoading }: CreateAccountModalProps) {
  const [formData, setFormData] = useState<CreateEmployeeAccountRequest>({
    email: employee.email || '',
    password: '',
    role: 'admin'
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }

    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }

    try {
      await onSubmit(formData)
      setFormData({ email: employee.email || '', password: '', role: 'admin' })
    } catch {
      setError('Failed to create account. Please try again.')
    }
  }

  const handleClose = () => {
    setError(null)
    setFormData({ email: employee.email || '', password: '', role: 'admin' })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Create Account for ${employee.full_name}`}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-account-form"
            className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Creating...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      }
    >
      <form id="create-account-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            placeholder="Enter email address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            placeholder="Min 12 characters"
            minLength={12}
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Must be at least 12 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'system_admin' }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-white"
            required
          >
            <option value="admin">Admin</option>
            <option value="system_admin">System Admin</option>
          </select>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Note:</span> This will create a Supabase user account linked to {employee.full_name}. 
            The employee will receive an email with login instructions.
          </p>
        </div>
      </form>
    </Modal>
  )
}
