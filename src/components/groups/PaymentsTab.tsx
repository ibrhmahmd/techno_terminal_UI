import { useState } from 'react'
import { DollarSign, CheckCircle, AlertCircle, TrendingUp, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import type { GroupPaymentsSummaryDTO, LevelPaymentsDTO } from '../../api/academics'

interface PaymentsTabProps {
  paymentSummary: GroupPaymentsSummaryDTO | null
  paymentsByLevel: LevelPaymentsDTO[]
  totalExpected: number
  totalCollected: number
  totalDue: number
  collectionRate: number
  isLoading: boolean
}

export function PaymentsTab({
  paymentSummary,
  paymentsByLevel,
  totalExpected,
  totalCollected,
  totalDue,
  collectionRate,
  isLoading,
}: PaymentsTabProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading payment data" className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full mb-3" />
          <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-48" />
        </div>
      </div>
    )
  }

  if (!paymentSummary || paymentsByLevel.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden={true} />
        <h3 className="text-lg font-medium text-slate-700 mb-1">No Payment Data</h3>
        <p className="text-slate-500">Payment information is not available for this group.</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} EGP`
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" aria-hidden={true} />
            </div>
            <span className="text-sm text-slate-500">Total Expected</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{formatCurrency(totalExpected)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" aria-hidden={true} />
            </div>
            <span className="text-sm text-slate-500">Collected</span>
          </div>
          <p className="text-2xl font-bold text-green-600 tabular-nums">{formatCurrency(totalCollected)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden={true} />
            </div>
            <span className="text-sm text-slate-500">Due</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 tabular-nums">{formatCurrency(totalDue)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" aria-hidden={true} />
            </div>
            <span className="text-sm text-slate-500">Collection Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 tabular-nums">{Math.round(collectionRate * 100)}%</p>
        </div>
      </div>

      {/* Level Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" aria-hidden={true} />
            Payments by Level
          </h3>
        </div>

        {paymentsByLevel.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No level breakdown data available
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paymentsByLevel.map((level) => (
              <div key={level.level_number}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={selectedLevel === level.level_number}
                  aria-label={`Level ${level.level_number} payment details`}
                  className={`w-full p-4 hover:bg-slate-50 transition-colors text-left ${
                    selectedLevel === level.level_number ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedLevel(
                    selectedLevel === level.level_number ? null : level.level_number
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedLevel(selectedLevel === level.level_number ? null : level.level_number)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {level.level_number}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Level {level.level_number}</h4>
                        <p className="text-sm text-slate-500">{level.course_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(level.collected)} / {formatCurrency(level.expected)}
                      </p>
                      <p className="text-sm text-slate-500 tabular-nums">
                        {level.paid_count} paid, {level.unpaid_count} unpaid
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end px-4 pb-2">
                  <button
                    type="button"
                    onClick={() => setExpandedLevel(expandedLevel === level.level_number ? null : level.level_number)}
                    aria-expanded={expandedLevel === level.level_number}
                    aria-label={expandedLevel === level.level_number ? `Collapse level ${level.level_number} details` : `Expand level ${level.level_number} details`}
                    className="p-2 hover:bg-slate-100 rounded-lg -mt-1 focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:outline-none"
                  >
                    {expandedLevel === level.level_number ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" aria-hidden={true} />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" aria-hidden={true} />
                    )}
                  </button>
                </div>

                {/* Expanded Payment Details */}
                {expandedLevel === level.level_number && level.payments.length > 0 && (
                  <div className="px-4 pb-4 bg-slate-50">
                    <div className="pl-14">
                      <h5 className="text-sm font-medium text-slate-700 mb-2">Payment Details</h5>
                      <div className="space-y-2">
                        {level.payments.slice(0, 5).map((payment) => (
                          <div key={payment.payment_id} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{payment.student_name}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-semibold ${
                                payment.status === 'completed' ? 'text-green-600' :
                                payment.status === 'pending' ? 'text-amber-600' :
                                payment.status === 'failed' ? 'text-red-600' :
                                'text-slate-600'
                              }`}>
                                {formatCurrency(payment.amount)}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {level.payments.length > 5 && (
                          <p className="text-sm text-slate-500 text-center py-2">
                            +{level.payments.length - 5} more payments
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
