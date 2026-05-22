import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateProfile,
  changePassword,
  getSessions,
  revokeAllSessions,
  getMyActivity,
  getCurrentUser,
  forgotPassword,
  register,
  createUser,
  resetPassword,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
  type ActivityQuery,
  type RegisterRequest,
  type ForgotPasswordRequest,
  type CreateUserRequest,
  type ResetPasswordRequest,
} from '../api/auth'
import {
  getUsers,
  updateUser,
  deactivateUser,
  inviteUser,
  getAuditLogins,
  getAuditPasswordChanges,
  getAuditFailedAttempts,
  type AdminUserQuery,
  type UpdateUserRequest,
  type InviteUserRequest,
  type AuditQuery,
  type FailedAttemptsQuery,
} from '../api/auth/admin'
import { useAuthStore } from '../store/authStore'
import { queryKeys } from './queryKeys'

// --- Profile ---

export function useCurrentUser() {
  const logout = useAuthStore((s) => s.logout)
  const query = useQuery({
    queryKey: queryKeys.auth.all,
    queryFn: getCurrentUser,
    staleTime: 300_000,
    retry: false,
  })

  useEffect(() => {
    if (query.error instanceof Error && query.error.message === 'Account deactivated') {
      logout()
      window.location.replace('/login')
    }
  }, [query.error, logout])

  return query
}

export function useUpdateProfile() {
  const updateUserInStore = useAuthStore((s) => s.updateUser)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (user) => {
      updateUserInStore(user)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
  })
}

// --- Password ---

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
  })
}

// --- Sessions ---

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.auth.sessions,
    queryFn: getSessions,
    staleTime: 60_000,
  })
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions })
    },
  })
}

// --- Activity ---

export function useMyActivity(query?: ActivityQuery) {
  return useQuery({
    queryKey: [...queryKeys.auth.activity, query],
    queryFn: () => getMyActivity(query),
    staleTime: 120_000,
  })
}

// --- Admin Users ---

export function useUsers(query?: AdminUserQuery) {
  return useQuery({
    queryKey: [...queryKeys.auth.users, query],
    queryFn: () => getUsers(query),
    staleTime: 0,
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) => updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users })
      qc.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users })
      qc.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
  })
}

export function useInviteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: InviteUserRequest) => inviteUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users })
    },
  })
}

// --- Registration ---

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
  })
}

// --- Create & Reset Mutations ---

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users })
      qc.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
  })
}

export function useResetPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResetPasswordRequest }) => resetPassword(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.users })
    },
  })
}

// --- Audit ---

export function useAuditLogins(query?: AuditQuery) {
  return useQuery({
    queryKey: [...queryKeys.auth.auditLogins, query],
    queryFn: () => getAuditLogins(query),
    staleTime: 120_000,
  })
}

export function useAuditPasswordChanges(query?: AuditQuery) {
  return useQuery({
    queryKey: [...queryKeys.auth.auditPasswordChanges, query],
    queryFn: () => getAuditPasswordChanges(query),
    staleTime: 120_000,
  })
}

export function useAuditFailedAttempts(query: FailedAttemptsQuery) {
  return useQuery({
    queryKey: [...queryKeys.auth.auditFailedAttempts, query],
    queryFn: () => getAuditFailedAttempts(query),
    staleTime: 120_000,
    enabled: !!query.from,
  })
}
