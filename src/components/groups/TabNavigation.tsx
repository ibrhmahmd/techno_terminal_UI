interface TabNavigationProps {
  activeTab: 'attendance' | 'students' | 'history'
  onTabChange: (tab: 'attendance' | 'students' | 'history') => void
  enrollmentCount: number
}

export function TabNavigation({ activeTab, onTabChange, enrollmentCount }: TabNavigationProps) {
  const tabs = [
    { id: 'attendance' as const, label: 'Attendance' },
    { id: 'students' as const, label: 'Students' },
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
          {enrollmentCount} Students Enrolled
        </span>
      </div>
    </div>
  )
}
