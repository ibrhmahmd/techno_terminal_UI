import { useState } from 'react'
import { createUser, resetPassword, type CreateUserRequest, type User } from '../../api/auth'
import { LoadingSpinner } from '../common/LoadingSpinner'

// Mock user list - in production this would come from an API endpoint
const MOCK_USERS: User[] = [
  {
    id: 1,
    employee_id: 101,
    username: 'admin',
    email: 'admin@techno.com',
    role: 'admin',
    is_active: true,
    last_login: new Date().toISOString(),
    created_at: '2024-01-15T00:00:00Z',
  },
]

export function UsersTab() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [isCreating, setIsCreating] = useState(false)
  const [isResetting, setIsResetting] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)

  // Create user form state
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    employee_id: 0,
    username: '',
    password: '',
    role: 'admin',
  })

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreating(true)

    try {
      const created = await createUser(newUser)
      setUsers([...users, created])
      setCreateSuccess(`User ${created.username} created successfully!`)
      setNewUser({ employee_id: 0, username: '', password: '', role: 'admin' })
      setTimeout(() => setShowCreateModal(false), 1500)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setIsCreating(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setResetError(null)
    setResetSuccess(null)
    setIsResetting(selectedUser.id)

    try {
      await resetPassword(selectedUser.id, { new_password: newPassword })
      setResetSuccess(`Password reset successfully for ${selectedUser.username}!`)
      setNewPassword('')
      setTimeout(() => {
        setShowResetModal(false)
        setSelectedUser(null)
      }, 2000)
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsResetting(null)
    }
  }

  const openResetModal = (user: User) => {
    setSelectedUser(user)
    setNewPassword('')
    setResetError(null)
    setResetSuccess(null)
    setShowResetModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-xl font-semibold text-on-surface">
          User Management
        </h2>
        <button
          onClick={() => {
            setNewUser({ employee_id: 0, username: '', password: '', role: 'admin' })
            setCreateError(null)
            setCreateSuccess(null)
            setShowCreateModal(true)
          }}
          className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Create User
        </button>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
            {/* Header with avatar and name */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-lg flex-shrink-0">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{user.username}</h3>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Role & Status */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-sm">work</span>
                <span className="text-sm text-slate-700 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                <span className="text-sm text-slate-500">
                  {new Date(user.last_login).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                user.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => alert(`View user: ${user.username}\nEmail: ${user.email}\nRole: ${user.role}\nEmployee ID: ${user.employee_id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                title="View Details"
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                View
              </button>
              <button
                onClick={() => alert(`Edit user: ${user.username} (Coming soon)`)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary bg-secondary-container/30 rounded-lg hover:bg-secondary-container/50 transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Edit
              </button>
              <button
                onClick={() => openResetModal(user)}
                disabled={isResetting === user.id}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                title="Reset Password"
              >
                {isResetting === user.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <span className="material-symbols-outlined text-lg">lock_reset</span>
                )}
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">
              Create New User
            </h3>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Employee ID *
                </label>
                <input
                  type="number"
                  required
                  value={newUser.employee_id || ''}
                  onChange={(e) => setNewUser({ ...newUser, employee_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'system_admin' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="admin">Admin</option>
                  <option value="system_admin">System Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating && <LoadingSpinner size="sm" variant="light" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">
              Reset Password
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Enter a new password for <strong>{selectedUser.username}</strong>
            </p>

            {resetError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                {resetError}
              </div>
            )}
            {resetSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
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
                />
                <p className="text-xs text-slate-500 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false)
                    setSelectedUser(null)
                    setNewPassword('')
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting !== null || newPassword.length < 6}
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResetting !== null && <LoadingSpinner size="sm" variant="light" />}
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
