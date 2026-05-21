import { DataTable, type DataTableColumn } from '../common'
import type { Competition } from '../../api/competitions'
import { competitionColumns } from './CompetitionColumns'

interface CompetitionsTableProps {
  data: Competition[]
  columns?: DataTableColumn<Competition>[]
  onView: (competition: Competition) => void
  onDelete?: (competition: Competition) => void
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: 'search' | 'inbox' | 'history' | 'schedule' | 'trash' | 'filter_list' | 'none'
}

export function CompetitionsTable({
  data,
  columns = competitionColumns,
  onView,
  onDelete,
  isLoading,
  emptyMessage = 'No competitions found',
  emptyIcon = 'inbox',
}: CompetitionsTableProps) {
  const actions: Record<string, (row: Competition) => void> = {
    view: onView,
    ...(onDelete && { delete: onDelete }),
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(row) => row.id.toString()}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      emptyIcon={emptyIcon}
      actions={actions}
    />
  )
}
