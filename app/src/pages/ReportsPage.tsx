import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { EnrollmentTrendsChart } from '../components/reports/EnrollmentTrendsChart'
import { RevenueChart } from '../components/reports/RevenueChart'
import { InstructorPerformanceChart } from '../components/reports/InstructorPerformanceChart'
import { StudentProgressChart } from '../components/reports/StudentProgressChart'
import { getDashboardSummary, type DashboardSummary } from '../api/analytics'
import { 
  getEnrollmentTrends, 
  getRevenueMetrics, 
  getInstructorPerformance, 
  getStudentProgressReport,
  type EnrollmentTrend,
  type RevenueMetrics,
  type InstructorPerformance,
  type StudentProgressReport
} from '../api/reports'

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

const MOCK_ENROLLMENT_TRENDS: EnrollmentTrend[] = [
  { month: 'Jan', new_enrollments: 15, transfers: 3, drops: 2, net_change: 16 },
  { month: 'Feb', new_enrollments: 20, transfers: 4, drops: 1, net_change: 23 },
  { month: 'Mar', new_enrollments: 18, transfers: 2, drops: 3, net_change: 17 },
  { month: 'Apr', new_enrollments: 25, transfers: 5, drops: 2, net_change: 28 },
  { month: 'May', new_enrollments: 22, transfers: 3, drops: 4, net_change: 21 },
  { month: 'Jun', new_enrollments: 30, transfers: 6, drops: 2, net_change: 34 },
]

const MOCK_REVENUE: RevenueMetrics = {
  monthly_revenue: [
    { month: 'Jan', amount: 20000 },
    { month: 'Feb', amount: 22000 },
    { month: 'Mar', amount: 21000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 24000 },
    { month: 'Jun', amount: 28000 },
  ],
  total_collected: 140000,
  total_outstanding: 8000,
  collection_rate: 94.6,
  average_monthly: 23333,
}

const MOCK_INSTRUCTOR_PERFORMANCE: InstructorPerformance[] = [
  { instructor_id: '1', instructor_name: 'Ali Mahmoud', groups_count: 3, total_students: 35, attendance_rate: 0.92, sessions_conducted: 48, sessions_cancelled: 2 },
  { instructor_id: '2', instructor_name: 'Sarah Ahmed', groups_count: 2, total_students: 28, attendance_rate: 0.88, sessions_conducted: 32, sessions_cancelled: 1 },
  { instructor_id: '3', instructor_name: 'Omar Hassan', groups_count: 4, total_students: 42, attendance_rate: 0.95, sessions_conducted: 64, sessions_cancelled: 0 },
  { instructor_id: '4', instructor_name: 'Fatima Ali', groups_count: 2, total_students: 24, attendance_rate: 0.90, sessions_conducted: 30, sessions_cancelled: 1 },
]

const MOCK_PROGRESS: StudentProgressReport[] = [
  { student_id: '1', student_name: 'Ahmed Mohamed', current_level: 3, modules_completed: 8, total_modules: 12, progress_percentage: 67, average_score: 85 },
  { student_id: '2', student_name: 'Fatima Ali', current_level: 2, modules_completed: 5, total_modules: 10, progress_percentage: 50, average_score: 78 },
  { student_id: '3', student_name: 'Omar Hassan', current_level: 4, modules_completed: 10, total_modules: 12, progress_percentage: 83, average_score: 92 },
  { student_id: '4', student_name: 'Aisha Ibrahim', current_level: 1, modules_completed: 2, total_modules: 8, progress_percentage: 25, average_score: 72 },
  { student_id: '5', student_name: 'Mohamed Ali', current_level: 3, modules_completed: 9, total_modules: 12, progress_percentage: 75, average_score: 88 },
]

