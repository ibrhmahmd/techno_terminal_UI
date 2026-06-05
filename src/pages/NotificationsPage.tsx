import { useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
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
      label: 'Admin Settings',
      value: 'Config',
      icon: 'settings',
      color: 'secondary' as const,
      onClick: () => handleTabChange('admin'),
    },
    {
      label: 'Logs',
      value: 'Audit',
      icon: 'history',
      color: 'amber' as const,
      onClick: () => handleTabChange('logs'),
    },
    {
      label: 'Bulk Messaging',
      value: 'Dispatch',
      icon: 'send',
      color: 'blue' as const,
      onClick: () => handleTabChange('bulk'),
    },
  ], [handleTabChange])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Notifications" />
      <PageHeader
        title="Notifications"
        subtitle="Configure system notification rules and recipient dispatch settings."
        sticky={false}
      />

      <section className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-[1680px] mx-auto">
          <MetricsStripCards items={metricItems} activeIndex={activeIndex} />
        </div>
      </section>

      <PageSection>
        <div className="min-h-[400px]">
          {activeTab === 'admin' && <ErrorBoundary><AdminSettingsTab /></ErrorBoundary>}
          {activeTab === 'logs' && <ErrorBoundary><LogsTab /></ErrorBoundary>}
          {activeTab === 'bulk' && <ErrorBoundary><BulkMessagingTab /></ErrorBoundary>}
        </div>
      </PageSection>
    </div>
  )
}
