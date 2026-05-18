import type { DataTableActions, ActionLabels } from './types'

interface TableActionsProps<T> {
  row: T
  actions?: DataTableActions<T>
  labels?: ActionLabels
}

export function TableActions<T>({ row, actions, labels }: TableActionsProps<T>) {
  if (!actions) return null

  const viewLabel = labels?.view || 'View'
  const editLabel = labels?.edit || 'Edit'
  const deleteLabel = labels?.delete || 'Delete'
  const restoreLabel = labels?.restore || 'Restore'

  return (
    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
        {actions.view && (
          <button
            onClick={() => actions.view?.(row)}
            className="p-1.5 text-slate-400 hover:text-secondary rounded-lg hover:bg-secondary-container transition-colors"
            title={viewLabel}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">visibility</span>
          </button>
        )}
        {actions.edit && (
          <button
            onClick={() => actions.edit?.(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title={editLabel}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">edit</span>
          </button>
        )}
        {actions.restore && (
          <button
            onClick={() => actions.restore?.(row)}
            className="p-1.5 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            title={restoreLabel}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">restore</span>
          </button>
        )}
        {actions.delete && (
          <button
            onClick={() => actions.delete?.(row)}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title={deleteLabel}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">delete</span>
          </button>
        )}
      </div>
    </td>
  )
}
