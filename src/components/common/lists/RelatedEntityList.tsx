import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface RelatedEntity {
  id: number | string
  title: string
  subtitle?: string
  meta?: string
  link?: string
  onClick?: () => void
  status?: 'active' | 'inactive' | 'pending'
}

interface RelatedEntityListProps {
  title: string
  icon?: ReactNode
  entities: RelatedEntity[]
  emptyMessage?: string
  maxDisplay?: number
}

export function RelatedEntityList({
  title,
  icon,
  entities,
  emptyMessage = 'No items found',
  maxDisplay = 5,
}: RelatedEntityListProps) {
  const navigate = useNavigate()

  const displayedEntities = entities.slice(0, maxDisplay)
  const hasMore = entities.length > maxDisplay

  const statusStyles = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-600',
    pending: 'bg-amber-100 text-amber-700',
  }

  if (entities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-medium text-slate-700">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 text-center py-4">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium text-slate-700">{title}</h3>
        </div>
        <span className="text-sm text-slate-500">{entities.length} item(s)</span>
      </div>

      <div className="space-y-2">
        {displayedEntities.map((entity) => (
          <div
            key={entity.id}
            onClick={() => {
              if (entity.onClick) {
                entity.onClick()
              } else if (entity.link) {
                navigate(entity.link)
              }
            }}
            className={`p-3 bg-slate-50 rounded-lg transition-colors ${
              entity.link || entity.onClick 
                ? 'cursor-pointer hover:bg-slate-100' 
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-on-surface text-sm truncate">
                    {entity.title}
                  </p>
                  {entity.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[entity.status]}`}>
                      {entity.status}
                    </span>
                  )}
                </div>
                {entity.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{entity.subtitle}</p>
                )}
              </div>
              {entity.meta && (
                <span className="text-xs text-slate-400 ml-2">{entity.meta}</span>
              )}
            </div>
          </div>
        ))}

        {hasMore && (
          <p className="text-xs text-slate-400 text-center py-1">
            +{entities.length - maxDisplay} more
          </p>
        )}
      </div>
    </div>
  )
}

export default RelatedEntityList
