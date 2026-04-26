import { MetricCard } from '../atoms/MetricCard'
import { formatTime } from '../../../utils/formatting'
import type { DailyCollectionItem, DailyReceiptItem } from '../../../api/finance/types'

interface CollectionsTabProps {
  collections: DailyCollectionItem[]
  receipts: DailyReceiptItem[]
  date: string
  onDateChange: (date: string) => void
  isLoading: boolean
  error?: string
  onRetry?: () => void
}

const PAYMENT_METHOD_CONFIG: Record<string, { label: string; icon: string; color: 'green' | 'blue' | 'amber' | 'slate' }> = {
  cash: { label: 'Cash', icon: 'payments', color: 'green' },
  bank_transfer: { label: 'Bank Transfer', icon: 'account_balance', color: 'blue' },
  credit_card: { label: 'Credit Card', icon: 'credit_card', color: 'amber' }
}

function getPaymentMethodConfig(method: string) {
  return PAYMENT_METHOD_CONFIG[method] || { label: method, icon: 'more_horiz', color: 'slate' }
}

export function CollectionsTab({
  collections,
  receipts,
  date,
  onDateChange,
  isLoading,
  error,
  onRetry
}: CollectionsTabProps) {
  const totalCollected = collections.reduce((sum, c) => sum + c.total_amount, 0)
  const totalReceipts = collections.reduce((sum, c) => sum + c.receipt_count, 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Daily Collections</h2>
              <p className="text-sm text-slate-500">Collection summary by payment method</p>
            </div>
            <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-slate-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Daily Collections</h2>
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
          <p className="mb-2">Failed to load collections data: {error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Daily Collections</h2>
            <p className="text-sm text-slate-500">Collection summary by payment method</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            />
          </div>
        </div>

        {/* Payment Method Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Card */}
          <MetricCard
            title="Total Collected"
            value={`${totalCollected.toLocaleString()} EGP`}
            subtitle={`${totalReceipts} receipts`}
            color="green"
          />

          {/* Payment Method Cards */}
          {collections.map((collection) => {
            const config = getPaymentMethodConfig(collection.payment_method)
            return (
              <MetricCard
                key={collection.payment_method}
                title={config.label}
                value={`${collection.total_amount.toLocaleString()} EGP`}
                subtitle={`${collection.receipt_count} receipts`}
                color={config.color}
              />
            )
          })}

          {/* Empty state for missing methods */}
          {collections.length === 0 && (
            <>
              <MetricCard
                title="Cash"
                value="0 EGP"
                subtitle="0 receipts"
                color="slate"
              />
              <MetricCard
                title="Bank Transfer"
                value="0 EGP"
                subtitle="0 receipts"
                color="slate"
              />
              <MetricCard
                title="Credit Card"
                value="0 EGP"
                subtitle="0 receipts"
                color="slate"
              />
            </>
          )}
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-lg font-semibold text-on-surface">
            Receipts
            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
              {receipts.length}
            </span>
          </h3>
        </div>

        {receipts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">receipt_long</span>
            <p>No receipts for this date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Receipt #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Payer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => {
                  const config = getPaymentMethodConfig(receipt.payment_method)
                  return (
                    <tr key={receipt.receipt_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-medium text-on-surface">
                        {receipt.receipt_number}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {receipt.payer_name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-secondary">
                        {receipt.total_amount.toLocaleString()} EGP
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                          <span className="material-symbols-outlined text-sm">{config.icon}</span>
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        {formatTime(receipt.issued_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
