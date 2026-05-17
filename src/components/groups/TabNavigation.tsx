interface TabNavigationProps {
  activeTab: 'attendance' | 'levels' | 'students' | 'payments' | 'history'
  onTabChange: (tab: 'attendance' | 'levels' | 'students' | 'payments' | 'history') => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'attendance' as const, label: 'Attendance' },
    { id: 'levels' as const, label: 'Levels' },
    { id: 'students' as const, label: 'Students' },
    { id: 'payments' as const, label: 'Payments' },
    { id: 'history' as const, label: 'History' },
  ]

  return (
    <div className="flex justify-between items-center border-b border-outline-variant/10" role="tablist" aria-label="Group detail sections">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
