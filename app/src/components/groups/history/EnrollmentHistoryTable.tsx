const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
import { DataTable } from '../../common/DataTable'
import { LoadingState } from '../../common/LoadingState'
import { EmptyState } from '../../common/EmptyState'
import type { EnrollmentHistoryDTO } from '../../../api/academics'

interface EnrollmentHistoryTableProps {
  data: EnrollmentHistoryDTO[]
  isLoading: boolean
  total: number
  skip: number
  limit: number
  onPageChange: (skip: number) => void
}

const actionConfig: Record<EnrollmentHistoryDTO['action'], { label: string; color: string }> = {
  enrolled: { label: 'Enrolled', color: 'bg-green-100 text-green-700' },
  transferred_in: { label: 'Transferred In', color: 'bg-blue-100 text-blue-700' },
  withdrawn: { label: 'Withdrawn', color: 'bg-red-100 text-red-700' },
  transferred_out: { label: 'Transferred Out', color: 'bg-amber-100 text-amber-700' },
  graduated: { label: 'Graduated', color: 'bg-purple-100 text-purple-700' },
}

export function EnrollmentHistoryTable({
  data,
  isLoading,
  total,
  skip,
  limit,
  onPageChange,
}: EnrollmentHistoryTableProps) {
  if (isLoading) {
    return <LoadingState message="Loading enrollment history..." />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="No enrollment history"
        message="No enrollment records found for this group."
      />
    )
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      width: '15%',
      cell: (row: EnrollmentHistoryDTO) => formatDate(row.date),
    },
    {
      key: 'student',
      header: 'Student',
      width: '25%',
      cell: (row: EnrollmentHistoryDTO) => (
        <span className="font-medium text-slate-900">{row.student_name}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      width: '20%',
      cell: (row: EnrollmentHistoryDTO) => {
        const config = actionConfig[row.action]
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'level',
      header: 'Level',
      width: '15%',
      cell: (row: EnrollmentHistoryDTO) => (
        <span className="text-sm text-slate-600">Level {row.level_at_time}</span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      width: '25%',
      cell: (row: EnrollmentHistoryDTO) => (
        <span className="text-sm text-slate-500 truncate">{row.notes || '-'}</span>
      ),
    },
  ]

  const currentPage = Math.floor(skip / limit) + 1
  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(row) => row.id}
      />
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          Showing {skip + 1}-{Math.min(skip + data.length, total)} of {total}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(skip - limit)}
            disabled={currentPage <= 1}
            className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(skip + limit)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
