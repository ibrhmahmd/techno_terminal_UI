interface LevelBadgeProps {
  level: number
  isActive?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LevelBadge({ level, isActive = false, size = 'md' }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold ${
        sizeClasses[size]
      } ${
        isActive
          ? 'bg-green-100 text-green-700 border-2 border-green-200'
          : 'bg-slate-100 text-slate-600 border-2 border-slate-200'
      }`}
      title={isActive ? 'Current Level' : `Level ${level}`}
    >
      {level}
    </span>
  )
}
