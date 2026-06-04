import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useResetPasswordWithToken } from '../hooks/useAuthQueries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

type Phase = 'invalid' | 'form' | 'success'

function parseRecoveryToken(): { token: string; valid: true } | { token: null; valid: false } {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const token = params.get('access_token')
  const type = params.get('type')
  if (token && type === 'recovery') return { token, valid: true }
  return { token: null, valid: false }
}

export function ResetPasswordPage() {
  const { token, valid } = useMemo(() => parseRecoveryToken(), [])
  const [phase, setPhase] = useState<Phase>(valid ? 'form' : 'invalid')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const resetMutation = useResetPasswordWithToken()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      await resetMutation.mutateAsync({ recoveryToken: token!, data: { new_password: newPassword } })
      setPhase('success')
    } catch {
      setError('This link has expired or has already been used. Please request a new reset link.')
    }
  }

  if (phase === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg border border-slate-100 text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
          <h1 className="font-headline text-xl font-bold text-on-surface mb-2">Invalid or Expired Link</h1>
          <p className="text-sm text-slate-600 mb-6">
            The password reset link is invalid, incomplete, or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg border border-slate-100 text-center">
          <span className="material-symbols-outlined text-4xl text-green-500 mb-4">check_circle</span>
          <h1 className="font-headline text-xl font-bold text-on-surface mb-2">Password Reset Complete</h1>
          <p className="text-sm text-slate-600 mb-6">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
          >
            Sign In
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
            Choose New Password
          </h1>
          <p className="text-sm text-on-surface-variant">
            Enter a secure new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              <span className="material-symbols-outlined text-lg mt-0.5 shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="text-sm font-medium text-on-surface">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 12 characters"
              required
              minLength={12}
              disabled={resetMutation.isPending}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className="text-sm font-medium text-on-surface">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={12}
              disabled={resetMutation.isPending}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending || !newPassword || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetMutation.isPending ? (
              <LoadingSpinner size="sm" variant="light" />
            ) : (
              'Reset Password'
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
