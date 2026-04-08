import { useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { formatDate, formatTime } from '../../utils/formatting'
import { searchReceipts, downloadReceiptPdf, type Receipt, type ReceiptSearchParams } from '../../api/finance'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
] as const

const ITEM_TYPES = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'materials', label: 'Materials' },
  { value: 'registration', label: 'Registration' },
  { value: 'other', label: 'Other' }
] as const

// Mock data
const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 1,
    receipt_number: 'R-2026-0001',
    payer_name: 'Ahmed Mohamed',
    total_amount: 450,
    payment_method: 'cash',
    created_at: '2026-04-01T10:30:00',
    items: [
      { enrollment_id: 1, amount: 150, type: 'tuition', description: 'Robotics A - March' },
      { enrollment_id: 2, amount: 200, type: 'tuition', description: 'Coding B - March' },
      { enrollment_id: 3, amount: 100, type: 'materials', description: 'Kit purchase' }
    ]
  },
  {
    id: 2,
    receipt_number: 'R-2026-0002',
    payer_name: 'Sara Khaled',
    total_amount: 175,
    payment_method: 'card',
    created_at: '2026-04-02T14:15:00',
    items: [
      { enrollment_id: 4, amount: 175, type: 'tuition', description: 'Electronics C - April' }
    ]
  }
]

interface SearchReceiptsPanelProps {
  useMockData: boolean
  isLoading: boolean
  onError: (message: string) => void
  setIsLoading: (loading: boolean) => void
}

export function SearchReceiptsPanel({ useMockData, isLoading, onError, setIsLoading }: SearchReceiptsPanelProps) {
  const [searchFromDate, setSearchFromDate] = useState('')
  const [searchToDate, setSearchToDate] = useState('')
  const [searchPayerName, setSearchPayerName] = useState('')
  const [searchResults, setSearchResults] = useState<Receipt[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearchReceipts = async () => {
    if (!searchFromDate || !searchToDate) {
      onError('Please select both from and to dates')
      return
    }

    setIsLoading(true)
    onError('')
    setHasSearched(true)
    try {
      if (useMockData) {
        await new Promise(r => setTimeout(r, 500))
        setSearchResults(MOCK_RECEIPTS)
      } else {
        const params: ReceiptSearchParams = {
          from_date: searchFromDate,
          to_date: searchToDate,
          ...(searchPayerName && { payer_name: searchPayerName })
        }
        const results = await searchReceipts(params)
        setSearchResults(results)
      }
    } catch {
      onError('Failed to search receipts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPdf = async (receiptId: number) => {
    try {
      if (useMockData) {
        onError('PDF download not available in mock mode')
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
      onError('Failed to download PDF')
    }
  }

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
            disabled={isLoading}
            className="w-full px-4 py-2 bg-secondary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <span className="material-symbols-outlined">search</span>}
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No receipts found for the selected criteria</p>
          ) : (
            searchResults.map(receipt => (
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
                      {formatDate(receipt.created_at)} at {formatTime(receipt.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-on-surface">{receipt.total_amount.toFixed(2)} EGP</p>
                    {!useMockData && (
                      <button
                        onClick={() => handleDownloadPdf(receipt.id)}
                        className="text-sm text-secondary hover:text-secondary/80 mt-2 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        PDF
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-left">
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipt.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="py-2">
                            <span className="px-2 py-1 bg-slate-200 rounded text-xs">
                              {ITEM_TYPES.find(t => t.value === item.type)?.label || item.type}
                            </span>
                          </td>
                          <td className="py-2 text-slate-600">{item.description || '-'}</td>
                          <td className="py-2 text-right font-medium">{item.amount.toFixed(2)} EGP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {receipt.notes && (
                  <p className="mt-3 text-sm text-slate-500 italic">Note: {receipt.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
