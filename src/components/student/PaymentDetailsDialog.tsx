// PaymentDetailsDialog.tsx
// Modal dialog for viewing payment details with receipt info and action buttons

import { useState } from 'react'
import { Modal, ActionButton } from '../common'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useToast } from '../common/Toast'
import type { PaymentDetailsResponse } from '../../api/crm/students/types/payments'
import { downloadReceiptPdf } from '../../api/finance/receipts'

interface PaymentDetailsDialogProps {
  payment: PaymentDetailsResponse | null
  isOpen: boolean
  isLoading: boolean
  isSendingReceipt: boolean
  onClose: () => void
  onSendReceipt: (paymentId: number, method: 'whatsapp' | 'email') => Promise<{ success: boolean; message: string }>
}

export function PaymentDetailsDialog({
  payment,
  isOpen,
  isLoading,
  isSendingReceipt,
  onClose,
  onSendReceipt,
}: PaymentDetailsDialogProps) {
  const { showToast, ToastComponent } = useToast()
  const [showSendOptions, setShowSendOptions] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!isOpen) return null

  const handleDownloadPdf = async () => {
    if (!payment) return

    setIsDownloading(true)
    try {
      const blob = await downloadReceiptPdf(payment.receipt.receipt_id)

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${payment.receipt.receipt_number ?? payment.receipt.receipt_id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('Receipt PDF downloaded', 'success')
    } catch (err) {
      showToast('Failed to download PDF', 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSendReceipt = async (method: 'whatsapp' | 'email') => {
    if (!payment) return

    const result = await onSendReceipt(payment.id, method)
    
    if (result.success) {
      showToast(result.message, 'success')
      setShowSendOptions(false)
    } else {
      showToast(result.message, 'error')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={payment ? `Receipt ${payment.receipt.receipt_number ?? 'N/A'}` : 'Payment Details'}
        size="lg"
      >
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-slate-500">Loading payment details...</p>
          </div>
        ) : payment ? (
          <div className="space-y-6">
            {/* Transaction Type Badge */}
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  payment.transaction_type === 'payment' ? 'bg-green-100 text-green-800' :
                  payment.transaction_type === 'refund' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {payment.transaction_type}
              </span>
              <span className="text-gray-500 text-sm">
                Payment ID: #{payment.id}
              </span>
            </div>

            {/* Payment Info Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Payment Date</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.created_at ? formatDate(payment.created_at) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Amount Paid</label>
                  <p className="text-sm font-medium text-green-600">
                    {formatCurrency(payment.amount)}
                  {payment.discount_amount > 0 && (
                    <span className="text-xs text-gray-500 ms-1">
                      (Discount: {formatCurrency(payment.discount_amount)})
                    </span>
                  )}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Payment Method</label>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {payment.receipt.payment_method?.replace('_', ' ') ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Transaction Type</label>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {payment.transaction_type}
                  </p>
                </div>
              </div>
            </div>

            {/* Enrollment Info Section */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                Enrollment Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Course</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.enrollment.course_name ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Group</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.enrollment.group_name ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Instructor</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.enrollment.instructor_name ?? 'N/A'}
                  {payment.enrollment.level_number && (
                    <span className="text-xs text-gray-500 ms-1">
                      (Level {payment.enrollment.level_number})
                    </span>
                  )}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-gray-500">Period Start</label>
                    <p className="text-sm font-medium text-gray-900">
                      Level {payment.enrollment.level_number ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Info Section */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                Receipt Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Receipt Number</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.receipt.receipt_number ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Issued Date</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.receipt.issued_date ? formatDate(payment.receipt.issued_date) : 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Issued By</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.receipt.issued_by ?? 'N/A'}
                  </p>
                </div>
                {payment.receipt.notes && (
                  <div className="col-span-2 mt-2">
                    <label className="text-xs text-gray-500">Receipt Notes</label>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.receipt.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                Student Information
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Full Name</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.student.full_name}
                  </p>
                </div>
                {payment.student.phone && (
                  <div>
                    <label className="text-xs text-gray-500">Phone</label>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.student.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Parent Info */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                Parent Contact (Receipt Recipient)
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Full Name</label>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.parent.full_name ?? 'N/A'}
                  </p>
                </div>
                {payment.parent.phone && (
                  <div>
                    <label className="text-xs text-gray-500">Phone</label>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.parent.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <ActionButton
                onClick={handleDownloadPdf}
                variant="secondary"
                className="flex-1"
                disabled={isDownloading}
              >
                <svg className="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </ActionButton>
              
              <div className="relative flex-1">
                {showSendOptions ? (
                  <div className="flex gap-2">
                    <ActionButton
                      onClick={() => handleSendReceipt('whatsapp')}
                      disabled={isSendingReceipt || !payment.parent.phone}
                      variant="primary"
                      className="flex-1"
                    >
                      {isSendingReceipt ? 'Sending...' : 'WhatsApp'}
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleSendReceipt('email')}
                      disabled={isSendingReceipt || !payment.parent.full_name}
                      variant="primary"
                      className="flex-1"
                    >
                      {isSendingReceipt ? 'Sending...' : 'Email'}
                    </ActionButton>
                    <ActionButton
                      onClick={() => setShowSendOptions(false)}
                      variant="ghost"
                      className="px-3"
                    >
                      ×
                    </ActionButton>
                  </div>
                ) : (
                  <ActionButton
                    onClick={() => setShowSendOptions(true)}
                    variant="primary"
                    className="w-full"
                    disabled={isSendingReceipt}
                  >
                    <svg className="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send to Student
                  </ActionButton>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No payment data available
          </div>
        )}
      </Modal>
      {ToastComponent}
    </>
  )
}
