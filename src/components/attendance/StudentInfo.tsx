interface StudentInfoProps {
  fullName: string
  billingStatus: 'paid' | 'due'
}

function BillingBadge({ status }: { status: 'paid' | 'due' }) {
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

export function StudentInfo({ fullName, billingStatus }: StudentInfoProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-bold text-slate-900">{fullName}</span>
      <BillingBadge status={billingStatus} />
    </div>
  )
}
