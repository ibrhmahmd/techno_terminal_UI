import { useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageHeader, PageSection } from '../components/common'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { AdminSettingsTab } from '../components/notifications/tabs/AdminSettingsTab'
import { LogsTab } from '../components/notifications/tabs/LogsTab'
import { BulkMessagingTab } from '../components/notifications/tabs/BulkMessagingTab'
import { MetricsStripCards } from '../components/common/MetricsStripCards'

const tabs = [
  { id: 'admin', label: 'Admin Settings', icon: 'settings' },
  { id: 'logs', label: 'Logs', icon: 'history' },
  { id: 'bulk', label: 'Bulk Messaging', icon: 'send' },
] as const

type TabId = typeof tabs[number]['id']

function getInitialTab(searchParams: URLSearchParams): TabId {
  const tabFromUrl = searchParams.get('tab')
  const tab = tabs.find(t => t.id === tabFromUrl)
  return tab?.id ?? 'admin'
}

export function NotificationsPage() {
  const { t } = useTranslation('notifications')
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(() => getInitialTab(searchParams))

  // Update URL when tab changes
  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }, [setSearchParams])

  const activeIndex = tabs.findIndex(t => t.id === activeTab)

  const metricItems = useMemo(() => [
    {
      label: t('tabs.admin'),
      value: t('metrics.admin'),
      icon: 'settings',
      color: 'secondary' as const,
      onClick: () => handleTabChange('admin'),
    },
    {
      label: t('tabs.logs'),
      value: t('metrics.logs'),
      icon: 'history',
      color: 'amber' as const,
      onClick: () => handleTabChange('logs'),
    },
    {
      label: t('tabs.bulk'),
      value: t('metrics.bulk'),
      icon: 'send',
      color: 'blue' as const,
      onClick: () => handleTabChange('bulk'),
    },
  ], [handleTabChange, t])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage={t('page_title')} />
      <PageHeader
        title={t('page_title')}
        subtitle={t('subtitle')}
        sticky={false}
      />

      <section className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-[1680px] mx-auto">
          <MetricsStripCards items={metricItems} activeIndex={activeIndex} />
        </div>
      </section>

      <PageSection>
        <div className="min-h-[400px]">
          {activeTab === 'admin' && (
            <div role="tabpanel" id="panel-admin" aria-labelledby="tab-admin">
              <ErrorBoundary><AdminSettingsTab /></ErrorBoundary>
            </div>
          )}
          {activeTab === 'logs' && (
            <div role="tabpanel" id="panel-logs" aria-labelledby="tab-logs">
              <ErrorBoundary><LogsTab /></ErrorBoundary>
            </div>
          )}
          {activeTab === 'bulk' && (
            <div role="tabpanel" id="panel-bulk" aria-labelledby="tab-bulk">
              <ErrorBoundary><BulkMessagingTab /></ErrorBoundary>
            </div>
          )}
        </div>
      </PageSection>
    </div>
  )
}
