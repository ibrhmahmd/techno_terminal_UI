import { useState, useMemo, useRef, useEffect } from 'react'
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
  const [activePanel, setActivePanel] = useState<PanelType>('create')
  const [isLoading, setIsLoading] = useState(false)
  const { ToastComponent } = useToast()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [activePanel])

  const activeIndex = PANEL_ORDER.indexOf(activePanel)

  const handleTabChange = (panel: PanelType) => {
    setActivePanel(panel)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const metricItems = useMemo(() => [
    {
      label: 'Create',
      icon: 'person_add',
      color: 'secondary' as const,
      onClick: () => handleTabChange('create'),
    },
    {
      label: 'Modify',
      icon: 'edit_document',
      color: 'blue' as const,
      onClick: () => handleTabChange('modify'),
    },
    {
      label: 'Drop',
      icon: 'person_remove',
      color: 'amber' as const,
      onClick: () => handleTabChange('drop'),
    },
  ], [])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Enrollments" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Enrollments</h1>
          <p className="text-sm text-on-surface-variant mt-2">Create new enrollments, modify financial details, or drop students</p>
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
