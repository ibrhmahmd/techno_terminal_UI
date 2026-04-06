import { useNavigate, useLocation } from 'react-router-dom'

const navSections = [
  {
    title: 'Core Operations',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/groups', label: 'Groups', icon: 'group' },
      { path: '/directory', label: 'Directory', icon: 'person_search' },
    ],
  },
  {
    title: 'Management',
    items: [
      { path: '/enrollments', label: 'Enrollments', icon: 'assignment_ind' },
      { path: '/finance', label: 'Finance', icon: 'payments' },
      // { path: '/attendance', label: 'Attendance', icon: 'check_circle' },
    ],
  },
  {
    title: 'Programs',
    items: [
      { path: '/competitions', label: 'Competitions', icon: 'emoji_events' },
      { path: '/reports', label: 'Reports', icon: 'assessment' },
    ],
  },
  {
    title: 'Resources',
    items: [{ path: '/staff', label: 'Staff', icon: 'people' }],
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 z-50 flex flex-col overflow-hidden">
      {/* Brand/Header - Matches dashboard.html exactly */}
      <div className="p-6 border-b border-slate-800">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-left hover:opacity-80 transition-opacity"
        >
          <h1 className="text-xl font-bold font-headline text-white tracking-tight">TechnoTerminal</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] mt-0.5">Control Center</p>
        </button>
      </div>

      {/* Navigation - Matches dashboard.html exactly */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      active
                        ? 'bg-teal-500/10 text-teal-500 border-r-2 border-teal-500'
                        : 'text-slate-400 border-r-2 border-transparent hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer - Back to Hub */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-base">home</span>
          <span>Back to Hub</span>
        </button>
      </div>
    </aside>
  )
}
