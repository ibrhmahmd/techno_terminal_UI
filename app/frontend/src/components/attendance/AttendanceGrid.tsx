import { useState } from 'react'
import type { Session } from '../../api/academics'

interface StudentAttendance {
  student_id: number
  student_name: string
  gender: 'male' | 'female'
  billing_status: 'paid' | 'due'
  attendance: (boolean | null)[]  // true=present, false=absent, null=unmarked
  notes?: string
}

interface AttendanceGridProps {
  sessions: Session[]
}

// Mock students data - in real app, this comes from API
const MOCK_STUDENTS: StudentAttendance[] = [
  {
    student_id: 1,
    student_name: 'Lucas Meyer',
    gender: 'male',
    billing_status: 'paid',
    attendance: [true, true, null, null, null],
    notes: '',
  },
  {
    student_id: 2,
    student_name: 'Sami Khan',
    gender: 'male',
    billing_status: 'due',
    attendance: [true, false, null, null, null],
    notes: 'Medical leave',
  },
  {
    student_id: 3,
    student_name: 'Elena Jovic',
    gender: 'female',
    billing_status: 'paid',
    attendance: [false, true, null, null, null],
    notes: '',
  },
]

const SESSION_DATES = ['Dec 07', 'Dec 14', 'Dec 21', 'Dec 28', 'Jan 04']

export function AttendanceGrid({ sessions }: AttendanceGridProps) {
  const [students, setStudents] = useState<StudentAttendance[]>(MOCK_STUDENTS)
  const [activeSessionIndex, setActiveSessionIndex] = useState(1) // Highlight session 2 by default

  const handleAttendanceClick = (studentIndex: number, sessionIndex: number) => {
    setStudents((prev) => {
      const updated = [...prev]
      const current = updated[studentIndex].attendance[sessionIndex]
      // Cycle: null -> true -> false -> null
      updated[studentIndex].attendance[sessionIndex] = 
        current === null ? true : current === true ? false : null
      return updated
    })
  }

  const getAttendanceIcon = (status: boolean | null) => {
    if (status === true) {
      return (
        <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      )
    }
    if (status === false) {
      return (
        <span className="material-symbols-outlined text-error text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          cancel
        </span>
      )
    }
    return <div className="w-5 h-5 mx-auto border border-outline-variant/20 rounded-sm" />
  }

  const getGenderEmoji = (gender: 'male' | 'female') => {
    return gender === 'male' ? '👦' : '👧'
  }

  const getBillingBadge = (status: 'paid' | 'due') => {
    return status === 'paid' ? (
      <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-sm">
        PAID
      </span>
    ) : (
      <span className="text-[9px] font-bold text-error bg-error-container/20 px-1.5 py-0.5 rounded-sm">
        DUE
      </span>
    )
  }

  // Limit to 5 sessions for display
  const displaySessions = sessions.slice(0, 5)

  return (
    <div className="bg-white border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-surface-container-lowest">
              <th 
                className="px-6 py-5 text-[10px] font-bold text-outline-variant uppercase tracking-[0.2em] border-b border-outline-variant/10" 
                style={{ width: 280 }}
              >
                Student
              </th>
              {displaySessions.map((session, idx) => (
                <th
                  key={session.id}
                  className={`px-4 py-5 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-outline-variant/10 text-center border-l border-outline-variant/5 ${
                    idx === activeSessionIndex 
                      ? 'text-secondary bg-secondary/5' 
                      : 'text-outline-variant'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    Session {idx + 1}
                    <span className="block text-[8px] font-normal tracking-normal opacity-60">
                      {SESSION_DATES[idx]}
                    </span>
                    <button className={`hover:text-secondary ${idx === activeSessionIndex ? 'text-secondary' : 'text-outline-variant'}`}>
                      <span className="material-symbols-outlined text-xs">sticky_note_2</span>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {students.map((student, studentIdx) => (
              <tr key={student.student_id} className="hover:bg-surface-container-low/20 transition-colors">
                {/* Student Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xs mr-3">{getGenderEmoji(student.gender)}</span>
                      <div>
                        <span className="text-sm font-semibold text-on-surface block">
                          {student.student_name}
                        </span>
                        <button className="text-[9px] text-outline hover:text-secondary flex items-center mt-0.5">
                          <span className="material-symbols-outlined text-[10px] mr-0.5">notes</span>
                          {student.notes || 'Add student note'}
                        </button>
                      </div>
                    </div>
                    {getBillingBadge(student.billing_status)}
                  </div>
                </td>

                {/* Attendance Cells */}
                {student.attendance.slice(0, displaySessions.length).map((status, sessionIdx) => (
                  <td
                    key={sessionIdx}
                    className={`px-4 py-4 text-center border-l border-outline-variant/5 ${
                      sessionIdx === activeSessionIndex ? 'bg-secondary/5' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleAttendanceClick(studentIdx, sessionIdx)}
                      className="w-full h-full flex items-center justify-center"
                    >
                      {getAttendanceIcon(status)}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
