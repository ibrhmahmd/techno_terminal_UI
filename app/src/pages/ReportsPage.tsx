import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { RevenueChart } from '../components/reports/RevenueChart'
import { StudentProgressChart } from '../components/reports/StudentProgressChart'
import { 
  getDashboardSummary, 
  getInstructorPerformance,
  type DashboardSummaryPublic, 
  type InstructorPerformanceDTO
} from '../api/analytics'
import { 
  getRevenueMetrics, 
  getStudentProgressReport,
  type RevenueMetrics,
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

const MOCK_SUMMARY: DashboardSummaryPublic = {
  active_enrollments: 165,
  today_sessions_count: 8
}

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

const MOCK_INSTRUCTOR_PERFORMANCE: InstructorPerformanceDTO[] = [
  { instructor_name: 'Ali Mahmoud', active_groups: 3, active_students: 35 },
  { instructor_name: 'Sarah Ahmed', active_groups: 2, active_students: 28 },
  { instructor_name: 'Omar Hassan', active_groups: 4, active_students: 42 },
  { instructor_name: 'Fatima Ali', active_groups: 2, active_students: 24 },
]

const MOCK_PROGRESS: StudentProgressReport[] = [
  { student_id: '1', student_name: 'Ahmed Mohamed', current_level: 3, modules_completed: 8, total_modules: 12, progress_percentage: 67, average_score: 85 },
  { student_id: '2', student_name: 'Fatima Ali', current_level: 2, modules_completed: 5, total_modules: 10, progress_percentage: 50, average_score: 78 },
  { student_id: '3', student_name: 'Omar Hassan', current_level: 4, modules_completed: 10, total_modules: 12, progress_percentage: 83, average_score: 92 },
  { student_id: '4', student_name: 'Aisha Ibrahim', current_level: 1, modules_completed: 2, total_modules: 8, progress_percentage: 25, average_score: 72 },
  { student_id: '5', student_name: 'Mohamed Ali', current_level: 3, modules_completed: 9, total_modules: 12, progress_percentage: 75, average_score: 88 },
]

export function ReportsPage() {
  const [summary, setSummary] = useState<DashboardSummaryPublic | null>(null)
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null)
  const [instructorPerformance, setInstructorPerformance] = useState<InstructorPerformanceDTO[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgressReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollment' | 'revenue' | 'instructors' | 'progress'>('overview')

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true)
      try {
        const [summaryData, revenueData, instructorData, progressData] = await Promise.all([
          getDashboardSummary().catch(() => MOCK_SUMMARY),
          getRevenueMetrics(6).catch(() => MOCK_REVENUE),
          getInstructorPerformance().catch(() => MOCK_INSTRUCTOR_PERFORMANCE),
          getStudentProgressReport().catch(() => MOCK_PROGRESS),
        ])
        
        setSummary(summaryData)
        setRevenueMetrics(revenueData)
        setInstructorPerformance(instructorData)
        setStudentProgress(progressData)
        
        if (
          summaryData === MOCK_SUMMARY ||
          revenueData === MOCK_REVENUE ||
          instructorData === MOCK_INSTRUCTOR_PERFORMANCE ||
          progressData === MOCK_PROGRESS
        ) {
          setUseMockData(true)
        }
      } catch {
        setSummary(MOCK_SUMMARY)
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
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ReportCard
                    title="Active Enrollments"
                    value={summary.active_enrollments}
                    icon="person_add"
                    color="purple"
                  />
                  <ReportCard
                    title="Today Sessions"
                    value={summary.today_sessions_count}
                    icon="calendar_today"
                    color="blue"
                  />
                  <ReportCard
                    title="Total Collected"
                    value={revenueMetrics?.total_collected.toLocaleString() || '0'}
                    subtitle="EGP"
                    icon="payments"
                    color="green"
                  />
                  <ReportCard
                    title="Outstanding"
                    value={revenueMetrics?.total_outstanding.toLocaleString() || '0'}
                    subtitle="EGP"
                    icon="money_off"
                    color="red"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-headline font-semibold text-on-surface mb-4">Enrollment Trends</h3>
                    <div className="h-64 flex items-center justify-center text-slate-400 italic">Chart rendering placeholder (BI Data)</div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-headline font-semibold text-on-surface mb-4">Revenue</h3>
                    <RevenueChart data={revenueMetrics?.monthly_revenue.slice(-4) || []} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'enrollment' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Enrollment Trends</h2>
                <p className="text-sm text-slate-500 mb-6">Daily new enrollments trend</p>
                <div className="h-80 flex items-center justify-center text-slate-400 italic">Chart rendering placeholder (Daily Trend)</div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Revenue Analysis</h2>
                  <p className="text-sm text-slate-500 mb-6">Monthly revenue trends and collection metrics</p>
                  <RevenueChart data={revenueMetrics?.monthly_revenue || []} />
                </div>

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

            {activeTab === 'instructors' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Instructor Performance</h2>
                <p className="text-sm text-slate-500 mb-6">Active groups and students by instructor</p>
                
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Instructor</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Active Groups</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Active Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructorPerformance.map((instructor, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-on-surface">{instructor.instructor_name}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{instructor.active_groups}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{instructor.active_students}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
