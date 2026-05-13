import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { DataTable } from '../../common/datatable'
import { LoadingState } from '../../common/LoadingState'
import { EmptyState } from '../../common/EmptyState'
import type { CompetitionParticipationDTO } from '../../../api/academics'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  active: { icon: Clock, color: 'text-blue-600', label: 'Active' },
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  withdrawn: { icon: XCircle, color: 'text-red-600', label: 'Withdrawn' },
}

interface CompetitionRecordsProps {
  data: CompetitionParticipationDTO[]
  isLoading: boolean
}

export function CompetitionRecords({ data, isLoading }: CompetitionRecordsProps) {
  if (isLoading) {
    return <LoadingState message="Loading competition records..." />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="No competitions"
        message="This group has not participated in any competitions yet."
      />
    )
  }

  const columns = [
    {
      key: 'competition',
      header: 'Competition',
      width: '25%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="font-medium text-slate-900">{row.competition_name}</span>
      ),
    },
    {
      key: 'team',
      header: 'Team',
      width: '20%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="text-sm text-slate-700">{row.team_name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '15%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="text-sm text-slate-600">{row.category_name || '-'}</span>
      ),
    },
    {
      key: 'entered_at',
      header: 'Entered',
      width: '15%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="text-sm text-slate-600">{formatDate(row.entered_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '12%',
      cell: (row: CompetitionParticipationDTO) => {
        const status = row.is_active ? 'active' : row.left_at ? 'completed' : 'withdrawn'
        const config = statusConfig[status] || statusConfig.completed
        const Icon = config.icon
        return (
          <span className={`flex items-center gap-1.5 text-sm font-medium ${config.color}`}>
            <Icon className="w-4 h-4" />
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'placement',
      header: 'Placement',
      width: '13%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="text-sm text-slate-900 font-medium">{row.final_placement ?? '-'}</span>
      ),
    },
  ]

  return <DataTable columns={columns} data={data} keyExtractor={(row) => String(row.participation_id)} />
}
