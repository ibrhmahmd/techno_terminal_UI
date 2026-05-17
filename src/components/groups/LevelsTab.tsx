import { useState } from 'react'
import { Calendar, Users, BookOpen, GraduationCap, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { LevelDetailDTO } from '../../api/academics'

interface LevelsTabProps {
  groupId: number
  levels: LevelDetailDTO[]
  currentLevelNumber: number
}

export function LevelsTab({
  levels,
  currentLevelNumber,
}: Omit<LevelsTabProps, 'groupId'>) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

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

  const formatDate = (date: string | null | undefined) => {
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
        {levels.map((level) => (
          <div
            key={level.level_id}
            className={`bg-white rounded-xl border transition-all ${
              expandedLevel === level.level_id
                ? 'border-blue-300 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            } ${level.level_number === currentLevelNumber ? 'ring-2 ring-blue-100' : ''}`}
          >
            {/* Card Header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedLevel(expandedLevel === level.level_id ? null : level.level_id)}
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
                      Course ID: {level.course_id}
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
                    {level.students_count} students ({level.students_completed} completed, {level.students_dropped} dropped)
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
                    {level.sessions.length} sessions
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Details - Payment Summary */}
            {expandedLevel === level.level_id && level.payment_summary && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Expected</p>
                    <p className="text-lg font-semibold text-slate-900">{level.payment_summary.total_expected} EGP</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Collected</p>
                    <p className="text-lg font-semibold text-green-600">
                      {level.payment_summary.total_collected} EGP
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Due</p>
                    <p className="text-lg font-semibold text-amber-600">
                      {level.payment_summary.total_due} EGP
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Collection Rate</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {Math.round(level.payment_summary.collection_rate * 100)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-600">
                  <span className="text-slate-500">Instructor ID:</span> {level.instructor_id}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
