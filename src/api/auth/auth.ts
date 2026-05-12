import client from '../client'
import type { ApiResponse } from '../../types/api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: number
  employee_id: number
  username: string
  email: string
  role: string
  is_active: boolean
  last_login: string
  created_at: string | null
}

export interface LoginResponse {
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

export interface RefreshRequest {
  refresh_token: string
}

export interface CreateUserRequest {
  employee_id: number
  username: string
  password: string
  role: 'admin' | 'system_admin'
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

  // If account has been deactivated, force logout and redirect
  if (!user.is_active) {
    const { useAuthStore } = await import('../../store/authStore')
    await useAuthStore.getState().logout()
    window.location.replace('/login')
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
