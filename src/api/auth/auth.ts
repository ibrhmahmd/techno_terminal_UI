import { client } from '../client'
import type { ApiResponse, PaginatedApiResponse } from '../../types/api'
import type { User, Session, AuditLogEntry } from './types'

export interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data: {
    access_token: string
    refresh_token: string
    token_type: string
    user: User
  }
  message: string
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>('/auth/login', credentials)
  return response.data
}

interface RefreshRequest {
  refresh_token: string
}

export interface CreateUserRequest {
  employee_id: number
  username: string
  password: string
  role: 'admin' | 'system_admin' | 'instructor'
}

export interface ResetPasswordRequest {
  new_password: string
}

export async function refreshToken(request: RefreshRequest): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>('/auth/refresh', request)
  return response.data
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout')
}

export async function getCurrentUser(): Promise<User> {
  const response = await client.get<ApiResponse<User>>('/auth/me')
  const user = response.data.data
  if (!user.is_active) {
    throw new Error('Account deactivated')
  }
  return user
}

export async function createUser(request: CreateUserRequest): Promise<User> {
  const response = await client.post<ApiResponse<User>>('/auth/users', request)
  return response.data.data
}

export async function resetPassword(userId: number, request: ResetPasswordRequest): Promise<void> {
  await client.post<ApiResponse<void>>(`/auth/users/${userId}/reset-password`, request)
}

// --- New Self-Service Endpoints ---

export interface RegisterRequest {
  token: string
  username: string
  password: string
}

export async function register(request: RegisterRequest): Promise<User> {
  const response = await client.post<ApiResponse<User>>('/auth/register', request)
  return response.data.data
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
}

export async function updateProfile(request: UpdateProfileRequest): Promise<User> {
  const response = await client.patch<ApiResponse<User>>('/auth/me', request)
  return response.data.data
}

export async function getSessions(): Promise<Session[]> {
  const response = await client.get<ApiResponse<Session[]>>('/auth/me/sessions')
  return response.data.data
}

export async function revokeAllSessions(): Promise<void> {
  await client.post('/auth/me/sessions/logout-all')
}

export interface ActivityQuery {
  skip?: number
  limit?: number
}

export async function getMyActivity(query?: ActivityQuery): Promise<PaginatedApiResponse<AuditLogEntry>> {
  const response = await client.get<PaginatedApiResponse<AuditLogEntry>>('/auth/me/activity', { params: query })
  return response.data
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await client.post('/auth/change-password', request)
}

export interface ForgotPasswordRequest {
  email: string
}

export async function forgotPassword(request: ForgotPasswordRequest): Promise<void> {
  await client.post('/auth/forgot-password', request)
}
