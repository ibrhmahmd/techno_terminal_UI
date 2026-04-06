interface TabNavigationProps {
  activeTab: 'info' | 'attendance' | 'history'
  onTabChange: (tab: 'info' | 'attendance' | 'history') => void
  sessionCount: number
}

export function TabNavigation({ activeTab, onTabChange, sessionCount }: TabNavigationProps) {
  const tabs = [
    { id: 'info' as const, label: 'Info' },
    { id: 'attendance' as const, label: 'Attendance Grid' },
    { id: 'history' as const, label: 'History' },
  ]

  return (
    <div className="flex justify-between items-center border-b border-outline-variant/10">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
      <div className="pb-3 flex space-x-4">
        <span className="text-[10px] uppercase font-bold text-outline">
          Show: {sessionCount} Sessions
        </span>
      </div>
    </div>
  )
}
