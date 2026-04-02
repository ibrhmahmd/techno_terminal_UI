import { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  width?: string
  cell: (row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  isLoading = false,
  emptyMessage = 'No data found',
  onRowClick
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map(col => (
              <th 
                key={col.key}
                className="text-left py-3 px-4 text-sm font-semibold text-slate-600"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-100 last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''
              } ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              {columns.map(col => (
                <td key={col.key} className="py-3 px-4 text-sm">
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
