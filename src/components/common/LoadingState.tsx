import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from './LoadingSpinner'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullHeight?: boolean
}

export function LoadingState({ 
  message,
  size = 'md',
  className = '',
  fullHeight = false
}: LoadingStateProps) {
  const { t } = useTranslation('common')
  const displayMessage = message ?? t('loading.loading')

  return (
    <div 
      className={`
        flex flex-col items-center justify-center p-8 text-center
        ${fullHeight ? 'min-h-[400px]' : ''}
        ${className}
      `}
    >
      <LoadingSpinner size={size} />
      <p className="mt-4 text-slate-600">{displayMessage}</p>
    </div>
  )
}

export default LoadingState
