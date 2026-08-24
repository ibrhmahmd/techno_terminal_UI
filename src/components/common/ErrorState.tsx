import { AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  title, 
  message,
  onRetry,
  className = ''
}: ErrorStateProps) {
  const { t } = useTranslation('common')
  const displayTitle = title ?? t('errors.somethingWentWrong')
  const displayMessage = message ?? t('errors.unexpectedError')

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{displayTitle}</h3>
      <p className="text-slate-600 max-w-md mb-4">{displayMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('errors.tryAgain')}
        </button>
      )}
    </div>
  )
}

export default ErrorState
