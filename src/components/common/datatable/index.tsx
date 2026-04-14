import type { DataTableProps } from './types'
import { FlatTable } from './FlatTable'
import { GroupedTable } from './GroupedTable'
import { TableSkeleton } from './TableSkeleton'
import { EmptyState } from '../EmptyState'
import { DataTableContainer } from '../DataTableContainer'

export type { DataTableProps, DataTableColumn, DataTableActions } from './types'

export function DataTable<T>(props: DataTableProps<T>) {
  if (props.isLoading) {
    return <TableSkeleton columns={props.columns} hasActions={!!props.actions} />
  }

  if ('groupedData' in props) {
    if (!props.groupedData || props.groupedData.length === 0) {
      return (
        <DataTableContainer>
          <EmptyState
            title="No data found"
            message={props.emptyMessage || 'No data found'}
            icon={props.emptyIcon || 'inbox'}
          />
        </DataTableContainer>
      )
    }
    return <GroupedTable<T> {...props} />
  }

  if (!props.data || props.data.length === 0) {
    return (
      <DataTableContainer>
        <EmptyState
          title="No data found"
          message={props.emptyMessage || 'No data found'}
          icon={props.emptyIcon || 'inbox'}
        />
      </DataTableContainer>
    )
  }

  return <FlatTable<T> {...props} />
}
