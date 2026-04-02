import { useNavigate } from 'react-router-dom'
import type { Session, Group } from '../../api/academics'

interface GroupSessionCardProps {
  group: Group
  sessions: Session[]
  selectedDate: string
}

// Mock student data for display
const MOCK_STUDENTS = [
  { id: 1, name: 'Ahmed Salem', initials: 'AS', color: 'teal', billing: 'paid', attendance: [true, false, true, null, null] },
  { id: 2, name: 'Sara Khaled', initials: 'SK', color: 'purple', billing: 'unpaid', attendance: [false, null, null, null, null] },
]

const SESSION_COUNT = 5

export function GroupSessionCard({ group, sessions }: GroupSessionCardProps) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/groups/${group.id}`)
  }

  // Get time from first session or use default
  const sessionTime = sessions.length > 0 
    ? `${sessions[0].start_time} - ${sessions[0].end_time}`
    : '03:00 PM - 04:30 PM'

  // Get instructor initials
  const instructorInitials = group.instructor_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'teal':
        return 'bg-teal-50 text-teal-600 border-teal-100'
      case 'purple':
        return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'rose':
        return 'bg-rose-50 text-rose-600 border-rose-100'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  const getBillingClasses = (billing: string) => {
    return billing === 'paid'
      ? 'bg-teal-50 text-teal-600 border-teal-100'
      : 'bg-red-50 text-red-600 border-red-100'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
      {/* Header - Matches dashboard.html exactly */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-secondary rounded-full"></div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-lg font-bold text-on-surface">{group.name}</h3>
            <button
              onClick={handleCardClick}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
            </button>
          </div>
          <div className="ml-2">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {sessionTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Instructor
            </p>
            <p className="font-medium text-sm text-on-surface">{group.instructor_name}</p>
          </div>
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
            {instructorInitials}
          </div>
        </div>
      </div>

      {/* Table - Matches dashboard.html exactly */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">
                Student
              </th>
              <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">
                Billing
              </th>
              {[...Array(SESSION_COUNT)].map((_, i) => (
                <th 
                  key={i} 
                  className="py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 text-center"
                >
                  Session {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_STUDENTS.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold border ${getColorClasses(student.color)}`}>
                      {student.initials}
                    </div>
                    <span className="font-medium text-sm text-on-surface">{student.name}</span>
                  </div>
                </td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getBillingClasses(student.billing)}`}>
                    {student.billing}
                  </span>
                </td>
                {student.attendance.map((status, idx) => (
                  <td key={idx} className="py-3 px-6 text-center">
                    {status === true && (
                      <button className="w-7 h-7 rounded bg-secondary text-white inline-flex items-center justify-center hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                    )}
                    {status === false && (
                      <button className="w-7 h-7 rounded bg-red-50 text-red-600 inline-flex items-center justify-center border border-red-100 hover:bg-red-100 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                    {status === null && (
                      <button className="w-7 h-7 rounded border border-slate-200 text-slate-300 inline-flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-sm">check_box_outline_blank</span>
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer - Matches dashboard.html exactly */}
      <div className="p-3 bg-slate-50 flex justify-end gap-2">
        <button className="px-4 py-1.5 rounded text-xs font-semibold text-slate-500 hover:text-secondary transition-colors">
          Cancel
        </button>
        <button className="bg-secondary text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-sm">save</span>
          Save Changes
        </button>
      </div>
    </div>
  )
}
