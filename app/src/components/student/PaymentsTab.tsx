import { CreditCard, Calendar, CheckCircle2, Clock, XCircle, ArrowRightLeft, ArrowUpRight } from 'lucide-react'
import type { PaymentRecord } from '../../api/crm/types'
import { EmptyState } from '../common/EmptyState'

interface PaymentsTabProps {
  payments: PaymentRecord[]
  totalBalance?: number
}

export function PaymentsTab({ payments, totalBalance = 0 }: PaymentsTabProps) {
  // Sort by date (most recent first)
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  )

  // Get latest 5 payments
  const latestPayments = sortedPayments.slice(0, 5)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'failed':
        return <XCircle className="w-4 h-4" />
      case 'refunded':
        return <ArrowRightLeft className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-amber-100 text-amber-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'refunded':
        return 'bg-slate-100 text-slate-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  // Calculate summary stats
  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  if (payments.length === 0) {
    return (
      <EmptyState
        title="No payment records"
        message="This student has no payment history."
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Paid</p>
              <p className="text-xl font-bold text-green-600">{totalPaid.toLocaleString()} EGP</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold text-amber-600">{pendingAmount.toLocaleString()} EGP</p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl border p-4 ${
          totalBalance > 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              totalBalance > 0 
                ? 'bg-red-100' 
                : 'bg-green-100'
            }`}>
              <CreditCard className={`w-5 h-5 ${
                totalBalance > 0 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`} />
            </div>
            <div>
              <p className={`text-sm ${
                totalBalance > 0 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {totalBalance > 0 ? 'Outstanding Balance' : 'Credit Balance'}
              </p>
              <p className={`text-xl font-bold ${
                totalBalance > 0 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {Math.abs(totalBalance).toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Payments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">Latest Payments</h3>
          <span className="text-sm text-slate-500">
            Showing {latestPayments.length} of {payments.length}
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {latestPayments.map((payment) => (
            <div key={payment.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">
                      {payment.description || 'Payment'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {payment.payment_date}
                      </span>
                      {payment.payment_method && (
                        <span>via {payment.payment_method}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    payment.status === 'completed' ? 'text-on-surface' :
                    payment.status === 'pending' ? 'text-amber-600' :
                    payment.status === 'failed' ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {payment.amount.toLocaleString()} EGP
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PaymentsTab
