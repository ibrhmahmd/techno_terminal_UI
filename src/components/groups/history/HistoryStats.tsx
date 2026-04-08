import { Users, Trophy, UserCog, BookOpen } from 'lucide-react'

interface HistoryStatsProps {
  totalEnrollments: number
  totalCompetitions: number
  totalInstructorChanges: number
  totalCourses: number
  isLoading: boolean
}

export function HistoryStats({
  totalEnrollments,
  totalCompetitions,
  totalInstructorChanges,
  totalCourses,
  isLoading,
}: HistoryStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
            <div className="h-8 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Enrollments',
      value: totalEnrollments,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Competitions',
      value: totalCompetitions,
      icon: Trophy,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Instructor Changes',
      value: totalInstructorChanges,
      icon: UserCog,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Courses',
      value: totalCourses,
      icon: BookOpen,
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
