import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useRegister } from '../hooks/useAuthQueries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { isAuthenticated } = useAuthStore()
  const registerMutation = useRegister()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg border border-slate-100 text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">link_off</span>
          <h1 className="font-headline text-xl font-bold text-on-surface mb-2">Invalid Invite Link</h1>
          <p className="text-sm text-slate-600">
            This invite link is missing a registration token. Please check your email for the full link.
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await registerMutation.mutateAsync({ token, username, password })
      navigate('/login')
    } catch {
      setError('Registration failed. The invite link may be invalid or expired. Please contact your administrator.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight mb-1">
            Complete Registration
          </h1>
          <p className="text-sm text-on-surface-variant">
            Set up your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-on-surface">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              disabled={registerMutation.isPending}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-on-surface">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 12 characters"
              required
              minLength={12}
              disabled={registerMutation.isPending}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-on-surface">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={12}
              disabled={registerMutation.isPending}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending || !username || !password || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending ? (
              <LoadingSpinner size="sm" variant="light" />
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
