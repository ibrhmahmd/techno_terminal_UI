import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface TopNavbarProps {
  activePage?: string
}

export function TopNavbar({ activePage }: TopNavbarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const displayPage = activePage || t('page_title')

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-8 h-16 bg-white border-b border-slate-200">
      <div className="flex items-center gap-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-medium font-body">
          <span className="text-slate-400">{t('breadcrumb.home')}</span>
          <span className="text-slate-200">/</span>
          <span className="text-secondary font-semibold">{displayPage}</span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="px-4 py-1.5 bg-secondary text-white rounded text-xs font-semibold hover:opacity-90 transition-opacity"
          onClick={() => navigate('/enrollments')}
        >
          {t('actions.new_enrollment')}
        </button>
      </div>
    </header>
  )
}
