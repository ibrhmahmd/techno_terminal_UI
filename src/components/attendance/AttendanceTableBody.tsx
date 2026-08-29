import { StudentInfo } from './StudentInfo'
import { AttendanceCell } from './AttendanceCell'
import type { SessionWithAttendanceDTO } from '../../api/dashboard'
import type { StudentRowData } from './types'

interface AttendanceTableBodyProps {
  students: StudentRowData[]
  sessions: SessionWithAttendanceDTO[]
  onToggle: (studentId: string | number, sessionId: number) => void
}

export function AttendanceTableBody({ students, sessions, onToggle }: AttendanceTableBodyProps) {


  return (
    <tbody>
      {students.map((student, index) => (
        <tr 
          key={`${student.student_id}-${index}`} 
          className={`transition-colors ${
            index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
          } hover:bg-secondary-container/10`}
        >
          {/* Student Cell */}
          <td className="px-6 py-4 border-r border-slate-200">
            <StudentInfo
              fullName={student.full_name}
              billingStatus={student.billing_status}
              balance={student.balance}
            />
          </td>

          {/* Attendance Cells */}
          {sessions.map((session, sessionIdx) => {
            const status = student.attendance.get(session.session_id) ?? 'not_taken'
            const isCancelled = session.status === 'cancelled'
            return (
              <td
                key={`${student.student_id}-${session.session_id}-${sessionIdx}`}
                className={`px-4 py-2 text-center border-l border-slate-200 ${
                  isCancelled ? 'opacity-50 blur-[1px] bg-gray-100' : ''
                }`}
              >
                <AttendanceCell
                  status={status}
                  onToggle={onToggle}
                  studentId={student.student_id}
                  sessionId={session.session_id}
                  disabled={isCancelled}
                />
              </td>
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}
