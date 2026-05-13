import type { ReactNode } from 'react'
import { Skeleton } from '../../common/Skeleton'

interface FieldLabelProps {
  label: string
  value?: ReactNode
  isLoading?: boolean
  icon?: string
  fallback?: string
}

export function FieldLabel({ label, value, isLoading, icon, fallback = 'Not set' }: FieldLabelProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="material-symbols-outlined text-slate-400 text-sm">{icon}</span>}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-3/4 mt-1" />
      ) : value ? (
        <p className="text-sm text-slate-900">{value}</p>
      ) : (
        <p className="text-sm text-slate-400 italic">{fallback}</p>
      )}
    </div>
  )
}
