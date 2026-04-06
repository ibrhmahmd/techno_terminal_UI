import type { ReactNode } from 'react'
import { DataTableContainer } from './DataTableContainer'
import { EmptyState } from './EmptyState'

export interface DataTableColumn<T> {
  /** Unique key for the column */
  key: string
  /** Header text */
  header: string
  /** Optional width (CSS value) */
  width?: string
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Whether column is sortable */
  sortable?: boolean
  /** Custom cell renderer */
  cell: (row: T) => ReactNode
}

export interface DataTableActions<T> {
  /** View action handler */
  view?: (row: T) => void
  /** Edit action handler */
  edit?: (row: T) => void
  /** Delete action handler */
  delete?: (row: T) => void
}

export interface DataTableProps<T> {
  /** Data array */
  data: T[]
  /** Column definitions */
  columns: DataTableColumn<T>[]
  /** Unique key extractor */
  keyExtractor: (row: T) => string
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Empty state icon - supports specific icon names */
  emptyIcon?: 'search' | 'inbox' | 'history' | 'schedule' | 'none'
  /** Row click handler */
  onRowClick?: (row: T) => void
  /** Current sort field */
  sortField?: string
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc'
  /** Sort handler */
  onSort?: (field: string | any) => void
  /** Row actions */
  actions?: DataTableActions<T>
  /** Custom action labels */
  actionLabels?: {
    view?: string
    edit?: string
    delete?: string
  }
  /** Additional CSS class */
  className?: string
}

/**
 * DataTable - Unified table component with sorting, actions, and consistent styling
 * 
 * Features:
 * - Generic column configuration
 * - Built-in sorting with visual indicators
 * - Standardized row actions (view/edit/delete)
 * - Sticky header with backdrop blur
 * - Loading skeleton state
 * - Empty state with icon
 * - Hover effects consistent with design system
 * 
 * @example
 * <DataTable
 *   data={students}
 *   columns={[
 *     { key: 'name', header: 'Name', cell: (s) => s.full_name },
 *     { key: 'email', header: 'Email', cell: (s) => s.email }
 *   ]}
 *   keyExtractor={(s) => s.id.toString()}
 *   onRowClick={(s) => navigate(`/students/${s.id}`)}
 *   actions={{ view: handleView, edit: handleEdit, delete: handleDelete }}
 * />
 */
export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data found',
  emptyIcon = 'inbox',
  onRowClick,
  sortField,
  sortDirection,
  onSort,
  actions,
  actionLabels = { view: 'View', edit: 'Edit', delete: 'Delete' },
  className = ''
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <DataTableContainer>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${Math.random() * 60 + 40}%` }} />
                  </td>
                ))}
                {actions && <td className="px-6 py-4" />}
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableContainer>
    )
  }

  if (data.length === 0) {
    return (
      <DataTableContainer>
        <EmptyState
          title="No data found"
          message={emptyMessage}
          icon={emptyIcon}
        />
      </DataTableContainer>
    )
  }

  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <span className="material-symbols-outlined text-slate-300 text-sm">swap_vert</span>
    }
    return (
      <span className="material-symbols-outlined text-secondary text-sm">
        {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    )
  }

  const getAlignClass = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-left'
    }
  }

  return (
    <DataTableContainer className={className}>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                  col.sortable ? 'cursor-pointer group select-none' : ''
                } ${getAlignClass(col.align)}`}
                style={{ width: col.width }}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : ''}`}>
                  <span>{col.header}</span>
                  {col.sortable && <SortIndicator field={col.key} />}
                </div>
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 w-32">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className={`group/row hover:bg-slate-50/50 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-6 py-4 ${getAlignClass(col.align)}`}
                >
                  {col.cell(row)}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    {actions.view && (
                      <button
                        onClick={() => actions.view?.(row)}
                        className="p-1.5 text-slate-400 hover:text-secondary rounded-lg hover:bg-secondary-container transition-colors"
                        title={actionLabels.view}
                      >
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                    )}
                    {actions.edit && (
                      <button
                        onClick={() => actions.edit?.(row)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title={actionLabels.edit}
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                    )}
                    {actions.delete && (
                      <button
                        onClick={() => actions.delete?.(row)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title={actionLabels.delete}
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableContainer>
  )
}
