import { describe, it, expect, vi, beforeEach } from 'vitest'

let capturedRequestInterceptor: ((config: any) => any) | null = null
let capturedResponseErrorInterceptor: ((error: any) => any) | null = null

const mockAxiosInstance = {
  interceptors: {
    request: {
      use: vi.fn((cb: any) => { capturedRequestInterceptor = cb }),
    },
    response: {
      use: vi.fn((_success: any, error: any) => { capturedResponseErrorInterceptor = error }),
    },
  },
  post: vi.fn(),
  get: vi.fn(),
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}))

// Mock useAuthStore
let mockToken: string | null = null
vi.mock('../../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      token: mockToken,
      refreshToken: 'mock-refresh-token',
      setTokens: vi.fn(),
      logout: vi.fn(),
    }),
  },
}))

// Need to re-evaluate the module to get the interceptor registered
const { createApiClient } = await import('../../api/client')

describe('API Client - Request Interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken = null
    capturedRequestInterceptor = null
    capturedResponseErrorInterceptor = null
    createApiClient()
  })

  function runRequestInterceptor(url: string, headers: Record<string, unknown> = {}) {
    if (!capturedRequestInterceptor) throw new Error('Interceptor not captured')
    return capturedRequestInterceptor({ url, headers })
  }

  it('injects Bearer token for non-auth endpoints when token exists', () => {
    mockToken = 'test-token'
    const config = runRequestInterceptor('/groups')
    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('skips Bearer injection for /auth/login', () => {
    mockToken = 'test-token'
    const config = runRequestInterceptor('/auth/login')
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('skips Bearer injection for /auth/refresh', () => {
    mockToken = 'test-token'
    const config = runRequestInterceptor('/auth/refresh')
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('injects Bearer for /auth/me', () => {
    mockToken = 'test-token'
    const config = runRequestInterceptor('/auth/me')
    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('injects Bearer for /auth/users', () => {
    mockToken = 'test-token'
    const config = runRequestInterceptor('/auth/users')
    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('injects Bearer for /auth/logout', () => {
    mockToken = 'test-token'
    const config = runRequestInterceptor('/auth/logout')
    expect(config.headers.Authorization).toBe('Bearer test-token')
  })

  it('does not add Bearer header when no token exists', () => {
    mockToken = null
    const config = runRequestInterceptor('/groups')
    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('API Client - Response Interceptor (login 401)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedResponseErrorInterceptor = null
    createApiClient()
  })

  it('passes through 401 errors from /auth/login without redirecting', async () => {
    const error = {
      response: { status: 401 },
      config: { url: '/auth/login' },
    }

    const result = capturedResponseErrorInterceptor!(error)
    await expect(result).rejects.toEqual(error)
  })
})
