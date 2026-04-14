import { Trophy, Medal, Award, XCircle } from 'lucide-react'
import { DataTable } from '../../common/datatable'
import { LoadingState } from '../../common/LoadingState'
import { EmptyState } from '../../common/EmptyState'
import type { CompetitionParticipationDTO } from '../../../api/academics'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface CompetitionRecordsProps {
  data: CompetitionParticipationDTO[]
  isLoading: boolean
}

const resultConfig: Record<NonNullable<CompetitionParticipationDTO['result']>, { icon: typeof Trophy; color: string; label: string }> = {
  winner: { icon: Trophy, color: 'text-yellow-600', label: 'Winner' },
  runner_up: { icon: Medal, color: 'text-slate-600', label: 'Runner Up' },
  participant: { icon: Award, color: 'text-blue-600', label: 'Participant' },
  disqualified: { icon: XCircle, color: 'text-red-600', label: 'Disqualified' },
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
      key: 'date',
      header: 'Date',
      width: '15%',
      cell: (row: CompetitionParticipationDTO) => formatDate(row.event_date),
    },
    {
      key: 'competition',
      header: 'Competition',
      width: '30%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="font-medium text-slate-900">{row.competition_name}</span>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      width: '12%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="text-sm text-slate-600">Level {row.level_at_time}</span>
      ),
    },
    {
      key: 'result',
      header: 'Result',
      width: '18%',
      cell: (row: CompetitionParticipationDTO) => {
        if (!row.result) {
          return <span className="text-sm text-slate-500">-</span>
        }
        const config = resultConfig[row.result]
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
      key: 'score',
      header: 'Score',
      width: '12%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="text-sm text-slate-900 font-medium">{row.score ?? '-'}</span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      width: '13%',
      cell: (row: CompetitionParticipationDTO) => (
        <span className="text-sm text-slate-500 truncate">{row.notes || '-'}</span>
      ),
    },
  ]

  return <DataTable columns={columns} data={data} keyExtractor={(row) => String(row.id)} />
}
