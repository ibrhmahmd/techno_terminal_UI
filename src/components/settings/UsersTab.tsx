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

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-on-surface">
                  {user.username}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                  {user.role.replace('_', ' ')}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(user.last_login).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openResetModal(user)}
                    disabled={isResetting === user.id}
                    className="text-sm text-secondary hover:text-secondary/80 flex items-center gap-1"
                  >
                    {isResetting === user.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <span className="material-symbols-outlined text-base">lock_reset</span>
                    )}
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
