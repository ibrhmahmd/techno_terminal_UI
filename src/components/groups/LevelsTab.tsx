import { useState } from 'react'
import { Calendar, Users, BookOpen, GraduationCap, Clock, CheckCircle, XCircle, AlertCircle, Edit3, ChevronDown, ChevronUp } from 'lucide-react'
import type { LevelDetailDTO, LevelPaymentsDTO } from '../../api/academics'
import { SessionListPanel } from './detail/SessionListPanel'

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} EGP`
}

function LevelPaymentsPanel({ payments }: { payments: LevelPaymentsDTO['payments'] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!payments || payments.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium text-slate-700">Recent Payments ({payments.length})</h5>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 rounded px-2 py-1"
        >
          {isExpanded ? 'Hide' : 'Show'}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-2 mt-3">
          {payments.slice(0, 5).map((payment) => (
            <div key={payment.payment_id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900">{payment.student_name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  payment.status === 'completed' ? 'text-green-600' :
                  payment.status === 'pending' ? 'text-amber-600' :
                  payment.status === 'failed' ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {formatCurrency(payment.amount)}
                </p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                  payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                  payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
          {payments.length > 5 && (
            <p className="text-xs text-slate-500 text-center py-2">
              +{payments.length - 5} more payments
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface LevelsTabProps {
  levels: LevelDetailDTO[]
  currentLevelNumber: number
  groupId: number
  paymentsByLevel?: LevelPaymentsDTO[]
}

export function LevelsTab({
  levels,
  currentLevelNumber,
  groupId,
  paymentsByLevel,
}: LevelsTabProps) {

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" aria-hidden={true} />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" aria-hidden={true} />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" aria-hidden={true} />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" aria-hidden={true} />
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
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden={true} />
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

      <div className="grid gap-6">
        {levels.map((level) => (
          <div
            key={level.level_id}
            className={`bg-white rounded-xl border shadow-sm p-6 ${
              level.level_number === currentLevelNumber ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
            }`}
          >
            {/* Card Header */}
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
                    <BookOpen className="w-4 h-4" aria-hidden={true} />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-slate-400" aria-hidden={true} />
                <span className="text-slate-600 tabular-nums">
                  {level.students_count} students ({level.students_completed} completed, {level.students_dropped} dropped)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" aria-hidden={true} />
                <span className="text-slate-600">
                  {formatDate(level.start_date)} - {formatDate(level.end_date)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" aria-hidden={true} />
                <span className="text-slate-600">
                  {level.sessions.length} sessions
                </span>
              </div>
            </div>

            {/* Expanded Details - Payment Summary */}
            {level.payment_summary && (
              <div className="mt-4 pt-4 border-t border-slate-100">
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
              </div>
            )}

            <LevelPaymentsPanel payments={paymentsByLevel?.find(p => p.level_number === level.level_number)?.payments || []} />

            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Instructor ID:</span> {level.instructor_id}
              </div>
              <button
                disabled
                title="Coming soon — level renumbering requires a database migration"
                className="flex items-center gap-1.5 text-slate-500 opacity-50 cursor-not-allowed text-xs font-medium"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Level Number
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full ml-1 uppercase tracking-wider font-bold">
                  Coming Soon
                </span>
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <SessionListPanel 
                sessions={level.sessions}
                groupId={groupId}
                levelNumber={level.level_number}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
