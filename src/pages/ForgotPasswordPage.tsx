import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { useForgotPassword } from '../hooks/useAuthQueries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { AuthLayout } from '../components/auth/AuthLayout'

export function ForgotPasswordPage() {
  const { t } = useTranslation('common')
  const forgotPasswordMutation = useForgotPassword()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (submitted) {
      successRef.current?.focus()
    }
  }, [submitted])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await forgotPasswordMutation.mutateAsync({ email })
      setSubmitted(true)
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setSubmitted(true)
      } else {
        setError(t('auth.forgotPasswordPage.unableToConnect'))
      }
    }
  }

  if (submitted) {
    return (
      <AuthLayout title={t('auth.forgotPasswordPage.title')} subtitle={t('auth.forgotPasswordPage.subtitle')}>
        <div ref={successRef} tabIndex={-1} className="text-center focus:outline-none">
          <span className="material-symbols-outlined text-4xl text-green-500 mb-4" aria-hidden="true">mail</span>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded"
          >
            <span className="material-symbols-outlined text-base icon-flip-rtl" aria-hidden="true">arrow_back</span>
            {t('auth.forgotPasswordPage.backToLogin')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('auth.forgotPasswordPage.resetTitle')} subtitle={t('auth.forgotPasswordPage.resetSubtitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700" role="alert">
            <span className="material-symbols-outlined text-lg mt-0.5 shrink-0" aria-hidden="true">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-on-surface">
            {t('auth.email')}
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
            className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            t('auth.forgotPasswordPage.sendReset')
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        {t('auth.forgotPasswordPage.rememberPassword')}{' '}
        <Link to="/login" className="text-secondary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-secondary/20 rounded">
          {t('auth.forgotPasswordPage.signIn')}
        </Link>
      </p>
    </AuthLayout>
  )
}
