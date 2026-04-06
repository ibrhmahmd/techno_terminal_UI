import { EnrollmentTrendsChart } from '../../reports/EnrollmentTrendsChart'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import type { EnrollmentTrend } from '../../../api/reports'

interface EnrollmentTabProps {
  trends: EnrollmentTrend[]
  isLoading: boolean
  error?: string
  onRetry?: () => void
}

export function EnrollmentTab({ trends, isLoading, error, onRetry }: EnrollmentTabProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Enrollment Trends</h2>
        <p className="text-sm text-slate-500 mb-6">Daily new enrollments trend</p>
        <div className="h-80 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Enrollment Trends</h2>
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
          <p className="mb-2">Failed to load enrollment data: {error}</p>
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
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Enrollment Trends</h2>
      <p className="text-sm text-slate-500 mb-6">Monthly enrollment activity</p>
      <EnrollmentTrendsChart data={trends} />
    </div>
  )
}
