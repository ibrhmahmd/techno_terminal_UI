import { useState } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { EnrollPanel } from '../components/enrollments/EnrollPanel'
import { useToast } from '../components/common/Toast'

export function EnrollmentsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { ToastComponent } = useToast()

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

      <section className="p-8 max-w-[1400px] mx-auto">
        <EnrollPanel
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          useMockData={false}
        />

        {/* Toast Notifications */}
        {ToastComponent}
      </section>
    </div>
  )
}
