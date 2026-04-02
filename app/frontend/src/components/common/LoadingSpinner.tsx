interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'light'
}

export function LoadingSpinner({ size = 'md', variant = 'default' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  const colorClasses = {
    default: 'border-slate-200 border-t-secondary',
    light: 'border-white/30 border-t-white',
  }

  return (
    <div className="flex items-center justify-center p-2">
      <div className={`${sizeClasses[size]} ${colorClasses[variant]} rounded-full animate-spin`} />
    </div>
  )
}
