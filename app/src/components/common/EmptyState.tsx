import { Search, Plus, Inbox, History } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: 'search' | 'inbox' | 'history' | 'schedule' | 'none' | string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ 
  title = 'No results found',
  message = 'There are no items to display at the moment.',
  icon = 'inbox',
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  const IconComponent = {
    search: Search,
    inbox: Inbox,
    history: History,
    none: () => null
  }[icon] || Inbox // fallback to Inbox for invalid values

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon !== 'none' && (
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <IconComponent className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-md mb-4">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
