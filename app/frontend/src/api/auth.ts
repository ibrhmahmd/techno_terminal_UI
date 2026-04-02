import client from './client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: number
  email: string
  role: string
}

export interface LoginResponse {
  success: boolean
  data: {
    access_token: string
    user: User
  }
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>('/auth/login', credentials)
  return response.data
}
