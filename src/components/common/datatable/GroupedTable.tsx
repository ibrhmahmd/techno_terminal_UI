import { useState } from 'react'
import { EmptyState } from '../EmptyState'
import { DataTableContainer } from '../DataTableContainer'
import { FlatTable } from './FlatTable'
import type { GroupedTableProps } from './types'

export function GroupedTable<T>(props: GroupedTableProps<T>) {
  const {
    groupedData,
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
    defaultActiveGroup,
  } = props

  const [activeGroup, setActiveGroup] = useState<string>(
    defaultActiveGroup ?? groupedData[0]?.key ?? ''
  )

  if (!groupedData || groupedData.length === 0) {
    return (
      <DataTableContainer>
        <EmptyState title="No data found" message={emptyMessage} icon={emptyIcon} />
      </DataTableContainer>
    )
  }

  // Find the currently active group's items
  const activeItems = groupedData.find((g) => g.key === activeGroup)?.items ?? []

  return (
    <div className={className}>
      {/* ── Zone 2: Dark Premium Tab Bar ─────────────────────────────── */}
      <div className="overflow-x-auto mb-4">
        <div className="flex min-w-full w-max items-center gap-1 rounded-xl bg-slate-800 p-1.5">
          {groupedData.map((group) => {
            const isActive = activeGroup === group.key
            return (
              <button
                key={group.key}
                onClick={() => setActiveGroup(group.key)}
                className={`flex-1 flex justify-center items-center gap-2.5 min-w-[120px] px-5 py-2 rounded-lg text-sm font-medium transition-all select-none ${
                  isActive
                    ? 'bg-secondary text-white font-bold shadow-lg shadow-secondary/20'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="font-headline">{group.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {group.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Zone 3: Data table for the active group ───────────────────── */}
      {activeItems.length === 0 ? (
        <DataTableContainer>
          <EmptyState
            title="No entries"
            message={`No groups in this category yet.`}
            icon={emptyIcon}
          />
        </DataTableContainer>
      ) : (
        <FlatTable<T>
          data={activeItems}
          columns={columns}
          keyExtractor={keyExtractor}
          emptyMessage={emptyMessage}
          emptyIcon={emptyIcon}
          onRowClick={onRowClick}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          actions={actions}
          actionLabels={actionLabels}
        />
      )}
    </div>
  )
}
