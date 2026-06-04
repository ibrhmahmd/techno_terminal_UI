import { client } from '../client'
import type { PaginatedApiResponse } from '../../types/api'
import type { User, AuditLogEntry } from './types'

export interface AdminUserQuery {
  skip?: number
  limit?: number
  is_active?: boolean
  role?: string
  q?: string
}

export async function getUsers(query?: AdminUserQuery): Promise<PaginatedApiResponse<User>> {
  const response = await client.get<PaginatedApiResponse<User>>('/admin/users', { params: query })
  return response.data
}

export async function getUser(id: number): Promise<User> {
  const response = await client.get<{ success: boolean; data: User }>(`/admin/users/${id}`)
  return response.data.data
}

export interface UpdateUserRequest {
  role?: string
  is_active?: boolean
}

export async function updateUser(id: number, request: UpdateUserRequest): Promise<User> {
  const response = await client.patch<{ success: boolean; data: User }>(`/admin/users/${id}`, request)
  return response.data.data
}

export async function deleteUser(id: number): Promise<void> {
  await client.delete(`/admin/users/${id}`)
}

export interface InviteUserRequest {
  email: string
  role: string
  employee_id: number
}

interface InviteResponse {
  id: number
  username: string
  role: string
  is_active: false
  invite_expires_at: string
}

export async function inviteUser(request: InviteUserRequest): Promise<InviteResponse> {
  const response = await client.post<{ success: boolean; data: InviteResponse }>('/admin/users/invite', request)
  return response.data.data
}

export interface AuditQuery {
  user_id?: number
  from?: string
  to?: string
  skip?: number
  limit?: number
}

export async function getAuditLogins(query?: AuditQuery): Promise<PaginatedApiResponse<AuditLogEntry>> {
  const response = await client.get<PaginatedApiResponse<AuditLogEntry>>('/admin/audit/logins', { params: query })
  return response.data
}

export async function getAuditPasswordChanges(query?: AuditQuery): Promise<PaginatedApiResponse<AuditLogEntry>> {
  const response = await client.get<PaginatedApiResponse<AuditLogEntry>>('/admin/audit/password-changes', { params: query })
  return response.data
}

export interface FailedAttemptsQuery {
  from: string
  to?: string
  skip?: number
  limit?: number
}

export async function getAuditFailedAttempts(query: FailedAttemptsQuery): Promise<PaginatedApiResponse<AuditLogEntry>> {
  const response = await client.get<PaginatedApiResponse<AuditLogEntry>>('/admin/audit/failed-attempts', { params: query })
  return response.data
}
