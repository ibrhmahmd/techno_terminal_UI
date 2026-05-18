import { DataTable, type DataTableColumn } from '../common'
import type { Competition } from '../../api/competitions'
import { competitionColumns } from './CompetitionColumns'

interface CompetitionsTableProps {
  data: Competition[]
  columns?: DataTableColumn<Competition>[]
  onView: (competition: Competition) => void
  onDelete?: (competition: Competition) => void
  onRestore?: (competition: Competition) => void
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: 'search' | 'inbox' | 'history' | 'schedule' | 'trash' | 'filter_list' | 'none'
  actionLabels?: {
    view?: string
    delete?: string
    restore?: string
  }
}

export function CompetitionsTable({
  data,
  columns = competitionColumns,
  onView,
  onDelete,
  onRestore,
  isLoading,
  emptyMessage = 'No competitions found',
  emptyIcon = 'inbox',
  actionLabels,
}: CompetitionsTableProps) {
  const actions: Record<string, (row: Competition) => void> = {
    view: onView,
    ...(onDelete && { delete: onDelete }),
    ...(onRestore && { restore: onRestore }),
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
      actionLabels={actionLabels}
    />
  )
}
