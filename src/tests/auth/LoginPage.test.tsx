import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '../../pages/LoginPage'
import type { User } from '../../store/authStore'

const mockLogin = vi.fn()
let mockIsAuthenticated = false
const mockStoreLogin = vi.fn()

vi.mock('../../api/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      isAuthenticated: mockIsAuthenticated,
      token: mockIsAuthenticated ? 'mock-token' : null,
      login: mockStoreLogin,
    }
    return selector ? selector(state) : state
  },
}))

const DashboardStub = () => <div data-testid="dashboard">Dashboard</div>

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardStub />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsAuthenticated = false
    mockLogin.mockReset()
    mockStoreLogin.mockReset()
  })

  it('renders email and password inputs', () => {
    renderLoginPage()
    expect(screen.getByLabelText('Email')).toBeDefined()
    expect(screen.getByLabelText('Password')).toBeDefined()
  })

  it('renders sign in button', () => {
    renderLoginPage()
    expect(screen.getByText('Sign In')).toBeDefined()
  })

  it('submit button is disabled when fields are empty', () => {
    renderLoginPage()
    const button = screen.getByText('Sign In') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('submit button is enabled when fields are filled', () => {
    renderLoginPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pwd' } })
    const button = screen.getByText('Sign In') as HTMLButtonElement
    expect(button.disabled).toBe(false)
  })

  it('calls login on form submit', async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      data: {
        access_token: 'at',
        refresh_token: 'rt',
        user: { id: 1, email: 'a@b.com', role: 'admin' } as User,
      },
      message: 'OK',
    })

    renderLoginPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pwd' } })
    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pwd' })
    })
  })

  it('shows loading spinner during submission', async () => {
    let resolvePromise!: (value: unknown) => void
    mockLogin.mockReturnValueOnce(new Promise((resolve) => { resolvePromise = resolve }))

    renderLoginPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pwd' } })
    fireEvent.click(screen.getByText('Sign In'))

    expect(document.querySelector('.loading-spinner')).toBeDefined()
    resolvePromise({
      success: true,
      data: {
        access_token: 'at',
        refresh_token: 'rt',
        user: { id: 1, email: 'a@b.com', role: 'admin' } as User,
      },
      message: 'OK',
    })
  })

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Unauthorized'))

    renderLoginPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeDefined()
    })
  })

  it('does not show login form when already authenticated', () => {
    mockIsAuthenticated = true

    renderLoginPage()
    expect(screen.queryByText('Sign In')).toBeNull()
  })

  it('shows rate limit message on 429 response with Retry-After', async () => {
    const error = {
      response: { status: 429, headers: { 'retry-after': '30' } },
    }
    mockLogin.mockRejectedValueOnce(error)

    renderLoginPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pwd' } })
    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(screen.getByText(/Too many attempts/)).toBeDefined()
    })
  })

  it('disables submit button during rate limit countdown', async () => {
    const error = {
      response: { status: 429, headers: { 'retry-after': '30' } },
    }
    mockLogin.mockRejectedValueOnce(error)

    renderLoginPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pwd' } })
    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      const button = screen.getByText('Sign In') as HTMLButtonElement
      expect(button.disabled).toBe(true)
    })
  })

  it('inputs are disabled during loading', async () => {
    let resolvePromise!: (value: unknown) => void
    mockLogin.mockReturnValueOnce(new Promise((resolve) => { resolvePromise = resolve }))

    renderLoginPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pwd' } })
    fireEvent.click(screen.getByText('Sign In'))

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    expect(emailInput.disabled).toBe(true)
    expect(passwordInput.disabled).toBe(true)

    resolvePromise({
      success: true,
      data: {
        access_token: 'at',
        refresh_token: 'rt',
        user: { id: 1, email: 'a@b.com', role: 'admin' } as User,
      },
      message: 'OK',
    })
  })
})
