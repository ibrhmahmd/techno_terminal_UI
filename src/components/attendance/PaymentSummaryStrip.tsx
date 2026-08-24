import { useTranslation } from 'react-i18next'
import type { StudentRosterDTO } from '../../api/dashboard'

interface PaymentSummaryStripProps {
  roster: StudentRosterDTO[]
  className?: string
}

export function PaymentSummaryStrip({ roster, className = '' }: PaymentSummaryStripProps) {
  const { t } = useTranslation('attendance')
  if (!roster || roster.length === 0) return null

  const paidCount = roster.filter(r => r.billing_status === 'paid').length
  const dueCount = roster.filter(r => r.billing_status !== 'paid').length

  // Only display balance if it is known (i.e. not -1 sentinel)
  const isBalanceKnown = roster.some(r => r.balance !== -1)
  const totalRemaining = isBalanceKnown
    ? roster.reduce((sum, r) => sum + Math.max(0, r.balance), 0)
    : 0

  return (
    <div className={`flex items-center gap-2 text-xs font-semibold ${className}`}>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container shadow-sm font-semibold">
        <span className="material-symbols-outlined text-[15px] font-bold text-secondary">check_circle</span>
        <span>{t('payment.paid', { count: paidCount })}</span>
      </span>
      {dueCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-error-container text-error shadow-sm font-semibold">
          <span className="material-symbols-outlined text-[15px] font-bold text-error">cancel</span>
          <span>{t('payment.due', { count: dueCount })}</span>
        </span>
      )}
      {isBalanceKnown && totalRemaining > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-on-surface shadow-sm font-semibold">
          <span className="material-symbols-outlined text-[15px] font-bold text-on-surface-variant">payments</span>
          <span>{t('payment.remaining', { amount: totalRemaining.toLocaleString() })}</span>
        </span>
      )}
    </div>
  )
}
