import type { TopDebtorItem, UnpaidAttendeeItem } from '../../../api/reports/daily'

interface ReportDebtorsDetailsProps {
  topDebtors: TopDebtorItem[]
  unpaidAttendees: UnpaidAttendeeItem[]
}

export function ReportDebtorsDetails({ topDebtors, unpaidAttendees }: ReportDebtorsDetailsProps) {
  if (topDebtors.length === 0 && unpaidAttendees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">Debtors & Unpaid Students</h3>
        <div className="text-center py-8 text-slate-500">
          <span className="material-symbols-outlined text-4xl text-emerald-300 mb-3" aria-hidden="true">check_circle</span>
          <p>No outstanding debts or unpaid students for this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {topDebtors.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">
            Top Debtors
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {topDebtors.length} Top
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-500">Student Name</th>
                  <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-slate-500">Amount Owed</th>
                </tr>
              </thead>
              <tbody>
                {topDebtors.map((debtor, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-medium text-on-surface">{debtor.student_name}</td>
                    <td className="py-3 px-4 text-sm text-right text-red-600 font-medium">
                      EGP {debtor.amount_owed.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {unpaidAttendees.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">
            Cumulative Unpaid Attendees
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {unpaidAttendees.length} Students
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-500">Student Name</th>
                  <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-500">Group Name</th>
                  <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-slate-500">Amount Owed</th>
                </tr>
              </thead>
              <tbody>
                {unpaidAttendees.map((attendee, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-medium text-on-surface">{attendee.student_name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{attendee.group_name}</td>
                    <td className="py-3 px-4 text-sm text-right text-orange-600 font-medium">
                      EGP {attendee.amount_owed.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
