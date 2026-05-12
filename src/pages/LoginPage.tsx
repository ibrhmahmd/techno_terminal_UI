import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { login } from '../api/auth'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login: storeLogin } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for rate-limit Retry-After
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRetryAfter(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await login({ email, password })
      if (response.success) {
        storeLogin(
          response.data.access_token,
          response.data.refresh_token,
          response.data.user
        )
        navigate('/dashboard')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (err) {
      const axiosError = err as { response?: { status?: number; headers?: Record<string, string> } }
      if (axiosError.response?.status === 429) {
        const retryAfterValue = axiosError.response.headers?.['retry-after']
        if (retryAfterValue) {
          const seconds = parseInt(retryAfterValue, 10)
          if (!isNaN(seconds)) {
            setRetryAfter(seconds)
            setCountdown(seconds)
          } else {
            const date = new Date(retryAfterValue)
            if (!isNaN(date.getTime())) {
              const diff = Math.ceil((date.getTime() - Date.now()) / 1000)
              const secs = Math.max(1, diff)
              setRetryAfter(secs)
              setCountdown(secs)
            }
          }
        }
      } else {
        setError('Invalid email or password.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight mb-1">
            TechnoTerminal
          </h1>
          <p className="text-sm text-on-surface-variant">CRM Sign In</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Rate Limit Message */}
          {retryAfter && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
              <span className="material-symbols-outlined text-lg">timer</span>
              <span>Too many attempts. Try again in {countdown} second{countdown !== 1 ? 's' : ''}.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-on-surface">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@techno.com"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-on-surface">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password || retryAfter !== null}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" variant="light" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
