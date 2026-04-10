import { useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { formatDate, formatTime } from '../../utils/formatting'
import { useReceipts } from '../../hooks/finance'
import type { ReceiptListItem, ReceiptSearchParams } from '../../api/finance'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
] as const

// Mock data
const MOCK_RECEIPTS: ReceiptListItem[] = [
  {
    id: 1,
    receipt_number: 'R-2026-0001',
    payer_name: 'Ahmed Mohamed',
    payment_method: 'cash',
    paid_at: '2026-04-01T10:30:00'
  },
  {
    id: 2,
    receipt_number: 'R-2026-0002',
    payer_name: 'Sara Khaled',
    payment_method: 'card',
    paid_at: '2026-04-02T14:15:00'
  }
]

interface SearchReceiptsPanelProps {
  useMockData: boolean
  isLoading: boolean
  onError: (message: string) => void
}

export function SearchReceiptsPanel({ useMockData, isLoading, onError }: SearchReceiptsPanelProps) {
  const { 
    receipts, 
    selectedReceipt, 
    isSearching, 
    isLoadingDetails,
    isDownloadingPdf,
    search, 
    getDetails,
    downloadPdf
  } = useReceipts()
  const [searchFromDate, setSearchFromDate] = useState('')
  const [searchToDate, setSearchToDate] = useState('')
  const [searchPayerName, setSearchPayerName] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [viewingReceiptId, setViewingReceiptId] = useState<number | null>(null)

  const handleSearchReceipts = async () => {
    if (!searchFromDate || !searchToDate) {
      onError('Please select both from and to dates')
      return
    }

    onError('')
    setHasSearched(true)
    try {
      if (useMockData) {
        await new Promise(r => setTimeout(r, 500))
        // Mock results will be handled by component reading receipts
      } else {
        const params: ReceiptSearchParams = {
          from_date: searchFromDate,
          to_date: searchToDate,
          ...(searchPayerName && { payer_name: searchPayerName })
        }
        await search(params)
      }
    } catch {
      onError('Failed to search receipts')
    }
  }

  const handleViewDetails = async (receiptId: number) => {
    try {
      setViewingReceiptId(receiptId)
      if (!useMockData) {
        await getDetails(receiptId)
      }
    } catch {
      onError('Failed to load receipt details')
    } finally {
      setViewingReceiptId(null)
    }
  }

  const handleCloseDetails = () => {
    // selectedReceipt is cleared via hook, but we need a way to close the view
    // This is handled by conditional rendering based on selectedReceipt state
  }

  const handleDownloadPdf = async (receiptId: number) => {
    try {
      if (useMockData) {
        onError('PDF download not available in mock mode')
        return
      }
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
      onError('Failed to download PDF')
    }
  }

  const displayReceipts = useMockData && hasSearched ? MOCK_RECEIPTS : receipts

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">Search Receipts</h2>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">From Date *</label>
          <input
            type="date"
            value={searchFromDate}
            onChange={(e) => setSearchFromDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">To Date *</label>
          <input
            type="date"
            value={searchToDate}
            onChange={(e) => setSearchToDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Payer Name</label>
          <input
            type="text"
            value={searchPayerName}
            onChange={(e) => setSearchPayerName(e.target.value)}
            placeholder="Optional..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearchReceipts}
            disabled={isLoading || isSearching}
            className="w-full px-4 py-2 bg-secondary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
          >
            {(isLoading || isSearching) ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined">search</span>}
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {displayReceipts.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No receipts found for the selected criteria</p>
          ) : (
            displayReceipts.map(receipt => (
              <div key={receipt.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-headline text-lg font-semibold">{receipt.receipt_number}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {PAYMENT_METHODS.find(m => m.value === receipt.payment_method)?.label || receipt.payment_method}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">Payer: {receipt.payer_name}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(receipt.paid_at)} at {formatTime(receipt.paid_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleViewDetails(receipt.id)}
                      disabled={viewingReceiptId === receipt.id || isLoadingDetails}
                      className="text-sm text-secondary hover:text-secondary/80 flex items-center gap-1 mr-3"
                    >
                      {viewingReceiptId === receipt.id || isLoadingDetails ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      )}
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(receipt.id)}
                      disabled={isDownloadingPdf}
                      className="text-sm text-secondary hover:text-secondary/80 flex items-center gap-1"
                    >
                      {isDownloadingPdf ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <span className="material-symbols-outlined text-sm">download</span>
                      )}
                      PDF
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
