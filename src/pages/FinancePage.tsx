import { useState, useCallback } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { CreateReceiptPanel } from '../components/finance/CreateReceiptPanel'
import { UnpaidEnrollmentsPanel } from '../components/finance/UnpaidEnrollmentsPanel'
import { TodayReceiptsList } from '../components/finance/TodayReceiptsList'
import { ComingSoonPlaceholder } from '../components/finance/ComingSoonPlaceholder'
import { useReceipts } from '../hooks/finance'
import type { UnpaidEnrollment } from '../api/crm/students/types/finance'

type PanelType = 'receipts' | 'create' | 'unpaid' | 'refunds'

const PANEL_ORDER: PanelType[] = ['receipts', 'create', 'unpaid', 'refunds']

export function FinancePage() {
  const [activePanel, setActivePanel] = useState<PanelType>('receipts')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdReceiptId, setCreatedReceiptId] = useState<number | null>(null)
  const [initialReceiptData, setInitialReceiptData] = useState<UnpaidEnrollment | null>(null)
  const { isSearching, downloadPdf } = useReceipts()

  const handleTabChange = useCallback((panel: PanelType) => {
    setActivePanel(panel)
    setError(null)
    setSuccess(null)
    setCreatedReceiptId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (panel !== 'create') {
      setInitialReceiptData(null)
    }
  }, [])

  const handlePayFromUnpaid = useCallback((enrollment: UnpaidEnrollment) => {
    setInitialReceiptData(enrollment)
    setActivePanel('create')
    setError(null)
    setSuccess(null)
  }, [])

  const handleError = useCallback((message: string) => {
    setError(message)
    setSuccess(null)
  }, [])

  const handleSuccess = useCallback((message: string, receiptId?: number) => {
    setSuccess(message)
    setError(null)
    setCreatedReceiptId(receiptId || null)
    setTimeout(() => setSuccess(null), 5000)
  }, [])

  const handleDownloadPdf = useCallback(async (receiptId: number) => {
    try {
      const blob = await downloadPdf(receiptId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${receiptId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      handleError('Failed to download PDF')
    }
  }, [downloadPdf, handleError])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Finance" />

      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Finance</h1>
          <p className="text-sm text-on-surface-variant mt-2">Create receipts and manage payments</p>
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex overflow-x-auto gap-1 border-b border-slate-200">
            {(PANEL_ORDER satisfies PanelType[]).map((panel) => {
              const tabLabels: Record<PanelType, string> = {
                receipts: "Today's Receipts",
                create: 'Create Receipt',
                unpaid: 'Unpaid',
                refunds: 'Refunds',
              }
              const isActive = activePanel === panel
              return (
                <button
                  key={panel}
                  onClick={() => handleTabChange(panel)}
                  className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                    isActive
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tabLabels[panel]}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm flex items-center justify-between">
              <span>{success}</span>
              {createdReceiptId && (
                <button
                  onClick={() => handleDownloadPdf(createdReceiptId!)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Download PDF
                </button>
              )}
            </div>
          )}
          <div key={activePanel} className="animate-fadeIn">
            {activePanel === 'create' && (
              <CreateReceiptPanel
                isLoading={isSearching}
                onSuccess={handleSuccess}
                onError={handleError}
                initialData={initialReceiptData}
                onClearInitialData={() => setInitialReceiptData(null)}
                onNavigateToUnpaid={() => handleTabChange('unpaid')}
              />
            )}
            {activePanel === 'receipts' && (
              <TodayReceiptsList
                onDownloadPdf={handleDownloadPdf}
                onNavigateToCreate={() => handleTabChange('create')}
              />
            )}
            {activePanel === 'unpaid' && (
              <UnpaidEnrollmentsPanel
                onError={handleError}
                onPay={handlePayFromUnpaid}
                onNavigateToCreate={() => handleTabChange('create')}
              />
            )}
            {activePanel === 'refunds' && (
              <ComingSoonPlaceholder
                title="Refunds"
                description="Refund processing and management will be available soon."
                icon="undo"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
