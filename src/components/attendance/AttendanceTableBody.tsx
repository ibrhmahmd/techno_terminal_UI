import { StudentInfo } from './StudentInfo'
import { AttendanceCell } from './AttendanceCell'
import type { Session } from '../../api/academics'
import type { AttendanceStatus } from '../../api/attendance'

interface StudentRowData {
  student_id: string
  full_name: string
  billing_status: 'paid' | 'due'
  attendance: Map<number, AttendanceStatus>
}

interface AttendanceTableBodyProps {
  students: StudentRowData[]
  sessions: Session[]
  onToggle: (studentId: string, sessionId: number) => void
}

export function AttendanceTableBody({ students, sessions, onToggle }: AttendanceTableBodyProps) {
  const displaySessions = sessions.slice(0, 5)

  return (
    <tbody className="divide-y divide-slate-300">
      {students.map((student, index) => (
        <tr key={`${student.student_id}-${index}`} className="hover:bg-surface-container-low/20 transition-colors border-b border-slate-300">
          {/* Student Cell */}
          <td className="px-6 py-4 border-b border-slate-300">
            <StudentInfo
              fullName={student.full_name}
              billingStatus={student.billing_status}
            />
          </td>

          {/* Attendance Cells */}
          {displaySessions.map((session, sessionIdx) => {
            const status = student.attendance.get(session.id) || null
            const isCancelled = session.status === 'cancelled'
            return (
              <td
                key={`${student.student_id}-${session.id}-${sessionIdx}`}
                className={`px-4 py-2 text-center border-l-2 border-slate-300 border-b border-slate-300 ${
                  isCancelled ? 'opacity-50 blur-[1px] bg-gray-100' : ''
                }`}
              >
                <AttendanceCell
                  status={status}
                  onToggle={() => !isCancelled && onToggle(student.student_id, session.id)}
                />
              </td>
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}
