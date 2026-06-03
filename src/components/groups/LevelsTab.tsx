import { useState } from 'react'
import { Calendar, Users, BookOpen, GraduationCap, Clock, CheckCircle, XCircle, AlertCircle, Edit3 } from 'lucide-react'
import type { LevelDetailDTO, LevelPaymentsDTO, CourseInfoDTO, InstructorInfoDTO } from '../../api/academics'
import { SessionListPanel } from './detail/SessionListPanel'
import { LevelStudentsPanel } from './detail/LevelStudentsPanel'
import { LevelSelector } from './detail/LevelSelector'
import { PillSelector } from '../common'

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} EGP`
}

function LevelPaymentsPanel({ payments }: { payments: LevelPaymentsDTO['payments'] }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="py-8 text-center bg-slate-50 rounded-lg">
        <p className="text-slate-500 text-sm">No recent payments found for this level.</p>
      </div>
    )
  }

  return (
    <div className="mt-4 border border-slate-100 rounded-xl bg-white overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
        <h5 className="text-sm font-semibold text-slate-700">Recent Payments ({payments.length})</h5>
      </div>
      <div className="divide-y divide-slate-100">
        {payments.map((payment) => (
          <div key={payment.payment_id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-900">{payment.student_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                payment.status === 'completed' ? 'text-emerald-600' :
                payment.status === 'pending' ? 'text-amber-600' :
                payment.status === 'failed' ? 'text-red-600' :
                'text-slate-600'
              }`}>
                {formatCurrency(payment.amount)}
              </p>
              <span className={`text-[10px] px-2 py-0.5 mt-1 inline-block rounded-full uppercase tracking-wider font-bold ${
                payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {payment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LevelsTabProps {
  levels: LevelDetailDTO[]
  currentLevelNumber: number
  groupId: number
  paymentsByLevel?: LevelPaymentsDTO[]
  coursesMap: Record<string, CourseInfoDTO>
  instructorsMap: Record<string, InstructorInfoDTO>
  onAddLevel?: () => void
}

export function LevelsTab({
  levels,
  currentLevelNumber,
  groupId,
  paymentsByLevel,
  coursesMap,
  instructorsMap,
  onAddLevel,
}: LevelsTabProps) {
  const initialLevelId = levels.find(l => l.level_number === currentLevelNumber)?.level_id || levels[0]?.level_id || null
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(initialLevelId)
  const [viewMode, setViewMode] = useState<'sessions' | 'payments' | 'students'>('sessions')

  const activeLevelId = selectedLevelId || levels[0]?.level_id || null
  const selectedLevel = levels.find(l => l.level_id === activeLevelId)

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

  if (!selectedLevel) return null

  return (
    <div className="space-y-4">
      <LevelSelector
        levels={levels}
        activeLevelId={activeLevelId}
        onLevelChange={setSelectedLevelId}
        currentLevelNumber={currentLevelNumber}
        onAddLevel={onAddLevel}
      />

      <div className="grid gap-6">
        <div className={`bg-white rounded-xl border shadow-sm p-6 ${
          selectedLevel.level_number === currentLevelNumber ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
        }`}>
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {selectedLevel.level_number}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  Level {selectedLevel.level_number}
                  {selectedLevel.level_number === currentLevelNumber && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" aria-hidden={true} />
                  {coursesMap[selectedLevel.course_id]?.course_name || `Course ID: ${selectedLevel.course_id}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(selectedLevel.status)}
              {getStatusIcon(selectedLevel.status)}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-slate-400" aria-hidden={true} />
              <span className="text-slate-600 tabular-nums">
                {selectedLevel.students_count} students ({selectedLevel.students_completed} completed, {selectedLevel.students_dropped} dropped)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" aria-hidden={true} />
              <span className="text-slate-600">
                {formatDate(selectedLevel.start_date)} - {formatDate(selectedLevel.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-400" aria-hidden={true} />
              <span className="text-slate-600">
                {selectedLevel.sessions.length} sessions
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex justify-center mb-6">
              <PillSelector
                options={[
                  { value: 'sessions', label: 'Sessions', icon: 'schedule' },
                  { value: 'payments', label: 'Payments', icon: 'payments' },
                  { value: 'students', label: 'Students', icon: 'groups' }
                ]}
                value={viewMode}
                onChange={(val) => setViewMode(val as 'sessions' | 'payments' | 'students')}
              />
            </div>
            
            {viewMode === 'sessions' ? (
              <div className="animate-fadeIn">
                <SessionListPanel 
                  sessions={selectedLevel.sessions}
                  groupId={groupId}
                  levelNumber={selectedLevel.level_number}
                />
              </div>
            ) : viewMode === 'payments' ? (
              <div className="animate-fadeIn">
                {selectedLevel.payment_summary && (
                  <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Expected</p>
                      <p className="text-xl font-bold text-slate-900 font-headline">{selectedLevel.payment_summary.total_expected} EGP</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <p className="text-xs text-emerald-600 font-medium mb-1 uppercase tracking-wider">Collected</p>
                      <p className="text-xl font-bold text-emerald-700 font-headline">
                        {selectedLevel.payment_summary.total_collected} EGP
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-xs text-amber-600 font-medium mb-1 uppercase tracking-wider">Due</p>
                      <p className="text-xl font-bold text-amber-700 font-headline">
                        {selectedLevel.payment_summary.total_due} EGP
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider">Collection Rate</p>
                      <p className="text-xl font-bold text-blue-700 font-headline">
                        {Math.round(selectedLevel.payment_summary.collection_rate * 100)}%
                      </p>
                    </div>
                  </div>
                )}
                <LevelPaymentsPanel payments={paymentsByLevel?.find(p => p.level_number === selectedLevel.level_number)?.payments || []} />
              </div>
            ) : viewMode === 'students' ? (
              <div className="animate-fadeIn">
                <LevelStudentsPanel 
                  groupId={groupId}
                  selectedLevel={selectedLevel}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <span className="text-slate-500 font-medium">Instructor:</span>{' '}
                <span className="text-slate-900 font-semibold">{instructorsMap[selectedLevel.instructor_id]?.instructor_name || `Unknown (${selectedLevel.instructor_id})`}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Course:</span>{' '}
                <span className="text-slate-900 font-semibold">{coursesMap[selectedLevel.course_id]?.course_name || `Unknown (${selectedLevel.course_id})`}</span>
              </div>
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
        </div>
      </div>
    </div>
  )
}
