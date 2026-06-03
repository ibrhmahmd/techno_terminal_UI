interface GroupStatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Active',
  },
  inactive: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: 'Inactive',
  },
  archived: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'Archived',
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Completed',
  },
}

const DEFAULT_CONFIG = {
  bg: 'bg-slate-100',
  text: 'text-slate-600',
  dot: 'bg-slate-400',
  label: 'Unknown',
}

export function GroupStatusBadge({ status, size = 'md' }: GroupStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
