import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'
import { useLogin } from '../hooks/useAuthQueries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { AuthLayout } from '../components/auth/AuthLayout'

export function LoginPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const loginMutation = useLogin()
  const emailRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('tt_remember_email') || '' } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    try { return !!localStorage.getItem('tt_remember_email') } catch { return false }
  })
  const [error, setError] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)

  // Auto-focus email input on mount
  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  // Focus error banner when an error appears
  useEffect(() => {
    if (error) {
      errorRef.current?.focus()
    }
  }, [error])

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

  // Redirect if already authenticated (safety net — PublicRoute handles this too)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Persist remember-me preference
    try {
      if (rememberMe) {
        localStorage.setItem('tt_remember_email', email)
      } else {
        localStorage.removeItem('tt_remember_email')
      }
    } catch {
      // localStorage unavailable (private browsing, quota exceeded) — silently skip
    }

    try {
      await loginMutation.mutateAsync({ email, password })
      navigate('/dashboard')
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
          setError(t('messages.networkError'))
        } else {
          setError(t('auth.invalidCredentials'))
        }
      } else {
        setError(t('auth.invalidCredentials'))
      }
    }
  }

  const isSubmitDisabled = loginMutation.isPending || !email || !password || retryAfter !== null

  return (
    <AuthLayout title={t('auth.login')} subtitle="">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Error Message */}
        {error && (
          <div ref={errorRef} tabIndex={-1} className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 focus:outline-none" role="alert">
            <span className="material-symbols-outlined text-lg mt-0.5 shrink-0" aria-hidden="true">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Rate Limit Message */}
        {retryAfter && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800" role="alert">
            <span className="material-symbols-outlined text-lg mt-0.5 shrink-0" aria-hidden="true">timer</span>
            <span>{t('messages.tooManyAttempts', { count: countdown })}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-on-surface">
            {t('labels.email')}
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
            disabled={loginMutation.isPending}
            className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-on-surface">
            {t('labels.password')}
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
              disabled={loginMutation.isPending}
              className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 pr-10 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
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
            onChange={(e) => {
              setRememberMe(e.target.checked)
              // Persist preference immediately, not just on submit
              try {
                if (e.target.checked && email) {
                  localStorage.setItem('tt_remember_email', email)
                } else {
                  localStorage.removeItem('tt_remember_email')
                }
              } catch {
                // localStorage unavailable — silently skip
              }
            }}
            disabled={loginMutation.isPending}
            className="w-4 h-4 rounded border-slate-300 text-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-50"
          />
          <span className="text-sm text-on-surface-variant">{t('auth.rememberMe')}</span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? (
            <LoadingSpinner size="sm" variant="light" />
          ) : retryAfter ? (
            t('messages.tryAgain', { seconds: countdown })
          ) : (
            t('auth.login')
          )}
        </button>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-secondary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
