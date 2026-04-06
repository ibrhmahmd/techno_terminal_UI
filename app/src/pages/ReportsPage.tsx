import { useState } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageSection, LoadingSpinner } from '../components/common'
import { TabNavigation, type TabId } from '../components/reports/molecules/TabNavigation'
import { OverviewTab } from '../components/reports/organisms/OverviewTab'
import { EnrollmentTab } from '../components/reports/organisms/EnrollmentTab'
import { RevenueTab } from '../components/reports/organisms/RevenueTab'
import { InstructorsTab } from '../components/reports/organisms/InstructorsTab'
import { ProgressTab } from '../components/reports/organisms/ProgressTab'
import { useDashboardData } from '../components/reports/hooks/useDashboardData'
import { useRevenueData } from '../components/reports/hooks/useRevenueData'
import { useInstructorPerformance } from '../components/reports/hooks/useInstructorPerformance'
import { useStudentProgress } from '../components/reports/hooks/useStudentProgress'
import { useEnrollmentTrends } from '../components/reports/hooks/useEnrollmentTrends'

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  // Data hooks with automatic mock fallback
  const { summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary, isUsingMockData: summaryMock } = useDashboardData()
  const { metrics: revenueMetrics, isLoading: revenueLoading, error: revenueError, refetch: refetchRevenue, isUsingMockData: revenueMock } = useRevenueData(6)
  const { instructors, isLoading: instructorsLoading, error: instructorsError, refetch: refetchInstructors, isUsingMockData: instructorsMock } = useInstructorPerformance()
  const { progress: studentProgress, isLoading: progressLoading, error: progressError, refetch: refetchProgress, isUsingMockData: progressMock } = useStudentProgress()
  const { trends: enrollmentTrends, isLoading: trendsLoading, error: trendsError, refetch: refetchTrends, isUsingMockData: trendsMock } = useEnrollmentTrends(6)

  // Determine overall loading and mock data state
  const isLoading = summaryLoading || revenueLoading || instructorsLoading || progressLoading || trendsLoading
  const isUsingMockData = summaryMock || revenueMock || instructorsMock || progressMock || trendsMock

  // Aggregate error message
  const hasError = summaryError || revenueError || instructorsError || progressError || trendsError
  const errorMessage = hasError ? 'Some data failed to load. Using fallback data where available.' : undefined

  const handleRetry = () => {
    refetchSummary()
    refetchRevenue()
    refetchInstructors()
    refetchProgress()
    refetchTrends()
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            summary={summary}
            revenue={revenueMetrics}
            isLoading={summaryLoading || revenueLoading}
            error={summaryError?.message || revenueError?.message}
            onRetry={handleRetry}
          />
        )
      case 'enrollment':
        return (
          <EnrollmentTab
            trends={enrollmentTrends}
            isLoading={trendsLoading}
            error={trendsError?.message}
            onRetry={refetchTrends}
          />
        )
      case 'revenue':
        return (
          <RevenueTab
            revenue={revenueMetrics}
            isLoading={revenueLoading}
            error={revenueError?.message}
            onRetry={refetchRevenue}
          />
        )
      case 'instructors':
        return (
          <InstructorsTab
            instructors={instructors}
            isLoading={instructorsLoading}
            error={instructorsError?.message}
            onRetry={refetchInstructors}
          />
        )
      case 'progress':
        return (
          <ProgressTab
            progress={studentProgress}
            isLoading={progressLoading}
            error={progressError?.message}
            onRetry={refetchProgress}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Reports" />

      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Reports</h1>
          <p className="text-sm text-on-surface-variant mt-2">Analytics and insights dashboard</p>
        </div>
      </header>

      <PageSection>
        {isUsingMockData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            API unavailable. Showing demo data.
          </div>
        )}

        {errorMessage && !isUsingMockData && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Retry All
            </button>
          </div>
        )}

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoading && !summary && !revenueMetrics ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          renderTabContent()
        )}
      </PageSection>
    </div>
  )
}
