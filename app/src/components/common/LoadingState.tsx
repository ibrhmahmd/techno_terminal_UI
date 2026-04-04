import { LoadingSpinner } from './LoadingSpinner'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullHeight?: boolean
}

export function LoadingState({ 
  message = 'Loading...',
  size = 'md',
  className = '',
  fullHeight = false
}: LoadingStateProps) {
  return (
    <div 
      className={`
        flex flex-col items-center justify-center p-8 text-center
        ${fullHeight ? 'min-h-[400px]' : ''}
        ${className}
      `}
    >
      <LoadingSpinner size={size} />
      <p className="mt-4 text-slate-600">{message}</p>
    </div>
  )
}

export default LoadingState
