// Notifications Page
// Admin-only page for managing notification settings, templates, logs, and bulk messaging

import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { AdminSettingsTab } from '../components/notifications/tabs/AdminSettingsTab'
import { LogsTab } from '../components/notifications/tabs/LogsTab'
import { BulkMessagingTab } from '../components/notifications/tabs/BulkMessagingTab'

const tabs = [
  { id: 'admin', label: 'Admin Settings', icon: 'person' },
  { id: 'logs', label: 'Logs', icon: 'history' },
  { id: 'bulk', label: 'Bulk Messaging', icon: 'send' },
] as const

type TabId = typeof tabs[number]['id']

function getInitialTab(searchParams: URLSearchParams): TabId {
  const tabFromUrl = searchParams.get('tab') as TabId
  if (tabFromUrl && tabs.some(t => t.id === tabFromUrl)) {
    return tabFromUrl
  }
  return 'admin'
}

export function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(() => getInitialTab(searchParams))

  // Update URL when tab changes
  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }, [setSearchParams])

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <TopNavbar activePage="Notifications" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Notifications</h1>
            <p className="text-slate-500 mt-1">
              Manage notification preferences
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-slate-200">
            <nav className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-slate-600 hover:text-on-surface hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'admin' && <AdminSettingsTab />}
            {activeTab === 'logs' && <LogsTab />}
            {activeTab === 'bulk' && <BulkMessagingTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
