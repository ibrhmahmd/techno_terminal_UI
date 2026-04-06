import { StudentProgressChart } from '../../reports/StudentProgressChart'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import type { StudentProgressReport } from '../../../api/reports'

interface ProgressTabProps {
  progress: StudentProgressReport[]
  isLoading: boolean
  error?: string
  onRetry?: () => void
  topStudentCount?: number
}

export function ProgressTab({ 
  progress, 
  isLoading, 
  error, 
  onRetry,
  topStudentCount = 5 
}: ProgressTabProps) {
  const completed = progress.filter(s => s.progress_percentage >= 80).length
  const inProgress = progress.filter(s => s.progress_percentage > 0 && s.progress_percentage < 80).length
  const notStarted = progress.filter(s => s.progress_percentage === 0).length

  const topPerformers = [...progress]
    .sort((a, b) => b.progress_percentage - a.progress_percentage)
    .slice(0, topStudentCount)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-80 flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-80 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
          <p className="mb-2">Failed to load progress data: {error}</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Student Progress Distribution</h2>
        <p className="text-sm text-slate-500 mb-6">Completion status across all students</p>
        <StudentProgressChart
          completed={completed}
          inProgress={inProgress}
          notStarted={notStarted}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Top Performing Students</h2>
        <div className="space-y-3">
          {topPerformers.map((student, index) => (
            <div key={student.student_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-white text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-on-surface">{student.student_name}</p>
                <p className="text-sm text-slate-500">Level {student.current_level} • Score: {student.average_score}%</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-secondary">{student.progress_percentage}%</p>
                <p className="text-xs text-slate-500">
                  {student.modules_completed}/{student.total_modules} modules
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
