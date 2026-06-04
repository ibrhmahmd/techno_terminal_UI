import { useState } from 'react'
import { isAxiosError } from 'axios'
import { useMonthlyReportData, useSendMonthlyReport } from '../hooks/useMonthlyReport'
import { ReportMonthSelectorBar } from '../molecules/ReportMonthSelectorBar'
import { MetricSummaryCard } from '../../common/cards/MetricSummaryCard'
import { useToast } from '../../common/Toast'
import { LoadingState } from '../../common/LoadingState'
import { ErrorState } from '../../common/ErrorState'
import { EmptyState } from '../../common/EmptyState'
import { ReportSessionDetails } from '../atoms/ReportSessionDetails'
import { ReportPaymentDetails } from '../atoms/ReportPaymentDetails'
import { ReportDebtorsDetails } from '../atoms/ReportDebtorsDetails'

export function MonthlyReportTab() {
  const [date, setDate] = useState<string>(() => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15)
    return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-15`
  })
  
  const { data, isLoading, isError, error, refetch } = useMonthlyReportData(date)
  const sendMutation = useSendMonthlyReport()
  const { showToast, ToastComponent } = useToast()

  const hasData = !!data

  const handleSendEmail = async () => {
    try {
      await sendMutation.mutateAsync({ date, recipients: [] }) // backend falls back to all admins
      showToast('Monthly report email queued successfully', 'success')
    } catch {
      showToast('Failed to queue monthly report email', 'error')
    }
  }

  const is404 = isError && error instanceof Error && (isAxiosError(error) ? error.response?.status === 404 : error.message.includes('404'))

  return (
    <div className="space-y-6">
      {ToastComponent}

      {/* Date Picker + Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-1">Monthly Report</h2>
            <p className="text-sm text-slate-500">Summary of activities and finances for the month up to selected date</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSendEmail}
              disabled={sendMutation.isPending || !hasData}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">mail</span>
              {sendMutation.isPending ? 'Sending...' : 'Email Admins'}
            </button>
          </div>
        </div>

        <ReportMonthSelectorBar date={date} onDateChange={setDate} />
      </div>

      {isLoading && <LoadingState message="Loading monthly report..." />}

      {is404 && (
        <EmptyState
          title={`No data up to ${date}`}
          message="There are no sessions, payments, or enrollments recorded for this month."
          icon="inbox"
          actionLabel="Refresh"
          onAction={() => refetch()}
        />
      )}

      {isError && !is404 && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Unknown error'}
          onRetry={() => refetch()}
        />
      )}

      {hasData && !isError && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricSummaryCard label="Total Revenue" value={data.total_revenue} currency="EGP" status="positive" />
            <MetricSummaryCard label="Total Debt" value={data.total_debt} currency="EGP" status="negative" />
            <MetricSummaryCard label="Attendance Rate" value={`${data.attendance_rate}%`} status={data.attendance_rate >= 80 ? 'positive' : 'neutral'} />
            <MetricSummaryCard label="Total Sessions" value={data.total_sessions} status="neutral" />
            <MetricSummaryCard label="New Enrollments" value={data.new_enrollments} status="positive" />
            <MetricSummaryCard label="Dropped Enrollments" value={data.dropped_enrollments} status="negative" />
            <MetricSummaryCard label="Active Students" value={data.active_students} status="neutral" />
            <MetricSummaryCard label="Debtor Count" value={data.debtor_count} status="negative" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div dangerouslySetInnerHTML={{ __html: data.top_groups }} />
             </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div dangerouslySetInnerHTML={{ __html: data.revenue_breakdown || data.top_courses }} />
             </div>
             {data.top_instructors && (
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                   <div dangerouslySetInnerHTML={{ __html: data.top_instructors }} />
                </div>
             )}
             {data.course_performance_matrix && (
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                   <div dangerouslySetInnerHTML={{ __html: data.course_performance_matrix }} />
                </div>
             )}
          </div>
          
          <ReportSessionDetails sessions={data.session_details || []} />
          <ReportPaymentDetails payments={data.payments_by_type || []} />
          <ReportDebtorsDetails topDebtors={data.top_debtors || []} unpaidAttendees={data.cumulative_unpaid_debtors || []} />
        </div>
      )}
    </div>
  )
}
