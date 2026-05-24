import { useState } from 'react'
import { isAxiosError } from 'axios'
import { useDailyReportData, useDailyReportPdf } from '../hooks/useDailyReport'
import { useReportsSummary } from '../hooks/useReportsSummary'
import { useRevenueData } from '../hooks/useRevenueData'
import { ReportSummaryCards } from '../atoms/ReportSummaryCards'
import { ReportSessionDetails } from '../atoms/ReportSessionDetails'
import { ReportPaymentDetails } from '../atoms/ReportPaymentDetails'
import { ReportEmailSender } from '../molecules/ReportEmailSender'
import { ReportDaySelectorBar } from '../molecules/ReportDaySelectorBar'
import { MetricSummaryCard } from '../../common/cards/MetricSummaryCard'
import { getTodayISO } from '../../../utils/date'
import { useToast } from '../../common/Toast'
import { LoadingState } from '../../common/LoadingState'
import { ErrorState } from '../../common/ErrorState'
import { EmptyState } from '../../common/EmptyState'

export function DailyReportTab() {
  const [date, setDate] = useState<string>(getTodayISO())

  // Global business snapshot (loads independently)
  const { summary } = useReportsSummary()
  const { metrics: revenueMetrics } = useRevenueData()

  // Date-specific daily report
  const { data, isLoading, isError, error, refetch } = useDailyReportData(date)
  const pdfMutation = useDailyReportPdf()
  const { showToast, ToastComponent } = useToast()

  const hasData = !!data

  const handleDownloadPdf = async () => {
    try {
      const response = await pdfMutation.mutateAsync(date)
      const pdfData = response.data
      const byteCharacters = atob(pdfData.pdf_base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `daily-report-${date}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      showToast('PDF downloaded successfully', 'success')
    } catch {
      showToast('Failed to generate PDF', 'error')
    }
  }

  const is404 = isError && error instanceof Error && (isAxiosError(error) ? error.response?.status === 404 : error.message.includes('404'))

  return (
    <div className="space-y-6">
      {ToastComponent}

      {/* Business Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricSummaryCard label="Active Enrollments" value={summary?.active_enrollments ?? 0} status="neutral" />
        <MetricSummaryCard label="Today Sessions" value={summary?.today_sessions_count ?? 0} status="neutral" />
        <MetricSummaryCard label="Total Collected" value={revenueMetrics?.total_revenue ?? 0} currency="EGP" status="positive" />
        <MetricSummaryCard label="Receipts Count" value={revenueMetrics?.total_receipts ?? 0} status="neutral" />
      </div>

      {/* Date Picker + Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-1">Daily Report</h2>
            <p className="text-sm text-slate-500">Summary of daily activities and finances</p>
          </div>

          {/* Actions — always visible once date is selected */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={pdfMutation.isPending || !hasData}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">download</span>
              {pdfMutation.isPending ? 'Generating...' : 'Download PDF'}
            </button>
            <ReportEmailSender date={date} disabled={!hasData} />
          </div>
        </div>

        <ReportDaySelectorBar date={date} onDateChange={setDate} />
      </div>

      {isLoading && <LoadingState message="Loading daily report..." />}

      {is404 && (
        <EmptyState
          title={`No data for ${date}`}
          message="There are no sessions, payments, or enrollments recorded for this date."
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
        <>
          <ReportSummaryCards data={data} />
          <ReportSessionDetails sessions={data.session_details} />
          <ReportPaymentDetails payments={data.payments_by_type} />
        </>
      )}
    </div>
  )
}
