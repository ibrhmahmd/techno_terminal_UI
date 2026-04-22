import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  cell: (row: T) => ReactNode
}

export interface DataTableActions<T> {
  view?: (row: T) => void
  edit?: (row: T) => void
  delete?: (row: T) => void
  restore?: (row: T) => void
}

export interface ActionLabels {
  view?: string
  edit?: string
  delete?: string
  restore?: string
}

// Base properties shared between all tables
export interface DataTableBaseProps<T> {
  columns: DataTableColumn<T>[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: 'search' | 'inbox' | 'history' | 'schedule' | 'trash' | 'filter_list' | 'none'
  onRowClick?: (row: T) => void
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: string) => void
  actions?: DataTableActions<T>
  actionLabels?: ActionLabels
  className?: string
}

// Strictly Typed Flat Table (Prevents grouping properties)
export interface FlatTableProps<T> extends DataTableBaseProps<T> {
  data: T[]
  groupedData?: never
  expandableGroups?: never
  defaultExpandedGroups?: never
  onGroupToggle?: never
}

export interface GroupItem<T> {
  key: string
  label: string
  count: number
  items: T[]
}

// Strictly Typed Grouped Table (Prevents flat properties)
export interface GroupedTableProps<T> extends DataTableBaseProps<T> {
  data?: never
  groupedData: GroupItem<T>[]
  /** Key of the group tab that should be active/open by default. Defaults to first group. */
  defaultActiveGroup?: string
}

export type DataTableProps<T> = FlatTableProps<T> | GroupedTableProps<T>
