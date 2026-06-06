import type { ReactNode } from 'react'
import { CardGrid } from '../directory/CardGrid'
import { CardSkeleton } from '../directory/shared/CardSkeleton'

interface GroupCardGridProps {
  children: ReactNode
  emptyMessage?: string
  emptyIcon?: string
  isLoading?: boolean
  skeletonCount?: number
}

export function GroupCardGrid({
  children,
  emptyMessage = 'No groups matched your selection',
  emptyIcon = 'grid_view',
  isLoading = false,
  skeletonCount = 8,
}: GroupCardGridProps) {
  if (isLoading) {
    return (
      <CardGrid>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </CardGrid>
    )
  }

  const childrenArray = Array.isArray(children) ? children : [children]
  const hasContent = childrenArray.some(Boolean)

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3 text-center" role="status">
        <span className="material-symbols-outlined text-6xl text-slate-200" aria-hidden="true">{emptyIcon}</span>
        <p className="text-slate-400 text-sm font-medium">{emptyMessage}</p>
      </div>
    )
  }

  return <CardGrid>{children}</CardGrid>
}
