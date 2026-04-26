import { useState } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { EnrollPanel } from '../components/enrollments/EnrollPanel'
import { EnrollmentQuickActions } from '../components/enrollments/EnrollmentQuickActions'
import { ManageEnrollmentPanel } from '../components/enrollments/ManageEnrollmentPanel'
import { useToast } from '../components/common/Toast'

type ViewMode = 'select' | 'enroll' | 'manage'

export function EnrollmentsPage() {
  const [activeView, setActiveView] = useState<ViewMode>('select')
  const [isLoading, setIsLoading] = useState(false)
  const { ToastComponent } = useToast()

  const handleBackToSelection = () => {
    setActiveView('select')
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Enrollments" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Enrollments</h1>
          <p className="text-sm text-on-surface-variant mt-2">Enroll students in groups</p>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto space-y-6">
        {activeView === 'select' && (
          <EnrollmentQuickActions
            onEnrollClick={() => setActiveView('enroll')}
            onManageClick={() => setActiveView('manage')}
          />
        )}

        {activeView === 'enroll' && (
          <>
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to actions
            </button>
            <EnrollPanel
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              useMockData={false}
            />
          </>
        )}

        {activeView === 'manage' && (
          <>
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to actions
            </button>
            <ManageEnrollmentPanel
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </>
        )}

        {/* Toast Notifications */}
        {ToastComponent}
      </section>
    </div>
  )
}
