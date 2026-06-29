import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'
import { login } from '../api/auth'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { AuthLayout } from '../components/auth/AuthLayout'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login: storeLogin } = useAuthStore()
  const emailRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered_email'))
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)

  // Redirect if already authenticated (safety net — PublicRoute handles this too)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Auto-focus email input on mount
  useEffect(() => {
    emailRef.current?.focus()
  }, [])

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Persist remember-me preference
    if (rememberMe) {
      localStorage.setItem('remembered_email', email)
    } else {
      localStorage.removeItem('remembered_email')
    }

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
        setError('Invalid email or password.')
      }
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfterValue = err.response.headers?.['retry-after']
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
        } else if (!err.response) {
          // Network error — no response received
          setError('Unable to connect. Please check your internet connection and try again.')
        } else {
          setError('Invalid email or password.')
        }
      } else {
        setError('Invalid email or password.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitDisabled = isLoading || !email || !password || retryAfter !== null

  return (
    <AuthLayout title="Sign In" subtitle="CRM Sign In">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700" role="alert">
            <span className="material-symbols-outlined text-lg shrink-0" aria-hidden="true">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Rate Limit Message */}
        {retryAfter && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700" role="alert" aria-live="polite">
            <span className="material-symbols-outlined text-lg shrink-0" aria-hidden="true">timer</span>
            <span>Too many attempts. Try again in {countdown} second{countdown !== 1 ? 's' : ''}.</span>
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-on-surface">
            Email
          </label>
          <input
            ref={emailRef}
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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 pr-11 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-slate-300 text-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-50"
          />
          <span className="text-sm text-on-surface-variant">Remember me</span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" variant="light" />
          ) : retryAfter ? (
            `Try again in ${countdown}s`
          ) : (
            'Sign In'
          )}
        </button>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-secondary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
