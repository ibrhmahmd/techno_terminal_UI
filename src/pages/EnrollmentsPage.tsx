import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { EnrollPanel } from '../components/enrollments/EnrollPanel'
import { ModifyEnrollmentPanel } from '../components/enrollments/ModifyEnrollmentPanel'
import { DropEnrollmentPanel } from '../components/enrollments/DropEnrollmentPanel'
import { useToast } from '../components/common/Toast'
import { MetricsStripCards } from '../components/common/MetricsStripCards'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

type PanelType = 'create' | 'modify' | 'drop'

const PANEL_ORDER: PanelType[] = ['create', 'modify', 'drop']

export function EnrollmentsPage() {
  const { t } = useTranslation('enrollments')
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')

  const initialTab = useMemo<PanelType>(() => {
    if (tabParam === 'modify' || tabParam === 'drop' || tabParam === 'create') {
      return tabParam as PanelType
    }
    return 'create'
  }, [tabParam])

  const [activePanel, setActivePanel] = useState<PanelType>(initialTab)
  const [isLoading, setIsLoading] = useState(false)
  const { ToastComponent } = useToast()
  const panelRef = useRef<HTMLDivElement>(null)

  // Sync state if search params change
  useEffect(() => {
    if (tabParam === 'modify' || tabParam === 'drop' || tabParam === 'create') {
      setActivePanel(tabParam as PanelType)
    }
  }, [tabParam])

  useEffect(() => {
    panelRef.current?.focus()
  }, [activePanel])

  const activeIndex = PANEL_ORDER.indexOf(activePanel)

  const handleTabChange = (panel: PanelType) => {
    setActivePanel(panel)
    setSearchParams({ tab: panel })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const metricItems = useMemo(() => [
    {
      label: t('tabs.create'),
      icon: 'person_add',
      color: 'secondary' as const,
      onClick: () => handleTabChange('create'),
    },
    {
      label: t('tabs.modify'),
      icon: 'edit_document',
      color: 'blue' as const,
      onClick: () => handleTabChange('modify'),
    },
    {
      label: t('tabs.drop'),
      icon: 'person_remove',
      color: 'amber' as const,
      onClick: () => handleTabChange('drop'),
    },
  ], [t])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage={t('page_title')} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{t('page_title')}</h1>
          <p className="text-sm text-on-surface-variant mt-2">{t('subtitle')}</p>
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="max-w-[1400px] mx-auto">
          <MetricsStripCards items={metricItems} activeIndex={activeIndex} />
        </div>
      </section>

      <section className="px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div key={activePanel} ref={panelRef} tabIndex={-1} className="animate-fadeIn outline-none">
            <ErrorBoundary>
              {activePanel === 'create' && (
                <EnrollPanel
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  useMockData={false}
                />
              )}
            </ErrorBoundary>
            <ErrorBoundary>
              {activePanel === 'modify' && (
                <ModifyEnrollmentPanel
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}
            </ErrorBoundary>
            <ErrorBoundary>
              {activePanel === 'drop' && (
                <DropEnrollmentPanel
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>

        {ToastComponent}
      </section>
    </div>
  )
}
