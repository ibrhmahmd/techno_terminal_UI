interface TabNavigationProps {
  activeTab: 'attendance' | 'levels' | 'students' | 'history'
  onTabChange: (tab: 'attendance' | 'levels' | 'students' | 'history') => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'attendance' as const, label: 'Attendance' },
    { id: 'levels' as const, label: 'Levels & Payments' },
    { id: 'students' as const, label: 'Students' },
    { id: 'history' as const, label: 'History' },
  ]

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    else return
    e.preventDefault()
    onTabChange(tabs[next].id)
  }

  return (
    <div className="flex justify-between items-center border-b border-outline-variant/10" role="tablist" aria-label="Group detail sections">
      <div className="flex space-x-8">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={handleKeyDown(index)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab.id
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
