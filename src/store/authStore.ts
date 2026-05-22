import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logout as logoutApi } from '../api/auth'
import type { User } from '../api/auth/types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => Promise<void>
  setTokens: (token: string, refreshToken: string) => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true }),
      logout: async () => {
        try {
          await logoutApi()
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn('Logout API call failed:', err)
          }
        }
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
      },
      setTokens: (token, refreshToken) =>
        set({ token, refreshToken }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)

// Cross-tab sync: when auth-storage changes in another tab (e.g., logout),
// re-read persisted state to stay consistent
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth-storage') {
      try {
        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed?.state) {
            useAuthStore.setState(parsed.state)
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
  })
}
