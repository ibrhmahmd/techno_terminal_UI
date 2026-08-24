import { Search, Plus, Inbox, History, Clock, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TerminalPattern } from './TerminalPattern'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: 'search' | 'inbox' | 'history' | 'schedule' | 'trash' | 'none' | string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ 
  title,
  message,
  icon = 'inbox',
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  const { t } = useTranslation('common')
  const displayTitle = title ?? t('empty.noResults')
  const displayMessage = message ?? t('empty.noItems')

  const IconComponent = {
    search: Search,
    inbox: Inbox,
    history: History,
    schedule: Clock,
    trash: Trash2,
    none: () => null
  }[icon] || Inbox

  return (
    <div className={`relative overflow-hidden flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <TerminalPattern opacity={0.03} id="empty-state-pattern" />
      <div className="relative z-10 flex flex-col items-center justify-center">
        {icon !== 'none' && (
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <IconComponent className="w-8 h-8 text-slate-400" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{displayTitle}</h3>
        <p className="text-slate-600 max-w-md mb-4">{displayMessage}</p>
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
    </div>
  )
}

export default EmptyState
