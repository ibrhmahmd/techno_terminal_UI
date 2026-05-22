import type { DailyReportData } from '../../../api/reports/daily'
import { MetricSummaryCard } from '../../common/cards/MetricSummaryCard'

interface ReportSummaryCardsProps {
  data?: DailyReportData
  isLoading?: boolean
}

export function ReportSummaryCards({ data, isLoading }: ReportSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricSummaryCard label="Total Revenue" value="" isLoading />
        <MetricSummaryCard label="New Enrollments" value="" isLoading />
        <MetricSummaryCard label="Sessions Held" value="" isLoading />
        <MetricSummaryCard label="Attendance Rate" value="" isLoading />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricSummaryCard
        label="Total Revenue"
        value={data.total_revenue}
        currency="EGP"
        status="positive"
        statusLabel={`${data.payment_count} payments`}
      />
      <MetricSummaryCard
        label="New Enrollments"
        value={data.new_enrollments}
        status="neutral"
      />
      <MetricSummaryCard
        label="Sessions Held"
        value={data.sessions_held}
        status="neutral"
        statusLabel={`${data.instructors_list.length} instructor(s)`}
      />
      <MetricSummaryCard
        label="Attendance Rate"
        value={`${(data.attendance_rate * 100).toFixed(1)}%`}
        status="neutral"
        breakdown={[
          { label: 'Present', value: data.present_count, status: 'positive' },
          { label: 'Absent', value: data.absent_count, status: 'negative' }
        ]}
      />
    </div>
  )
}
