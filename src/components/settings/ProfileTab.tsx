import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/formatting'
import { useUpdateProfile, useChangePassword, useMfaStatus } from '../../hooks/useAuthQueries'
import { LoadingSpinner } from '../common/LoadingSpinner'


export function ProfileTab() {
  const { user } = useAuthStore()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()
  const { data: mfaData, isLoading: mfaLoading, isError: mfaError } = useMfaStatus()


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
      <div className="bg-white rounded-[6px] shadow-sm p-8 text-center">
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

    if (newPassword.length < 12) {
      setPasswordError('Password must be at least 12 characters')
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
    { label: 'Role', value: displayUser.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A' },
    { label: 'Last Login', value: displayUser.last_login ? formatDate(displayUser.last_login) : 'N/A' },
  ]

  return (
    <div className="space-y-6 font-body">
      {/* Profile Information */}
      <div className="bg-white rounded-[6px] shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Profile Information
        </h2>

        {profileError && (
          <div className="mb-4 p-3 bg-red-500/10 rounded-[6px] text-sm text-red-700" role="alert">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 p-3 bg-secondary/15 rounded-[6px] text-sm text-secondary" role="alert">
            {profileSuccess}
          </div>
        )}

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="edit-username" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
              <input
                id="edit-username"
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
              <input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-4 md:col-span-2">
              <button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 bg-secondary text-white rounded-[6px] font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm transition-opacity duration-120"
              >
                {updateProfileMutation.isPending && <LoadingSpinner size="sm" variant="light" />}
                Save Changes
              </button>
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-[6px] text-sm font-medium hover:bg-slate-200 transition-colors duration-120"
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
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{field.label}</label>
                  <div className="px-4 py-2.5 bg-slate-50 rounded-[6px] text-sm text-on-surface">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={startEditing}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-[6px] text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 duration-120"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">edit</span>
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-[6px] shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Change Password
        </h2>

        {passwordError && (
          <div className="mb-4 p-3 bg-red-500/10 rounded-[6px] text-sm text-red-700" role="alert">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-secondary/15 rounded-[6px] text-sm text-secondary" role="alert">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Current Password *
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              New Password *
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={12}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
              placeholder="Enter new password"
            />
            <p className="text-xs text-slate-400 mt-1">
              Password must be at least 12 characters
            </p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Confirm Password *
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
              placeholder="Confirm new password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-4 py-2 bg-secondary text-white rounded-[6px] font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm transition-opacity duration-120"
            >
              {changePasswordMutation.isPending && <LoadingSpinner size="sm" variant="light" />}
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Factor Authentication */}
      <div className="bg-white rounded-[6px] shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Multi-Factor Authentication
        </h2>
        
        {mfaLoading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <LoadingSpinner size="sm" />
            <span>Checking MFA status...</span>
          </div>
        ) : mfaError ? (
          <div className="text-slate-500 text-sm italic">
            Status unavailable
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-4xl text-slate-400 shrink-0 select-none" aria-hidden="true">
              shield
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-on-surface">MFA Status:</span>
                {mfaData?.enrolled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-semibold bg-secondary/15 text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                    Enrolled ({mfaData.method || 'Unknown'})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-semibold bg-amber-500/10 text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    Not Enrolled
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-body">
                {!mfaData?.enrolled 
                  ? 'Multi-Factor Authentication (MFA) enrollment is coming soon to secure your account.'
                  : 'Your account is secured with Multi-Factor Authentication.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
