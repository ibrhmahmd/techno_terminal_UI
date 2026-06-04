import { useState } from 'react'
import { BookOpen, GraduationCap, CheckCircle, XCircle, AlertCircle, Edit3 } from 'lucide-react'
import type { LevelDetailDTO, LevelPaymentsDTO, CourseInfoDTO, InstructorInfoDTO } from '../../api/academics'
import { LevelSelector } from './detail/LevelSelector'
import { useGroupAttendance } from '../../hooks/useGroupAttendance'
import { AttendanceGrid } from '../attendance/AttendanceGrid'
import { transformRoster, transformSessions } from '../../utils/attendanceTransforms'
import { LoadingSpinner } from '../common/LoadingSpinner'

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
  groupInstructorName?: string
  groupName?: string
  courseName?: string
}

export function LevelsTab({
  levels,
  currentLevelNumber,
  groupId,
  paymentsByLevel,
  coursesMap,
  instructorsMap: _instructorsMap,
  onAddLevel,
  groupInstructorName,
  groupName,
  courseName,
}: LevelsTabProps) {
  const initialLevelId = levels.find(l => l.level_number === currentLevelNumber)?.level_id || levels[0]?.level_id || null
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(initialLevelId)
  const [viewMode, setViewMode] = useState<'attendance' | 'payments'>('attendance')

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

  const getDurationString = (start?: string | null, end?: string | null) => {
    if (!start || !end) return ''
    try {
      const s = new Date(start)
      const e = new Date(end)
      const diffTime = Math.abs(e.getTime() - s.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const weeks = Math.floor(diffDays / 7)
      const extraDays = diffDays % 7
      
      let parts = []
      if (weeks > 0) {
        parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`)
      }
      if (extraDays > 0 || weeks === 0) {
        parts.push(`${extraDays} day${extraDays > 1 ? 's' : ''}`)
      }
      return `${parts.join(' ')}`
    } catch {
      return ''
    }
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
        <div className={`bg-surface-container-low border border-surface-container-low rounded-lg p-6 ${
          selectedLevel.level_number === currentLevelNumber ? 'ring-1 ring-secondary/30' : ''
        }`}>
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-white font-bold text-lg">
                {selectedLevel.level_number}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  Level {selectedLevel.level_number}
                  <button
                    disabled
                    title="Coming soon — level renumbering requires a database migration"
                    className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-600 cursor-not-allowed opacity-60 flex items-center justify-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {selectedLevel.level_number === currentLevelNumber && (
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
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

          {/* Level Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Date Range Card */}
            <div className="bg-surface-container-lowest p-4 rounded-md border border-surface-container-low flex flex-col justify-between min-h-[90px]">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Timeline</span>
                <span className="font-headline text-sm font-bold text-slate-900 leading-tight block">
                  {formatDate(selectedLevel.start_date)} - {formatDate(selectedLevel.end_date)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-secondary bg-secondary/10 px-2 py-0.5 rounded mt-1.5 inline-block">
                  Duration: {getDurationString(selectedLevel.start_date, selectedLevel.end_date) || 'N/A'}
                </span>
              </div>
            </div>

            {/* Sessions Card */}
            <div className="bg-surface-container-lowest p-4 rounded-md border border-surface-container-low flex flex-col justify-between min-h-[90px]">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sessions</span>
                <span className="font-headline text-base font-bold text-slate-900 leading-tight block">
                  {selectedLevel.sessions.length} Sessions
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1.5 block">Total session nodes</span>
            </div>

            {/* Course Card */}
            <div className="bg-surface-container-lowest p-4 rounded-md border border-surface-container-low flex flex-col justify-between min-h-[90px]">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Course</span>
                <span className="font-headline text-sm font-bold text-slate-900 leading-tight block truncate" title={coursesMap[selectedLevel.course_id]?.course_name || courseName || `ID: ${selectedLevel.course_id}`}>
                  {coursesMap[selectedLevel.course_id]?.course_name || courseName || `ID: ${selectedLevel.course_id}`}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1.5 block">Curriculum standard</span>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex justify-center mb-6">
              <div role="tablist" aria-label="Select view" className="flex items-center gap-1 rounded-md bg-surface-container-low border border-surface-container-low p-1 w-full max-w-md">
                <button
                  role="tab"
                  aria-selected={viewMode === 'attendance'}
                  onClick={() => setViewMode('attendance')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all whitespace-nowrap font-headline text-sm ${
                    viewMode === 'attendance'
                      ? 'bg-surface text-secondary shadow-sm font-bold border border-surface-container-high'
                      : 'text-slate-600 hover:text-secondary hover:bg-surface-container-lowest/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  Attendance & Sessions
                </button>
                <button
                  role="tab"
                  aria-selected={viewMode === 'payments'}
                  onClick={() => setViewMode('payments')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all whitespace-nowrap font-headline text-sm ${
                    viewMode === 'payments'
                      ? 'bg-surface text-secondary shadow-sm font-bold border border-surface-container-high'
                      : 'text-slate-600 hover:text-secondary hover:bg-surface-container-lowest/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Payments
                </button>
              </div>
            </div>
            
            {viewMode === 'attendance' ? (
              <div className="animate-fadeIn">
                <LevelAttendancePanel
                  groupId={groupId}
                  levelNumber={selectedLevel.level_number}
                  groupInstructorName={groupInstructorName}
                  groupName={groupName}
                  courseName={courseName}
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function LevelAttendancePanel({
  groupId,
  levelNumber,
  groupInstructorName,
  groupName,
  courseName,
}: {
  groupId: number
  levelNumber: number
  groupInstructorName?: string
  groupName?: string
  courseName?: string
}) {
  const { roster, sessions, isLoading, error } = useGroupAttendance(groupId, levelNumber)

  if (isLoading) return <div className="py-12 flex justify-center"><LoadingSpinner /></div>
  if (error) return <div className="py-8 text-center text-red-500">Failed to load attendance: {error}</div>

  const transformedRoster = transformRoster(roster)
  const transformedSessions = transformSessions(sessions, roster, groupId, levelNumber)

  return (
    <AttendanceGrid 
      roster={transformedRoster}
      sessions={transformedSessions}
      groupId={groupId}
      level={levelNumber}
      groupInstructorName={groupInstructorName}
      groupName={groupName}
      courseName={courseName}
    />
  )
}
