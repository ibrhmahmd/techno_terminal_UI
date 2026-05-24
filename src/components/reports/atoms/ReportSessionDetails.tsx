import type { SessionDetail } from '../../../api/reports/daily'

interface ReportSessionDetailsProps {
  sessions: SessionDetail[]
}

export function ReportSessionDetails({ sessions }: ReportSessionDetailsProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">Session Details</h3>
        <div className="text-center py-8 text-slate-500">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-3" aria-hidden="true">event</span>
          <p>No sessions for this date</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">
        Session Details
        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
          {sessions.length}
        </span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-500">Instructor</th>
              <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-500">Time</th>
              <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-slate-500">Present</th>
              <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-slate-500">Absent</th>
              <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-slate-500">Cancelled</th>
              <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-500">Students Present</th>
              <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-500">Students Absent</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-medium text-on-surface">
                  {session.instructor_name}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {session.session_time}
                </td>
                <td className="py-3 px-4 text-sm text-right text-green-600 font-medium">
                  {session.present_count}
                </td>
                <td className="py-3 px-4 text-sm text-right text-red-600 font-medium">
                  {session.absent_count}
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-500">
                  {session.cancelled_count}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-[200px] truncate" title={session.student_names_present}>
                  {session.student_names_present || '—'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-[200px] truncate" title={session.student_names_absent}>
                  {session.student_names_absent || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
