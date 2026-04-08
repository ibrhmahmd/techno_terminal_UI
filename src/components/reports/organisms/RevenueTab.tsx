import { RevenueChart } from '../../reports/RevenueChart'
import { MetricCard } from '../atoms/MetricCard'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import type { RevenueMetrics } from '../../../api/reports'

interface RevenueTabProps {
  revenue: RevenueMetrics | null
  isLoading: boolean
  error?: string
  onRetry?: () => void
}

export function RevenueTab({ revenue, isLoading, error, onRetry }: RevenueTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Revenue Analysis</h2>
          <p className="text-sm text-slate-500 mb-6">Monthly revenue trends and collection metrics</p>
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner />
          </div>
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
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Revenue Analysis</h2>
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
          <p className="mb-2">Failed to load revenue data: {error}</p>
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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Revenue Analysis</h2>
        <p className="text-sm text-slate-500 mb-6">Monthly revenue trends and collection metrics</p>
        <RevenueChart data={revenue?.monthly_revenue || []} />
      </div>

      {revenue && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Collected"
            value={`${revenue.total_collected.toLocaleString()} EGP`}
            color="green"
          />
          <MetricCard
            title="Outstanding"
            value={`${revenue.total_outstanding.toLocaleString()} EGP`}
            color="red"
          />
          <MetricCard
            title="Collection Rate"
            value={`${revenue.collection_rate.toFixed(1)}%`}
            color="blue"
          />
          <MetricCard
            title="Avg Monthly"
            value={`${revenue.average_monthly.toLocaleString()} EGP`}
            color="amber"
          />
        </div>
      )}
    </div>
  )
}
