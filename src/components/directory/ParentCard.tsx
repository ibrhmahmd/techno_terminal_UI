import type { ParentListItem } from '../../api/crm'
import { RowActions } from '../common/RowActions'
import { CardSkeleton } from './shared/CardSkeleton'
import { useNavigate } from 'react-router-dom'

interface ParentCardActions {
  onEdit?: () => void
  onDelete?: () => void
}

interface ParentCardProps {
  parent: ParentListItem
  actions: ParentCardActions
  loading?: boolean
}

export function ParentCard({ parent, actions, loading = false }: ParentCardProps) {
  const navigate = useNavigate()
  if (loading) return <CardSkeleton />

  return (
    <div
      onClick={() => navigate(`/parents/${parent.id}`)}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col"
    >
      <div className="flex-1">
        <h3 className="font-headline font-semibold text-on-surface text-base truncate">
          {parent.full_name}
        </h3>
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">phone</span>
          {parent.phone_primary}
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <RowActions
          visible="always"
          actions={[
            { icon: 'visibility', label: 'View', onClick: () => navigate(`/parents/${parent.id}`), variant: 'primary' },
            ...(actions.onEdit ? [{ icon: 'edit' as const, label: 'Edit' as const, onClick: () => actions.onEdit!() }] : []),
            ...(actions.onDelete ? [{ icon: 'delete' as const, label: 'Delete' as const, onClick: () => actions.onDelete!(), variant: 'danger' as const }] : []),
          ]}
        />
      </div>
    </div>
  )
}
