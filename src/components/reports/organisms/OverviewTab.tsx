import type { DashboardSummaryPublic } from '../../../api/analytics'
import type { RevenueMetrics } from '../../../api/reports'
import { SummaryCards } from '../molecules/SummaryCards'
import { RevenueChart } from '../../reports/RevenueChart'
import { LoadingSpinner } from '../../common/LoadingSpinner'

interface OverviewTabProps {
  summary: DashboardSummaryPublic | null
  revenue: RevenueMetrics | null
  isLoading: boolean
  error?: string
  onRetry?: () => void
}

export function OverviewTab({ 
  summary, 
  revenue, 
  isLoading, 
  error,
  onRetry 
}: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <SummaryCards summary={null} revenue={null} isLoading={true} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-80 flex items-center justify-center">
            <LoadingSpinner />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-80 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h2>
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SummaryCards 
        summary={summary} 
        revenue={revenue} 
        isLoading={false} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-headline font-semibold text-on-surface mb-4">Enrollment Trends</h3>
          <div className="h-64 flex items-center justify-center text-slate-400 italic">
            Chart rendering placeholder (BI Data)
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-headline font-semibold text-on-surface mb-4">Revenue</h3>
          <RevenueChart data={revenue?.monthly_revenue.slice(-4) || []} />
        </div>
      </div>
    </div>
  )
}
