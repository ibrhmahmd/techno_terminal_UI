import { useState, useMemo } from 'react'
import { DollarSign, CheckCircle, AlertCircle, Clock, TrendingUp, Users, CreditCard } from 'lucide-react'
import type { GroupEnrollmentAnalyticsDTO } from '../../api/academics'

interface PaymentsTabProps {
  groupId: number
  enrollmentAnalytics: GroupEnrollmentAnalyticsDTO | null
}

export function PaymentsTab({
  enrollmentAnalytics,
}: PaymentsTabProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)

  const stats = useMemo(() => {
    if (!enrollmentAnalytics) return null

    const total = enrollmentAnalytics.total_enrollments
    const paid = enrollmentAnalytics.active_enrollments + enrollmentAnalytics.completed_enrollments
    const unpaid = total - paid
    const collectionRate = total > 0 ? Math.round((paid / total) * 100) : 0

    return {
      total,
      paid,
      unpaid,
      collectionRate,
      byLevel: enrollmentAnalytics.students_by_level || [],
    }
  }, [enrollmentAnalytics])

  if (!stats) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-700 mb-1">No Payment Data</h3>
        <p className="text-slate-500">Payment information is not available for this group.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">Total Enrollments</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-slate-500">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-slate-500">Unpaid</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.unpaid}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-500">Collection Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.collectionRate}%</p>
        </div>
      </div>

      {/* Level Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payments by Level
          </h3>
        </div>

        {stats.byLevel.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No level breakdown data available
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.byLevel.map((level) => (
              <div
                key={level.level_number}
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                  selectedLevel === level.level_number ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedLevel(
                  selectedLevel === level.level_number ? null : level.level_number
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {level.level_number}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Level {level.level_number}</h4>
                      <p className="text-sm text-slate-500">{level.student_count} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{level.student_count} enrollments</p>
                    <p className="text-sm text-slate-500">
                      Payment status tracking available
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">Payment Details</p>
          <p className="text-sm text-amber-700">
            Detailed payment information will be available when the new payments API is integrated.
            Currently showing enrollment-based payment estimates.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentsTab
