import { useQuery } from '@tanstack/react-query'
import { getReceiptDetails } from '../../api/finance'
import { queryKeys } from '../../hooks/queryKeys'
import type { ReceiptDetail } from '../../api/finance/types'

interface ReceiptDetailPanelProps {
  receiptId: number
  onClose: () => void
  onDownloadPdf: (receiptId: number) => void
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  e_wallet: 'E-Wallet',
  instapay: 'instaPay',
  other: 'Other',
}

export function ReceiptDetailPanel({ receiptId, onClose, onDownloadPdf }: ReceiptDetailPanelProps) {
  const { data: detail, isLoading, error, refetch } = useQuery<ReceiptDetail>({
    queryKey: queryKeys.finance.receipts.detail(receiptId),
    queryFn: () => getReceiptDetails(receiptId),
    enabled: true,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 id="receipt-detail-title" className="font-headline text-lg font-semibold text-on-surface">
            {isLoading ? 'Loading...' : detail ? `Receipt ${detail.receipt.receipt_number}` : 'Receipt Details'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close receipt details"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="h-4 bg-slate-200 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-3xl text-red-400 mb-2" aria-hidden="true">error</span>
              <p className="text-red-600 text-sm mb-3">Failed to load receipt details</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90"
              >
                Retry
              </button>
            </div>
          )}

          {detail && (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Payer</span>
                  <span className="text-sm font-medium text-on-surface">{detail.receipt.payer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Payment Method</span>
                  <span className="text-sm font-medium text-on-surface capitalize">
                    {METHOD_LABELS[detail.receipt.payment_method] || detail.receipt.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Issued At</span>
                  <span className="text-sm font-medium text-on-surface">
                    {new Date(detail.receipt.paid_at).toLocaleString()}
                  </span>
                </div>
                {detail.receipt.notes && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Notes</span>
                    <span className="text-sm text-on-surface max-w-[200px] text-right">{detail.receipt.notes}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-on-surface mb-3">Line Items</h4>
                <div className="space-y-2">
                  {detail.lines.map((line) => (
                    <div key={line.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {line.payment_type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </p>
                        <p className="text-xs text-slate-500">
                          Student #{line.student_id}
                          {line.discount > 0 && ` (Discount: EGP ${line.discount})`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-on-surface font-headline">
                        EGP {(line.amount - line.discount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100">
                  <span className="text-sm font-semibold text-on-surface">Total</span>
                  <span className="text-lg font-bold text-secondary font-headline">
                    EGP {detail.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {detail && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onDownloadPdf(receiptId)}
              className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">download</span>
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
