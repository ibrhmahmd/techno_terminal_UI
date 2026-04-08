import { DataTable, type DataTableColumn } from '../../common'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import type { InstructorPerformanceReport } from '../../../api/reports'

const instructorColumns: DataTableColumn<InstructorPerformanceReport>[] = [
  {
    key: 'instructor_name',
    header: 'Instructor',
    cell: (instructor) => <span className="font-semibold text-slate-900">{instructor.instructor_name}</span>
  },
  {
    key: 'groups_count',
    header: 'Groups',
    align: 'center',
    cell: (instructor) => <span className="text-slate-600">{instructor.groups_count}</span>
  },
  {
    key: 'total_students',
    header: 'Students',
    align: 'center',
    cell: (instructor) => <span className="text-slate-600">{instructor.total_students}</span>
  },
  {
    key: 'attendance_rate',
    header: 'Attendance Rate',
    align: 'center',
    cell: (instructor) => (
      <span className="text-slate-600">{(instructor.attendance_rate * 100).toFixed(1)}%</span>
    )
  },
  {
    key: 'sessions',
    header: 'Sessions',
    align: 'center',
    cell: (instructor) => (
      <span className="text-slate-600">
        {instructor.sessions_conducted}
        {instructor.sessions_cancelled > 0 && (
          <span className="text-red-500 text-xs ml-1">
            ({instructor.sessions_cancelled} cancelled)
          </span>
        )}
      </span>
    )
  }
]

interface InstructorsTabProps {
  instructors: InstructorPerformanceReport[]
  isLoading: boolean
  error?: string
  onRetry?: () => void
}

export function InstructorsTab({ instructors, isLoading, error, onRetry }: InstructorsTabProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Instructor Performance</h2>
        <p className="text-sm text-slate-500 mb-6">Active groups and students by instructor</p>
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Instructor Performance</h2>
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
          <p className="mb-2">Failed to load instructor data: {error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Instructor Performance</h2>
      <p className="text-sm text-slate-500 mb-6">Active groups and students by instructor</p>
      
      <DataTable
        data={instructors}
        columns={instructorColumns}
        keyExtractor={(i) => i.instructor_id.toString()}
        isLoading={isLoading}
        emptyMessage="No instructor data available"
        emptyIcon="none"
      />
    </div>
  )
}
