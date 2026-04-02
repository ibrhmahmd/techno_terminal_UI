import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { EnrollPanel } from '../components/enrollments/EnrollPanel'
import { TransferPanel } from '../components/enrollments/TransferPanel'
import { DropPanel } from '../components/enrollments/DropPanel'
import { getActiveEnrollments, type Enrollment } from '../api/enrollments'

type PanelType = 'enroll' | 'transfer' | 'drop'

// Mock data
const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: 'mock-enroll-1',
    student_id: 'mock-student-1',
    group_id: 'mock-group-1',
    student_name: 'Omar Khaled',
    group_name: 'Robotics A - Saturday',
    level: 1,
    status: 'active',
    amount_due: 150,
    discount: 0,
    enrolled_on: '2026-01-15'
  },
  {
    id: 'mock-enroll-2',
    student_name: 'Sara Ahmed',
    student_id: 'mock-student-2',
    group_id: 'mock-group-2',
    group_name: 'Coding B - Sunday',
    level: 2,
    status: 'active',
    amount_due: 200,
    discount: 25,
    enrolled_on: '2026-02-01'
  }
]

export function EnrollmentsPage() {
  const [activePanel, setActivePanel] = useState<PanelType>('enroll')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  // Detect API availability on mount
  useEffect(() => {
    async function checkApi() {
      try {
        await getActiveEnrollments()
      } catch {
        setUseMockData(true)
      }
    }
    checkApi()
  }, [])

  const handleSuccess = (message: string) => {
    setSuccess(message)
    setError(null)
    // Auto-clear after 5 seconds
    setTimeout(() => setSuccess(null), 5000)
  }

  const handleError = (message: string) => {
    setError(message)
    setSuccess(null)
  }

  const handleTabChange = (panel: PanelType) => {
    setActivePanel(panel)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Enrollments" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Enrollments</h1>
          <p className="text-sm text-on-surface-variant mt-2">Enroll, transfer, or drop students from groups</p>
        </div>
      </header>

      {/* Panel Tabs */}
      <div className="px-8 pt-4 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex space-x-1">
            {(['enroll', 'transfer', 'drop'] as PanelType[]).map((panel) => (
              <button
                key={panel}
                onClick={() => handleTabChange(panel)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative capitalize ${
                  activePanel === panel
                    ? 'text-on-surface'
                    : 'text-slate-400 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">
                  {panel === 'enroll' ? 'person_add' : panel === 'transfer' ? 'swap_horiz' : 'person_remove'}
                </span>
                {panel}
                {activePanel === panel && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <section className="p-8 max-w-[1400px] mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}
        {useMockData && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            API unavailable. Using mock data for testing.
          </div>
        )}

        {/* Panel Content */}
        {activePanel === 'enroll' && (
          <EnrollPanel
            useMockData={useMockData}
            isLoading={isLoading}
            onSuccess={handleSuccess}
            onError={handleError}
            setIsLoading={setIsLoading}
          />
        )}
        {activePanel === 'transfer' && (
          <TransferPanel
            useMockData={useMockData}
            isLoading={isLoading}
            onSuccess={handleSuccess}
            onError={handleError}
            setIsLoading={setIsLoading}
          />
        )}
        {activePanel === 'drop' && (
          <DropPanel
            useMockData={useMockData}
            isLoading={isLoading}
            onSuccess={handleSuccess}
            onError={handleError}
            setIsLoading={setIsLoading}
          />
        )}
      </section>
    </div>
  )
}
