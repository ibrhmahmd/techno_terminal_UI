import { useState } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageSection, PageHeader } from '../components/common'
import { TabNavigation, type TabId } from '../components/reports/molecules/TabNavigation'
import { RevenueAndCollectionsTab } from '../components/reports/organisms/RevenueAndCollectionsTab'
import { ProgressTab } from '../components/reports/organisms/ProgressTab'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { DailyReportTab } from '../components/reports/organisms/DailyReportTab'

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('daily_report')

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Reports" />

      <PageHeader
        title="Reports"
        subtitle="Analytics and insights dashboard"
      />

      <PageSection>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'revenue_collections' && <RevenueAndCollectionsTab />}
        {activeTab === 'progress' && <ProgressTab />}
        {activeTab === 'daily_report' && <ErrorBoundary><DailyReportTab /></ErrorBoundary>}
      </PageSection>
    </div>
  )
}
