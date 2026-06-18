import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../store/authStore'
import { type CreateUserRequest, type User } from '../../api/auth'
import { useUsers, useUpdateUser, useDeleteUser, useInviteUser, useCreateUser, useResetPassword } from '../../hooks/useAuthQueries'
import { useDebounce } from '../../hooks/useDebounce'
import { formatDate } from '../../utils/formatting'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { InstructorCombobox } from '../staff/InstructorCombobox'
import type { EmployeeListItem } from '../../api/hr'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function useFocusTrap(containerRef: React.RefObject<HTMLDivElement | null>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return
    const container = containerRef.current
    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE)
    firstFocusable?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return
      const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusables.length < 2) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, isActive])
}

interface UserDetailModalProps {
  user: User
  onClose: () => void
}

const ROLE_STYLES: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  system_admin: { label: 'System Admin', bg: 'bg-purple-500/10', text: 'text-purple-700', icon: 'admin_panel_settings' },
  admin: { label: 'Admin', bg: 'bg-blue-500/10', text: 'text-blue-700', icon: 'shield' },
  instructor: { label: 'Instructor', bg: 'bg-amber-500/10', text: 'text-amber-700', icon: 'school' },
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  Active: { label: 'Active', bg: 'bg-secondary/15', text: 'text-secondary', dot: 'bg-secondary' },
  Invited: { label: 'Invited', bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500' },
  Deactivated: { label: 'Deactivated', bg: 'bg-slate-500/10', text: 'text-slate-600', dot: 'bg-slate-500' },
}

function getUserStatus(user: User): 'Active' | 'Invited' | 'Deactivated' {
  if (!user.is_active) return 'Deactivated'
  if (user.last_login) return 'Active'
  return 'Invited'
}

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] || { label: role, bg: 'bg-slate-500/10', text: 'text-slate-600', icon: 'badge' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className="material-symbols-outlined text-xs" aria-hidden="true">{style.icon}</span>
      {style.label}
    </span>
  )
}

function StatusBadge({ status }: { status: 'Active' | 'Invited' | 'Deactivated' }) {
  const style = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}

