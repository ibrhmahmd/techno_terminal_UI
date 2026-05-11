import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../../store/authStore'

vi.mock('../../api/auth', () => ({
  logout: vi.fn(),
}))

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  })

  it('initial state has null tokens and unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('login sets token, refreshToken, user, and isAuthenticated', () => {
    const user = {
      id: 1,
      employee_id: 100,
      username: 'admin',
      email: 'admin@test.com',
      role: 'admin',
      is_active: true,
      last_login: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    }

    useAuthStore.getState().login('access-token', 'refresh-token', user)

    const state = useAuthStore.getState()
    expect(state.token).toBe('access-token')
    expect(state.refreshToken).toBe('refresh-token')
    expect(state.user).toEqual(user)
    expect(state.isAuthenticated).toBe(true)
  })

  it('logout clears all state and calls logout API', async () => {
    const user = {
      id: 1,
      employee_id: 100,
      username: 'admin',
      email: 'admin@test.com',
      role: 'admin',
      is_active: true,
      last_login: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    }
    useAuthStore.getState().login('token', 'refresh', user)

    const { logout: mockedLogout } = await import('../../api/auth')
    await useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(mockedLogout).toHaveBeenCalled()
  })

  it('logout clears state even when API call fails', async () => {
    const user = {
      id: 1,
      employee_id: 100,
      username: 'admin',
      email: 'admin@test.com',
      role: 'admin',
      is_active: true,
      last_login: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    }
    useAuthStore.getState().login('token', 'refresh', user)

    const { logout: mockedLogout } = await import('../../api/auth')
    vi.mocked(mockedLogout).mockRejectedValueOnce(new Error('Network error'))

    await useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setTokens updates only token and refreshToken', () => {
    const user = {
      id: 1,
      employee_id: 100,
      username: 'admin',
      email: 'admin@test.com',
      role: 'admin',
      is_active: true,
      last_login: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    }
    useAuthStore.getState().login('old-token', 'old-refresh', user)

    useAuthStore.getState().setTokens('new-token', 'new-refresh')

    const state = useAuthStore.getState()
    expect(state.token).toBe('new-token')
    expect(state.refreshToken).toBe('new-refresh')
    expect(state.user).toEqual(user)
    expect(state.isAuthenticated).toBe(true)
  })

  it('login then logout resets state correctly', async () => {
    useAuthStore.getState().login('token', 'refresh', {
      id: 1,
      employee_id: 100,
      username: 'admin',
      email: 'admin@test.com',
      role: 'admin',
      is_active: true,
      last_login: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    })

    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    await useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
