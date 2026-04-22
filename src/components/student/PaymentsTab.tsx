import { useState } from 'react'
import { CreditCard, ArrowUpRight, FileDown, MessageCircle } from 'lucide-react'
import type { StudentBalance } from '../../api/crm/students/types/finance'
import type { PaymentListItem } from '../../api/crm/students/types/payments'
import { LoadingSpinner } from '../common'
import { DataTable, type DataTableColumn } from '../common/datatable'
import { useStudentPayments } from '../../hooks/students/useStudentPayments'
import { PaymentDetailsDialog } from './PaymentDetailsDialog'

interface PaymentsTabProps {
  studentId: number
  balance: StudentBalance | null
  loading?: boolean
  error?: string | null
}

export function PaymentsTab({ studentId, balance, loading: balanceLoading, error: balanceError }: PaymentsTabProps) {
  const {
    payments,
    isLoading: paymentsLoading,
    error: paymentsError,
    selectedPayment,
    isDetailsLoading,
    isSendingReceipt,
    selectPayment,
    clearSelectedPayment,
    sendReceipt,
    downloadReceipt,
  } = useStudentPayments(studentId, true)

  const [sortField, setSortField] = useState<string>('payment_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Calculate summary stats from balance data
  const totalPaid = balance?.enrollments?.reduce((sum: number, e) => sum + e.total_paid, 0) || 0
  const totalAmountDue = balance?.total_amount_due || 0
  const totalDiscounts = balance?.total_discounts || 0
  const netBalance = balance?.net_balance || 0

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (payment: PaymentListItem) => {
    selectPayment(payment.id)
  }

  const handleDownloadPdf = async (payment: PaymentListItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (payment.receipt_id) {
      await downloadReceipt(payment.receipt_id)
    }
  }

  const handleSendWhatsApp = async (payment: PaymentListItem, e: React.MouseEvent) => {
    e.stopPropagation()
    await sendReceipt(payment.id, 'whatsapp')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      month: 'short',
      day: 'numeric',
    })
  }

  // Define columns using DataTableColumn type matching design system
  const paymentColumns: DataTableColumn<PaymentListItem>[] = [
    {
      key: 'payment_date',
      header: 'Date',
      sortable: true,
      cell: (payment) => (
        <span className="text-slate-900">{formatDate(payment.payment_date)}</span>
      )
    },
    {
      key: 'course_name',
      header: 'Course',
      sortable: true,
      cell: (payment) => (
        <span className="font-medium text-slate-900">{payment.course_name ?? 'N/A'}</span>
      )
    },
    {
      key: 'group_name',
      header: 'Group',
      sortable: true,
      cell: (payment) => (
        <span className="text-slate-600">{payment.group_name ?? 'N/A'}</span>
      )
    },
    {
      key: 'transaction_type',
      header: 'Type',
      sortable: true,
      cell: (payment) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          payment.transaction_type === 'payment' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {payment.transaction_type}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      cell: (payment) => (
        <span className="font-medium text-slate-900">{formatCurrency(payment.amount)}</span>
      )
    },
    {
      key: 'payment_method',
      header: 'Method',
      sortable: true,
      cell: (payment) => (
        <span className="text-slate-600 capitalize">{payment.payment_method.replace('_', ' ')}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (payment) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
          {payment.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      cell: (payment) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => handleDownloadPdf(payment, e)}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title="Download PDF"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleSendWhatsApp(payment, e)}
            className="p-1.5 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            title="Send via WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const isLoading = balanceLoading || paymentsLoading
  const error = balanceError || paymentsError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
        <p className="font-medium">Failed to load payment data</p>
        <p className="mt-1">{error}</p>
      </div>
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

      {/* Payments Table */}
      <div className="space-y-4">
        <h3 className="font-semibold text-on-surface">
          Payment Records ({payments.length})
        </h3>
        
        <DataTable
          data={payments}
          columns={paymentColumns}
          keyExtractor={(p) => p.id.toString()}
          isLoading={paymentsLoading}
          emptyMessage="This student has no payment history yet."
          emptyIcon="inbox"
          onRowClick={handleRowClick}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Payment Details Dialog */}
      <PaymentDetailsDialog
        payment={selectedPayment}
        isOpen={!!selectedPayment || isDetailsLoading}
        isLoading={isDetailsLoading}
        isSendingReceipt={isSendingReceipt}
        onClose={clearSelectedPayment}
        onSendReceipt={sendReceipt}
      />
    </div>
  )
}

export default PaymentsTab
