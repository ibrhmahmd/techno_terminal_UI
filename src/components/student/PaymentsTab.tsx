import { useState } from 'react'
import { CreditCard, ArrowUpRight } from 'lucide-react'
import type { StudentBalance, EnrollmentBalance } from '../../api/crm/students/types/finance'
import { EmptyState, LoadingSpinner, StatusDataCard, ItemDetailDialog } from '../common'
import { useReceipts } from '../../hooks/finance'

interface PaymentsTabProps {
  studentId: number
  balance: StudentBalance | null
  loading?: boolean
  error?: string | null
}

export function PaymentsTab({ studentId, balance, loading, error }: PaymentsTabProps) {
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentBalance | null>(null)
  const receipts = useReceipts()

  // Fetch receipts when dialog opens
  const handleCardClick = async (enrollment: EnrollmentBalance) => {
    setSelectedEnrollment(enrollment)
    if (studentId) {
      const today = new Date().toISOString().split('T')[0]
      await receipts.search({
        student_id: studentId,
        from_date: '2020-01-01',
        to_date: today
      })
    }
  }
  // Show loading state while balance is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
        <p className="font-medium">Failed to load payment data</p>
        <p className="mt-1">{error}</p>
      </div>
    )
  }
  // Calculate summary stats from enrollment balance data
  const totalPaid = balance?.enrollments?.reduce((sum: number, e: EnrollmentBalance) => sum + e.total_paid, 0) || 0
  const totalAmountDue = balance?.total_amount_due || 0
  const totalDiscounts = balance?.total_discounts || 0
  const netBalance = balance?.net_balance || 0

  if (!balance || !balance.enrollments || balance.enrollments.length === 0) {
    return (
      <EmptyState
        title="No payment records"
        message="This student has no enrollment payment history."
        icon="inbox"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Payment History</h2>
          <p className="text-sm text-slate-500 mt-1">
            View all payments and financial history
          </p>
        </div>
        <button
          onClick={() => window.open('/finance', '_blank')}
          className="flex items-center gap-1.5 text-sm text-secondary hover:text-secondary/80 font-medium"
        >
          View Full Finance History
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              netBalance < 0 ? 'bg-red-100' : netBalance > 0 ? 'bg-green-100' : 'bg-slate-100'
            }`}>
              <CreditCard className={`w-6 h-6 ${
                netBalance < 0 ? 'text-red-600' : netBalance > 0 ? 'text-green-600' : 'text-slate-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Net Balance</p>
              <p className={`text-2xl font-bold ${
                netBalance < 0 ? 'text-red-600' : netBalance > 0 ? 'text-green-600' : 'text-slate-600'
              }`}>
                {Math.abs(netBalance).toLocaleString()} EGP
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500 space-y-1">
            <p>Paid: <span className="font-medium text-green-600">{totalPaid.toLocaleString()} EGP</span></p>
            <p>Due: <span className="font-medium">{totalAmountDue.toLocaleString()} EGP</span></p>
            <p>Discounts: <span className="font-medium text-purple-600">{totalDiscounts.toLocaleString()} EGP</span></p>
          </div>
        </div>
      </div>

      {/* Payment Cards Grid */}
      <div className="space-y-4">
        <h3 className="font-semibold text-on-surface">Payment Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balance?.enrollments?.map((enrollment) => (
            <StatusDataCard
              key={enrollment.enrollment_id}
              title={enrollment.group_name}
              subtitle={`Level ${enrollment.level_number}`}
              status={enrollment.remaining_balance > 0 ? 'unpaid' : 'paid'}
              statusLabel={enrollment.remaining_balance > 0 ? 'Outstanding' : 'Paid'}
              amount={{ value: enrollment.remaining_balance > 0 ? enrollment.remaining_balance : enrollment.total_paid, currency: 'EGP' }}
              meta={[
                { label: 'Amount Due', value: `${enrollment.amount_due.toLocaleString()} EGP` },
                { label: 'Discount', value: `${enrollment.discount_applied.toLocaleString()} EGP` },
                { label: 'Total Paid', value: `${enrollment.total_paid.toLocaleString()} EGP` }
              ]}
              onClick={() => handleCardClick(enrollment)}
              isClickable
            />
          ))}
        </div>
      </div>

      {/* Payment Detail Dialog */}
      <ItemDetailDialog
        isOpen={!!selectedEnrollment}
        onClose={() => {
          setSelectedEnrollment(null)
          receipts.clearSelectedReceipt()
        }}
        title="Payment Details"
        sections={[
          {
            id: 'enrollment',
            title: 'Enrollment Information',
            items: [
              { label: 'Group', value: selectedEnrollment?.group_name || '-', highlight: true },
              { label: 'Level', value: selectedEnrollment?.level_number.toString() || '-' },
              { label: 'Amount Due', value: `${selectedEnrollment?.amount_due.toLocaleString() || 0} EGP` },
              { label: 'Discount', value: `${selectedEnrollment?.discount_applied.toLocaleString() || 0} EGP` },
              { label: 'Total Paid', value: `${selectedEnrollment?.total_paid.toLocaleString() || 0} EGP` }
            ]
          }
        ]}
        document={receipts.selectedReceipt ? {
          type: 'receipt',
          id: receipts.selectedReceipt.receipt.id,
          number: receipts.selectedReceipt.receipt.receipt_number,
          date: new Date(receipts.selectedReceipt.receipt.paid_at).toLocaleDateString(),
          issuer: receipts.selectedReceipt.receipt.payer_name,
          onDownload: () => receipts.downloadPdf(receipts.selectedReceipt!.receipt.id),
          isDownloading: receipts.isDownloadingPdf
        } : undefined}
        isLoading={receipts.isLoadingDetails}
      />
    </div>
  )
}

export default PaymentsTab
