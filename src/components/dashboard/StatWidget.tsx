interface StatWidgetProps {
  value: number | string
  label: string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
  onClick?: () => void
}

export function StatWidget({
  value,
  label,
  icon,
  trend = 'neutral',
  onClick
}: StatWidgetProps) {
  const trendIcons = {
    up: 'trending_up',
    down: 'trending_down',
    neutral: 'remove'
  }

  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-slate-400'
  }

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`w-full bg-white rounded-lg border border-slate-200 shadow-sm p-5 transition-all ${
        onClick ? 'hover:shadow-md hover:border-secondary/30 cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-xs text-on-surface-variant uppercase tracking-wide">
            {label}
          </p>
          <p className="font-headline text-3xl font-bold text-on-surface mt-2">
            {value}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden="true">
            {icon}
          </span>
          <span className={`material-symbols-outlined text-sm ${trendColors[trend]}`} aria-hidden="true">
            {trendIcons[trend]}
          </span>
          <span className="sr-only">{trend === 'up' ? 'Upward trend' : trend === 'down' ? 'Downward trend' : 'No change'}</span>
        </div>
      </div>
    </Component>
  )
}
