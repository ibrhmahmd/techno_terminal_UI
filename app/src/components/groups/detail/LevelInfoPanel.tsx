import { Calendar, Users, BarChart3, Target, CheckCircle } from 'lucide-react'
import type { GroupLevelHistoryDTO } from '../../../api/academics'

interface LevelInfoPanelProps {
  level: GroupLevelHistoryDTO | null
  isActiveLevel: boolean
  attendanceStats: {
    completedSessions: number
    totalSessions: number
    averageAttendance: number
  }
}

export function LevelInfoPanel({ level, isActiveLevel, attendanceStats }: LevelInfoPanelProps) {
  if (!level) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <p className="text-slate-500 text-center">Select a level to view details</p>
      </div>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {level.level_name}
            {isActiveLevel && (
              <span className="ml-2 text-sm font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500">
            <Calendar className="w-4 h-4 inline mr-1" />
            {formatDate(level.start_date)}
            {level.end_date && ` - ${formatDate(level.end_date)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            Enrollment
          </div>
          <p className="text-xl font-bold text-slate-900">
            {level.enrollment_count_start}
            {level.enrollment_count_end !== undefined && (
              <span className="text-sm font-normal text-slate-500">
                {' '}
                → {level.enrollment_count_end}
              </span>
            )}
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            Sessions
          </div>
          <p className="text-xl font-bold text-slate-900">{level.sessions_count}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Target className="w-4 h-4" />
            Completion
          </div>
          <p className="text-xl font-bold text-slate-900">{level.completion_rate}%</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <BarChart3 className="w-4 h-4" />
            Attendance
          </div>
          <p className="text-xl font-bold text-slate-900">{attendanceStats.averageAttendance}%</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-700">
          <strong>Pricing:</strong>{' '}
          {level.pricing_snapshot.monthly_fee} {level.pricing_snapshot.currency}/month
          {' · '}
          {level.pricing_snapshot.session_fee} {level.pricing_snapshot.currency}/session
        </p>
      </div>
    </div>
  )
}