export function ReportsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [enrollmentTrends, setEnrollmentTrends] = useState<EnrollmentTrend[]>([])
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null)
  const [instructorPerformance, setInstructorPerformance] = useState<InstructorPerformance[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgressReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollment' | 'revenue' | 'instructors' | 'progress'>('overview')

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true)
      try {
        // Load all report data in parallel
        const [summaryData, enrollmentData, revenueData, instructorData, progressData] = await Promise.all([
          getDashboardSummary().catch(() => MOCK_SUMMARY),
          getEnrollmentTrends(6).catch(() => MOCK_ENROLLMENT_TRENDS),
          getRevenueMetrics(6).catch(() => MOCK_REVENUE),
          getInstructorPerformance().catch(() => MOCK_INSTRUCTOR_PERFORMANCE),
          getStudentProgressReport().catch(() => MOCK_PROGRESS),
        ])
        
        setSummary(summaryData)
        setEnrollmentTrends(enrollmentData)
        setRevenueMetrics(revenueData)
        setInstructorPerformance(instructorData)
        setStudentProgress(progressData)
        
        // If any API failed, we're using mock data
        if (
          summaryData === MOCK_SUMMARY ||
          enrollmentData === MOCK_ENROLLMENT_TRENDS ||
          revenueData === MOCK_REVENUE ||
          instructorData === MOCK_INSTRUCTOR_PERFORMANCE ||
          progressData === MOCK_PROGRESS
        ) {
          setUseMockData(true)
        }
      } catch {
        // Fallback to all mock data
        setSummary(MOCK_SUMMARY)
        setEnrollmentTrends(MOCK_ENROLLMENT_TRENDS)
        setRevenueMetrics(MOCK_REVENUE)
        setInstructorPerformance(MOCK_INSTRUCTOR_PERFORMANCE)
        setStudentProgress(MOCK_PROGRESS)
        setUseMockData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadReports()
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

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 p-1 bg-slate-100 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'enrollment', label: 'Enrollment', icon: 'trending_up' },
            { id: 'revenue', label: 'Revenue', icon: 'payments' },
            { id: 'instructors', label: 'Instructors', icon: 'school' },
            { id: 'progress', label: 'Progress', icon: 'military_tech' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-on-surface shadow-sm'
                  : 'text-slate-600 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : summary ? (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                {/* Quick Charts Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-headline font-semibold text-on-surface mb-4">Enrollment Trends</h3>
                    <EnrollmentTrendsChart data={enrollmentTrends.slice(-4)} />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-headline font-semibold text-on-surface mb-4">Revenue</h3>
                    <RevenueChart data={revenueMetrics?.monthly_revenue.slice(-4) || []} />
                  </div>
                </div>
              </div>
            )}

            {/* Enrollment Tab */}
            {activeTab === 'enrollment' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Enrollment Trends</h2>
                <p className="text-sm text-slate-500 mb-6">Track new enrollments, transfers, and drops over the last 6 months</p>
                <EnrollmentTrendsChart data={enrollmentTrends} />
                
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {enrollmentTrends.reduce((sum, t) => sum + t.new_enrollments, 0)}
                    </p>
                    <p className="text-sm text-slate-500">Total New Enrollments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600">
                      {enrollmentTrends.reduce((sum, t) => sum + t.transfers, 0)}
                    </p>
                    <p className="text-sm text-slate-500">Total Transfers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {enrollmentTrends.reduce((sum, t) => sum + t.drops, 0)}
                    </p>
                    <p className="text-sm text-slate-500">Total Drops</p>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Revenue Analysis</h2>
                  <p className="text-sm text-slate-500 mb-6">Monthly revenue trends and collection metrics</p>
                  <RevenueChart data={revenueMetrics?.monthly_revenue || []} />
                </div>

                {/* Revenue Stats */}
                {revenueMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <p className="text-sm text-slate-500 mb-1">Total Collected</p>
                      <p className="text-2xl font-bold text-green-600">
                        {revenueMetrics.total_collected.toLocaleString()} EGP
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <p className="text-sm text-slate-500 mb-1">Outstanding</p>
                      <p className="text-2xl font-bold text-red-600">
                        {revenueMetrics.total_outstanding.toLocaleString()} EGP
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <p className="text-sm text-slate-500 mb-1">Collection Rate</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {revenueMetrics.collection_rate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <p className="text-sm text-slate-500 mb-1">Avg Monthly</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {revenueMetrics.average_monthly.toLocaleString()} EGP
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instructors Tab */}
            {activeTab === 'instructors' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Instructor Performance</h2>
                <p className="text-sm text-slate-500 mb-6">Attendance rates and session metrics by instructor</p>
                <InstructorPerformanceChart data={instructorPerformance} />

                {/* Instructor Table */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Instructor</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Groups</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Students</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Attendance Rate</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructorPerformance.map((instructor) => (
                        <tr key={instructor.instructor_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-on-surface">{instructor.instructor_name}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{instructor.groups_count}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{instructor.total_students}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              instructor.attendance_rate >= 0.9 ? 'bg-green-100 text-green-800' :
                              instructor.attendance_rate >= 0.8 ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {(instructor.attendance_rate * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600">
                            {instructor.sessions_conducted} / {instructor.sessions_conducted + instructor.sessions_cancelled}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Student Progress Distribution</h2>
                  <p className="text-sm text-slate-500 mb-6">Completion status across all students</p>
                  <StudentProgressChart
                    completed={studentProgress.filter(s => s.progress_percentage >= 80).length}
                    inProgress={studentProgress.filter(s => s.progress_percentage > 0 && s.progress_percentage < 80).length}
                    notStarted={studentProgress.filter(s => s.progress_percentage === 0).length}
                  />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Top Performing Students</h2>
                  <div className="space-y-3">
                    {studentProgress
                      .sort((a, b) => b.progress_percentage - a.progress_percentage)
                      .slice(0, 5)
                      .map((student, index) => (
                        <div key={student.student_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-on-surface">{student.student_name}</p>
                            <p className="text-sm text-slate-500">Level {student.current_level} • Score: {student.average_score}%</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-secondary">{student.progress_percentage}%</p>
                            <p className="text-xs text-slate-500">
                              {student.modules_completed}/{student.total_modules} modules
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
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
