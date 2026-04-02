import client from './client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: number
  username: string
  role: string
  is_active: boolean
  employee_id: number
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
