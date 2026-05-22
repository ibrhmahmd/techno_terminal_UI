import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/formatting'
import { useUpdateProfile, useChangePassword } from '../../hooks/useAuthQueries'
import { LoadingSpinner } from '../common/LoadingSpinner'

export function ProfileTab() {
  const { user } = useAuthStore()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const displayUser = user

  if (!displayUser) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <LoadingSpinner />
      </div>
    )
  }

  const startEditing = () => {
    setEditUsername(displayUser.username)
    setEditEmail(displayUser.email)
    setProfileError(null)
    setProfileSuccess(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setProfileError(null)
    setProfileSuccess(null)
  }

  const handleSaveProfile = async () => {
    setProfileError(null)
    setProfileSuccess(null)

    const payload: { username?: string; email?: string } = {}
    if (editUsername !== displayUser.username) payload.username = editUsername
    if (editEmail !== displayUser.email) payload.email = editEmail

    if (Object.keys(payload).length === 0) {
      setIsEditing(false)
      return
    }

    try {
      await updateProfileMutation.mutateAsync(payload)
      setProfileSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch {
      setProfileError('Failed to update profile. Please try again.')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError('Failed to change password. Please check your current password and try again.')
    }
  }

  const profileFields = [
    { label: 'Username', value: displayUser.username || 'N/A' },
    { label: 'Email', value: displayUser.email || 'N/A' },
    { label: 'Employee ID', value: displayUser.employee_id?.toString() || 'N/A' },
    { label: 'Role', value: displayUser.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A' },
    { label: 'Account Status', value: displayUser.is_active ? 'Active' : 'Inactive' },
    { label: 'Last Login', value: displayUser.last_login ? formatDate(displayUser.last_login) : 'N/A' },
    { label: 'Account Created', value: displayUser.created_at ? formatDate(displayUser.created_at) : 'N/A' },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Profile Information
        </h2>

        {profileError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
            {profileSuccess}
          </div>
        )}

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Username</label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div className="flex gap-3 pt-4 md:col-span-2">
              <button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {updateProfileMutation.isPending && <LoadingSpinner size="sm" variant="light" />}
                Save Changes
              </button>
              <button
                onClick={cancelEditing}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
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
            <div className="mt-6">
              <button
                onClick={startEditing}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Edit Profile
              </button>
            </div>
          </>
        )}
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
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              placeholder="Enter new password"
            />
            <p className="text-xs text-slate-500 mt-1">
              Password must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              placeholder="Confirm new password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {changePasswordMutation.isPending && <LoadingSpinner size="sm" variant="light" />}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
