import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  login, logout, refreshToken, getCurrentUser,
  createUser, resetPassword,
} from '../../api/auth'
import type { LoginCredentials, CreateUserRequest, ResetPasswordRequest } from '../../api/auth'

const { mockPost, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
}))

vi.mock('../../api/client', () => ({
  default: { post: mockPost, get: mockGet },
}))

const { mockStoreLogout } = vi.hoisted(() => ({
  mockStoreLogout: vi.fn(),
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({ logout: mockStoreLogout }),
  },
}))

describe('Auth API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login calls POST /auth/login with credentials', async () => {
    const credentials: LoginCredentials = { email: 'test@test.com', password: 'pwd' }
    const mockResponse = {
      data: {
        success: true,
        data: { access_token: 'at', refresh_token: 'rt', token_type: 'bearer', user: { id: 1 } },
        message: 'OK',
      },
    }
    mockPost.mockResolvedValueOnce(mockResponse)

    const result = await login(credentials)

    expect(mockPost).toHaveBeenCalledWith('/auth/login', credentials)
    expect(result).toEqual(mockResponse.data)
  })

  it('logout calls POST /auth/logout', async () => {
    mockPost.mockResolvedValueOnce({})

    await logout()

    expect(mockPost).toHaveBeenCalledWith('/auth/logout')
  })

  it('refreshToken calls POST /auth/refresh with refresh_token', async () => {
    const request = { refresh_token: 'rt' }
    const mockResponse = {
      data: {
        success: true,
        data: { access_token: 'at', refresh_token: 'rt', token_type: 'bearer', user: { id: 1 } },
        message: 'OK',
      },
    }
    mockPost.mockResolvedValueOnce(mockResponse)

    const result = await refreshToken(request)

    expect(mockPost).toHaveBeenCalledWith('/auth/refresh', request)
    expect(result).toEqual(mockResponse.data)
  })

  it('getCurrentUser calls GET /auth/me and returns user', async () => {
    const userData = {
      id: 1, employee_id: 100, username: 'admin',
      email: 'admin@test.com', role: 'admin',
      is_active: true, last_login: '', created_at: null,
    }
    mockGet.mockResolvedValueOnce({ data: { success: true, data: userData, message: null } })

    const result = await getCurrentUser()

    expect(mockGet).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(userData)
  })

  it('getCurrentUser logs out and redirects when account is inactive', async () => {
    const userData = {
      id: 1, employee_id: 100, username: 'admin',
      email: 'admin@test.com', role: 'admin',
      is_active: false, last_login: '', created_at: null,
    }
    mockGet.mockResolvedValueOnce({ data: { success: true, data: userData, message: null } })

    const replaceSpy = vi.spyOn(window.location, 'replace').mockImplementation(() => {})

    await expect(getCurrentUser()).rejects.toThrow('Account deactivated')
    expect(mockStoreLogout).toHaveBeenCalled()
    expect(replaceSpy).toHaveBeenCalledWith('/login')

    replaceSpy.mockRestore()
  })

  it('createUser calls POST /auth/users with user data', async () => {
    const request: CreateUserRequest = { employee_id: 100, username: 'newuser', password: 'pwd123', role: 'admin' }
    const userData = {
      id: 2, employee_id: 100, username: 'newuser',
      email: '', role: 'admin', is_active: true, last_login: '', created_at: null,
    }
    mockPost.mockResolvedValueOnce({ data: { success: true, data: userData, message: null } })

    const result = await createUser(request)

    expect(mockPost).toHaveBeenCalledWith('/auth/users', request)
    expect(result).toEqual(userData)
  })

  it('resetPassword calls POST /auth/users/:id/reset-password', async () => {
    const userId = 1
    const request: ResetPasswordRequest = { new_password: 'newpwd123' }
    mockPost.mockResolvedValueOnce({ data: { success: true, data: null, message: null } })

    await resetPassword(userId, request)

    expect(mockPost).toHaveBeenCalledWith(`/auth/users/${userId}/reset-password`, request)
  })
})
