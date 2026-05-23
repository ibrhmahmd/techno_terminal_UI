import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { type CreateUserRequest, type User } from '../../api/auth'
import { useUsers, useUpdateUser, useDeactivateUser, useInviteUser, useCreateUser, useResetPassword } from '../../hooks/useAuthQueries'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { InstructorCombobox } from '../common/combobox/InstructorCombobox'
import type { EmployeeListItem } from '../../api/hr'

interface UserDetailModalProps {
  user: User
  onClose: () => void
}

const ROLE_STYLES: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  system_admin: { label: 'System Admin', bg: 'bg-purple-100', text: 'text-purple-700', icon: 'admin_panel_settings' },
  admin: { label: 'Admin', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'shield' },
  instructor: { label: 'Instructor', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'school' },
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  Active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  Invited: { label: 'Invited', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Deactivated: { label: 'Deactivated', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' },
}

function getUserStatus(user: User): 'Active' | 'Invited' | 'Deactivated' {
  if (!user.is_active) return 'Deactivated'
  if (user.last_login) return 'Active'
  return 'Invited'
}

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] || { label: role, bg: 'bg-slate-100', text: 'text-slate-600', icon: 'badge' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className="material-symbols-outlined text-xs">{style.icon}</span>
      {style.label}
    </span>
  )
}

function StatusBadge({ status }: { status: 'Active' | 'Invited' | 'Deactivated' }) {
  const style = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}

