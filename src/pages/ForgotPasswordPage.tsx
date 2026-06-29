import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../hooks/useAuthQueries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { AuthLayout } from '../components/auth/AuthLayout'

export function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <AuthLayout title="Check Your Email" subtitle="If an account with that email exists, we've sent password reset instructions.">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-green-500 mb-4" aria-hidden="true">mail</span>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email and we'll send you reset instructions">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700" role="alert">
            <span className="material-symbols-outlined text-lg shrink-0" aria-hidden="true">error</span>
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
        <Link to="/login" className="text-secondary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  )
}
