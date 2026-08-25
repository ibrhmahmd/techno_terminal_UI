import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageSection, PageHeader } from '../components/common'
import { TabNavigation, type TabId } from '../components/reports/molecules/TabNavigation'
import { RevenueAndCollectionsTab } from '../components/reports/organisms/RevenueAndCollectionsTab'
import { ProgressTab } from '../components/reports/organisms/ProgressTab'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { DailyReportTab } from '../components/reports/organisms/DailyReportTab'
import { WeeklyReportTab } from '../components/reports/organisms/WeeklyReportTab'
import { MonthlyReportTab } from '../components/reports/organisms/MonthlyReportTab'

export function ReportsPage() {
  const { t } = useTranslation('reports')
  const [activeTab, setActiveTab] = useState<TabId>('daily_report')

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage={t('page_title')} />

      <PageHeader
        title={t('page_title')}
        subtitle={t('subtitle')}
      />

      <PageSection>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'revenue_collections' && <ErrorBoundary><RevenueAndCollectionsTab /></ErrorBoundary>}
        {activeTab === 'progress' && <ErrorBoundary><ProgressTab /></ErrorBoundary>}
        {activeTab === 'daily_report' && <ErrorBoundary><DailyReportTab /></ErrorBoundary>}
        {activeTab === 'weekly_report' && <ErrorBoundary><WeeklyReportTab /></ErrorBoundary>}
        {activeTab === 'monthly_report' && <ErrorBoundary><MonthlyReportTab /></ErrorBoundary>}
      </PageSection>
    </div>
  )
}
