import { useState, useEffect, useCallback, useRef } from 'react'
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

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const tableRef = useRef<HTMLTableElement>(null)
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIndex(-1)
    rowRefs.current = []
  }, [data])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!data || data.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => {
        const newIndex = prev < data.length - 1 ? prev + 1 : 0
        return newIndex
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => {
        const newIndex = prev > 0 ? prev - 1 : data.length - 1
        return newIndex
      })
    } else if (e.key === 'Enter' && selectedIndex >= 0 && onRowClick) {
      e.preventDefault()
      onRowClick(data[selectedIndex])
    }
  }, [data, onRowClick, selectedIndex])

  // Add keyboard event listener
  useEffect(() => {
    const table = tableRef.current
    if (table) {
      table.addEventListener('keydown', handleKeyDown)
      table.tabIndex = 0 // Make table focusable
    }
    return () => {
      if (table) {
        table.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleKeyDown])

  // Scroll selected row into view
  useEffect(() => {
    if (selectedIndex >= 0 && rowRefs.current[selectedIndex]) {
      rowRefs.current[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedIndex])

  if (!data || data.length === 0) {
    return (
      <DataTableContainer>
        <EmptyState title="No data found" message={emptyMessage} icon={emptyIcon} />
      </DataTableContainer>
    )
  }

  return (
    <DataTableContainer className={className}>
      <table ref={tableRef} className="w-full border-collapse text-sm outline-none focus:ring-2 focus:ring-secondary/20 rounded-lg">
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
              <th className="px-6 py-4 text-end text-xs font-bold uppercase tracking-wider text-slate-500 w-32">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              ref={(el) => { rowRefs.current[index] = el }}
              className={`group/row hover:bg-slate-50/50 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              } ${selectedIndex === index ? 'bg-secondary/10 ring-1 ring-secondary/30' : ''}`}
              onClick={() => {
                setSelectedIndex(index)
                onRowClick?.(row)
              }}
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
