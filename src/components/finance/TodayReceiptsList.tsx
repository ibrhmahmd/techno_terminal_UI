import { useState, useMemo } from 'react'
import { useDailyReceipts } from '../../hooks/finance'
import { useReceipts } from '../../hooks/finance'
import { TodayReceiptsFilters } from './TodayReceiptsFilters'
import { ReceiptDetailPanel } from './ReceiptDetailPanel'
import type { DailyReceiptItem } from '../../api/finance/types'

interface TodayReceiptsListProps {
  onDownloadPdf?: (receiptId: number) => void
  onNavigateToCreate?: () => void
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Transfer',
  other: 'Other',
}

const METHOD_COLORS: Record<string, string> = {
  cash: 'bg-emerald-100 text-emerald-700',
  card: 'bg-blue-100 text-blue-700',
  transfer: 'bg-purple-100 text-purple-700',
  other: 'bg-slate-100 text-slate-600',
}

function ReceiptRow({
  receipt,
  onClick,
}: {
  receipt: DailyReceiptItem
  onClick: () => void
}) {
  const methodLabel = METHOD_LABELS[receipt.payment_method] ?? receipt.payment_method
  const methodColor = METHOD_COLORS[receipt.payment_method] ?? 'bg-slate-100 text-slate-600'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between py-3 px-4 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="min-w-0 flex-1 text-left">
          <p className="font-medium text-on-surface truncate">
            {receipt.payer_name || 'Unknown'}
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            #{receipt.receipt_number}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${methodColor}`}>
          {methodLabel}
        </span>
        <span className="font-semibold text-on-surface font-headline min-w-[80px] text-right">
          EGP {receipt.total_amount.toLocaleString()}
        </span>
        <span className="text-xs text-slate-400 min-w-[50px] text-right">
          {new Date(receipt.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </button>
  )
}

export function TodayReceiptsList({ onDownloadPdf, onNavigateToCreate }: TodayReceiptsListProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const { receipts, isLoading, error } = useDailyReceipts(today)
  const { search: searchApi, isSearching } = useReceipts()
  const [date, setDate] = useState(today)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchFromDate, setSearchFromDate] = useState('')
  const [searchToDate, setSearchToDate] = useState('')
  const [searchPayerName, setSearchPayerName] = useState('')
  const [searchResults, setSearchResults] = useState<DailyReceiptItem[] | null>(null)
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null)

  const filteredReceipts = useMemo(() => {
    if (searchResults) return searchResults
    if (date === today) return receipts
    return receipts.filter((r) => r.issued_at.startsWith(date))
  }, [receipts, date, today, searchResults])

  const totalAmount = useMemo(
    () => filteredReceipts.reduce((sum, r) => sum + r.total_amount, 0),
    [filteredReceipts]
  )

  const handleAdvancedSearch = async () => {
    if (!searchFromDate || !searchToDate) return
    try {
      const results = await searchApi({
        from_date: searchFromDate,
        to_date: searchToDate,
        ...(searchPayerName && { payer_name: searchPayerName }),
      })
      setSearchResults(
        results.map((r) => ({
          receipt_id: r.id,
          receipt_number: r.receipt_number,
          payer_name: r.payer_name,
          total_amount: 0,
          payment_method: r.payment_method,
          issued_at: r.paid_at,
        }))
      )
    } catch {
      // ignore
    }
  }

  const handleClearSearch = () => {
    setSearchResults(null)
    setSearchFromDate('')
    setSearchToDate('')
    setSearchPayerName('')
    setShowAdvanced(false)
  }

  const handleDateChange = (newDate: string) => {
    setDate(newDate)
    handleClearSearch()
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-red-400 mb-2">error</span>
        <p className="text-red-700 text-sm">Failed to load receipts</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedReceiptId && onDownloadPdf && (
        <ReceiptDetailPanel
          receiptId={selectedReceiptId}
          onClose={() => setSelectedReceiptId(null)}
          onDownloadPdf={onDownloadPdf}
        />
      )}

      <TodayReceiptsFilters date={date} onDateChange={handleDateChange} />

      {/* Advanced Search Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-sm text-secondary hover:text-secondary/80 font-medium transition-colors"
      >
        <span className="material-symbols-outlined text-base">{showAdvanced ? 'expand_less' : 'expand_more'}</span>
        Advanced Search
      </button>

      {showAdvanced && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">From Date</label>
              <input
                type="date"
                value={searchFromDate}
                onChange={(e) => setSearchFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">To Date</label>
              <input
                type="date"
                value={searchToDate}
                onChange={(e) => setSearchToDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Payer Name</label>
              <input
                type="text"
                value={searchPayerName}
                onChange={(e) => setSearchPayerName(e.target.value)}
                placeholder="Optional..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdvancedSearch}
              disabled={isSearching || !searchFromDate || !searchToDate}
              className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-secondary/90 transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3">
        <span className="text-sm text-slate-600">
          {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''}
          {searchResults ? ' (search results)' : date !== today && ` for ${date}`}
        </span>
        <div className="flex items-center gap-3">
          {onNavigateToCreate && (
            <button
              type="button"
              onClick={onNavigateToCreate}
              className="text-sm text-secondary hover:text-secondary/80 font-medium flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Create Receipt
            </button>
          )}
          <span className="text-sm font-semibold text-on-surface font-headline">
            Total: EGP {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-32" />
              <div className="h-4 bg-slate-200 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredReceipts.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">receipt_long</span>
          <h3 className="font-headline text-lg font-semibold text-on-surface mb-1">No receipts found</h3>
          <p className="text-sm text-slate-500">
            {searchResults
              ? 'No receipts match the search criteria.'
              : date === today
                ? 'No receipts have been issued today yet.'
                : `No receipts were issued on ${date}.`}
          </p>
          {onNavigateToCreate && (
            <button
              type="button"
              onClick={onNavigateToCreate}
              className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
            >
              Create Receipt
            </button>
          )}
        </div>
      )}

      {/* Receipts list */}
      {!isLoading && filteredReceipts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <span className="flex-1">Payer</span>
            <div className="flex items-center gap-3">
              <span className="w-[60px]">Method</span>
              <span className="w-[80px] text-right">Amount</span>
              <span className="w-[50px] text-right">Time</span>
            </div>
          </div>
          {filteredReceipts.map((receipt) => (
            <ReceiptRow
              key={receipt.receipt_id}
              receipt={receipt}
              onClick={() => setSelectedReceiptId(receipt.receipt_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
