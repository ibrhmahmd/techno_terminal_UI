import { User, Calendar } from 'lucide-react'
import { DataTable } from '../../common/DataTable'
import { LoadingState } from '../../common/LoadingState'
import { EmptyState } from '../../common/EmptyState'
import type { InstructorAssignmentDTO } from '../../../api/academics'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface InstructorHistoryTableProps {
  data: InstructorAssignmentDTO[]
  isLoading: boolean
}

export function InstructorHistoryTable({ data, isLoading }: InstructorHistoryTableProps) {
  if (isLoading) {
    return <LoadingState message="Loading instructor history..." />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="No instructor changes"
        message="No instructor assignment history available for this group."
      />
    )
  }

  const assignmentTypeConfig: Record<InstructorAssignmentDTO['assignment_type'], { label: string; color: string }> = {
    primary: { label: 'Primary', color: 'bg-blue-100 text-blue-700' },
    substitute: { label: 'Substitute', color: 'bg-amber-100 text-amber-700' },
    assistant: { label: 'Assistant', color: 'bg-purple-100 text-purple-700' },
  }

  const columns = [
    {
      key: 'instructor',
      header: 'Instructor',
      width: '25%',
      cell: (row: InstructorAssignmentDTO) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-900">{row.instructor_name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '18%',
      render: (row: InstructorAssignmentDTO) => {
        const config = assignmentTypeConfig[row.assignment_type]
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'startDate',
      header: 'Start Date',
      width: '18%',
      cell: (row: InstructorAssignmentDTO) => (
        <span className="text-sm text-slate-600 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(row.start_date)}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      width: '18%',
      cell: (row: InstructorAssignmentDTO) => (
        <span className="text-sm text-slate-600">
          {row.end_date ? formatDate(row.end_date) : 'Present'}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      width: '21%',
      cell: (row: InstructorAssignmentDTO) => (
        <span className="text-sm text-slate-500 truncate">{row.reason || '-'}</span>
      ),
    },
  ]

  return <DataTable columns={columns} data={data} keyExtractor={(row) => String(row.id)} />
}
