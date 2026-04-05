import { useState } from 'react'
import { Calendar, CheckCircle2, XCircle, MinusCircle, Clock, Users } from 'lucide-react'
import type { Session } from '../../api/academics'
import { EmptyState } from '../common/EmptyState'

interface AttendanceRecord {
  student_id: number
  student_name: string
  status: 'present' | 'absent' | 'excused' | 'late' | null
}

interface SessionAttendance {
  session: Session
  records: AttendanceRecord[]
}

interface AttendanceTabProps {
  sessions: Session[]
  students: { id: number; full_name: string }[]
  onUpdateAttendance?: (sessionId: number, studentId: number, status: string) => void
  isLoading?: boolean
}

export function AttendanceTab({ 
  sessions, 
  students, 
  onUpdateAttendance,
  isLoading 
}: AttendanceTabProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  // Calculate attendance stats
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'excused':
        return <MinusCircle className="w-5 h-5 text-amber-600" />
      case 'late':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'excused':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'late':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-50 text-slate-400 border-slate-200'
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-secondary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading attendance data...</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No sessions scheduled"
        message="There are no sessions scheduled for this group yet."
        icon="calendar"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Attendance Tracking</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage student attendance for group sessions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-on-surface">{completedSessions}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-secondary">{upcomingSessions}</p>
            <p className="text-xs text-slate-500">Upcoming</p>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 sticky left-0 bg-slate-50">
                  Student
                </th>
                {sessions.slice(0, 10).map((session) => (
                  <th key={session.id} className="px-2 py-3 text-center text-xs font-medium text-slate-500 min-w-[60px]">
                    <div className="flex flex-col items-center">
                      <span>{new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className={`mt-1 px-1.5 py-0.5 rounded text-[10px] ${
                        session.status === 'completed' ? 'bg-green-100 text-green-700' :
                        session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-on-surface sticky left-0 bg-white hover:bg-slate-50">
                    {student.full_name}
                  </td>
                  {sessions.slice(0, 10).map((session) => (
                    <td key={session.id} className="px-2 py-3 text-center">
                      {onUpdateAttendance ? (
                        <select
                          className={`text-xs rounded-full px-2 py-1 border ${getStatusColor(null)} cursor-pointer hover:opacity-80`}
                          defaultValue=""
                          onChange={(e) => onUpdateAttendance(session.id, student.id, e.target.value)}
                        >
                          <option value="">-</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="excused">Excused</option>
                          <option value="late">Late</option>
                        </select>
                      ) : (
                        <div className="flex justify-center">
                          {getStatusIcon(null)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sessions.length > 10 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Showing last 10 sessions of {sessions.length} total
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-slate-600">
        <span className="font-medium">Legend:</span>
        {[
          { status: 'present', label: 'Present', color: 'bg-green-500' },
          { status: 'absent', label: 'Absent', color: 'bg-red-500' },
          { status: 'excused', label: 'Excused', color: 'bg-amber-500' },
          { status: 'late', label: 'Late', color: 'bg-blue-500' },
        ].map(({ status, label, color }) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AttendanceTab
