import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { CreateReceiptPanel } from '../components/finance/CreateReceiptPanel'
import { SearchReceiptsPanel } from '../components/finance/SearchReceiptsPanel'
import { searchReceipts, downloadReceiptPdf } from '../api/finance'

type PanelType = 'create' | 'search'

export function FinancePage() {
  const [activePanel, setActivePanel] = useState<PanelType>('create')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdReceiptId, setCreatedReceiptId] = useState<number | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  // Detect API availability
  useEffect(() => {
    async function checkApi() {
      try {
        const today = new Date().toISOString().split('T')[0]
        await searchReceipts({ from_date: today, to_date: today })
      } catch {
        setUseMockData(true)
      }
    }
    checkApi()
  }, [])

  const handleSuccess = (message: string, receiptId?: number) => {
    setSuccess(message)
    setError(null)
    setCreatedReceiptId(receiptId || null)
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
    setCreatedReceiptId(null)
  }

  const handleDownloadPdf = async (receiptId: number) => {
    try {
      if (useMockData) {
        handleError('PDF download not available in mock mode')
        return
      }
      const blob = await downloadReceiptPdf(receiptId)
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
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Finance" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Finance</h1>
          <p className="text-sm text-on-surface-variant mt-2">Create receipts and manage payments</p>
        </div>
      </header>

      {/* Panel Tabs */}
      <div className="px-8 pt-4 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex space-x-1">
            {(['create', 'search'] as PanelType[]).map((panel) => (
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
                  {panel === 'create' ? 'add_circle' : 'search'}
                </span>
                {panel === 'create' ? 'Create Receipt' : 'Search Receipts'}
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
          <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm flex items-center justify-between">
            <span>{success}</span>
            {createdReceiptId && !useMockData && (
              <button
                onClick={() => handleDownloadPdf(createdReceiptId!)}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Download PDF
              </button>
            )}
          </div>
        )}
        {useMockData && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            API unavailable. Using mock data for testing.
          </div>
        )}

        {/* Panel Content */}
        {activePanel === 'create' && (
          <CreateReceiptPanel
            useMockData={useMockData}
            isLoading={isLoading}
            onSuccess={handleSuccess}
            onError={handleError}
            setIsLoading={setIsLoading}
          />
        )}
        {activePanel === 'search' && (
          <SearchReceiptsPanel
            useMockData={useMockData}
            isLoading={isLoading}
            onError={handleError}
            setIsLoading={setIsLoading}
          />
        )}
      </section>
    </div>
  )
}
