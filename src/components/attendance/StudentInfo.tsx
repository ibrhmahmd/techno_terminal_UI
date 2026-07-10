interface StudentInfoProps {
  fullName: string
  billingStatus: 'paid' | 'due'
  balance?: number
}

function BillingBadge({ status, balance }: { status: 'paid' | 'due'; balance?: number }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
        <span className="material-symbols-outlined text-[12px] font-bold text-secondary">check</span>
        <span>PAID</span>
      </span>
    )
  }

  const badgeText = balance !== undefined && balance > 0
    ? `DUE: ${balance.toLocaleString()} EGP`
    : 'DUE'

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-error bg-error-container px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
      <span className="material-symbols-outlined text-[12px] font-bold text-error">close</span>
      <span>{badgeText}</span>
    </span>
  )
}

export function StudentInfo({ fullName, billingStatus, balance }: StudentInfoProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-bold text-slate-900">{fullName}</span>
      <BillingBadge status={billingStatus} balance={balance} />
    </div>
  )
}
