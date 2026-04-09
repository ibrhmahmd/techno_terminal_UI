interface QuickActionWidgetProps {
  icon: string
  title: string
  subtitle?: string
  variant?: 'primary' | 'secondary' | 'accent'
  onClick: () => void
}

export function QuickActionWidget({
  icon,
  title,
  subtitle,
  variant = 'primary',
  onClick
}: QuickActionWidgetProps) {
  const variantStyles = {
    primary: 'hover:border-secondary/30 hover:shadow-secondary/5',
    secondary: 'hover:border-slate-400 hover:shadow-slate-200',
    accent: 'hover:border-amber-400 hover:shadow-amber-100'
  }

  const iconColors = {
    primary: 'text-secondary',
    secondary: 'text-slate-500',
    accent: 'text-amber-500'
  }

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white rounded-lg border border-slate-200 shadow-sm p-5 text-left transition-all hover:shadow-md ${variantStyles[variant]}`}
    >
      <div className="flex items-start gap-4">
        <span className={`material-symbols-outlined text-3xl ${iconColors[variant]}`}>
          {icon}
        </span>
        <div className="flex-1">
          <h3 className="font-headline font-semibold text-on-surface text-sm">
            {title}
          </h3>
          {subtitle && (
            <p className="font-body text-xs text-on-surface-variant mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <span className="material-symbols-outlined text-slate-300 text-xl">
          arrow_forward
        </span>
      </div>
    </button>
  )
}
