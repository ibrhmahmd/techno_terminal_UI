interface DirectoryTabsProps {
  activeTab: 'students' | 'parents' | 'waiting' | 'advanced'
  waitingCount: number
  onTabChange: (tab: 'students' | 'parents' | 'waiting' | 'advanced') => void
}

export function DirectoryTabs({ activeTab, waitingCount, onTabChange }: DirectoryTabsProps) {
  return (
    <div className="px-8 pt-4 border-b border-slate-200">
      <div className="max-w-[1680px] mx-auto">
        <div className="flex space-x-1">
          <button
            onClick={() => onTabChange('students')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'students'
                ? 'text-on-surface'
                : 'text-slate-400 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">school</span>
            Students
            {activeTab === 'students' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
            )}
          </button>
          <button
            onClick={() => onTabChange('parents')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'parents'
                ? 'text-on-surface'
                : 'text-slate-400 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">family_restroom</span>
            Parents
            {activeTab === 'parents' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
            )}
          </button>
          <button
            onClick={() => onTabChange('waiting')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'waiting'
                ? 'text-on-surface'
                : 'text-slate-400 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">schedule</span>
            Waiting ({waitingCount})
            {activeTab === 'waiting' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
            )}
          </button>
          <button
            onClick={() => onTabChange('advanced')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'advanced'
                ? 'text-on-surface'
                : 'text-slate-400 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">tune</span>
            Filter Students
            {activeTab === 'advanced' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
