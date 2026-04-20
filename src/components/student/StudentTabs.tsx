import { User, Users, BookOpen, Trophy, UsersRound, CreditCard, History } from 'lucide-react'

type TabId = 'overview' | 'enrollments' | 'courses' | 'competitions' | 'teams' | 'payments' | 'history'

interface StudentTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
  { id: 'enrollments', label: 'Enrollments', icon: <Users className="w-4 h-4" /> },
  { id: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'competitions', label: 'Competitions', icon: <Trophy className="w-4 h-4" /> },
  { id: 'teams', label: 'Teams', icon: <UsersRound className="w-4 h-4" /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
]

export function StudentTabs({ activeTab, onTabChange }: StudentTabsProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-8">
        <nav className="flex space-x-1" aria-label="Student tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                  ${isActive 
                    ? 'text-secondary border-b-2 border-secondary -mb-[2px]' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export type { TabId }
export default StudentTabs
