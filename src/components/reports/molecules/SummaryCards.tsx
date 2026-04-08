import type { DashboardSummaryPublic } from '../../../api/analytics'
import type { RevenueMetrics } from '../../../api/reports'
import { ReportCard } from '../atoms/ReportCard'

interface SummaryCardsProps {
  summary: DashboardSummaryPublic | null
  revenue: RevenueMetrics | null
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
        value={revenue?.total_collected?.toLocaleString() ?? '0'}
        subtitle="EGP"
        icon="payments"
        color="green"
        isLoading={isLoading}
        error={error}
      />
      <ReportCard
        title="Outstanding"
        value={revenue?.total_outstanding?.toLocaleString() ?? '0'}
        subtitle="EGP"
        icon="money_off"
        color="red"
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
