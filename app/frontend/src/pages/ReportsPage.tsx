import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { getDashboardSummary, type DashboardSummary } from '../api/analytics'

interface ReportCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple'
}

function ReportCard({ title, value, subtitle, icon, color }: ReportCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  }

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-sm opacity-70 mt-1">{subtitle}</p>}
        </div>
        <span className="material-symbols-outlined text-3xl opacity-50">{icon}</span>
      </div>
    </div>
  )
}

function ComingSoonCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm opacity-75">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-100 rounded-lg">
          <span className="material-symbols-outlined text-slate-500">{icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline text-lg font-semibold text-slate-600">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
          Coming Soon
        </span>
      </div>
    </div>
  )
}

// Mock data for when API is unavailable
const MOCK_SUMMARY: DashboardSummary = {
  total_students: 150,
  active_students: 135,
  total_groups: 12,
  active_groups: 10,
  total_enrollments: 180,
  active_enrollments: 165,
  monthly_revenue: 25000,
  outstanding_balance: 8000
}

export function ReportsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    async function loadSummary() {
      setIsLoading(true)
      try {
        const data = await getDashboardSummary()
        setSummary(data)
      } catch {
        setSummary(MOCK_SUMMARY)
        setUseMockData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadSummary()
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Reports" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Reports</h1>
          <p className="text-sm text-on-surface-variant mt-2">Analytics and insights dashboard</p>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto">
        {useMockData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            API unavailable. Showing demo data.
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : summary ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ReportCard
                title="Total Students"
                value={summary.total_students}
                subtitle={`${summary.active_students} active`}
                icon="school"
                color="blue"
              />
              <ReportCard
                title="Total Groups"
                value={summary.total_groups}
                subtitle={`${summary.active_groups} active`}
                icon="groups"
                color="green"
              />
              <ReportCard
                title="Enrollments"
                value={summary.active_enrollments}
                subtitle={`of ${summary.total_enrollments} total`}
                icon="person_add"
                color="purple"
              />
              <ReportCard
                title="Monthly Revenue"
                value={`${summary.monthly_revenue.toLocaleString()} EGP`}
                subtitle={`${summary.outstanding_balance.toLocaleString()} outstanding`}
                icon="payments"
                color="amber"
              />
            </div>

            {/* Coming Soon Reports */}
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Detailed Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ComingSoonCard
                title="Attendance Report"
                description="Daily, weekly, and monthly attendance summaries with student participation rates"
                icon="event_available"
              />
              <ComingSoonCard
                title="Enrollment Trends"
                description="Track new enrollments, transfers, and drops over time"
                icon="trending_up"
              />
              <ComingSoonCard
                title="Revenue Analysis"
                description="Payment collection trends, outstanding balances, and financial forecasting"
                icon="attach_money"
              />
              <ComingSoonCard
                title="Student Progress"
                description="Level completion rates, assessment scores, and advancement tracking"
                icon="military_tech"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2">analytics</span>
            <p>Failed to load reports</p>
          </div>
        )}
      </section>
    </div>
  )
}
