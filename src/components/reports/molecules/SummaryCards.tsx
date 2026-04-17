import type { DashboardSummaryPublic, RevenueMetricsDTO } from '../../../api/analytics'
import { ReportCard } from '../atoms/ReportCard'

interface SummaryCardsProps {
  summary: DashboardSummaryPublic | null
  revenue: RevenueMetricsDTO | null
  isLoading: boolean
  error?: string
}

export function SummaryCards({ summary, revenue, isLoading, error }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ReportCard
        title="Active Enrollments"
        value={summary?.active_enrollments ?? 0}
        icon="person_add"
        color="purple"
        isLoading={isLoading}
        error={error}
      />
      <ReportCard
        title="Today Sessions"
        value={summary?.today_sessions_count ?? 0}
        icon="calendar_today"
        color="blue"
        isLoading={isLoading}
        error={error}
      />
      <ReportCard
        title="Total Collected"
        value={revenue?.total_revenue?.toLocaleString() ?? '0'}
        subtitle="EGP"
        icon="payments"
        color="green"
        isLoading={isLoading}
        error={error}
      />
      <ReportCard
        title="Receipts Count"
        value={revenue?.total_receipts?.toLocaleString() ?? '0'}
        subtitle="receipts"
        icon="receipt"
        color="blue"
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
