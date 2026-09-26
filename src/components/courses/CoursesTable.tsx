import { DataTable } from '../common'
import { courseColumns } from './courseColumns'
import type { Course } from '../../api/academics'

interface CoursesTableProps {
  data: Course[]
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: string) => void
  onRowClick: (course: Course) => void
  onView: (course: Course) => void
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: 'search' | 'inbox' | 'history' | 'schedule' | 'trash' | 'filter_list' | 'none'
}

export function CoursesTable({
  data,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  isLoading,
  emptyMessage = 'No courses found',
  emptyIcon = 'inbox',
}: CoursesTableProps) {
  return (
    <DataTable
      data={data}
      columns={courseColumns}
      keyExtractor={(c) => c.id.toString()}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onRowClick}
      actions={{
        view: onView,
        edit: onEdit,
        delete: onDelete,
      }}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      emptyIcon={emptyIcon}
    />
  )
}
