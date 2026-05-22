import { useState } from 'react'
import type { PaymentsByTypeItem } from '../../../api/reports/daily'

interface ReportPaymentDetailsProps {
  payments: PaymentsByTypeItem[]
}

export function ReportPaymentDetails({ payments }: ReportPaymentDetailsProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set())

  const toggleType = (paymentType: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(paymentType)) {
        next.delete(paymentType)
      } else {
        next.add(paymentType)
      }
      return next
    })
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">Payment Details</h3>
        <div className="text-center py-8 text-slate-500">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-3" aria-hidden="true">payments</span>
          <p>No payments for this date</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">
        Payment Details
        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
          {payments.length} type(s)
        </span>
      </h3>
      <div className="space-y-3">
        {payments.map((paymentType) => {
          const isExpanded = expandedTypes.has(paymentType.payment_type)
          return (
            <div key={paymentType.payment_type} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleType(paymentType.payment_type)}
                aria-expanded={isExpanded}
                aria-controls={`payment-panel-${paymentType.payment_type}`}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-sm transition-transform ${isExpanded ? 'rotate-90' : ''}`} aria-hidden="true">
                    chevron_right
                  </span>
                  <span className="font-medium text-sm text-on-surface capitalize">
                    {paymentType.payment_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">{paymentType.count} payment(s)</span>
                  <span className="font-semibold text-secondary">{paymentType.subtotal.toLocaleString()} EGP</span>
                </div>
              </button>
              {isExpanded && (
                <div id={`payment-panel-${paymentType.payment_type}`} className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left py-2 px-4 text-xs font-medium text-slate-500">Student</th>
                        <th className="text-left py-2 px-4 text-xs font-medium text-slate-500">Group</th>
                        <th className="text-right py-2 px-4 text-xs font-medium text-slate-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentType.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 px-4 text-sm text-slate-700">{item.student_name}</td>
                          <td className="py-2 px-4 text-sm text-slate-500">{item.group_name}</td>
                          <td className="py-2 px-4 text-sm text-right font-medium text-secondary">
                            {item.amount.toLocaleString()} EGP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
