import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { t } = useTranslation('layout')

  const navSections = [
    {
      title: t('sections.core_operations'),
      items: [
        { path: '/dashboard', label: t('nav.dashboard'), icon: 'dashboard' },
        { path: '/groups', label: t('nav.groups'), icon: 'group' },
        { path: '/directory', label: t('nav.directory'), icon: 'person_search' },
        { path: '/courses', label: t('nav.courses'), icon: 'school' },
      ],
    },
    {
      title: t('sections.management'),
      items: [
        { path: '/enrollments', label: t('nav.enrollments'), icon: 'assignment_ind' },
        { path: '/finance', label: t('nav.finance'), icon: 'payments' },
      ],
    },
    {
      title: t('sections.programs'),
      items: [
        { path: '/competitions', label: t('nav.competitions'), icon: 'emoji_events' },
        { path: '/certificates', label: t('nav.certificates'), icon: 'verified' },
        { path: '/reports', label: t('nav.reports'), icon: 'assessment' },
      ],
    },
    {
      title: t('sections.resources'),
      items: [
        { path: '/staff', label: t('nav.staff'), icon: 'people' },
        { path: '/tasks', label: t('nav.tasks'), icon: 'task_alt' },
        // { path: '/capabilities', label: t('nav.capabilities'), icon: 'article' },
        { path: '/notifications', label: t('nav.notifications'), icon: 'notifications' },
        { path: '/settings', label: t('nav.settings'), icon: 'settings' },
      ],
    },
  ]

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
          <h1 className="text-xl font-bold font-headline text-white tracking-tight">{t('brand')}</h1>
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
          <span>{t('sign_out')}</span>
        </button>
      </div>
    </aside>
  )
}
