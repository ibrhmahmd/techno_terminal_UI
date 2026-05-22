import { useStudentProgress } from '../hooks/useStudentProgress'
import { StudentProgressChart } from '../../reports/StudentProgressChart'
import { LoadingState } from '../../common/LoadingState'
import { ErrorState } from '../../common/ErrorState'
import { EmptyState } from '../../common/EmptyState'

export function ProgressTab() {
  const { progress, isLoading, error, refetch } = useStudentProgress()

  const completed = progress.filter(s => s.progress_status === 'on_track').length
  const inProgress = progress.filter(s => s.progress_status === 'at_risk').length
  const notStarted = progress.filter(s => s.progress_status === 'behind').length

  const topPerformers = [...progress]
    .sort((a, b) => b.attendance_pct - a.attendance_pct)
    .slice(0, 5)

  if (isLoading) {
    return <LoadingState message="Loading progress data..." />
  }

  if (error) {
    return <ErrorState message={error?.message} onRetry={refetch} />
  }

  if (!progress || progress.length === 0) {
    return <EmptyState title="No progress data" message="No student progress data available." icon="inbox" />
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
        <ol className="space-y-3">
          {topPerformers.map((student) => (
            <li key={student.student_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-white text-sm font-medium">
                {topPerformers.indexOf(student) + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-on-surface">{student.student_name}</p>
                <p className="text-sm text-slate-500">{student.course_name} • Level {student.current_level}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-secondary">{student.attendance_pct}%</p>
                <p className="text-xs text-slate-500">
                  {student.sessions_attended}/{student.total_sessions} sessions
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
