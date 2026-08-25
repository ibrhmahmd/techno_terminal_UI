import { useMemo, useState, useRef, useEffect, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResetPasswordWithToken } from '../hooks/useAuthQueries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { AuthLayout } from '../components/auth/AuthLayout'

type Phase = 'invalid' | 'form' | 'success'

function parseRecoveryToken(hash: string): { token: string; valid: true } | { token: null; valid: false } {
  const params = new URLSearchParams(hash.slice(1))
  const token = params.get('access_token')
  const type = params.get('type')
  if (token && type === 'recovery') return { token, valid: true }
  return { token: null, valid: false }
}

export function ResetPasswordPage() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const { token, valid } = useMemo(() => parseRecoveryToken(location.hash), [location.hash])
  const [phase, setPhase] = useState<Phase>(valid ? 'form' : 'invalid')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const resetMutation = useResetPasswordWithToken()
  const invalidRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase === 'invalid') {
      invalidRef.current?.focus()
    } else if (phase === 'success') {
      successRef.current?.focus()
    }
  }, [phase])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 12) {
      setError(t('auth.resetPasswordPage.passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.resetPasswordPage.passwordMismatch'))
      return
    }
    if (!token) {
      setPhase('invalid')
      return
    }

    try {
      await resetMutation.mutateAsync({ recoveryToken: token, data: { new_password: newPassword } })
      setPhase('success')
    } catch {
      setError(t('auth.resetPasswordPage.invalidLink'))
    }
  }

  if (phase === 'invalid') {
    return (
      <AuthLayout title={t('auth.resetPasswordPage.invalidTitle')} subtitle={t('auth.resetPasswordPage.invalidSubtitle')}>
        <div ref={invalidRef} tabIndex={-1} className="text-center focus:outline-none">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4" aria-hidden="true">error</span>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded"
          >
            <span className="material-symbols-outlined text-base icon-flip-rtl" aria-hidden="true">arrow_back</span>
            {t('auth.resetPasswordPage.requestNewLink')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (phase === 'success') {
    return (
      <AuthLayout title={t('auth.resetPasswordPage.completeTitle')} subtitle={t('auth.resetPasswordPage.completeSubtitle')}>
        <div ref={successRef} tabIndex={-1} className="text-center focus:outline-none">
          <span className="material-symbols-outlined text-4xl text-green-500 mb-4" aria-hidden="true">check_circle</span>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded"
          >
            {t('auth.resetPasswordPage.signIn')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('auth.resetPasswordPage.title')} subtitle={t('auth.resetPasswordPage.subtitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700" role="alert">
            <span className="material-symbols-outlined text-lg mt-0.5 shrink-0" aria-hidden="true">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-password" className="text-sm font-medium text-on-surface">
            {t('auth.resetPasswordPage.newPassword')}
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('auth.resetPasswordPage.minChars')}
            required
            minLength={12}
            disabled={resetMutation.isPending}
            className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-password" className="text-sm font-medium text-on-surface">
            {t('auth.resetPasswordPage.confirmPassword')}
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('auth.resetPasswordPage.confirmPlaceholder')}
            required
            minLength={12}
            disabled={resetMutation.isPending}
            className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            t('auth.resetPasswordPage.resetButton')
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        {t('auth.resetPasswordPage.rememberPassword')}{' '}
        <Link to="/login" className="text-secondary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded">
          {t('auth.resetPasswordPage.signIn')}
        </Link>
      </p>
    </AuthLayout>
  )
}
