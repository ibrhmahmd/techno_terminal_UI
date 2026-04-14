import { DataTableContainer } from '../DataTableContainer'
import { EmptyState } from '../EmptyState'
import { getAlignClass } from './TableUtils'
import { SortIndicator } from './SortIndicator'
import { TableActions } from './TableActions'
import type { FlatTableProps } from './types'

export function FlatTable<T>(props: FlatTableProps<T>) {
  const {
    data,
    columns,
    keyExtractor,
    emptyMessage = 'No data found',
    emptyIcon = 'inbox',
    onRowClick,
    sortField,
    sortDirection,
    onSort,
    actions,
    actionLabels,
    className = '',
  } = props

  if (!data || data.length === 0) {
    return (
      <DataTableContainer>
        <EmptyState title="No data found" message={emptyMessage} icon={emptyIcon} />
      </DataTableContainer>
    )
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
                  {col.sortable && (
                    <SortIndicator
                      fieldKey={col.key}
                      currentSortField={sortField}
                      currentSortDirection={sortDirection}
                    />
                  )}
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
                <td key={col.key} className={`px-6 py-4 ${getAlignClass(col.align)}`}>
                  {col.cell(row)}
                </td>
              ))}
              <TableActions row={row} actions={actions} labels={actionLabels} />
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableContainer>
  )
}
