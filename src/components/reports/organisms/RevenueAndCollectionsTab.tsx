import { RevenueChart } from '../../reports/RevenueChart'
import { MetricSummaryCard } from '../../common/cards/MetricSummaryCard'
import { useRevenueData } from '../hooks/useRevenueData'
import { useDailyCollections } from '../hooks/useDailyCollections'
import { ReportDaySelectorBar } from '../molecules/ReportDaySelectorBar'
import { LoadingState } from '../../common/LoadingState'
import { ErrorState } from '../../common/ErrorState'
import { EmptyState } from '../../common/EmptyState'
import { formatTime } from '../../../utils/formatting'
const PAYMENT_METHOD_CONFIG: Record<string, { label: string; icon: string }> = {
  cash: { label: 'Cash', icon: 'payments' },
  bank_transfer: { label: 'Bank Transfer', icon: 'account_balance' },
  credit_card: { label: 'Credit Card', icon: 'credit_card' }
}

function getPaymentMethodConfig(method: string) {
  return PAYMENT_METHOD_CONFIG[method] || { label: method, icon: 'more_horiz' }
}



export function RevenueAndCollectionsTab() {
  const { metrics: revenue, isLoading: revLoading, error: revError, refetch: refetchRev } = useRevenueData()
  const { collections, receipts, date, setDate, isLoading: colLoading, error: colError, refetch: refetchCol } = useDailyCollections()

  const isLoading = revLoading || colLoading
  const error = revError?.message || colError?.message
  const onRetry = () => { refetchRev(); refetchCol() }

  const totalCollected = collections.reduce((sum, c) => sum + c.total_amount, 0)

  if (isLoading) {
    return <LoadingState message="Loading revenue & collections data..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  return (
    <div className="space-y-6">
      {/* ————— Revenue Section ————— */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Revenue Analysis</h2>
        <p className="text-sm text-slate-500 mb-6">Monthly revenue trends and collection metrics</p>
        <RevenueChart data={revenue?.monthly_breakdown || []} />

        {revenue && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <MetricSummaryCard label="Total Revenue" value={revenue.total_revenue || 0} currency="EGP" status="positive" />
            <MetricSummaryCard label="Total Receipts" value={revenue.total_receipts || 0} status="neutral" />
            <MetricSummaryCard
              label="Change %"
              value={`${(revenue.revenue_change_pct || 0).toFixed(1)}%`}
              status={revenue.trend_direction === 'up' ? 'positive' : revenue.trend_direction === 'down' ? 'negative' : 'neutral'}
            />
            <MetricSummaryCard label="Avg per Receipt" value={revenue.avg_revenue_per_receipt || 0} currency="EGP" status="neutral" />
          </div>
        )}
      </div>

      {/* ————— Collections Section ————— */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-1">Daily Collections</h2>
            <p className="text-sm text-slate-500">Collection summary by payment method</p>
          </div>
        </div>

        <ReportDaySelectorBar date={date} onDateChange={setDate} />

        {/* Collection summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricSummaryCard label="Total Collected" value={totalCollected} currency="EGP" status="positive" />
          {collections.map((collection) => {
            const config = getPaymentMethodConfig(collection.payment_method)
            return (
              <MetricSummaryCard
                key={collection.payment_method}
                label={config.label}
                value={collection.total_amount}
                currency="EGP"
                status="neutral"
              />
            )
          })}
          {collections.length === 0 && (
            <>
              <MetricSummaryCard label="Cash" value={0} currency="EGP" status="neutral" />
              <MetricSummaryCard label="Bank Transfer" value={0} currency="EGP" status="neutral" />
              <MetricSummaryCard label="Credit Card" value={0} currency="EGP" status="neutral" />
            </>
          )}
        </div>

        {/* Receipts table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg font-semibold text-on-surface">
              Receipts
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                {receipts.length}
              </span>
            </h3>
          </div>

          {receipts.length === 0 && collections.length === 0 ? (
            <EmptyState title="No collections" message="No collections or receipts recorded for this date." icon="inbox" />
          ) : receipts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3" aria-hidden="true">receipt_long</span>
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
                        <td className="py-3 px-4 text-sm font-medium text-on-surface">{receipt.receipt_number}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{receipt.payer_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-medium text-secondary">{receipt.total_amount.toLocaleString()} EGP</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">{config.icon}</span>
                            {config.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">{formatTime(receipt.issued_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
