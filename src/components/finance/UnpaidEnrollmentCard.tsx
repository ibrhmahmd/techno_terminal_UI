import type { UnpaidEnrollment } from '../../api/crm/students/types/finance'

interface UnpaidEnrollmentCardProps {
  enrollment: UnpaidEnrollment
  onPay: () => void
  onRemind: () => void
}

export function UnpaidEnrollmentCard({ enrollment, onPay, onRemind }: UnpaidEnrollmentCardProps) {
  // Calculate days since enrollment
  const enrolledDateObj = enrollment.enrolled_at ? new Date(enrollment.enrolled_at) : null
  const today = new Date()
  const daysUnpaid = enrolledDateObj
    ? Math.floor((today.getTime() - enrolledDateObj.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Determine balance color based on amount
  const isHighBalance = enrollment.remaining_balance > 1000
  const balanceColor = isHighBalance ? 'text-red-600' : 'text-amber-600'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Hero Section: Student Info + Big Balance */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-on-surface truncate">
            {enrollment.student_name || 'Unknown Student'}
          </h4>
          <p className="text-sm text-slate-500 mt-0.5">
            {enrollment.group_name || 'Unknown Group'} • Level {enrollment.level_number}
          </p>
          {daysUnpaid > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-0.5 rounded">
              <span className="material-symbols-outlined text-[12px]" aria-hidden="true">schedule</span>
              {daysUnpaid} days unpaid
            </span>
          )}
        </div>
        <div className="text-right ml-3 shrink-0">
          <p className={`text-2xl font-bold ${balanceColor}`}>
            {enrollment.remaining_balance.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">EGP remaining</p>
        </div>
      </div>

      {/* Compact Financial Breakdown */}
      <div className="flex items-center justify-between py-3 border-y border-slate-100 text-sm mb-4">
        <div>
          <span className="text-xs text-slate-500 block">Due</span>
          <span className="font-semibold text-slate-700">{enrollment.amount_due.toFixed(2)}</span>
        </div>
        <span className="text-slate-300">→</span>
        <div>
          <span className="text-xs text-slate-500 block">Paid</span>
          <span className="font-semibold text-blue-600">{enrollment.total_paid.toFixed(2)}</span>
        </div>
        <span className="text-slate-300">→</span>
        {enrollment.discount_applied > 0 && (
          <>
            <div>
              <span className="text-xs text-slate-500 block">Discount</span>
              <span className="font-semibold text-green-600">-{enrollment.discount_applied.toFixed(2)}</span>
            </div>
            <span className="text-slate-300">→</span>
          </>
        )}
        <div>
          <span className="text-xs text-slate-500 block">Remaining</span>
          <span className={`font-bold ${balanceColor}`}>{enrollment.remaining_balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onPay}
          className="flex-1 px-4 py-2.5 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">payments</span>
          Pay Now
        </button>
        <button
          onClick={onRemind}
          aria-label="Send reminder"
          className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chat</span>
        </button>
      </div>
    </div>
  )
}
