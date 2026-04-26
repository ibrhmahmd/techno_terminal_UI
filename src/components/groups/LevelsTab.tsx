import { useState, useMemo } from 'react'
import { Calendar, Users, BookOpen, GraduationCap, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { GroupLevelTimelineItem, GroupLevelAnalyticsDTO } from '../../api/academics'

interface LevelsTabProps {
  groupId: number
  levels: GroupLevelTimelineItem[]
  levelAnalytics: GroupLevelAnalyticsDTO[]
  currentLevelNumber: number
}

export function LevelsTab({
  groupId: _groupId,
  levels,
  levelAnalytics,
  currentLevelNumber,
}: LevelsTabProps) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  const levelsWithAnalytics = useMemo(() => {
    return levels.map(level => {
      const analytics = levelAnalytics.find(a => a.level_number === level.level_number)
      return { ...level, analytics }
    })
  }, [levels, levelAnalytics])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="w-5 h-5 text-amber-500" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-amber-100 text-amber-700`}>Active</span>
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Completed</span>
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Cancelled</span>
      default:
        return <span className={`${baseClasses} bg-slate-100 text-slate-600`}>Unknown</span>
    }
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (levels.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-700 mb-1">No Level History</h3>
        <p className="text-slate-500">This group doesn't have any level progression data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Level Progression History ({levels.length} levels)
        </h2>
        <span className="text-sm text-slate-500">
          Current: Level {currentLevelNumber}
        </span>
      </div>

      <div className="grid gap-4">
        {levelsWithAnalytics.map((level) => (
          <div
            key={level.id}
            className={`bg-white rounded-xl border transition-all ${
              expandedLevel === level.id
                ? 'border-blue-300 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            } ${level.level_number === currentLevelNumber ? 'ring-2 ring-blue-100' : ''}`}
          >
            {/* Card Header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {level.level_number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      Level {level.level_number}
                      {level.level_number === currentLevelNumber && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {level.course_name || 'Unknown Course'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(level.status)}
                  {getStatusIcon(level.status)}
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    {level.enrollment_count} students
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    {formatDate(level.start_date)} - {formatDate(level.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    {level.analytics?.sessions_completed || 0}/{level.analytics?.sessions_total || 0} sessions
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedLevel === level.id && level.analytics && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Students</p>
                    <p className="text-lg font-semibold text-slate-900">{level.analytics.student_count}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Sessions Completed</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {level.analytics.sessions_completed}/{level.analytics.sessions_total}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Completion Rate</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {level.analytics.completion_rate}%
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Avg Attendance</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {level.analytics.average_attendance}%
                    </p>
                  </div>
                </div>

                {level.instructor_name && (
                  <div className="mt-4 text-sm text-slate-600">
                    <span className="text-slate-500">Instructor:</span> {level.instructor_name}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LevelsTab