function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const { user: currentUser } = useAuthStore()
  const updateUserMutation = useUpdateUser()
  const deactivateUserMutation = useDeactivateUser()
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)

  const isSelf = currentUser?.id === user.id
  const status = getUserStatus(user)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeactivateConfirm) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, showDeactivateConfirm])

  const handleRoleChange = async () => {
    if (selectedRole === user.role) return
    try {
      await updateUserMutation.mutateAsync({ id: user.id, data: { role: selectedRole } })
    } catch {
      setSelectedRole(user.role)
    }
  }

  const handleDeactivate = async () => {
    setIsDeactivating(true)
    try {
      await deactivateUserMutation.mutateAsync(user.id)
      setShowDeactivateConfirm(false)
      onClose()
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label={`User details: ${user.username}`}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-white font-semibold text-xl shadow-sm">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">{user.username}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-slate-500">Employee ID</label>
            <p className="text-sm text-on-surface mt-1">{user.employee_id ?? 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Role</label>
            <div className="mt-1">
              {isSelf ? (
                <RoleBadge role={user.role} />
              ) : (
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  onBlur={handleRoleChange}
                  className="w-full mt-1 px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                  <option value="system_admin">System Admin</option>
                </select>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Status</label>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Last Login</label>
            <p className="text-sm text-on-surface mt-1">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-500">Account Created</label>
            <p className="text-sm text-on-surface mt-1">{user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          {!isSelf && user.is_active && (
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              disabled={deactivateUserMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center gap-2"
            >
              {deactivateUserMutation.isPending ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-lg">person_off</span>}
              Deactivate User
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 ml-auto"
          >
            Close
          </button>
        </div>

        {showDeactivateConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" role="dialog" aria-modal="true" aria-label="Confirm deactivation" onKeyDown={(e) => e.key === 'Escape' && setShowDeactivateConfirm(false)}>
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
              <h4 className="font-headline text-base font-semibold text-on-surface mb-2">Deactivate User?</h4>
              <p className="text-sm text-slate-600 mb-6">
                This will soft-deactivate <strong>{user.username}</strong>. They will not be able to log in. This action can be reversed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeactivateConfirm(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button onClick={handleDeactivate} disabled={isDeactivating} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isDeactivating && <LoadingSpinner size="sm" variant="light" />}
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface InviteModalProps {
  onClose: () => void
}

function InviteModal({ onClose }: InviteModalProps) {
  const inviteUserMutation = useInviteUser()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'system_admin'>('admin')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ id: number; invite_expires_at: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) {
      setError('Please select an employee')
      return
    }
    if (!selectedEmployee.is_active) {
      setError('Cannot send invite to inactive employee')
      return
    }
    setError(null)
    try {
      const res = await inviteUserMutation.mutateAsync({
        email,
        role,
        employee_id: selectedEmployee.id,
      })
      setResult(res)
    } catch (err: unknown) {
      // Show server validation error if available
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create user. Please try again.')
      }
    }
  }

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Invite sent">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-green-500 mb-3">mail</span>
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">Invite Sent!</h3>
            <p className="text-sm text-slate-600 mb-4">
              Invite expires at {new Date(result.invite_expires_at).toLocaleString()}
            </p>
            <button onClick={onClose} className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90">Done</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Invite user">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">Invite User</h3>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Employee</label>
            <InstructorCombobox
              value={selectedEmployee}
              onChange={setSelectedEmployee}
            />
            {!selectedEmployee && <p className="text-xs text-slate-500 mt-1">Search and select an employee to invite</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email *</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Role *</label>
            <select value={role} onChange={(e) => { const v = e.target.value; if (v === 'admin' || v === 'system_admin') setRole(v as 'admin' | 'system_admin') }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20">
              <option value="admin">Admin</option>
              <option value="system_admin">System Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={inviteUserMutation.isPending || !selectedEmployee || !selectedEmployee?.is_active} className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {inviteUserMutation.isPending && <LoadingSpinner size="sm" variant="light" />}
                  Send Invite
                </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function UsersTab() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const limit = 50

  const query = {
    ...(search ? { q: search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(statusFilter ? { is_active: statusFilter === 'active' } : {}),
    skip: page * limit,
    limit,
  }

  const { data, isLoading, error } = useUsers(query)
  const createUserMutation = useCreateUser()
  const resetPasswordMutation = useResetPassword()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Create user state
  const [newPassword, setNewPassword] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)

  const [newUser, setNewUser] = useState<CreateUserRequest & { selectedEmployee: EmployeeListItem | null }>({
    selectedEmployee: null,
    employee_id: 0,
    username: '',
    password: '',
    role: 'admin',
  })

  const setNewUserField = <K extends keyof CreateUserRequest>(field: K, value: CreateUserRequest[K]) => {
    setNewUser((prev) => ({ ...prev, [field]: value }))
  }

  const users = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const debouncedSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(0)
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)
    if (!newUser.selectedEmployee) {
      setCreateError('Please select an employee')
      return
    }
    if (!newUser.selectedEmployee.is_active) {
      setCreateError('Cannot create account for inactive employee')
      return
    }
    try {
      const created = await createUserMutation.mutateAsync({
        employee_id: newUser.employee_id,
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
      })
      setCreateSuccess(`User ${created.username} created successfully!`)
      setNewUser({ selectedEmployee: null, employee_id: 0, username: '', password: '', role: 'admin' })
      setTimeout(() => setShowCreateModal(false), 1500)
    } catch (err: unknown) {
      // Show server validation error if available
      if (err instanceof Error) {
        setCreateError(err.message)
      } else {
        setCreateError('Failed to create user. Please try again.')
      }
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setResetError(null)
    setResetSuccess(null)
    try {
      await resetPasswordMutation.mutateAsync({ id: selectedUser.id, data: { new_password: newPassword } })
      setResetSuccess(`Password reset successfully for ${selectedUser.username}!`)
      setNewPassword('')
      setTimeout(() => { setShowResetModal(false); setSelectedUser(null) }, 2000)
    } catch (err: unknown) {
      // Show server validation error if available
      if (err instanceof Error) {
        setResetError(err.message)
      } else {
        setResetError('Failed to reset password. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-xl font-semibold text-on-surface">User Management</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-base">mail</span>
            Invite User
          </button>
          <button onClick={() => { setNewUser({ selectedEmployee: null, employee_id: 0, username: '', password: '', role: 'admin' }); setCreateError(null); setCreateSuccess(null); setShowCreateModal(true) }} className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 transition-colors flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-base">add</span>
            Create User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Search by username or email..."
            aria-label="Search by username or email"
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(0) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">badge</span>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }} aria-label="Filter by role" className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 appearance-none bg-white min-w-[160px]">
            <option value="">All Roles</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
            <option value="system_admin">System Admin</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">circle</span>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }} aria-label="Filter by status" className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 appearance-none bg-white min-w-[160px]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"><LoadingSpinner /></div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"><p className="text-red-600">Failed to load users.</p></div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"><p className="text-slate-500">No users found.</p></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((u) => {
              const status = getUserStatus(u)

              return (
                <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-secondary/20 transition-all duration-200 group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-sm">
                      {u.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-slate-900 truncate">{u.username}</h3>
                        {u.id === useAuthStore.getState().user?.id && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded font-medium">You</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={u.role} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                      <span className="text-sm text-slate-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never logged in'}</span>
                    </div>
                    {u.employee_id && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-sm">badge</span>
                        <span className="text-sm text-slate-500">ID: {u.employee_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => setDetailUser(u)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      View
                    </button>
                    <button onClick={() => { setSelectedUser(u); setNewPassword(''); setResetError(null); setResetSuccess(null); setShowResetModal(true) }} disabled={resetPasswordMutation.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50">
                      {resetPasswordMutation.isPending ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-lg">lock_reset</span>}
                      Reset
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-slate-500">Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Create new user" onKeyDown={(e) => e.key === 'Escape' && setShowCreateModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">Create New User</h3>
              {createError && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{createError}</div>}
            {createSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">{createSuccess}</div>}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Employee</label>
                <InstructorCombobox
                  value={newUser.selectedEmployee}
                  onChange={(emp) => {
                    setNewUser((prev) => ({
                      ...prev,
                      selectedEmployee: emp,
                      employee_id: emp ? emp.id : 0,
                    }))
                  }}
                />
                {!newUser.selectedEmployee && <p className="text-xs text-slate-500 mt-1">Search and select an employee</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Username *</label>
                <input type="text" required value={newUser.username} onChange={(e) => setNewUserField('username', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Password *</label>
                <input type="password" required value={newUser.password} onChange={(e) => setNewUserField('password', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Role *</label>
                <select value={newUser.role} onChange={(e) => { const v = e.target.value; if (v === 'instructor' || v === 'admin' || v === 'system_admin') setNewUserField('role', v) }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20">
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                  <option value="system_admin">System Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createUserMutation.isPending || !newUser.selectedEmployee || !newUser.selectedEmployee?.is_active} className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {createUserMutation.isPending && <LoadingSpinner size="sm" variant="light" />}
                  Create User
                </button>
              </div>
              {!newUser.selectedEmployee && <p className="text-xs text-slate-500 mt-1">Search and select an employee</p>}
              {newUser.selectedEmployee && !newUser.selectedEmployee.is_active && <p className="text-xs text-red-500 mt-1">Cannot create account for inactive employee</p>}
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Reset password" onKeyDown={(e) => e.key === 'Escape' && (setShowResetModal(false), setSelectedUser(null), setNewPassword(''))}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">Reset Password</h3>
            <p className="text-sm text-slate-600 mb-4">Enter a new password for <strong>{selectedUser.username}</strong></p>
            {resetError && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{resetError}</div>}
            {resetSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">{resetSuccess}</div>}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">New Password *</label>
                <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20" />
                <p className="text-xs text-slate-500 mt-1">Password must be at least 8 characters</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowResetModal(false); setSelectedUser(null); setNewPassword('') }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={resetPasswordMutation.isPending || newPassword.length < 8} className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {resetPasswordMutation.isPending && <LoadingSpinner size="sm" variant="light" />}
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}

      {/* Invite Modal */}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  )
}
