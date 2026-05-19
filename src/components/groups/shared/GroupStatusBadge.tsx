interface GroupStatusBadgeProps {
  status: 'active' | 'inactive' | 'archived' | 'completed'
  size?: 'sm' | 'md'
}

export function GroupStatusBadge({ status, size = 'md' }: GroupStatusBadgeProps) {
  const config = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Active',
    },
    inactive: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      label: 'Inactive',
    },
    archived: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      label: 'Archived',
    },
    completed: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Completed',
    },
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const { bg, text, label } = config[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${bg} ${text} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : status === 'inactive' ? 'bg-slate-400' : 'bg-amber-500'}`} aria-hidden="true" />
      {label}
    </span>
  )
}
