import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navSections = [
  {
    title: 'Core Operations',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/groups', label: 'Groups', icon: 'group' },
      { path: '/directory', label: 'Directory', icon: 'person_search' },
      { path: '/courses', label: 'Courses', icon: 'school' },
    ],
  },
  {
    title: 'Management',
    items: [
      { path: '/enrollments', label: 'Enrollments', icon: 'assignment_ind' },
      { path: '/finance', label: 'Finance', icon: 'payments' },
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
    items: [
      { path: '/staff', label: 'Staff', icon: 'people' },
      { path: '/notifications', label: 'Notifications', icon: 'notifications' },
      { path: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    onClose()
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true
    return false
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose()
  }

  // Filter sections based on user role
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.path === '/notifications') {
        return user?.role === 'admin' || user?.role === 'system_admin'
      }
      return true
    })
  })).filter(section => section.items.length > 0)

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Brand/Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => handleNavigate('/dashboard')}
          className="text-left hover:opacity-80 transition-opacity"
        >
          <h1 className="text-xl font-bold font-headline text-white tracking-tight">TechnoTerminal</h1>
        </button>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {filteredSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
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

      {/* Footer - User Info & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-teal-400">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.username}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
