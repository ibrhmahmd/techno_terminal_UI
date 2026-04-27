import { useCallback } from 'react'

type TabId = 'overview' | 'enrollment' | 'revenue' | 'instructors' | 'progress' | 'collections'

interface TabConfig {
  id: TabId
  label: string
  icon: string
}

interface TabNavigationProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  tabs?: TabConfig[]
}

const DEFAULT_TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  // { id: 'enrollment', label: 'Enrollment', icon: 'trending_up' },
  { id: 'revenue', label: 'Revenue', icon: 'payments' },
  { id: 'collections', label: 'Collections', icon: 'receipt_long' },
  // { id: 'instructors', label: 'Instructors', icon: 'school' },
  { id: 'progress', label: 'Progress', icon: 'military_tech' },
]

export function TabNavigation({ 
  activeTab, 
  onTabChange,
  tabs = DEFAULT_TABS 
}: TabNavigationProps) {
  const handleTabClick = useCallback((tabId: TabId) => {
    onTabChange(tabId)
  }, [onTabChange])

  return (
    <div className="flex gap-1 mb-8 p-1 bg-slate-100 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-on-surface shadow-sm'
              : 'text-slate-600 hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export type { TabId }
export { DEFAULT_TABS }
