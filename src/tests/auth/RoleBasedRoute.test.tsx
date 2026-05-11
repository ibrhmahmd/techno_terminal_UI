import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { RoleBasedRoute, AccessDenied } from '../../components/common/RoleBasedRoute'

let mockUser: { role: string } | null = null
let mockIsAuthenticated = false

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      user: mockUser,
      isAuthenticated: mockIsAuthenticated,
    }
    return selector ? selector(state) : state
  },
}))

function ProtectedOutlet() {
  return <div data-testid="protected-content">Protected Content</div>
}

function renderRoleBasedRoute(allowedRoles: string[], redirectTo?: string) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<RoleBasedRoute allowedRoles={allowedRoles} redirectTo={redirectTo} />}>
          <Route path="/protected" element={<ProtectedOutlet />} />
        </Route>
        <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RoleBasedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    mockIsAuthenticated = false
  })

  it('renders outlet for authorized role', () => {
    mockUser = { role: 'admin' }
    mockIsAuthenticated = true

    renderRoleBasedRoute(['admin', 'system_admin'])
    expect(screen.getByTestId('protected-content')).toBeDefined()
  })

  it('redirects unauthorized role to dashboard', () => {
    mockUser = { role: 'staff' }
    mockIsAuthenticated = true

    renderRoleBasedRoute(['admin', 'system_admin'])
    expect(screen.getByTestId('dashboard')).toBeDefined()
  })

  it('renders outlet when not authenticated (delegates to ProtectedRoute)', () => {
    mockUser = null
    mockIsAuthenticated = false

    renderRoleBasedRoute(['admin'])
    expect(screen.getByTestId('protected-content')).toBeDefined()
  })

  it('redirects to custom path when redirectTo is provided', () => {
    mockUser = { role: 'staff' }
    mockIsAuthenticated = true

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<RoleBasedRoute allowedRoles={['admin']} redirectTo="/settings" />}>
            <Route path="/protected" element={<ProtectedOutlet />} />
          </Route>
          <Route path="/settings" element={<div data-testid="settings">Settings</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByTestId('settings')).toBeDefined()
  })
})

describe('AccessDenied', () => {
  it('renders the access denied message', () => {
    render(<MemoryRouter><AccessDenied /></MemoryRouter>)
    expect(screen.getByText('Access Denied')).toBeDefined()
    expect(screen.getByText('Return to Dashboard')).toBeDefined()
  })
})
