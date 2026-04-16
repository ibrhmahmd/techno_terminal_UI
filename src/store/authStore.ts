import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logout as logoutApi } from '../api/auth'

// Full User interface matching API contract
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

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => Promise<void>
  setTokens: (token: string, refreshToken: string) => void
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
        // Call API logout to invalidate token server-side
        try {
          await logoutApi()
        } catch (err) {
          // Silently fail - we'll clear local state regardless
          console.warn('Logout API call failed:', err)
        }
        // Clear local state
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
      },
      setTokens: (token, refreshToken) =>
        set({ token, refreshToken }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
