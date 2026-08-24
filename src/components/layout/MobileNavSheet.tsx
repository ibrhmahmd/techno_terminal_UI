import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'

interface MobileNavSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavSheet({ isOpen, onClose }: MobileNavSheetProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const sheetRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation('layout')

  const MORE_ITEMS = [
    { path: '/courses',       label: t('nav.courses'),       icon: 'school'          },
    { path: '/enrollments',   label: t('nav.enrollments'),   icon: 'assignment_ind'  },
    { path: '/competitions',  label: t('nav.competitions'),  icon: 'emoji_events'    },
    { path: '/certificates',  label: t('nav.certificates'),  icon: 'verified'        },
    { path: '/reports',       label: t('nav.reports'),       icon: 'assessment'      },
    { path: '/staff',         label: t('nav.staff'),         icon: 'people'          },
    { path: '/tasks',         label: t('nav.tasks'),         icon: 'task_alt'        },
    { path: '/capabilities',  label: t('nav.capabilities'),  icon: 'article'         },
    { path: '/notifications', label: t('nav.notifications'), icon: 'notifications'   },
    { path: '/settings',      label: t('nav.settings'),      icon: 'settings'        },
  ]

  // Close when route changes
  useEffect(() => {
    if (isOpen) onClose()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Focus trap / close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleLogout = async () => {
    await logout()
    onClose()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  // Filter by role
  const allowedPaths = user?.role === 'instructor'
    ? ['/courses', '/competitions', '/certificates', '/capabilities']
    : null

  const visibleItems = MORE_ITEMS.filter(item => {
    if (item.path === '/notifications') {
      return user?.role === 'admin' || user?.role === 'system_admin'
    }
    if (allowedPaths && !allowedPaths.includes(item.path)) return false
    return true
  })

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?'

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('aria.more_navigation')}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-slate-950 rounded-t-2xl border-t border-slate-800 lg:hidden
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Title */}
        <p className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t('more')}
        </p>

        {/* Icon Grid */}
        <div className="px-4 pb-4 grid grid-cols-3 gap-2">
          {visibleItems.map(item => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                  active
                    ? 'bg-teal-500/15 text-teal-400'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-xs font-medium text-center leading-tight">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-slate-800" />

        {/* User Info + Sign Out */}
        <div className="p-4 pb-20 flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-teal-400">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">logout</span>
            {t('sign_out')}
          </button>
        </div>
      </div>
    </>
  )
}
