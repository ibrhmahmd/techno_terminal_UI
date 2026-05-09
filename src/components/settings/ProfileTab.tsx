import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/formatting'
import { getCurrentUser, resetPassword } from '../../api/auth'
import { LoadingSpinner } from '../common/LoadingSpinner'

export function ProfileTab() {
  const { user } = useAuthStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-slate-500">Loading user information...</p>
      </div>
    )
  }

  const profileFields = [
    { label: 'Username', value: user.username || 'N/A' },
    { label: 'Email', value: user.email || 'N/A' },
    { label: 'Employee ID', value: user.employee_id?.toString() || 'N/A' },
    { label: 'Role', value: user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A' },
    { label: 'Account Status', value: user.is_active ? 'Active' : 'Inactive' },
    { label: 'Last Login', value: user.last_login ? formatDate(user.last_login) : 'N/A' },
    { label: 'Account Created', value: user.created_at ? formatDate(user.created_at) : 'N/A' },
  ]

  const handleRefreshProfile = async () => {
    setIsRefreshing(true)
    try {
      await getCurrentUser()
      setLastRefreshed(new Date())
    } catch (err) {
      console.error('Failed to refresh profile:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      await resetPassword(user.id, { new_password: newPassword })
      setPasswordSuccess('Password changed successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Profile Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileFields.map((field) => (
            <div key={field.label} className="space-y-1">
              <label className="text-sm font-medium text-slate-500">{field.label}</label>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-on-surface">
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Session Information
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-on-surface">Current Session</p>
              <p className="text-xs text-slate-500 mt-1">
                Logged in as {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>

          {lastRefreshed && (
            <p className="text-xs text-slate-500">
              Profile last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleRefreshProfile}
            disabled={isRefreshing}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span className="material-symbols-outlined text-base">refresh</span>
            )}
            Refresh Profile
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Change Password
        </h2>

        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              placeholder="Enter new password"
            />
            <p className="text-xs text-slate-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              placeholder="Confirm new password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {isChangingPassword && <LoadingSpinner size="sm" variant="light" />}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
