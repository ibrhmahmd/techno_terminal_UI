import { CreditCard, CheckCircle2, XCircle, ArrowRightLeft, ArrowUpRight, GraduationCap } from 'lucide-react'
import type { StudentBalance, EnrollmentBalance } from '../../api/crm/students/types/finance'
import { EmptyState, LoadingSpinner } from '../common'

interface PaymentsTabProps {
  balance: StudentBalance | null
  loading?: boolean
  error?: string | null
}

export function PaymentsTab({ balance, loading, error }: PaymentsTabProps) {
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
  const outstandingAmount = balance?.enrollments
    ?.filter((e: EnrollmentBalance) => e.remaining_balance > 0)
    ?.reduce((sum: number, e: EnrollmentBalance) => sum + e.remaining_balance, 0) || 0

  // Paid enrollments (remaining_balance = 0)
  const paidEnrollments = balance?.enrollments?.filter((e: EnrollmentBalance) => e.remaining_balance === 0) || []

  // Unpaid/partially paid enrollments
  const unpaidEnrollments = balance?.enrollments?.filter((e: EnrollmentBalance) => e.remaining_balance > 0) || []

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Due</p>
              <p className="text-xl font-bold text-blue-600">{totalAmountDue.toLocaleString()} EGP</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Discounts</p>
              <p className="text-xl font-bold text-purple-600">{totalDiscounts.toLocaleString()} EGP</p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl border p-4 ${
          netBalance < 0 
            ? 'bg-red-50 border-red-200' 
            : netBalance > 0 
              ? 'bg-green-50 border-green-200'
              : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              netBalance < 0 
                ? 'bg-red-100' 
                : netBalance > 0 
                  ? 'bg-green-100'
                  : 'bg-slate-100'
            }`}>
              <CreditCard className={`w-5 h-5 ${
                netBalance < 0 
                  ? 'text-red-600' 
                  : netBalance > 0 
                    ? 'text-green-600'
                    : 'text-slate-600'
              }`} />
            </div>
            <div>
              <p className={`text-sm ${
                netBalance < 0 
                  ? 'text-red-600' 
                  : netBalance > 0 
                    ? 'text-green-600'
                    : 'text-slate-600'
              }`}>
                {netBalance < 0 ? 'Outstanding' : netBalance > 0 ? 'Credit' : 'Balance'}
              </p>
              <p className={`text-xl font-bold ${
                netBalance < 0 
                  ? 'text-red-600' 
                  : netBalance > 0 
                    ? 'text-green-600'
                    : 'text-slate-600'
              }`}>
                {Math.abs(netBalance).toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Enrollments */}
      {unpaidEnrollments.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
            <h3 className="font-semibold text-on-surface flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Outstanding Payments
            </h3>
            <span className="text-sm text-slate-500">
              {unpaidEnrollments.length} enrollment(s) with balance due
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {unpaidEnrollments.map((enrollment: EnrollmentBalance) => (
              <div key={enrollment.enrollment_id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{enrollment.group_name}</p>
                      <p className="text-sm text-slate-500">Level {enrollment.level_number}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>Amount Due: {enrollment.amount_due.toLocaleString()} EGP</span>
                        {enrollment.discount_applied > 0 && (
                          <span className="text-green-600">Discount: {enrollment.discount_applied.toLocaleString()} EGP</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      {enrollment.remaining_balance.toLocaleString()} EGP
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 mt-1">
                      Outstanding
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid/Completed Enrollments */}
      {paidEnrollments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-on-surface flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Paid Enrollments
            </h3>
            <span className="text-sm text-slate-500">
              {paidEnrollments.length} enrollment(s) fully paid
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {paidEnrollments.map((enrollment: EnrollmentBalance) => (
              <div key={enrollment.enrollment_id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{enrollment.group_name}</p>
                      <p className="text-sm text-slate-500">Level {enrollment.level_number}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>Total Paid: {enrollment.total_paid.toLocaleString()} EGP</span>
                        {enrollment.discount_applied > 0 && (
                          <span className="text-green-600">Saved: {enrollment.discount_applied.toLocaleString()} EGP</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {enrollment.total_paid.toLocaleString()} EGP
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsTab
