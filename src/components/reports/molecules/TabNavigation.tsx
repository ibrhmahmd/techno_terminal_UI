import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavDirection } from '../../../hooks/useNavDirection'

type TabId = 'daily_report' | 'weekly_report' | 'monthly_report' | 'revenue_collections' | 'progress'

interface TabConfig {
  id: TabId
  label: string
  icon: string
  comingSoon?: boolean
}

interface TabNavigationProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  tabs?: TabConfig[]
}

const DEFAULT_TABS: TabConfig[] = [
  { id: 'daily_report', label: 'Daily Report', icon: 'calendar_today' },
  { id: 'weekly_report', label: 'Weekly Report', icon: 'date_range' },
  { id: 'monthly_report', label: 'Monthly Report', icon: 'calendar_month' },
  { id: 'revenue_collections', label: 'Revenue & Collections', icon: 'payments' },
  { id: 'progress', label: 'Progress', icon: 'military_tech' },
]

export function TabNavigation({
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS
}: TabNavigationProps) {
  const { t } = useTranslation('reports')
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleTabClick = useCallback((tabId: TabId) => {
    onTabChange(tabId)
  }, [onTabChange])

  const { getNextIndex } = useNavDirection()

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentId: TabId) => {
    const currentIndex = tabs.findIndex(t => t.id === currentId)

    const nextIndex = getNextIndex(e, currentIndex, tabs.length)

    if (nextIndex !== null) {
      e.preventDefault()
      const nextTab = tabs[nextIndex]
      onTabChange(nextTab.id)
      tabRefs.current.get(nextTab.id)?.focus()
    }
  }, [tabs, onTabChange, getNextIndex])

  return (
    <section className="w-full pb-6">
      <div className="overflow-x-auto">
        <div className="flex min-w-[400px] items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-disabled={tab.comingSoon}
              tabIndex={tab.comingSoon ? -1 : activeTab === tab.id ? 0 : -1}
              onClick={() => !tab.comingSoon && handleTabClick(tab.id)}
              onKeyDown={(e) => !tab.comingSoon && handleKeyDown(e, tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md transition-all ${
                tab.comingSoon
                  ? 'text-slate-400 cursor-not-allowed'
                  : activeTab === tab.id
                    ? 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
                    : 'text-slate-600 hover:text-secondary hover:bg-white/70'
              }`}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">{tab.icon}</span>
              {t(`tabs.${tab.id}`)}
              {tab.comingSoon && (
                <span className="ms-1 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-500 rounded-full leading-none">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export type { TabId }