function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const deactivateConfirmRef = useRef<HTMLDivElement>(null)
  const deleteConfirmRef = useRef<HTMLDivElement>(null)
  const { user: currentUser } = useAuthStore()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isReactivating, setIsReactivating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isSelf = currentUser?.id === user.id
  const status = getUserStatus(user)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeactivateConfirm && !showDeleteConfirm) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, showDeactivateConfirm, showDeleteConfirm])

  useFocusTrap(overlayRef, true)
  useFocusTrap(deactivateConfirmRef, showDeactivateConfirm)
  useFocusTrap(deleteConfirmRef, showDeleteConfirm)

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
      await updateUserMutation.mutateAsync({ id: user.id, data: { is_active: false } })
      setShowDeactivateConfirm(false)
      onClose()
    } finally {
      setIsDeactivating(false)
    }
  }

  const handleReactivate = async () => {
    setIsReactivating(true)
    try {
      await updateUserMutation.mutateAsync({ id: user.id, data: { is_active: true } })
      onClose()
    } finally {
      setIsReactivating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteUserMutation.mutateAsync(user.id)
      setShowDeleteConfirm(false)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-body" role="dialog" aria-modal="true" aria-label={`User details: ${user.username}`}>
      <div className="bg-white rounded-[6px] shadow-sm p-6 w-full max-w-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[6px] bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-xl">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">{user.username}</h3>
              <p className="text-sm text-slate-500 font-mono">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 p-1 rounded-[6px] hover:bg-slate-100 transition-colors duration-120">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee ID</label>
            <p className="text-sm text-on-surface mt-1">{user.employee_id ?? 'N/A'}</p>
          </div>
          <div>
            <label htmlFor="detail-role" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
            <div className="mt-1">
              {isSelf ? (
                <RoleBadge role={user.role} />
              ) : (
                <select
                  id="detail-role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  onBlur={handleRoleChange}
                  className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1 text-sm rounded-none outline-none transition-colors"
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                  <option value="system_admin">System Admin</option>
                </select>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</label>
            <p className="text-sm text-slate-500 mt-1">{user.last_login ? formatDate(user.last_login) : 'Never'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Created</label>
            <p className="text-sm text-slate-500 mt-1">{user.created_at ? formatDate(user.created_at) : 'N/A'}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          {!isSelf && user.is_active && (
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              disabled={isDeactivating}
              className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-500/10 rounded-[6px] hover:bg-amber-500/15 disabled:opacity-50 flex items-center gap-2 duration-120"
            >
              {isDeactivating ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-lg" aria-hidden="true">person_off</span>}
              Deactivate
            </button>
          )}
          {!isSelf && !user.is_active && (
            <>
              <button
                onClick={handleReactivate}
                disabled={isReactivating}
                className="px-4 py-2 text-sm font-medium text-secondary bg-secondary/15 rounded-[6px] hover:bg-secondary/20 disabled:opacity-50 flex items-center gap-2 duration-120"
              >
                {isReactivating ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-lg" aria-hidden="true">how_to_reg</span>}
                Reactivate
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-500/10 rounded-[6px] hover:bg-red-500/15 disabled:opacity-50 flex items-center gap-2 duration-120"
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-lg" aria-hidden="true">delete_forever</span>}
                Delete
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-[6px] hover:bg-slate-200 transition-colors duration-120 ml-auto"
          >
            Close
          </button>
        </div>

        {showDeactivateConfirm && (
          <div ref={deactivateConfirmRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" role="dialog" aria-modal="true" aria-label="Confirm deactivation" onKeyDown={(e) => e.key === 'Escape' && setShowDeactivateConfirm(false)}>
            <div className="bg-white rounded-[6px] shadow-sm p-6 w-full max-w-sm">
              <h4 className="font-headline text-base font-semibold text-on-surface mb-2">Deactivate User?</h4>
              <p className="text-sm text-slate-600 mb-6 font-body">
                This will soft-deactivate <strong>{user.username}</strong>. They will not be able to log in. This action can be reversed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeactivateConfirm(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-[6px] text-sm font-medium hover:bg-slate-200 duration-120">Cancel</button>
                <button onClick={handleDeactivate} disabled={isDeactivating} className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-[6px] text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 duration-120">
                  {isDeactivating && <LoadingSpinner size="sm" variant="light" />}
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div ref={deleteConfirmRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" role="dialog" aria-modal="true" aria-label="Confirm deletion" onKeyDown={(e) => e.key === 'Escape' && setShowDeleteConfirm(false)}>
            <div className="bg-white rounded-[6px] shadow-sm p-6 w-full max-w-sm">
              <h4 className="font-headline text-base font-semibold text-red-600 mb-2">Delete Permanently?</h4>
              <p className="text-sm text-slate-600 mb-6 font-body">
                This will permanently delete <strong>{user.username}</strong> and all associated audit logs. This action <strong>cannot be undone</strong>.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-[6px] text-sm font-medium hover:bg-slate-200 duration-120">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-[6px] text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 duration-120">
                  {isDeleting && <LoadingSpinner size="sm" variant="light" />}
                  Delete
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
  const overlayRef = useRef<HTMLDivElement>(null)
  const inviteUserMutation = useInviteUser()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
  useFocusTrap(overlayRef, true)
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
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create user. Please try again.')
      }
    }
  }

  if (result) {
    return (
      <div ref={overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-body" role="dialog" aria-modal="true" aria-label="Invite sent">
        <div className="bg-white rounded-[6px] shadow-sm p-6 w-full max-w-md">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-secondary mb-3" aria-hidden="true">mail</span>
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">Invite Sent!</h3>
            <p className="text-sm text-slate-600 mb-4">
              Invite expires at {formatDate(result.invite_expires_at)}
            </p>
            <button onClick={onClose} className="px-4 py-2 bg-secondary text-white rounded-[6px] font-medium hover:opacity-90 duration-120">Done</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-body" role="dialog" aria-modal="true" aria-label="Invite user">
      <div className="bg-white rounded-[6px] shadow-sm p-6 w-full max-w-md">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">Invite User</h3>

        {error && <div className="mb-4 p-3 bg-red-500/10 rounded-[6px] text-sm text-red-700 font-semibold" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employee</label>
            <InstructorCombobox
              value={selectedEmployee}
              onChange={setSelectedEmployee}
            />
            {!selectedEmployee && <p className="text-xs text-slate-500 mt-1">Search and select an employee to invite</p>}
          </div>
          <div>
            <label htmlFor="invite-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email *</label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role *</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => { const v = e.target.value; if (v === 'admin' || v === 'system_admin') setRole(v as 'admin' | 'system_admin') }}
              className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
            >
              <option value="admin">Admin</option>
              <option value="system_admin">System Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-[6px] text-sm font-medium hover:bg-slate-200 duration-120">Cancel</button>
            <button
              type="submit"
              disabled={inviteUserMutation.isPending || !selectedEmployee || !selectedEmployee?.is_active}
              className="flex-1 px-4 py-2 bg-secondary text-white rounded-[6px] font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 duration-120"
            >
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
  const createOverlayRef = useRef<HTMLDivElement>(null)
  const resetOverlayRef = useRef<HTMLDivElement>(null)
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const limit = 50
  const debouncedSearch = useDebounce(searchInput, 350)

  const query = {
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
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

  useFocusTrap(createOverlayRef, showCreateModal)
  useFocusTrap(resetOverlayRef, showResetModal)

  const users = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

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
    if (newUser.password.length < 12) {
      setCreateError('Password must be at least 12 characters')
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
      if (err instanceof Error) {
        setResetError(err.message)
      } else {
        setResetError('Failed to reset password. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6 font-body">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-xl font-semibold text-on-surface">User Management</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-[6px] font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm duration-120">
            <span className="material-symbols-outlined text-base" aria-hidden="true">mail</span>
            Invite User
          </button>
          <button onClick={() => { setNewUser({ selectedEmployee: null, employee_id: 0, username: '', password: '', role: 'admin' }); setCreateError(null); setCreateSuccess(null); setShowCreateModal(true) }} className="px-4 py-2 bg-secondary text-white rounded-[6px] font-medium hover:opacity-90 transition-colors flex items-center gap-2 text-sm duration-120">
            <span className="material-symbols-outlined text-base" aria-hidden="true">add</span>
            Create User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="material-symbols-outlined absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" aria-hidden="true">search</span>
          <input
            type="text"
            placeholder="Search by username or email..."
            aria-label="Search by username or email"
            id="user-search"
            onChange={(e) => { setSearchInput(e.target.value); setPage(0) }}
            className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 pl-8 pr-3 py-1.5 text-sm rounded-none outline-none transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setPage(0) }}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
            </button>
          )}
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" aria-hidden="true">badge</span>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }}
            aria-label="Filter by role"
            className="bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 pl-8 pr-8 py-1.5 text-sm rounded-none outline-none appearance-none min-w-[160px] transition-colors"
          >
            <option value="">All Roles</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
            <option value="system_admin">System Admin</option>
          </select>
          <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" aria-hidden="true">expand_more</span>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" aria-hidden="true">circle</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
            aria-label="Filter by status"
            className="bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 pl-8 pr-8 py-1.5 text-sm rounded-none outline-none appearance-none min-w-[160px] transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
          <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" aria-hidden="true">expand_more</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[6px] shadow-sm p-8 text-center"><LoadingSpinner /></div>
      ) : error ? (
        <div className="bg-white rounded-[6px] shadow-sm p-8 text-center"><p className="text-red-600">Failed to load users.</p></div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-[6px] shadow-sm p-8 text-center" role="status"><p className="text-slate-500">No users found.</p></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((u) => {
              const status = getUserStatus(u)

              return (
                <div key={u.id} className="bg-white rounded-[6px] shadow-sm p-5 hover:shadow-md hover:translate-y-[-1px] transition-all duration-120 group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-[6px] bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-lg flex-shrink-0">
                      {u.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-slate-900 truncate">{u.username}</h3>
                        {u.id === useAuthStore.getState().user?.id && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded-[6px] font-semibold">You</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate font-mono">{u.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={u.role} />
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">schedule</span>
                      <span className="text-sm">{u.last_login ? formatDate(u.last_login) : 'Never logged in'}</span>
                    </div>
                    {u.employee_id && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">badge</span>
                        <span className="text-sm">ID: {u.employee_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => setDetailUser(u)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-[6px] hover:bg-slate-200 transition-colors duration-120">
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">visibility</span>
                      View
                    </button>
                    <button onClick={() => { setSelectedUser(u); setNewPassword(''); setResetError(null); setResetSuccess(null); setShowResetModal(true) }} disabled={resetPasswordMutation.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-secondary bg-secondary/15 rounded-[6px] hover:bg-secondary/20 transition-colors duration-120 disabled:opacity-50">
                      {resetPasswordMutation.isPending ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined text-lg" aria-hidden="true">lock_reset</span>}
                      Reset
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4">
              <p className="text-xs text-slate-500">Showing {page * limit + 1}&#8211;{Math.min((page + 1) * limit, total)} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-[6px] hover:bg-slate-200 transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed font-semibold">Previous</button>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-[6px] hover:bg-slate-200 transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed font-semibold">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div ref={createOverlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-body" role="dialog" aria-modal="true" aria-label="Create new user" onKeyDown={(e) => e.key === 'Escape' && setShowCreateModal(false)}>
          <div className="bg-white rounded-[6px] shadow-sm p-6 w-full max-w-md">
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">Create New User</h3>
            {createError && <div className="mb-4 p-3 bg-red-500/10 rounded-[6px] text-sm text-red-700 font-semibold" role="alert">{createError}</div>}
            {createSuccess && <div className="mb-4 p-3 bg-secondary/15 rounded-[6px] text-sm text-secondary font-semibold" role="alert">{createSuccess}</div>}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employee</label>
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
                <label htmlFor="create-username" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Username *</label>
                <input
                  id="create-username"
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUserField('username', e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="create-password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Password *</label>
                <input
                  id="create-password"
                  type="password"
                  required
                  minLength={12}
                  value={newUser.password}
                  onChange={(e) => setNewUserField('password', e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
                  placeholder="Min 12 characters"
                />
                <p className="text-xs text-slate-500 mt-1">Password must be at least 12 characters</p>
              </div>
              <div>
                <label htmlFor="create-role" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role *</label>
                <select
                  id="create-role"
                  value={newUser.role}
                  onChange={(e) => { const v = e.target.value; if (v === 'instructor' || v === 'admin' || v === 'system_admin') setNewUserField('role', v) }}
                  className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                  <option value="system_admin">System Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-[6px] text-sm font-medium hover:bg-slate-200 duration-120">Cancel</button>
                <button type="submit" disabled={createUserMutation.isPending || !newUser.selectedEmployee || !newUser.selectedEmployee?.is_active} className="flex-1 px-4 py-2 bg-secondary text-white rounded-[6px] font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 duration-120">
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
        <div ref={resetOverlayRef} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-body" role="dialog" aria-modal="true" aria-label="Reset password" onKeyDown={(e) => e.key === 'Escape' && (setShowResetModal(false), setSelectedUser(null), setNewPassword(''))}>
          <div className="bg-white rounded-[6px] shadow-sm p-6 w-full max-w-md">
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-2">Reset Password</h3>
            <p className="text-sm text-slate-600 mb-4 font-body font-normal">Enter a new password for <strong>{selectedUser.username}</strong></p>
            {resetError && <div className="mb-4 p-3 bg-red-500/10 rounded-[6px] text-sm text-red-700 font-semibold" role="alert">{resetError}</div>}
            {resetSuccess && <div className="mb-4 p-3 bg-secondary/15 rounded-[6px] text-sm text-secondary font-semibold" role="alert">{resetSuccess}</div>}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">New Password *</label>
                <input
                  id="reset-password"
                  type="password"
                  required
                  minLength={12}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
                  placeholder="Min 12 characters"
                />
                <p className="text-xs text-slate-500 mt-1">Password must be at least 12 characters</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowResetModal(false); setSelectedUser(null); setNewPassword('') }} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-[6px] text-sm font-medium hover:bg-slate-200 duration-120">Cancel</button>
                <button type="submit" disabled={resetPasswordMutation.isPending || newPassword.length < 12} className="flex-1 px-4 py-2 bg-secondary text-white rounded-[6px] font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 duration-120">
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
