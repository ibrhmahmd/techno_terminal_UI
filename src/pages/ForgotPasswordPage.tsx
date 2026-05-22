import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useForgotPassword } from '../hooks/useAuthQueries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuthStore()
  const forgotPasswordMutation = useForgotPassword()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await forgotPasswordMutation.mutateAsync({ email })
      setSubmitted(true)
    } catch {
      // Always show success to avoid leaking account existence
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg border border-slate-100 text-center">
          <span className="material-symbols-outlined text-4xl text-green-500 mb-4">mail</span>
          <h1 className="font-headline text-xl font-bold text-on-surface mb-2">Check Your Email</h1>
          <p className="text-sm text-slate-600 mb-6">
            If an account with that email exists, we've sent password reset instructions.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight mb-1">
            Reset Password
          </h1>
          <p className="text-sm text-on-surface-variant">
            Enter your email and we'll send you reset instructions
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
            <label htmlFor="email" className="text-sm font-medium text-on-surface">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={forgotPasswordMutation.isPending}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending || !email}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {forgotPasswordMutation.isPending ? (
              <LoadingSpinner size="sm" variant="light" />
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="text-secondary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
