import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function MobileDashboardFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return
    const handleOutsideInteraction = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === 'Escape') setIsOpen(false)
        return
      }
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideInteraction)
    document.addEventListener('keydown', handleOutsideInteraction)
    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction)
      document.removeEventListener('keydown', handleOutsideInteraction)
    }
  }, [isOpen])

  return (
    <>
      {/* Dim backdrop when open */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 z-30 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <div ref={fabRef} className="fixed bottom-20 right-4 z-40 lg:hidden flex flex-col items-end gap-3">
        {/* Action Pills */}
        <div 
          className={`flex flex-col items-end gap-3 transition-all duration-200 origin-bottom ${
            isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none invisible'
          }`}
          aria-hidden={!isOpen}
        >
          <button
            onClick={() => {
              setIsOpen(false)
              navigate('/directory')
            }}
            className="flex items-center gap-3 bg-white text-slate-700 font-medium px-4 py-3 rounded-full shadow-lg border border-slate-200 active:bg-slate-50"
          >
            <span className="text-sm">{t('fab.quick_register')}</span>
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
          </button>

          <button
            onClick={() => {
              setIsOpen(false)
              navigate('/finance')
            }}
            className="flex items-center gap-3 bg-white text-slate-700 font-medium px-4 py-3 rounded-full shadow-lg border border-slate-200 active:bg-slate-50"
          >
            <span className="text-sm">{t('fab.create_payment')}</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </button>
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? t('fab.close_actions') : t('fab.open_actions')}
          aria-expanded={isOpen}
          className="w-14 h-14 bg-secondary text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-500/30"
        >
          <span 
            className={`material-symbols-outlined text-[28px] transition-transform duration-300 ${
              isOpen ? 'rotate-45' : 'rotate-0'
            }`}
          >
            add
          </span>
        </button>
      </div>
    </>
  )
}
