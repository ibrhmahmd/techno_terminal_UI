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
      { path: '/certificates', label: 'Certificates', icon: 'verified' },
      { path: '/reports', label: 'Reports', icon: 'assessment' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { path: '/staff', label: 'Staff', icon: 'people' },
      { path: '/tasks', label: 'Tasks', icon: 'task_alt' },
      { path: '/capabilities', label: 'Capabilities', icon: 'article' },
      { path: '/notifications', label: 'Notifications', icon: 'notifications' },
      { path: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true
    return false
  }

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  // Filter sections based on user role
  const allowedPaths = user?.role === 'instructor'
    ? ['/dashboard', '/groups', '/courses', '/competitions', '/certificates', '/students', '/parents', '/attendance', '/capabilities']
    : null
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.path === '/notifications') {
        return user?.role === 'admin' || user?.role === 'system_admin'
      }
      if (allowedPaths && !allowedPaths.includes(item.path)) {
        return false
      }
      return true
    })
  })).filter(section => section.items.length > 0)

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 bg-primary-container z-50 flex flex-col overflow-hidden hidden lg:flex shadow-[0_12px_40px_rgba(11,28,48,0.06)]"
    >
      {/* Brand/Header */}
      <div className="p-6 pt-8 pb-5 flex items-center justify-between">
        <button
          onClick={() => handleNavigate('/dashboard')}
          className="text-left hover:opacity-85 transition-opacity"
        >
          <h1 className="text-xl font-bold font-headline text-white tracking-tight">TechnoTerminal</h1>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="px-3 space-y-1">
          {filteredSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-headline">
                {section.title}
              </p>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-[6px] text-sm font-medium transition-colors ${
                        active
                          ? 'bg-secondary-container/10 text-secondary-container font-semibold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer - User Info & Logout */}
      <div className="p-4 space-y-3 pb-6">
        {user && (
          <div className="flex items-center gap-3 p-2.5 rounded-[6px] bg-black/20">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-secondary-container">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-slate-300 capitalize font-headline mt-0.5">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-red-400 hover:bg-red-400/10 rounded-[6px] transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
