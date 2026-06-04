import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { MobileNavSheet } from './MobileNavSheet'

const PRIMARY_TABS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/groups',    label: 'Groups',    icon: 'group'      },
  { path: '/directory', label: 'Directory', icon: 'person_search' },
  { path: '/finance',   label: 'Finance',   icon: 'payments'   },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true
    return false
  }

  const isMoreActive = !PRIMARY_TABS.some(t => isActive(t.path))

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-slate-950 border-t border-slate-800 flex items-stretch lg:hidden"
      >
        {PRIMARY_TABS.map(tab => {
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative group"
            >
              {/* Top accent line */}
              <span
                className={`absolute top-0 left-4 right-4 h-0.5 rounded-b-full transition-all duration-200 ${
                  active ? 'bg-teal-400 opacity-100' : 'opacity-0'
                }`}
              />
              <span
                className={`material-symbols-outlined text-xl transition-colors duration-200 ${
                  active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
              <span
                className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
                  active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}

        {/* More tab */}
        <button
          onClick={() => setSheetOpen(true)}
          aria-label="More navigation options"
          aria-expanded={sheetOpen}
          className="flex-1 flex flex-col items-center justify-center gap-1 relative group"
        >
          <span
            className={`absolute top-0 left-4 right-4 h-0.5 rounded-b-full transition-all duration-200 ${
              isMoreActive ? 'bg-teal-400 opacity-100' : 'opacity-0'
            }`}
          />
          <span
            className={`material-symbols-outlined text-xl transition-colors duration-200 ${
              isMoreActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}
            aria-hidden="true"
          >
            more_horiz
          </span>
          <span
            className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
              isMoreActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}
          >
            More
          </span>
        </button>
      </nav>

      <MobileNavSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
