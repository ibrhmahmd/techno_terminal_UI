import { DataTableContainer } from '../DataTableContainer'
import type { DataTableColumn } from './types'

interface TableSkeletonProps<T> {
  columns: DataTableColumn<T>[]
  hasActions?: boolean
}

export function TableSkeleton<T>({ columns, hasActions }: TableSkeletonProps<T>) {
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
            {hasActions && (
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
                  <div
                    className="h-4 bg-slate-200 rounded animate-pulse"
                    style={{ width: `${Math.random() * 60 + 40}%` }}
                  />
                </td>
              ))}
              {hasActions && <td className="px-6 py-4" />}
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableContainer>
  )
}
